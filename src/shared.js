import Manifest from './manifest'

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
