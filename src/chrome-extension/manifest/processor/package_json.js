import fs from 'fs'
import _ from 'lodash'
import findup from 'findup-sync'

//////////
// Merge manifest.json with name, description and version from package.json
export default function(manifest) {
  // Start looking somewhere else, and ignore case (probably a good idea).
  const packagePath = findup('package.json')

  const packageConfig = JSON.parse(fs.readFileSync(packagePath, 'utf8'))

  manifest = _.merge({}, manifest, _.pick(packageConfig, 'name', 'description', 'version'));

  return {manifest}
}
