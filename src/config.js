import _ from 'lodash'
import path from 'path';
import packageJson from '../package';
import applicationJson from '../../config/application.json';

const env = process.env.NODE_ENV;

export default _.merge({
  env: env,
  isProduction: env === 'production',
  isDevelopment: env === 'development',
  version: packageJson.version,
}, applicationJson[env]);
