const HtmlWebpackPlugin = require('html-webpack-plugin'),
      MiniCssExtractPlugin = require('mini-css-extract-plugin'),
      CopyWebpackPlugin = require('copy-webpack-plugin'),
      SITE_PATH = require('path').join(__dirname, 'site');

module.exports = {
  mode: 'development',

  entry: './src/js/index.js',

  output: {
    path: SITE_PATH,
    filename: './js/main.js'
  },

  module: {
    rules: [
      { test: /\.pug$/,
        use: {
          loader: 'pug-loader',
          options: { pretty: true }
        }
      },
      { test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      { test: /\.scss$/,
        use: [
          { loader: MiniCssExtractPlugin.loader,
            options: {}
          },
          { loader: 'css-loader',
            options: { sourceMap: true, importLoaders: 2  /*postcss+sass*/ }
          },
          { loader: 'postcss-loader',
            options: { sourceMap: true, plugins: [require('autoprefixer')] }
          },
          { loader: 'sass-loader',
            options: { sourceMap: true, outputStyle: 'expanded' }
          }
        ]
      }
    ]
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: './src/pug/index.pug',
      filename: 'index.html'
    }),
    new MiniCssExtractPlugin({
      filename: 'css/style.css'
    }),
    new CopyWebpackPlugin([{ from: 'src/img', to:'img' }])
  ],

  devServer: {
    contentBase: SITE_PATH,
    port: 5555
  }
};
