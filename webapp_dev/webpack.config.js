const path = require('path');
const glob = require('glob');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextWebpackPlugin = require('extract-text-webpack-plugin');
const ROOT_PATH = path.resolve(__dirname);
const DEV_PATH = ROOT_PATH;
const BUILD_PATH = path.resolve(ROOT_PATH, '../webapp');

const config = {
  entry: getEntry(),

  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, '../webapp'),
    publicPath: '/'
  },

  module: {
    rules: [
      {
        test: /\.jsp$/,
        use: [{
          loader: 'html-loader'
        }]
      },
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ExtractTextWebpackPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader'
        })
      },
      {
        test: /\.scss$/,
        use: ExtractTextWebpackPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'postcss-loader', 'sass-loader']
        })
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        use: 'url-loader?limit=4000'
      },
      {
        test: /\.woff2?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: 'url-loader'
      },
      {
        test: /\.(ttf|eot|svg)(\?[\s\S]+)?$/,
        use: 'file-loader'
      }
    ]
  },

  plugins: [

    new ExtractTextWebpackPlugin({
      filename: (getPath) => {
        return getPath('[name].css').replace('/js', '/css');
      }
    }),

    ...htmlPlugin()
  ]
}

function htmlPlugin() {
  const keys = Object.keys(getEntry());
  const plugins = [];

  keys.forEach(key => {
    const path = key.replace(/^static\/js\/(\w+\/\w+)$/g, '$1');

    plugins.push(new HtmlWebpackPlugin({
      filename: `view/${path}.jsp`,
      template: `./views/${path}.jsp`,
      chunks: [key]
    }))
  })

  return plugins;
}


function getEntry() {
  const entry = {};
  const files = glob.sync('./static/js/**/*.js');

  files.forEach(file => {
    const key = file.replace(/^\.\/(static\/js\/\w+\/\w+)\.js$/g, '$1');
    entry[key] = file;
  })

  return entry;
}



module.exports = config;