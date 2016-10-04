import fs from 'fs'
import path from 'path'
import commander from 'commander'
import pckg from '../package.json'

class MissingOptionError extends Error {

}

/**
 * Generic settings
 */

commander
.version(pckg.version)

/**
 * Run command
 */
applyOptions(
  commander
    .command('run <manifest>')
    .description('run extension in development environment')
).action(runHandler);

/**
 * Build command
 */
applyOptions(
  commander
    .command('build <manifest>')
    .description('build extension for distribution')
).action(buildHandler);

/**
 * Start it!
 */
commander.parse(process.argv);

/**
 * Wrap command with common options
 *
 * @param  {Command} commander
 * @return {Command}
 */
function applyOptions(commander) {
  return (
    commander
    // .option(
    //   '-c --config <path>',
    //   'custom webpack config',
    //   function(path) {
    //     resolvePath('config', path)
    //   }
    // )
    .option('-o --output <path>', 'output directory path')
  )
}

/**
 * Get path from Command option and allow to throw error for missing one
 *
 * @param  {Command} command
 * @param  {String|Boolean} option
 * @return {String}
 */
function resolvePath(pathToResolve, required = false) {
  if(required && !pathToResolve) {
    throw new MissingOptionError(`error: missing required option '${required}'`)
  }

  return path.resolve(pathToResolve)
}

/**
 * Extract options from Command
 *
 * @param  {Command} command
 * @return {Object}
 */
function processOptions(options) {
  const output = resolvePath(options.output, 'output')
  // const config = resolvePath(command, 'config')

  return {
    ...options,
    output
  }
}

/**
 * Returns handler for Command action with given function
 *
 * @param  {Function} runner
 * @param  {String} manifest
 * @param  {Object} options
 */
function actionHandler(runner, manifest, options) {
  try {
    runner({
      ...processOptions(options),
      manifest: path.resolve(manifest)
    })
  } catch(ex) {
    if(ex instanceof MissingOptionError) {
      console.error(`\n  ${ex.message}\n`)
    } else {
      throw ex
    }
  }
}

function runHandler(manifest, options) {
  actionHandler(require('./run'), manifest, options)
}


function buildHandler(manifest, options) {
  actionHandler(require('./build'), manifest, options)
}
