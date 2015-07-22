import gulp from 'gulp';
import configGenerator from './webpack/generator';
import webpackBuild from './webpack/build';
import webpackDevServer from './webpack/server';
import yargs from 'yargs';
import runSequence from 'run-sequence';
import makeManifest from './src/util/make_manifest'

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

gulp.task('webpack', ['env', 'manifest', args.production ? 'webpack-production' : 'webpack-hot']);

gulp.task('default', (done) => {
  runSequence('webpack', done);
});

gulp.task('config', (done) => {
  done()
})
