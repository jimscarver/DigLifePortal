'use strict'
const path = require('path')
const utils = require('./utils')
const webpack = require('webpack')
const config = require('../config')
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const CompressionWebpackPlugin = require('compression-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

const env = process.env.NODE_ENV === 'testing'
	? require('../config.test.env')
	: require('../config/prod.env')

const webpackConfig = merge(baseWebpackConfig, {
  module: {
    rules: utils.styleLoaders({
      sourceMap: config.build.productionSourceMap,
      extract: true,
      usePostCSS: true
    })
  },
  devtool: config.build.productionSourceMap ? config.build.devtool : false,
  output: {
    path: config.build.assetsRoot,
    filename: utils.assetsPath('js/[name].[chunkhash].js'),
    chunkFilename: utils.assetsPath('js/[id].[chunkhash].js')
  },
  plugins: [
    // http://vuejs.github.io/vue-loader/en/workflow/production.html
    new webpack.DefinePlugin({
      'process.env': env
    }),
    // extract css into its own file
    new MiniCssExtractPlugin({
      filename: utils.assetsPath('css/[name].[contenthash].css'),
      // Setting the following option to `false` will not extract CSS from codesplit chunks.
      // Their CSS will instead be inserted dynamically with style-loader when the codesplit chunk has been loaded by webpack.
      // It's currently set to `true` because we are seeing that sourcemaps are included in the codesplit bundle as well when it's `false`, 
      // increasing file size: https://github.com/vuejs-templates/webpack/issues/1110
      allChunks: true,
    }),
    // generate dist index.html with correct asset hash for caching.
    // you can customize output by editing /index.html
    // see https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      filename: process.env.NODE_ENV === 'testing'
	? 'index.html'
	: config.build.index,
      template: 'index.html',
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
        // more options:
        // https://github.com/kangax/html-minifier#options-quick-reference
      },
      // necessary to consistently work with multiple chunks via CommonsChunkPlugin
      chunksSortMode: 'dependency'
    }),
    // keep module.id stable when vendor modules does not change
    new webpack.HashedModuleIdsPlugin(),
    // enable scope hoisting
    new webpack.optimize.ModuleConcatenationPlugin(),

    // copy custom static assets
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../static'),
        to: config.build.assetsSubDirectory,
        ignore: ['.*']
      }
    ]),
  ],

  optimization: {
    concatenateModules: true,
    minimize: true,
    minimizer: [
      new UglifyJsPlugin ({
	uglifyOptions: {
	  compress: {
	    warnings: false
	  }
	},
	sourceMap: config.build.productionSourceMap,
	parallel: true
     }),
     // Compress extracted CSS. We are using this plugin so that possible duplicated CSS from different components can be deduped. 
      new OptimizeCSSPlugin({
       cssProcessorOptions: config.build.productionSourceMap,
	safe: true
       }),	    
     ],

   splitChunks: {
     cacheGroups: {
       default: false,
       // Split vendor js into its own file
	 vendor: {
 	   test: /[\\/]node_modules[\\/]/,
	   name: 'vendor',
	   chunks: 'all',
	  },
       // Extract webpack runtime and module manifest to its own file in order to prevent vendor hash from being updated whenever app bundle is updated
	 manifest: {
	  test: "manifest",
          name: "manifest",
	  minChunks: Infinity
         },
      // This instance extracts shared chunks from code splitted chunks and bundles then in a seperate chunk, similar to the vendor chunk
	app: {
	  test: "app",
	  name: "app",
	  reuseExistingChunk: true,
	  chunks: 'all',
	  minChunks: 2
	 },
	 styles: {
	   name: 'styles',
	   test: /\.css$/,
	   chunks: 'all',
	   enforce: true
	 }
     }
    }
   }	  
})

if (config.build.productionGzip) {

  webpackConfig.plugins.push(
    new CompressionWebpackPlugin({
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      test: new RegExp(
        '\\.(' +
        config.build.productionGzipExtensions.join('|') +
        ')$'
      ),
      threshold: 10240,
      minRatio: 0.8
    })
  )
}

if (config.build.bundleAnalyzerReport) {
  webpackConfig.plugins.push(new BundleAnalyzerPlugin())
}

module.exports = webpackConfig
