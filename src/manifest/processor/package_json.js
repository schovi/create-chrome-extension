import fs from 'fs-extra'
import findupSync from 'findup-sync'

//////////
// Merge manifest.json with name, description and version from package.json
export default function(manifest) {
  const packagePath = findupSync('package.json')

  const packageConfig = fs.readJSONSync(packagePath)

  const { name, description, version } = packageConfig

  manifest = {
    name,
    description,
    version,
    ...manifest
  }

  return {manifest}
}
