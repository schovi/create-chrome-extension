import webpack from 'webpack';
import combineLoaders from 'webpack-combine-loaders'
import precss from 'precss'
import autoprefixer from 'autoprefixer'

import * as Remove from '../utils/remove'
import ManifestPlugin from '../manifest/plugin'


// NOTE: Style preprocessors
// If you want to use any of style preprocessor, add related npm package + loader and uncomment following line
var styleLoaders = {
  'css': 'postcss-loader',
  'less': 'less-loader',
  'scss|sass': 'sass-loader'
};

function makeStyleLoaders() {
  return Object.keys(styleLoaders).map(function(ext) {
    // TODO: Autoprefixer just for webkit. You can guess why :D
    var prefix = 'css-loader?sourceMap&root=../assets'
    var loader = 'style-loader!' + prefix + '!' + styleLoaders[ext];;

    return {
      test: new RegExp('\\.(' + ext + ')$'),
      exclude: /(node_modules|bower_components)/,
      loader: loader
    };
  });
}

function config(Manifest) {
  const isDevelopment = process.env.NODE_ENV == "development" || true

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

          // TODO: just some assets I use often. Need to be more dynamic
          {
            test: /\.(png|jpg|jpeg|gif|svg|wav|woff|woff2|ttf|eot)/,
            exclude: /(node_modules|bower_components)/,
            loader: "url-loader?limit=1000000&name=[name]-[hash].[ext]"
          },
          // Styles
          ...makeStyleLoaders(),

          // Scripts
          (function() {
            const base = {
              test: /\.jsx?$/,
              exclude: /(node_modules|bower_components)/
            }

            const babelQuery = {
              cacheDirectory: true,
              plugins: [ "transform-decorators-legacy" ],
              presets: [ "react", "es2015", "es2016", "es2017", "stage-0" ]
              // [
              //   [
              //     "target", {
              //       plugins: [ "transform-decorators-legacy" ],
              //       presets: [ "es2015", "es2016", "es2017", "stage-0" ],
              //       targets: [
              //         { name: "chrome", version: 52 }
              //       ]
              //     }
              //   ]
              // ]
            }

            if(isDevelopment) {
              babelQuery.presets = [
                "react-hmre",
                ...babelQuery.presets
              ]

              return {
                ...base,
                loader: 'babel-loader',
                query: babelQuery
                // loader: combineLoaders([
                //   {
                //     loader: 'react-hot-loader'
                //   },
                //   {
                //     loader: 'babel-loader',
                //     query: babelQuery
                //   }
                // ])
              }
            } else {
              return {
                ...base,
                loader: 'babel-loader',
                query: babelQuery
              }
            }
          })(),

          // Json
          {
            test: /\.json/,
            exclude: /(node_modules|bower_components)/,
            loader: "json-loader"
          }
          // NOTE: Add more loaders here
        ]

        return loaders
      })()
    },
    postcss: function () {
      return [precss, autoprefixer];
    }
  }
}

export default config
