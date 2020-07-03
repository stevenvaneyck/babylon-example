const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/index.ts',
  mode: 'development',
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      }
    ]
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'images', to: '.' },
        { from: 'index.html', to: '.' }
      ],
    }),
  ],
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, "public"),
  },
  devServer: {
    writeToDisk: true,
    contentBase: path.resolve(__dirname, "public"),
    compress: true,
    port: 8080,
    hot:true,
    overlay:true
  }
};
