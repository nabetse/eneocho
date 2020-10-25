const path = require('path');

module.exports = {
  //mode: 'development',
  entry: './src/index.js',
  /*
  devtool: 'inline-source-map',
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 9000
  }
  */
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
     rules: [
       {
         test: /\.css$/,
         use: [
           'style-loader',
           'css-loader',
         ],
       },
       {
            test: /\.(png|svg|jpg|gif)$/,
            use: [
            'file-loader',
            ],
        },
        {
            test: /\.(woff|woff2|eot|ttf|otf)$/,
            use: [
              'file-loader',
            ],
        },
        {
            test: /\.(csv|tsv)$/,
            use: [
              'csv-loader',
            ],
          },
          {
            test: /\.xml$/,
            use: [
              'xml-loader',
            ],
          },
     ],
   },
};