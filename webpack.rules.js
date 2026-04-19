module.exports = [
  {
    test: /native_modules[/\\].+\.node$/,
    use: 'node-loader',
  },
  {
    test: /[/\\]node_modules[/\\].+\.(m?js|node)$/,
    parser: { amd: false },
    use: {
      loader: '@vercel/webpack-asset-relocator-loader',
      options: {
        outputAssetBase: 'native_modules',
      },
    },
  },
  {
    test: /\.(js|jsx)$/,
    exclude: /node_modules/,
    use: {
      loader: 'babel-loader',
      options: {
        presets: [
          '@babel/preset-env',
          ['@babel/preset-react', { runtime: 'automatic' }]
        ],
      },
    },
  },
  {
    test: /\.css$/,
    use: ['style-loader', 'css-loader'],
  },
  // 🚀 UPDATED RULE: Now handles Images AND Audio Files
  {
    test: /\.(png|jpe?g|gif|svg|ico|wav|mp3|ogg)$/i,
    type: 'asset/resource',
  },
];