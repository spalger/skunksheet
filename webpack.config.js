const res = require('path').resolve.bind(null, __dirname)
const HtmlWebpackPlugin = require('html-webpack-plugin')
const pkg = require('./package')

const externals = [
  'horizon/src/serve',
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.devDependencies || {}),
]

const devtool = 'cheap-module-source-map'
function jsLoaders() {
  return [
    {
      test: /\.jsx?$/,
      loader: 'babel-loader',
      exclude: [/node_modules/],
      query: { cacheDirectory: res('target/babelcache') },
    },
    { test: /\.txt$/, loader: 'raw-loader' },
    { test: /\.json$/, loader: 'json-loader' },
  ]
}

function resolve() {
  return {
    modulesDirectories: ['node_modules'],
    extensions: ['', '.js', '.jsx', '.json'],
    packageMains: ['webpack', 'browser', 'main'],
  }
}

module.exports = [
  // client
  {
    context: res('src/client'),
    entry: [
      'babel-polyfill',
      './App.js',
    ],

    devtool,
    output: {
      path: res('target/client'),
      publicPath: '/',
      filename: 'bundle.js',
      devtoolModuleFilenameTemplate: '[resource-path]',
    },

    resolve: resolve(),
    module: {
      loaders: [
        jsLoaders(),
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
  },

  {
    context: res('src/server'),
    entry: [
      'babel-polyfill',
      'source-map-support/register',
      './server.js',
    ],

    devtool: 'cheap-module-source-map',

    target: 'node',
    output: {
      path: res('target/server'),
      publicPath: '/',
      filename: 'server.js',
      libraryTarget: 'commonjs2',
      devtoolModuleFilenameTemplate: '[resource-path]',
    },
    externals,

    node: {
      console: false,
      global: false,
      process: false,
      Buffer: false,
      __filename: false,
      __dirname: false,
      setImmediate: false,
    },

    resolve: resolve(),
    module: {
      loaders: [
        jsLoaders(),
      ],
    },
  },
]
