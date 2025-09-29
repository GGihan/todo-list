const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './src/index.js',

    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'main.js',
        clean: true,
    },

    mode: 'development',

    devtool: "eval-source-map",
    devServer: {
        watchFiles: ["./src/index.html"],
    },

    plugins: [
        new HtmlWebpackPlugin({
        title: 'Todo-List',
        template: './src/index.html',
        }),
    ],

    module: {
        rules: [
            {
                test: /\.css$/i,
                use:  ["style-loader", "css-loader"],
            },
            {
                test: /\.html$/i,
                loader: "html-loader",
            },
            {
                test: /\.(png|jpg|jpeg|gif|svg)$/i,
                type: 'asset/resource',
            },
        ],
    },
};