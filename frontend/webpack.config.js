const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const fs = require('fs');

module.exports = {
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.[contenthash].js',
    chunkFilename: '[name].[contenthash].js',
    clean: true,
    publicPath: process.env.PUBLIC_URL ? `${process.env.PUBLIC_URL.replace(/\/$/, '')}/` : '/',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
    }),
    new webpack.DefinePlugin({
      __API_BASE_URL__: JSON.stringify(process.env.API_BASE_URL || 'http://localhost:8080/api/v1'),
    }),
    {
      apply: (compiler) => {
        compiler.hooks.thisCompilation.tap('CopyPublicAssetsPlugin', (compilation) => {
          const { RawSource } = webpack.sources;
          const publicDir = path.resolve(__dirname, 'public');
          const files = [
            { from: path.join(publicDir, 'manifest.json'), to: 'manifest.json' },
            { from: path.join(publicDir, 'sw.js'), to: 'sw.js' },
            { from: path.join(publicDir, 'icons', 'icon.svg'), to: path.join('icons', 'icon.svg') },
          ];

          for (const f of files) {
            if (!fs.existsSync(f.from)) continue;
            const content = fs.readFileSync(f.from);
            compilation.emitAsset(f.to.replaceAll('\\', '/'), new RawSource(content));
          }
        });
      },
    },
  ],
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
    runtimeChunk: 'single',
  },
  devServer: {
    static: [
      { directory: path.join(__dirname, 'dist') },
      { directory: path.join(__dirname, 'public'), publicPath: '/' },
    ],
    compress: true,
    port: 3000,
    historyApiFallback: true,
    proxy: [
      {
        context: ['/api'],
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    ],
  },
};
