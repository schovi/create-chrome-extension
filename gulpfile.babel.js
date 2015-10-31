// Native
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process'

// npm
import rimraf from 'rimraf';
import clc from 'cli-color';
import yargs from 'yargs';

// gulp
import gulp from 'gulp';
import runSequence from 'run-sequence';

// package
import configGenerator from './dev-env/webpack.generator';
import webpackBuild from './dev-env/webpack.build';
import webpackDevServer from './dev-env/webpack.server';
import Manifest from './dev-env/manifest'
import overrideHotUpdater from './dev-env/lib/override_hot_updater'
import * as paths from './dev-env/paths'


// Program

const args = yargs
  .alias('p', 'production')
  .argv;

gulp.task('env', () => {
  const env = args.production ? 'production' : 'development';
  process.env.NODE_ENV = env; // eslint-disable-line no-undef
});

// gulp.task('test-manifest', () => {
//   const watcher = new Manifest(paths.manifest)
//   watcher.watch()
// })

let manifest

gulp.task('manifest', () => {
  manifest = new Manifest(paths.manifest)
  manifest.run()
});

gulp.task('override_webpack', () => {
  overrideHotUpdater()
});

gulp.task('webpack-production', function(done) {
  return webpackBuild(configGenerator(false, manifest))(done)
});

gulp.task('webpack-hot', function(done) {
  return webpackDevServer(configGenerator(true, manifest))(done)
});

gulp.task('webpack-dev', function(done) {
  return webpackBuild(configGenerator(true, manifest))(done)
});

gulp.task('webpack-local', (done) => {
  runSequence('webpack-dev', 'webpack-hot', done);
});

gulp.task('development', (done) => {
  runSequence('override_webpack', 'manifest', 'webpack-hot', done)
})

gulp.task('extension', (done) => {
  // TODO detect system and Chrome path
  const chromeBinaryPath = '/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome'

  setTimeout(() => {
    console.log(clc.yellow(`Building extension into '${paths.releaseBuild}'`))
    exec(`\$('${chromeBinaryPath}' --pack-extension=${paths.releaseBuild})`, (error, stdout, stderr) => {
      console.log(clc.green('Done'));

      if(stdout)
        console.log(clc.yellow('stdout: ' + stdout));

      if(stderr)
        console.log(clc.red('stderr: ' + stderr));

      if(error !== null)
        console.log(clc.red('exec error: ' + error));

      done()
    })
  // Long enought to prevent some unexpected errors
  }, 1000)
})

gulp.task('prepare-release-dir', (done) => {
  rimraf(paths.release, () => {
    fs.mkdir(paths.release, () => {
      done()
    })
  })
})

gulp.task('production', (done) => {
  runSequence('prepare-release-dir', 'manifest', 'webpack-production', 'extension', done)
})

gulp.task('run', (done) => {
  runSequence('env', (args.production ?  'production' : 'development'), done)
});

gulp.task('default', (done) => {
  runSequence('run', done);
});
