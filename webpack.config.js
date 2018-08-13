var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var plugins = [
    new webpack.optimize.CommonsChunkPlugin({
        names: ['app', 'vendor', 'polyfills']
    }),
    // Workaround for angular/angular#11580
    new webpack.ContextReplacementPlugin(
        // The (\\|\/) piece accounts for path separators in *nix and Windows
        /angular(\\|\/)core(\\|\/)@angular/,
        __dirname + '/src', // location of your src
        {} // a map of your routes
    ),
    new HtmlWebpackPlugin({
        chunks: ['app', 'vendor', 'polyfills'],
        template: 'src/index.html',
        filename: '../index.html'
    }),
    new ExtractTextPlugin('[name].css')
];

var config = {
    entry: {
        'polyfills': path.resolve(__dirname, 'src/polyfills.ts'),
        'vendor': path.resolve(__dirname, 'src/vendor.ts'),
        'app': path.resolve(__dirname, 'src/main.ts')
    },
    output: {
        path: path.resolve(__dirname, 'dist/client'),
        publicPath: '/client/',
        filename: '[name].js'
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                loaders: [
                    'ts-loader',
                    {
                        loader: 'angular2-template-loader',
                        options: {
                            keepUrl: true
                        }
                    }
                ]
            },
            {
                test: /\.html$/,
                exclude: [
                    path.resolve(__dirname, 'src/index.html')
                ],
                loaders: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: 'assets/templates/'
                        }
                    },
                    'extract-loader',
                    'html-loader'
                ]
            },
            {
                test: /\.json$/,
                loaders: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: 'assets/i18n/',
                            publicPath: './client/'
                        }
                    }
                ]
            },
            {
                test: /\.(png|jpe?g|gif|svg|ico)$/,
                loader: 'file-loader',
                options: {
                    name: '[name].[ext]',
                    outputPath: 'assets/images/'
                }
            },
            {
                test: /\.css$/,
                exclude: [
                    path.resolve(__dirname, 'src/app')
                ],
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: 'css-loader'
                })
            },
            {
                test: /\.css$/,
                include: [
                    path.resolve(__dirname, 'src/app')
                ],
                loaders: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: 'assets/css/',
                            publicPath: './client/'
                        }
                    }
                ]
            },
            {
                test: /\.(woff|woff2|eot|ttf|svg)$/,
                include: [
                    path.resolve(__dirname, "src/font")
                ],
                loader: 'url-loader',
                options: {
                    name: '[name].[ext]',
                    outputPath: 'assets/font/',
                    publicPath: './',
                    limit: 8912
                }
            }
        ]
    },
    plugins: plugins,
    devtool: 'eval-source-map',
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        publicPath: '/client/',
        historyApiFallback: {
            index: 'index.html'
        },
    }
};

if (process.env.BUILD === 'prod') {
    plugins.push(new webpack.optimize.UglifyJsPlugin({ // https://github.com/angular/angular/issues/10618
        mangle: {
            keep_fnames: true
        }
    }));
    delete config.devtool;
}

module.exports = config;