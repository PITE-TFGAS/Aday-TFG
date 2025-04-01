const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = {
    entry: {
        popup: './src/popup.ts',
        background: './src/background.ts',
        content: './src/content.ts',
    },
    output: {
        filename: '[name].js', // Genera popup.js, background.js y content.js
        path: path.resolve(__dirname, '../dist'),
    },
    resolve: {
        extensions: ['.ts', '.js'],
        fallback: {
            fs: false,
            net: false,
            tls: false,
            url: require.resolve('url/'),
        },
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    plugins: [
        new CopyPlugin({
          patterns: [
            { from: ".", to: ".", context: "public" },
            { from: "./src/Database/prompts.json", to: "Database/prompts.json" } // Añade esta línea
          ]
        }),
    ],
    mode: 'production',
};