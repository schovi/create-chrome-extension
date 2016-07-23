import fs from 'fs'
import path from 'path'
import commander from 'commander'
import { run, build } from './index'
import pckg from '../package.json'

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
  .option(
    '-e --env <env>',
    'node environment (default: development)',
    'development'
  )
).action(actionHandler(run))

/**
 * Build command
 */
applyOptions(
  commander
  .command('build <manifest>')
  .description('build extension for distribution')
  .option(
    '-e --env <env>',
    'node environment (default: production)',
    'production'
  )
).action(actionHandler(build))

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
    .option(
      '-o --output <path>',
      'output directory path'
    )
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
function processOptions(command) {
  const output = resolvePath(command.output, 'output')
  // const config = resolvePath(command, 'config')

  return {
    output,
    // config
  }
}

/**
 * Returns handler for Command action with given function
 *
 * @param  {Function} runner
 * @return {Function}
 */
function actionHandler(runner) {
  return function(manifest, command) {
    try {
      runner({
        ...processOptions(command),
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
}

function MissingOptionError(message = "") {
    this.name = "MissingOptionError"
    this.message = message
}

MissingOptionError.prototype = Error.prototype;
