//import './stylesheets/style.css';
//require('normalize.css/normalize.css');
//require('stylessheets/style.css');
//require('stylesheets/style.css');

function $(s){
	return document.querySelectorAll(s);
}
var lis = $("#list li");
for(var i=0;i<lis.length;i++){
	lis[i].onclick=function(){
		for(var j=0;j<lis.length;j++){
           lis[j].className="";
		}
		this.className = "selected";
		load("/datas/" + this.title);
    stopp.disabled = false;
	}
}

var xhr = new XMLHttpRequest();
var ac = new (window.AudioContext||window.webkitAudioContext)();
var gainNode = ac[ac.createGain ? "createGain":"createGainNode"]();
gainNode.connect(ac.destination);
var analyser = ac.createAnalyser();
var size = 64;
analyser.fftSize = size * 2;
analyser.connect(gainNode);

var source = null;
var count = 0;
var line;
var t1,ct1,ct2,t3,tt ;

//创建canvas画布

var box = $("#box")[0];
var height,width;
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
box.appendChild(canvas);
var Dots = [];

function random(m,n){
	return Math.round(Math.random() * (n - m) + m);
}
//创建圆点数组

function getDots(){
	Dots = [];
	for(var i=0;i<size;i++){
      var x = random(0,width);
      var y = random(0,height);
      var color = "rgba("+random(0,255)+","+random(0,255)+","+random(0,255)+",0)";
      Dots.push({
      	x:x,
      	y:y,
      	dx: random(1,4),
      	color:color,
      	cap:0
      })
	}
}

//添加本地音乐播放
$("#add")[0].onclick = function(){
   $("#upload")[0].click();
   for(var j=0;j<lis.length;j++){
           lis[j].className="";
    }
}

$("#upload")[0].onchange = function(){
  var file = this.files[0];
  var fr = new FileReader();

  fr.onload = function(e){
       play(e.target.result);
      };
  fr.readAsArrayBuffer(file);
}

//play方法封装函数
function play(url){
  var b = ++count;
  //判断路径是ArrayBuffer属性，即为本地歌曲，不需要ajax请求生成arrayBuffer，可以直接解码，进行播放
  if(url instanceof ArrayBuffer){
    t1 = 0;
    source&&source[source.stop ? "stop" : "noteOff"]();
    ac.decodeAudioData(url,function(buffer){
      var bufferSource = ac.createBufferSource();
      bufferSource.buffer = buffer;
      bufferSource.connect(analyser);
      bufferSource[bufferSource.start ? "start":"noteOn"](ac.currentTime,0);
      ct1 = ac.currentTime;
       source = bufferSource;
       var  msm = false;
         stopp.onclick=function(){
           source[source.stop ? "stop" : "noteOff"](ac.currentTime);
           ct2 = ac.currentTime;
           t1 += ct2 - ct1;
         }
         
       startt.onclick=function(){
          var bufferSource = ac.createBufferSource();
          bufferSource.buffer = buffer;
          bufferSource.connect(analyser);
          bufferSource[bufferSource.start ? "start":"noteOn"](ac.currentTime,t1);
           ct1 = ac.currentTime;
          source = bufferSource;
       }
      
     },
function(err){
      console.log(err);
        })
  }
  
}
//调整页面大小
function resize(){
	height = box.clientHeight;
	width = box.clientWidth;
	canvas.height = height;
	canvas.width = width;
	//创建线性渐变
	line = ctx.createLinearGradient(0,0,0,height);
	line.addColorStop(0,"red");
	line.addColorStop(0.5,"yellow");
	line.addColorStop(1,"green");
	getDots();
}

resize();

window.onresize = resize;
//绘制图形

