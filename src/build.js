// Native
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process'

// npm
import rimraf from 'rimraf';
import color from 'colors/safe';
import webpack from 'webpack'

// our
import Manifest from './chrome-extension/manifest'
import overrideHotUpdater from './chrome-extension/override'
import configGenerator from './chrome-extension/webpack.generator';
import * as log from './chrome-extension/manifest/log'

/**
 * Clear reelase directory
 *
 * @param  {String} path Release directory path
 * @return {Promise}
 */
function prepareReleaseDir(options) {
  return new Promise((resolve, reject) => {
    rimraf(options.release, () => {
      fs.mkdir(options.release, () => {
        resolve()
      })
    })
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
function webpackProduction(webpackConfig) {
  return new Promise((resolve, reject) => {
    // TODO: Does not log :S
    log.pending(`Processing webpack build`)

    webpack(webpackConfig, function(fatalError, stats) {
      var jsonStats = stats.toJson()

      // We can save jsonStats to be analyzed with
      // http://webpack.github.io/analyse or
      // https://github.com/robertknight/webpack-bundle-size-analyzer.
      // var fs = require('fs')
      // fs.writeFileSync('./bundle-stats.json', JSON.stringify(jsonStats))

      const warnings = jsonStats.warnings
      warnings.forEach((warning) => {
        log.pending(`webpack warning: ${warning}`)
      })

      const buildError = fatalError || jsonStats.errors[0]
      if(buildError) {
        reject(`webpack error: ${buildError}`)
        return
      }

      const result = stats.toString({
        colors: true,
        version: false,
        hash: false,
        timings: false,
        chunks: false,
        chunkModules: false
      })

      log.success(`Done with: ${result}`)
      resolve()
    })
  })
}

/**
 * Generate extension file inside release path
 *
 * @param  {String} path Release directory path
 * @return {Promise}
 */
function makeExtension(options) {
  return function() {
    return new Promise((resolve, reject) => {
      // TODO detect system and Chrome path
      const chromeBinaryPath = '/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome'
      console.log(color.yellow(`Building extension into '${options.release}'`))

      setTimeout(() => {
        const commandParts = [`'${chromeBinaryPath}'`, `--pack-extension=${options.output}`]

        if(options.key) {
          commandParts.push(`--pack-extension-key=${options.key}`)
        }

        const command = `\$(${commandParts.join(" ")})`

        exec(command, (error, stdout, stderr) => {
          if(stdout) {
            console.log(color.yellow('stdout: ' + stdout));
          }

          if(stderr) {
            return reject('stderr: ' + stderr)
          }

          if(error !== null) {
            return reject('exec error: ' + stderr)
          }

          resolve(`Extension builded in '${options.release}'`)
        })
        // Long enought to prevent some unexpected errors
      }, 1000)
    })
  }
}

function build(options) {
  process.env.NODE_ENV = 'production'

  options = {
    ...options,
    key: options.key && path.resolve(options.key),
    release: options.output,
    output: path.join(options.output, 'source')
  }

  // TODO: check if release directory contain *.key file
  // If yes, then ask user if
  // 1) want to use it as key for build
  // 2) really really really want to override it
  prepareReleaseDir(options)
  .then(prepareManifest(options))
  .then(prepareWebpackConfig)
  .then(webpackProduction)
  .then(makeExtension(options))
  // Extension done
  .then(function(message) {
    console.log(color.green(message))
  })
  // Some error happened
  .catch(function(error) {
    console.log(color.red(error.stack || error))
  })
}

module.exports = build
