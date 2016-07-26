import fs from 'fs'
import findup from 'findup-sync'

//////////
// Merge manifest.json with name, description and version from package.json
export default function(manifest) {
  // Start looking somewhere else, and ignore case (probably a good idea).
  const packagePath = findup('package.json')

  const packageConfig = JSON.parse(fs.readFileSync(packagePath, 'utf8'))

  const { name, description, version } = packageConfig

  manifest = {
    ...manifest,
    name,
    description,
    version
  }

  return {manifest}
}
