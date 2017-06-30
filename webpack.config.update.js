const path = require('path');
const glob = require('glob');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MultipageWebpackPlugin = require('multipage-webpack-plugin');
const ExtractTextWebpackPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ROOT_PATH = path.resolve(__dirname);
const DEV_PATH = ROOT_PATH;
const BUILD_PATH = path.resolve(ROOT_PATH, '../webapp');

const config = {
  entry: Object.assign({}, {'static/common/vendor': ['reqwest', 'echarts', 'handlebars']}, getEntry()),

  output: {
    filename: process.env.NODE_ENV === 'production' ? '[name]_[chunkhash].js' : '[name].js',
    path: BUILD_PATH,
    publicPath: '/'
  },

  module: {
    rules: [
      {
        test: /\.(jsp|html)$/,
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
        test: /\.handlebars$/,
        use: 'handlebars-loader'
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        use: 'url-loader?limit=4000&name=static/images/[name].[ext]'
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

  resolve: {
    alias: {
      handlebars: 'handlebars/dist/handlebars.min.js'
    }
  },

  plugins: [
    new CopyWebpackPlugin([
      {
        from: 'views/layout',
        to: 'WEB-INF/layout'
      }
    ]),

    new webpack.optimize.CommonsChunkPlugin({
      names: ['static/common/vendor', 'static/common/manifest'],
    }),

    new ExtractTextWebpackPlugin({
      filename: (getPath) => {
        return getPath(process.env.NODE_ENV === 'production' ? '[name]_[contenthash].css' : '[name].css').replace('/js', '/css');
      }
    }),

    ...htmlPlugin()
    // new MultipageWebpackPlugin()
  ]
}

function htmlPlugin() {
  const keys = Object.keys(getEntry());
  const plugins = [];
  const vendorName = 'static/common/vendor';
  const manifestName = 'static/common/manifest';

  keys.forEach(key => {
    const path = key.replace(/^static\/entries\/(\w+\/\w+)$/g, '$1');

    plugins.push(new HtmlWebpackPlugin({
      filename: `WEB-INF/${path}.jsp`,
      template: `./views/${path}.jsp`,
      chunks: [manifestName, vendorName, key],
      chunksSortMode: (a, b) => {
        const chunks = [manifestName, vendorName, key];
        const aIndex = chunks.indexOf(a.names[0]);
        const bIndex = chunks.indexOf(b.names[0]);

        return aIndex - bIndex;
      }
    }))
  })

  return plugins;
}


function getEntry() {
  const entry = {};
  const files = glob.sync('./entries/**/*.js');

  files.forEach(file => {
    const key = file.replace(/^\.\/(entries\/\w+\/\w+)\.js$/g, 'static/$1');
    entry[key] = file;
  })

  return entry;
}

module.exports = config;

if (process.env.NODE_ENV === 'production') {
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    })
  ])
}

