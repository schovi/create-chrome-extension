import fs from "fs";
import path from "path"
import { execSync } from "child_process";
import webpack from 'webpack';
import _ from 'lodash';
import * as Remove from './lib/remove'

var styleLoaders = {
  'css': '',
  'less': '!less-loader',
  'scss|sass': '!sass-loader',
  'styl': '!stylus-loader'
};

function configGenerator(isDevelopment, entryScripts) {

  function makeStyleLoaders() {
    return Object.keys(styleLoaders).map(function(ext) {
      var prefix = 'css-loader?sourceMap&root=../assets'//!autoprefixer-loader?browsers=last 2 version';
      var extLoaders = prefix + styleLoaders[ext];
      var loader = 'style-loader!' + extLoaders;

      return {
        loader: loader,
        test: new RegExp('\\.(' + ext + ')$'),
        exclude: /node_modules/
      };
    });
  }

  return {
    ///// Lowlevel config
    cache: isDevelopment,
    debug: isDevelopment,
    devtool: isDevelopment ? 'cheap-module-eval-source-map' : '',
    context: __dirname,
    node: {__dirname: true},

    ///// App config

    // Entry points in your app
    // There we use scripts from your manifest.json
    entry: (function() {
      var entries = {}

      _.each(entryScripts, function(entryScript) {
        let name = Remove.all(entryScript)

        if(isDevelopment) {
          entries[name] = [
            'webpack-dev-server/client?https://localhost:3001',
            // Why only-dev-server instead of dev-server:
            // https://github.com/webpack/webpack/issues/418#issuecomment-54288041
            'webpack/hot/only-dev-server',
            path.join(__dirname, "../src", entryScript)//,
            // './override_hot_download_update_chunk',
          ]
        } else {
          entries[name] = [
            path.join(__dirname, "../src", entryScript)
          ]
        }
      })

      return entries
    })(),

    // Output
    output: (function() {
      var output;

      if(isDevelopment) {
        output = {
          path: path.join(__dirname, "../build"),
          filename: '[name].js',
          chunkFilename: '[name]-[chunkhash].js',
          publicPath: 'https://localhost:3001/'
        }
      } else {
        output = {
          path: path.join(__dirname, "../release/build"),
          filename: "[name].js"
        }
      }
      return output
    })(),

    // Plugins
    plugins: (function() {
      let plugins = [
        new webpack.DefinePlugin({
          "global.GENTLY": false,
          "process.env": {
            NODE_ENV: JSON.stringify(isDevelopment ? 'development' : 'production'),
            IS_BROWSER: true
          }
        })
      ];

      if(isDevelopment) {
        // Development plugins for hot reload
        plugins = plugins.concat([
          // NotifyPlugin,
          new webpack.HotModuleReplacementPlugin(),
          // Tell reloader to not reload if there is an error.
          new webpack.NoErrorsPlugin()
        ])
      } else {
        // Production plugins for optimizing code
        plugins = plugins.concat([
          new webpack.optimize.UglifyJsPlugin({
            compress: {
              // Because uglify reports so many irrelevant warnings.
              warnings: false
            }
          }),
          new webpack.optimize.DedupePlugin(),
          new webpack.optimize.OccurenceOrderPlugin(),
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
        ])
      }

      // CUSTOM
      // if you need to exclude anything pro loading
      // plugins.push(new webpack.IgnorePlugin(/^(vertx|somethingelse)$/))

      return plugins;
    })(),

    // CUSTOM
    // If you need to change value of required (imported) module
    // for example if you dont want any module import 'net' for various reason like code only for non browser envirinment
    externals: {
      // net: function() {}
    },

    resolve: {
      extensions: ['', '.js', '.json'],
      modulesDirectories: ['src', 'node_modules'],
      root: [
        path.join(__dirname, "../src/client/"),
        path.join(__dirname, "../assets")
      ],
      alias: (function() {
        // CUSTOM
        // If you want to override some path with another. Good for importing same version of React across different libraries
        var alias = {
          // "react$": require.resolve(path.join(__dirname, '../node_modules/react')),
          // "react/addons$": require.resolve(path.join(__dirname, '../node_modules/react/addons'))
        }

        return alias;
      })()
    },

    // Loaders
    module: {
      loaders: (function() {
        var loaders = []

        // Assets

        // Inline all assets with base64 into javascripts
        // TODO make and test requiring assets with url
        loaders = loaders.concat([
          {
            test: /\.(png|jpg|jpeg|gif|svg)/,
            loader: "url-loader?limit=1000000&name=[name]-[hash].[ext]",
            exclude: /node_modules/
          },
          {
            test: /\.(woff|woff2)/,
            loader: "url-loader?limit=1000000&name=[name]-[hash].[ext]",
            exclude: /node_modules/
          },
          {
            test: /\.(ttf|eot)/,
            loader: "url-loader?limit=1000000?name=[name]-[hash].[ext]",
            exclude: /node_modules/
          }
        ])

        // Styles
        loaders = loaders.concat(makeStyleLoaders())

        // Scripts
        loaders = loaders.concat([
          {
            test: /\.js$/,
            exclude: /node_modules/,
            loaders: isDevelopment ? [
              'react-hot', 'babel-loader'
            ] : [
              'babel-loader'
            ]
          }
        ])

        return loaders
      })()
    }
  }
}

module.exports = configGenerator
