module.exports = {
  entry: './src/main.js',
  target: 'electron-main',
  module: {
    rules: require('./webpack.rules'),
  },
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.json'],
  },
  externals: {
    'winreg': 'commonjs winreg',
  },
  node: {
    __dirname: false,
    __filename: false,
  },
};