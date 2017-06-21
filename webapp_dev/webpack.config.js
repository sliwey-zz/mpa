const path = require('path');
const glob = require('glob');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ROOT_PATH = path.resolve(__dirname);
const DEV_PATH = ROOT_PATH;
const BUILD_PATH = path.resolve(ROOT_PATH, '../webapp');

const config = {
  entry: getEntry(),

  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, '../webapp')
  },

  module: {
    rules: [
      {
        test: /\.jsp$/,
        use: [{
          loader: 'html-loader'
        }]
      }
    ]
  },

  plugins: [

    ...htmlPlugin()
  ]
}

function htmlPlugin() {
  const keys = Object.keys(getEntry());
  const plugins = [];

  keys.forEach(key => {
    // const path = key.replace('_', '/');

    plugins.push(new HtmlWebpackPlugin({
      filename: `view/${key}.jsp`,
      template: `./views/${key}.jsp`,
      chunks: [key]
    }))
  })

  return plugins;
}


function getEntry() {
  const entry = {};
  const files = glob.sync('./static/js/**/*.js');

  files.forEach(file => {
    const key = file.replace(/^\.\/static\/js\/(\w+\/\w+)\.js$/g, '$1');
    entry[key] = file;
  })

  return entry;
}



module.exports = config;