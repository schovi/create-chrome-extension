import script from './lib/script'

export default function(manifest, {buildPath}) {
  const {content_scripts} = manifest

  if(!content_scripts) return

  const scripts = []

  content_scripts.forEach((content_script = []) => {
    // TODO content_script can contain css too.
    // Maybe we can be strict, throw error and tell user to add css into scripts and leave it on webpack too
    content_script.js.forEach((scriptPath) => {
      script(scriptPath, buildPath)
      scripts.push(scriptPath)
    })
  })

  return {scripts}
}
