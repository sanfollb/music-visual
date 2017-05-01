var htmlWebpackPlugin = require('html-webpack-plugin');
var webpack = require('webpack');

module.exports = {
	entry:'./public/javascripts/index.js',
	output:{
		path:__dirname+'/dist',
		filename:'js/[name]-[chunkhash].js',
		publicPath:''
	},
	module:{
        loaders:[
             {
               test:/\.js$/,
               loader:'babel-loader',
               options:{
               	presets:['latest']
               }

             },
             {
               test:/\.html$/,
               loader:'html-loader'
             },
             {
               test:/\.ejs$/,
               loader:'ejs-loader'
             },
          
             {
        	    test:/\.css$/,
        	    loader:'style-loader!css-loader!postcss-loader'
             },
             {
             	test:/\.jsx$/,
             	loader:'jsx-loader'
             },
             {
             	test:/\.(mp3|jpg|png|svg|woff|woff2)$/,
             	loader:'url-loader?limit=8192'
             },
             {
                 test: /\.(mp3|ogg|svg)$/,
                 loader: 'file-loader'
             }
        ]
      
	},

  plugins:[
   new htmlWebpackPlugin({
    template:'views/index.html'
   }),
   new webpack.LoaderOptionsPlugin({
            options:{
                postcss:function(){
                    return [
                        require('autoprefixer')({
                            broswers:['last 5 versions']
                        })
                    ]
                }
            }
        })

  ]
  
}

