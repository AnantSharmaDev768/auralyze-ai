const rules = require('./webpack.rules');
const path = require('path');

rules.push({
  test: /\.css$/,
  use: ['style-loader', 'css-loader'],
});

rules.push({
  test: /\.(js|jsx)$/,
  exclude: /node_modules/,
  use: {
    loader: 'babel-loader',
    options: {
      presets: [
        ['@babel/preset-env', { targets: { browsers: 'last 2 versions' } }],
        ['@babel/preset-react', { runtime: 'automatic' }]
      ],
    },
  },
});

module.exports = {
  target: 'web',
  mode: 'development',
  devtool: 'source-map',
  module: { rules },
  resolve: {
    extensions: ['.js', '.jsx', '.css', '.json'],
    fallback: {
      path: false,
      fs: false,
      os: false,
    }
  },
  entry: './src/renderer/index.js',
};