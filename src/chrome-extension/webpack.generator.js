// import fs from "fs";
// import path from "path"

import combineLoaders from 'webpack-combine-loaders'
import webpack from 'webpack';
import _ from 'lodash';

import * as Remove from './remove'
import ManifestPlugin from './manifest/plugin'

// NOTE: Style preprocessors
// If you want to use any of style preprocessor, add related npm package + loader and uncomment following line
var styleLoaders = {
  'css': '',
  'less': '!less-loader',
  'scss|sass': '!sass-loader'
  // 'styl': '!stylus-loader'
};

function makeStyleLoaders() {
  return Object.keys(styleLoaders).map(function(ext) {
    // NOTE: Enable autoprefixer loader
    var prefix = 'css-loader?sourceMap&root=../assets'//!autoprefixer-loader?browsers=last 2 version';
    var extLoaders = prefix + styleLoaders[ext];
    var loader = 'style-loader!' + extLoaders;

    return {
      test: new RegExp('\\.(' + ext + ')$'),
      exclude: /node_modules/,
      loader: loader
    };
  });
}

function configGenerator(Manifest) {
  const isDevelopment = process.env.NODE_ENV == "development"

  return {
    ///// Lowlevel config
    cache: isDevelopment,
    debug: isDevelopment,
    devtool: isDevelopment ? 'cheap-module-eval-source-map' : '',
    node: {__dirname: true},

    ///// App config

    // Entry points in your app
    // There we use scripts from your manifest.json
    entry: {},

    // Output
    output: (function() {
      let output = {
        path: Manifest.buildPath,
        filename: '[name].js'
      }

      if(isDevelopment) {
        output = {
          ...output,
          chunkFilename: '[name]-[chunkhash].js',
          publicPath: 'https://localhost:3001/'
        }
      }

      return output
    })(),

    // Plugins
    plugins: (function() {
      let plugins = [
        new webpack.optimize.OccurenceOrderPlugin(),
        new ManifestPlugin(Manifest, isDevelopment),
        new webpack.DefinePlugin({
          "global.GENTLY": false,
          "process.env": {
            APP_ENV:  JSON.stringify(process.env.APP_ENV),
            NODE_ENV: JSON.stringify(process.env.NODE_ENV),
            IS_BROWSER: true
          }
        })
      ];

      if(isDevelopment) {
        // Development plugins for hot reload
        plugins = [
          ...plugins,
          // NotifyPlugin,
          new webpack.HotModuleReplacementPlugin(),
          // Tell reloader to not reload if there is an error.
          new webpack.NoErrorsPlugin()
        ]

      } else {
        // Production plugins for optimizing code
        plugins = [
          ...plugins,
          new webpack.optimize.UglifyJsPlugin({
            compress: {
              // Because uglify reports so many irrelevant warnings.
              warnings: false
            }
          }),
          new webpack.optimize.DedupePlugin(),
          // new webpack.optimize.LimitChunkCountPlugin({maxChunks: 15}),
          // new webpack.optimize.MinChunkSizePlugin({minChunkSize: 10000}),
          function() {
            this.plugin("done", function(stats) {
              if (stats.compilation.errors && stats.compilation.errors.length) {
                console.log(stats.compilation.errors)
                process.exit(1)
              }
            })
          }
        ]
      }

      // NOTE: Custom plugins
      // if you need to exclude anything pro loading
      // plugins.push(new webpack.IgnorePlugin(/^(vertx|somethingelse)$/))

      return plugins;
    })(),

    // NOTE: Override external requires
    // If you need to change value of required (imported) module
    // for example if you dont want any module import 'net' for various reason like code only for non browser envirinment
    externals: {
      // net: function() {}
    },

    resolve: {
      extensions: [
        '',
        '.js',
        '.jsx',
        '.json'
      ],
      modulesDirectories: [
        'src',
        'node_modules'
      ],
      root: [
        Manifest.src
      ],
      alias: (function() {
        // NOTE: Aliasing
        // If you want to override some path with another. Good for importing same version of React across different libraries
        var alias = {
          // "react-fa-icon": require.resolve(path.resolve(Manifest.src, 'lib/react-fa-icon'))
          // "lodash$": require.resolve(path.join(__dirname, '../node_modules/lodash')),
          // "promise$": require.resolve(path.join(__dirname, '../node_modules/bluebird')),
          // "bluebird$": require.resolve(path.join(__dirname, '../node_modules/bluebird')),
          // "immutable$": require.resolve(path.join(__dirname, '../node_modules/immutable')),
          // "react$": require.resolve(path.join(__dirname, '../node_modules/react'))
          // "react-dom$": require.resolve(path.join(__dirname, '../node_modules/react-dom'))
        }

        return alias;
      })()
    },

    // Loaders
    module: {
      loaders: (function() {
        var loaders = [
          // Assets

          // Inline all assets with base64 into javascripts
          // TODO make and test requiring assets with url
          {
            test: /\.wav/,
            exclude: /node_modules/,
            loader: "url-loader?limit=1000000&name=[name]-[hash].[ext]"
          },
          {
            test: /\.(png|jpg|jpeg|gif|svg)/,
            exclude: /node_modules/,
            loader: "url-loader?limit=1000000&name=[name]-[hash].[ext]"
          },
          {
            test: /\.(woff|woff2)/,
            exclude: /node_modules/,
            loader: "url-loader?limit=1000000&name=[name]-[hash].[ext]"
          },
          {
            test: /\.(ttf|eot)/,
            exclude: /node_modules/,
            loader: "url-loader?limit=1000000?name=[name]-[hash].[ext]"
          },

          // Styles
          ...makeStyleLoaders(),

          // Scripts
          (function() {
            const base = {
              test: /\.jsx?$/,
              exclude: /node_modules/
            }

            // const babelQuery = {
            //   "presets": [
            //     "react",
            //     "es2015"
            //   ],
            //   "plugins": [
            //     "transform-object-rest-spread"
            //   ]
            // }

            if(process.env.NODE_ENV == 'production') {
              return {
                ...base,
                loader: 'babel-loader',
                // query: babelQuery
              }
            } else {
              // babelQuery.presets = [
              //   ...babelQuery.presets,
              //   "react-hmre"
              // ]

              return {
                ...base,
                loader: combineLoaders([
                  {
                    loader: 'react-hot-loader'
                  },
                  {
                    loader: 'babel-loader',
                    // query: babelQuery
                  }
                ])
              }
            }
          })(),

          // Json
          {
            test: /\.json/,
            exclude: /node_modules/,
            loader: "json-loader"
          }
          // NOTE: Add more loaders here
        ]

        return loaders
      })()
    }
  }
}

module.exports = configGenerator
