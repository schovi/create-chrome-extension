import Manifest from './manifest'
import configGenerator from './webpack/config';

/**
* For given manifest path, process everything in it
*
* @param  {String} path Manifest file path
* @return {Promise(Manifest)}
*/
export function prepareManifest(options) {
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
export function prepareWebpackConfig(manifest) {
  return configGenerator(manifest)
}
