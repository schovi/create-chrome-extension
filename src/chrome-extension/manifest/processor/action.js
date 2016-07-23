import path from 'path'
import html from './lib/html'

export default function(manifest, {buildPath, src}) {

  // TODO: unify with ./overrides.js
  const actions = [manifest.browser_action, manifest.page_action]
  const scripts = []

  for (let action of actions) {
    if(!action || !action.default_popup) {
      continue
    }

    const script = html(action.default_popup, src, buildPath)

    scripts.push(script)
  }

  return {scripts}
}
