const path = require('path');

module.exports = {
    mode: 'development',
    watch: true,
    // entry: './src/index.js',
    entry: './src/state/index.js',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'public'),
    },
    devServer: {
        contentBase: path.join(__dirname, 'public'),
        hot: true,
        port: 9000,
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
};
