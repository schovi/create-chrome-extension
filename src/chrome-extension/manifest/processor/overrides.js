import html from './lib/html'

const process = function({page, buildPath, scripts}) {
  if(!page) return

  scripts.push(html(page, buildPath))

  return true
}

export default function(manifest, {buildPath, src}) {

  if(!manifest.chrome_url_overrides)
    return

  // TODO: unify with ./action.js
  const {bookmarks, history, newtab} = manifest.chrome_url_overrides

  const overrides = [bookmarks, history, newtab]
  const scripts = []

  for (let override of overrides) {
    if(!override) {
      continue
    }

    const script = html(override, src, buildPath)

    scripts.push(script)
  }

  return {scripts}
}
