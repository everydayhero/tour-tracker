const webpack = require('webpack')

const define = new webpack.DefinePlugin({
  'process.env.NODE_ENV': `'${process.env.NODE_ENV}'`,
  'process.env.BASE_URL': `'${process.env.BASE_URL || ''}'`,
  'process.env.BASE_PATH': `'${process.env.BASE_PATH || '/'}'`
})

module.exports = {
  context: `${__dirname}/source`,
  stats: { children: false },
  entry: './index.js',
  node: { fs: 'empty' },
  output: {
    path: `${__dirname}/build`,
    filename: 'main.js',
    publicPath: process.env.BASE_PATH || '/'
  },
  module: {
    loaders: [
      {
        test: /\.json$/,
        loader: 'json'
      },
      {
        test: /\.js?$/,
        include: /source/,
        loader: 'babel',
        query: {
          presets: [
            'es2015',
            'stage-0',
            'react'
          ]
        }
      },
      {
        test: /(\.png|\.jpg|\.svg|\.eot|\.ttf|\.woff)$/,
        loader: 'file-loader'
      }
    ]
  },
  plugins: [define]
}
