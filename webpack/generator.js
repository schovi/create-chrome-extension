import fs from "fs";
import path from "path"
import { execSync } from "child_process";
import ExtractTextPlugin from "extract-text-webpack-plugin";
import webpack from 'webpack';
import _ from 'lodash';

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

  function stripExtension(filename) {
    return filename.split(".").slice(0,-1).join(".") || filename + ""
  }

  return {
    ///// Lowlevel config
    cache: isDevelopment,
    debug: isDevelopment,
    devtool: '',//isDevelopment ? 'cheap-module-eval-source-map' : '',
    context: __dirname,
    node: {__dirname: true},

    ///// Applikační config

    entry: (function() {
      var entries = {}

      _.each(entryScripts, function(entryScript) {
        let name = stripExtension(entryScript)

        if(isDevelopment) {
          entries[name] = [
            'webpack-dev-server/client?http://localhost:3001',
            // Why only-dev-server instead of dev-server:
            // https://github.com/webpack/webpack/issues/418#issuecomment-54288041
            'webpack/hot/only-dev-server',
            path.join(__dirname, "../src", entryScript)
          ]
        } else {
          entries[name] = [
            path.join(__dirname, "../src", entryScript)
          ]
        }
      })

      return entries
    })(),

    // Výstup
    output: (function() {
      var output;

      if(isDevelopment) {
        output = {
          path: path.join(__dirname, "../build"),
          filename: '[name].js',
          chunkFilename: '[name]-[chunkhash].js',
          publicPath: 'http://localhost:3001/'
        }
      } else {
        output = {
          path: path.join(__dirname, "../build"),
          filename: "[name].js"
        }
      }
      return output
    })(),

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
        plugins = plugins.concat([
          // NotifyPlugin,
          new webpack.HotModuleReplacementPlugin(),
          // Tell reloader to not reload if there is an error.
          new webpack.NoErrorsPlugin()
        ])
      } else {
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

      // plugins.push(new webpack.IgnorePlugin(/^(vertx|necodalsiho)$/))

      // plugins.push(
      //   function() {
      //     this.plugin("done", function(stats) {
      //       let jsonStats = stats.toJson({
      //         chunkModules: true,
      //         exclude: [
      //           /node_modules/ //[\\\/]react(-router)?[\\\/]/,
      //         ],
      //       });
      //
      //       jsonStats.publicPath = isDevelopment ? "build" : "";
      //       jsonStats.appVersion = "1.0";
      //       jsonStats.appCommit = execSync("git rev-parse --short HEAD").toString();
      //
      //       const folderPath = path.join(__dirname, "../build");
      //
      //       if (!fs.existsSync(folderPath)) {
      //         fs.mkdirSync(folderPath);
      //       }
      //
      //       fs.writeFileSync(path.join(folderPath, "stats.json"), JSON.stringify(jsonStats));
      //     });
      //   }
      // )


      return plugins;
    })(),

    // Pokud potřebujeme změnit hodnotu toho co se requiruje
    externals: {
      // example: function() {}
    },

    resolve: {
      extensions: ['', '.js', '.json'],
      modulesDirectories: ['src', 'node_modules'],
      root: [
        // TODO kam dáme styly?
        path.join(__dirname, "../src/client/"),
        path.join(__dirname, "../src/styles/"),
        path.join(__dirname, "../assets")
      ],
      alias: {
        // "lodash": __dirname + '/../node_modules/lodash',
        // "promise": __dirname + '/javascripts/lib/promise',

        // Prevence před requirnutím různých verzí
        "promise$": require.resolve(path.join(__dirname, '../node_modules/bluebird')),
        "immutable$": require.resolve(path.join(__dirname, '../node_modules/immutable')),
        "react$": require.resolve(path.join(__dirname, '../node_modules/react')),
        "react/addons$": require.resolve(path.join(__dirname, '../node_modules/react/addons'))
      }
    },

    // Loaders
    module: {
      loaders: (function() {
        var loaders = []

        // Assets
        loaders.concat([
          {
            test: /\.(png|jpg|jpeg|gif|svg)/,
            loader: "url-loader?limit=10000&name=[name]-[hash].[ext]",
            exclude: /node_modules/
          },
          {
            test: /\.(woff|woff2)/,
            loader: "url-loader?limit=10000&name=[name]-[hash].[ext]",
            exclude: /node_modules/
          },
          {
            test: /\.(ttf|eot)/,
            loader: "file-loader?name=[name]-[hash].[ext]",
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
