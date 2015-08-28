import rimraf from 'rimraf';
import fs from 'fs';
import path from 'path';
import gulp from 'gulp';
import configGenerator from './dev-env/webpack.generator';
import webpackBuild from './dev-env/webpack.build';
import webpackDevServer from './dev-env/webpack.server';
import yargs from 'yargs';
import runSequence from 'run-sequence';
import makeManifest from './dev-env/lib/make_manifest'
import overrideHotUpdater from './dev-env/lib/override_hot_updater'
import { exec } from 'child_process'
import clc from 'cli-color';

const releaseDir = path.join(__dirname, "release")
const productionBuildDir = path.join(releaseDir, "build")

const args = yargs
  .alias('p', 'production')
  .argv;

gulp.task('env', () => {
  const env = args.production ? 'production' : 'development';
  process.env.NODE_ENV = env; // eslint-disable-line no-undef
});

// TODO better :)
let scripts = []
gulp.task('manifest', () => {
  scripts = makeManifest()
});

gulp.task('override_webpack', () => {
  overrideHotUpdater()
});

gulp.task('webpack-production', function(done) {
  return webpackBuild(configGenerator(false, scripts))(done)
});

gulp.task('webpack-hot', function(done) {
  return webpackDevServer(configGenerator(true, scripts))(done)
});

gulp.task('webpack-dev', function(done) {
  return webpackBuild(configGenerator(true, scripts))(done)
});

gulp.task('webpack-local', (done) => {
  runSequence('webpack-dev', 'webpack-hot', done);
});

gulp.task('development', (done) => {
  runSequence('override_webpack', 'manifest', 'webpack-hot', done)
})

gulp.task('extension', (done) => {
  const productionBuildDir = path.join(__dirname, "release/build")
  const chromeBinaryPath = '/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome'

  setTimeout(() => {
    console.log(clc.yellow(`Building extension into '${productionBuildDir}'`))
    exec(`\$('${chromeBinaryPath}' --pack-extension=${productionBuildDir})`, (error, stdout, stderr) => {
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
  rimraf(releaseDir, () => {
    fs.mkdir(releaseDir, () => {
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
