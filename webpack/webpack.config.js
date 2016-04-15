/**
 * Created by m.igrachev on 2/5/2016.
 */
var path = require('path');
var webpack = require('webpack');

module.exports = {
    devtool: 'source-map',
    entry: [
        './src/index',
        './tests/middleware-sprec'
    ],
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'multi-action-api-middleware.js'
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin()
    ],
    resolve: {
        extensions: ['', '.js']
    },
    module: {
        loaders: [{
            test: /\.js$/,
            loader: 'babel',
            exclude: /node_modules/,
            include: __dirname
        }]
    }
};
