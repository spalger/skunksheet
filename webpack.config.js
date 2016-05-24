const { resolve } = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  context: resolve(__dirname, 'src'),
  entry: [
    'babel-polyfill',
    './App.js',
  ],

  devtool: 'cheap-module-source-map',

  output: {
    path: resolve(__dirname, 'target/build'),
    publicPath: '/',
    filename: 'bundle.js',
    devtoolModuleFilenameTemplate: '[resource-path]',
  },

  resolve: {
    modulesDirectories: ['node_modules'],
    extensions: ['', '.js', '.jsx', '.json'],
    packageMains: ['webpack', 'browser', 'main'],
  },

  resolveLoader: {
    moduleTemplates: ['*'],
  },

  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: [/node_modules/],
        query: { cacheDirectory: resolve(__dirname, 'target/babelcache') },
      },
      {
        test: /\.css$/,
        loaders: [
          'style-loader?sourceMap',
          'css-loader?sourceMap',
          'postcss-loader?sourceMap',
        ],
      },
      {
        test: /\.less$/,
        loaders: [
          'style-loader?sourceMap',
          'css-loader?sourceMap',
          'less-loader?sourceMap',
          'postcss-loader?parser=postcss-less&sourceMap',
        ],
      },

      { test: /\.txt$/, loader: 'raw-loader' },
      { test: /\.json$/, loader: 'json-loader' },
      { test: /\.(eot|ttf)$/, loader: 'file-loader' },
      { test: /\.(png|jpg|jpeg|gif|svg|woff|woff2)$/, loader: 'url-loader?limit=1000' },
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: 'index.html',
      inject: 'body',
      cache: true,
      showErrors: true,
    }),
  ],
}
