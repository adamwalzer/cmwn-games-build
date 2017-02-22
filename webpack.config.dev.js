var path = require('path');
var webpack = require('webpack');

module.exports = {
    context: path.join(__dirname, 'library'),
    entry: null,
    devtool: 'source-map',
    resolve: {
        root: [path.resolve(__dirname, 'library'), path.resolve(__dirname, 'node_modules')],
        extensions: ['', '.js', '.json'],
        modulesDirectories: ['node_modules']
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin()
    ],
    output: {
        path: __dirname + '/build',
        filename: '[name]/ai.js',
        publicPath: '/build/'
    },
    module: {
        preLoaders: [
            { test: /\.json$/, exclude: /node_modules/, loader: 'json'},
        ],
        loaders: [
            {
                test: /\.js$/,
                loader: ['babel'],
                exclude: [/bower_components/, /node_modules/],
                query: {
                    presets: ['react', 'es2015', 'react-hmre', 'stage-0']
                }
            }
        ]
    },
    postcss: function () {
        return [autoprefixer];
    },
    cache: false
};
