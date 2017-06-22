process.env.NODE_ENV = 'development'

// npm
import color from 'colors/safe'
import webpack from 'webpack'
import WebpackDevServer from 'webpack-dev-server'

// own
import easyRequire from './utils/easyRequire'
import overrideHotUpdater from './webpack/override'
import * as log from './utils/log'
import { prepareManifest }  from './shared'
import webpackGenerator from './webpack/webpack.config.dev'

/**
 * Override webpack package files
 * @return {Promise}
 */
function override() {
  return new Promise((resolve) => {
    resolve(overrideHotUpdater())
  })
}

/**
 * Build production release
 *
 * @param  {Object} webpackConfig
 * @return {Promise}
 */
function webpackDevelopment(webpackConfig) {
  return new Promise((resolve, reject) => {
    return easyRequire(() => {

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
        },
        headers: {
          'Access-Control-Allow-Origin': '*'
        }
      }).listen(port, host, function (err, result) {
        if (err) {
          reject('webpack: ' + err)
        } else {
          resolve('Listening at https://' + host + ':' + port)
        }
      })
    })
  })
}

function run(options) {
  override()
  .then(prepareManifest(options))
  .then((Manifest) => {
    return webpackGenerator(Manifest)
  })
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
