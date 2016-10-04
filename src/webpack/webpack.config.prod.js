import webpack from 'webpack';
import precss from 'precss'
import autoprefixer from 'autoprefixer'

import * as Remove from '../utils/remove'
import ManifestPlugin from '../manifest/plugin'

// NOTE: Style preprocessors
// If you want to use any of style preprocessor, add related npm package + loader and uncomment following line
const styleLoaders = {
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
      loader: loader
    };
  });
}

// This is the production configuration.
// It compiles slowly and is focused on producing a fast and minimal bundle.
// The development configuration is different and lives in a separate file.
module.exports = function(Manifest) {
  return {
    // Don't attempt to continue if there are any errors.
    bail: true,
    // We generate sourcemaps in production. This is slow but gives good results.
    // You can exclude the *.map files from the build during deployment.
    devtool: '',
    // In production, we only want to load the polyfills and the app code.
    entry: {},

    output: {
      path: Manifest.buildPath,
      filename: '[name].js'
    },

    resolve: {
      root: [
        Manifest.src
      ],
      // These are the reasonable defaults supported by the Node ecosystem.
      // We also include JSX as a common component filename extension to support
      // some tools, although we do not recommend using it, see:
      // https://github.com/facebookincubator/create-react-app/issues/290
      extensions: ['.js', '.json', '.jsx', ''],
      alias: {
        // Support React Native Web
        // https://www.smashingmagazine.com/2016/08/a-glimpse-into-the-future-with-react-native-for-web/
        'react-native': 'react-native-web'
      }
    },

    module: {
      loaders: [
        ...makeStyleLoaders(),

        {
          test: /\.(js|jsx)?$/,
          loader: 'babel-loader',
          query: {
            babelrc: false,
            cacheDirectory: true,
            plugins: [ "transform-decorators-legacy" ],
            presets: [ "react", "es2015", "es2016", "es2017", "stage-0" ]
          }
        },

        // JSON is not enabled by default in Webpack but both Node and Browserify
        // allow it implicitly so we also enable it.
        {
          test: /\.json$/,
          loader: 'json'
        },

        {
          test: /\.(ico|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)/,
          loader: "url-loader?limit=1000000&name=[name]-[hash].[ext]"
        }
      ]
    },
    // We use PostCSS for autoprefixing only.
    postcss: function() {
      return [
        autoprefixer({
          browsers: [
            'last 10 Chrome versions'
          ]
        }),
      ];
    },
    plugins: [
      new ManifestPlugin(Manifest),
      new webpack.DefinePlugin({
        "global.GENTLY": false,
        "process.env.APP_ENV": JSON.stringify(process.env.APP_ENV),
        "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
        "process.env.IS_BROWSER": JSON.stringify(process.env.IS_BROWSER)
      }),
      // Makes some environment variables available to the JS code, for example:
      // if (process.env.NODE_ENV === 'production') { ... }. See `./env.js`.
      // It is absolutely essential that NODE_ENV was set to production here.
      // Otherwise React will be compiled in the very slow development mode.
      // This helps ensure the builds are consistent if source hasn't changed:
      new webpack.optimize.OccurrenceOrderPlugin(),
      // Try to dedupe duplicated modules, if any:
      new webpack.optimize.DedupePlugin(),
      // Minify the code.
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          screw_ie8: true, // React doesn't support IE8
          warnings: false
        },
        mangle: {
          screw_ie8: true
        },
        output: {
          comments: false,
          screw_ie8: true
        }
      })
    ],
    // Some libraries import Node modules but don't use them in the browser.
    // Tell Webpack to provide empty mocks for them so importing them works.
    node: {
      fs: 'empty',
      net: 'empty',
      tls: 'empty'
    }
  }
};
