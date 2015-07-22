import gulp from 'gulp';
import configGenerator from './webpack/generator';
import webpackBuild from './webpack/build';
import webpackDevServer from './webpack/server';
import yargs from 'yargs';
import runSequence from 'run-sequence';

const args = yargs
  .alias('p', 'production')
  .argv;

gulp.task('env', () => {
  const env = args.production ? 'production' : 'development';
  process.env.NODE_ENV = env; // eslint-disable-line no-undef
});

gulp.task('webpack-production', webpackBuild(configGenerator(false)));
gulp.task('webpack-hot', webpackDevServer(configGenerator(true)));
gulp.task('webpack-dev', webpackBuild(configGenerator(true)));

gulp.task('webpack-local', (done) => {
  runSequence('webpack-dev', 'webpack-hot', done);
});

gulp.task('webpack', ['env', args.production ? 'webpack-production' : 'webpack-hot']);

gulp.task('default', (done) => {
  runSequence('webpack', done);
});
