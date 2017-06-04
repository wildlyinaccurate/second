const webpack = require('webpack')
const path = require('path')
const BabiliPlugin = require('babili-webpack-plugin')

module.exports = {
  entry: './client-bundle.js',

  output: {
    path: path.resolve(__dirname, 'static'),
    filename: 'bundle.js'
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }
    ]
  },

  plugins: [
    new BabiliPlugin(),

    new webpack.DefinePlugin({
      DISABLE_DEHYDRATOR: JSON.stringify(true),
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    })
  ]
}
