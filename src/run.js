// npm
import color from 'colors/safe'
import webpack from 'webpack'
import WebpackDevServer from 'webpack-dev-server'

// own
import Manifest from './chrome-extension/manifest'
import overrideHotUpdater from './chrome-extension/override'
import configGenerator from './chrome-extension/webpack.generator'
import * as log from './chrome-extension/manifest/log'

/**
 * Override webpack package files
 * @return {Promise}
 */
function override() {
  return new Promise((resolve) => {
    resolve(overrideHotUpdater())
  })
}

// TODO: sjednotit s build.js
/**
* For given manifest path, process everything in it
*
* @param  {String} path Manifest file path
* @return {Promise(Manifest)}
*/
function prepareManifest(options) {
  return function() {
    return new Promise((resolve) => {
      resolve(new Manifest(options))
    })
  }
}

/**
 * Generate webpack config from Manifest
 *
 * @param  {Manifest} manifest
 * @return {Object}
 */
function prepareWebpackConfig(manifest) {
  return configGenerator(manifest)
}

/**
 * Build production release
 *
 * @param  {Object} webpackConfig
 * @return {Promise}
 */
function webpackDevelopment(webpackConfig) {
  return new Promise((resolve, reject) => {
    // TODO move to config
    const host = "0.0.0.0"
    const port = 3001

    new WebpackDevServer(webpack(webpackConfig), {
      contentBase: 'https://localhost:3001',
      publicPath: webpackConfig.output.publicPath,
      https: true,
      // lazy: true,
      // watchDelay: 50,
      hot: true,
      // Unfortunately quiet swallows everything even error so it can't be used.
      quiet: false,
      // No info filters only initial compilation it seems.
      noInfo: false,
      // noInfo: true,
      // Remove console.log mess during watch.
      stats: {
        // assets: false,
        colors: true,
        // version: false,
        // hash: false,
        // timings: false,
        // chunks: false,
        // chunkModules: false
      }
    }).listen(port, host, function (err, result) {
      if (err) {
        reject('webpack: ' + err)
      } else {
        resolve('Listening at https://' + host + ':' + port)
      }
    })
  })
}

function run(options) {
  process.env.NODE_ENV = options.environment

  override()
  .then(prepareManifest(options))
  .then(prepareWebpackConfig)
  .then(webpackDevelopment)
  // Development server ready
  .then(function(message) {
    console.log(color.green(message))
  })
  // Some error happened
  .catch(function(error) {
    console.log(color.red(error.stack || error))
  })
}

module.exports = run
