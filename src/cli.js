import fs from 'fs'
import path from 'path'
import commander from 'commander'
import { run, build } from './index'
import pckg from '../package.json'

if(!process.env.NODE_ENV) {
  process.env.NODE_ENV = "development"
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
    .option('-e --env [env]', 'node environment', 'development')
).action(actionHandler(run));

/**
 * Build command
 */
applyOptions(
  commander
    .command('build <manifest>')
    .description('build extension for distribution')
    .option('-e --env [env]', 'node environment', 'production')
).action(actionHandler(build));

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
 * @return {Function}
 */
function actionHandler(runner) {
  return function(manifest, options) {
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
}

class MissingOptionError extends Error {

}
