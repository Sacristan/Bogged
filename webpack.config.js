const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const appDirectory = fs.realpathSync(process.cwd());

module.exports = {
    mode: 'development',
    // entry: path.resolve(appDirectory, 'src/app.ts'), // path to the main .ts file
    entry: path.resolve(appDirectory, 'src/index.jsx'), // path to the main .ts file
    output: {
        filename: 'js/bundleName.js', // name for the js file that is created/compiled in memory
        clean: true,
    },
    resolve: {
        extensions: ['.ts', '.js', '.jsx'],
    },
    performance: {
        maxEntrypointSize: 512000,
        maxAssetSize: 512000
    },
    devServer: {
        host: '0.0.0.0',
        historyApiFallback: true,
        port: 8080, // port that we're using for local host (localhost:8080)
        static: path.resolve(appDirectory, 'public'), // tells webpack to serve from the public folder
        devMiddleware: {
            publicPath: '/',
        },
    },
    module: {
        rules: [
            //TS
            {
                test: /\.ts?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            //REACT
            {
                test: /\.jsx$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
            },
            //CSS
            {
                test: /\.css$/i,
                use: [
                    'style-loader',
                    'css-loader',
                    {
                        loader: 'postcss-loader',
                        options: {
                            postcssOptions: {
                                plugins: [
                                    [
                                        'postcss-preset-env',
                                        {
                                            // Options
                                        },
                                    ],
                                ],
                            },
                        },
                    },
                ],
            },
            //FONTS + MISC
            {
                test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: 'fonts/',
                        },
                    },
                ],
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            inject: true,
            template: path.resolve(appDirectory, 'public/index.html'),
        }),
        new CleanWebpackPlugin(),
    ],
};