function draw(arr){
	ctx.clearRect(0,0,width,height);
	var w = width / size;
	var cw = w*0.6;
	var capH = cw > 5 ? 5 : cw;
	ctx.fillStyle = line;
   for(var i = 0 ; i < size; i++){
   	  var o = Dots[i];
   	//判断绘制图形类型
   	if(draw.type == "column"){
      var h = arr[i] / 256 * height;
      ctx.fillRect(w * i,height-h,cw,h);
      ctx.fillRect(w * i,height-(o.cap+capH),cw,capH);
      o.cap--;
      if(o.cap<0){
      	o.cap = 0;
      }
      if(h > 0 && o.cap < h + 40){
        o.cap = h + 40 >height - capH ? height - capH : h +40 ;  
      }
   	}else if(draw.type == "dot"){
   	  ctx.beginPath();
      var r = 10 + arr[i] / 256 * (height > width ? width : height) / 15;
      ctx.arc(o.x,o.y,r,0,Math.PI*2,true);
      var g = ctx.createRadialGradient(o.x,o.y,0,o.x,o.y,r);
      g.addColorStop(0,"#fff");
      g.addColorStop(1,o.color);
      ctx.fillStyle = g;
      ctx.fill();
      o.x += o.dx;
      o.x = o.x > width ? 0 : o.x;

   	}
   	
   }
}


draw.type = "column";
//切换展示按钮样式
var types = $("#type li");
for(var i=0;i<types.length;i++){
	types[i].onclick = function(){
		for(var j=0;j<types.length;j++){
			types[j].className = "";
		}
		this.className = "dided";
		draw.type = this.getAttribute("data-type");
	}
}
var startt = $("#startt")[0];
var stopp = $("#stopp")[0];
startt.disabled = true;
stopp.disabled = true;
//ajax获取服务端数据请求
function load(url){
	t1 = 0;
	var n = ++count;
	source&&source[source.stop ? "stop" : "noteOff"]();
	xhr.abort();
   xhr.open("get",url);
   xhr.responseType = "arraybuffer";
   xhr.onload=function(){
   	if(n != count) return;
   	ac.decodeAudioData(xhr.response,function(buffer){
   	if(n != count) return;
      var bufferSource = ac.createBufferSource();
      bufferSource.buffer = buffer;
      bufferSource.connect(analyser);
      var dur = bufferSource.buffer.duration;
      
      bufferSource.onended = function(){
        t3 = ac.currentTime;
        tt = t1 + t3 - ct1;
        console.log(dur);
        console.log(t1);
        console.log(tt);
        if(tt>dur){
              for(var j=0;j<lis.length;j++){
           lis[j].className="";
             }
        }else {
            console.log("歌曲还未播放完全");
        }
      }
      bufferSource[bufferSource.start ? "start":"noteOn"](ac.currentTime,0);
      ct1 = ac.currentTime;
       source = bufferSource;
       

       //开始暂停功能
       var  msm = false;
         stopp.onclick=function(){
           source[source.stop ? "stop" : "noteOff"](ac.currentTime);
       	   ct2 = ac.currentTime;
           t1 += ct2 - ct1;
           startt.disabled = false;
           stopp.disabled = true;
         }
         
       startt.onclick=function(){
        startt.disabled = true;
        stopp.disabled = false;
       	  var bufferSource = ac.createBufferSource();
       	  bufferSource.buffer = buffer;
          bufferSource.connect(analyser);
          var dur = bufferSource.buffer.duration;
      
        bufferSource.onended = function(){
        t3 = ac.currentTime;
        tt = t1 + t3 - ct1;
        console.log(dur);
        console.log(t1);
        console.log(tt);
        if(tt>dur){
            for(var j=0;j<lis.length;j++){
           lis[j].className="";
            }
        
        }else{
          console.log("歌曲还未播放完全");
        }
      }
       	  bufferSource[bufferSource.start ? "start":"noteOn"](ac.currentTime,t1);
       	   ct1 = ac.currentTime;
       	  source = bufferSource;
       }

   	},function(err){
   		console.log(err);
   	});
   
}
   xhr.send();
}
//定义获取音频频域数组函数
function visualizer(){
	var arr = new Uint8Array(analyser.frequencyBinCount);
	
	//动画函数
	requestAnimationFrame = window.requestAnimationFrame||
	                        window.webkitRequestAnimationFrame||
	                        window.mozRequestAnimationFrame;
	 function v(){
	 	analyser.getByteFrequencyData(arr);
	 	draw(arr);
	 	requestAnimationFrame(v);
	 }
	 requestAnimationFrame(v);
}
visualizer();

//调节音量大小
function changeVolume(percent){
	gainNode.gain.value = percent * percent;
}

$("#volume")[0].onchange = function(){
	changeVolume(this.value/this.max);
}
$("#volume")[0].onchange();


