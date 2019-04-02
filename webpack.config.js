const path = require('path');
const webpack = require('webpack');

module.exports = {
    mode: 'development',
    entry: path.resolve(__dirname, './client/index.js'),
    output:{
        path: path.resolve(__dirname, 'client/dist'),
        filename: './client/dist/bundle.js'
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin() 
    ],
    devServer: {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
        },
        contentBase: __dirname,
        hot: true
    },
    module: {
        rules: [
            {
                exclude: [/node_modules/, /onLoad.json/],
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env', '@babel/preset-react']
                    }
                }
            },
            {
                test: /.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    }
};