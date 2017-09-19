const path = require('path')

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: process.env.NODE_ENV === 'production' ? 'tractor.min.js' : 'tractor.js',
    library: 'Tractor',
    libraryTarget: 'umd'
  },
  module: {
    rules: [
      // https://github.com/babel/babel-loader
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader'
        },
        include: path.join(__dirname, 'src')
      }
    ]
  }
}
