import fs from 'fs-extra';
import path from 'path';
import packageConfig from '../../package.json';
import manifestSkelet from '../../src/manifest.json';
import makeInjector from './make_injector';
import makePopupLayout from './make_popup_layout';
import _ from 'lodash';
import rimraf from 'rimraf';
import mkdirp from 'mkdirp'
import clc from 'cli-color';
import * as Remove from './remove';
import * as paths from '../paths'

export default function() {
  let buildPath

  if(process.env.NODE_ENV == "development") {
    buildPath = paths.build
  } else {
    buildPath = paths.releaseBuild
  }

  // Prepare clear build
  rimraf.sync(buildPath)
  fs.mkdirSync(buildPath)

  // Merge manifest.json with name, description and version from package.json
  const packageValues = _.pick(packageConfig, 'name', 'description', 'version');
  const manifest = _.merge(manifestSkelet, packageValues);

  //////////
  // CSP. Fix Content security policy to allow eval webpack scripts in development mode
  if(process.env.NODE_ENV == 'development') {
    let csp = manifest["content_security_policy"] || ""

    const objectSrc = "object-src 'self'"

    if(~csp.indexOf('object-src')) {
      csp = csp.replace('object-src', objectSrc)
    } else {
      csp = `${objectSrc}; ${csp}`
    }

    const scriptSrc = "script-src 'self' 'unsafe-eval' https://localhost:3001"

    if(~csp.indexOf('script-src')) {
      csp = csp.replace('script-src', scriptSrc)
    } else {
      csp = `${scriptSrc}; ${csp}`
    }

    manifest["content_security_policy"] = csp
  }

  //////////
  // Prepare background, content and popup injectors
  const scripts = [];

  // Add script for next processing.
  // Validate its presence and ignore duplicates
  const pushScriptName = function(scriptName) {
    const scriptPath = path.join(paths.src, scriptName)

    if(!fs.existsSync(scriptPath)) {
      console.warn(clc.red(`Missing script ${scriptPath}`))

      return
    }

    if(~scripts.indexOf(scriptName))
      return

    scripts.push(scriptName)
  }

  // When in development mode, create injector for each script
  const processScriptName = function (scriptName) {
    if(process.env.NODE_ENV == 'development') {
      const injectorScript = makeInjector(scriptName);
      const injectorFilepath = path.join(buildPath, scriptName);
      const injectorPath = Remove.file(injectorFilepath)

      console.log(clc.green(`Making injector 'build/${scriptName}'`))

      mkdirp.sync(injectorPath)
      fs.writeFileSync(injectorFilepath, injectorScript, {encoding: 'utf8'})
    }
  }

  // Process content scripts
  if(manifest.content_scripts && manifest.content_scripts.length) {
    _.each(manifest.content_scripts, (content_script) => {
      _.each(content_script.js, pushScriptName)
    })
  }

  // Process background scripts
  if(manifest.background && manifest.background.scripts && manifest.background.scripts.length) {
    _.each(manifest.background.scripts, pushScriptName)
  }

  // Process each script (create injectors)
  _.each(scripts, processScriptName)


  //////////
  // Popup script
  // We dont need to wrap popup script into injector, so we can skipp processScriptName for that

  // TODO reload extension when popup html changed. it was developed for use with react,
  // which allow us to make layout changes hot reloaded automaticaly

  const processHtmlPage = function(htmlFilepath) {
    console.log(clc.green(`Making 'build/${htmlFilepath}'`))

    // Read body content
    const htmlContent = fs.readFileSync(path.resolve(path.join('src', htmlFilepath)), {encoding: "utf8"})

    // Get just path and name ie: 'popup/index'
    const bareFilepath = Remove.extension(htmlFilepath)

    const scriptFilepath = `${bareFilepath}.js`

    const webpackScriptUrl = process.env.NODE_ENV == "development" ? path.join("https://localhost:3001/", scriptFilepath) : scriptFilepath
    const webpackScript = `<script src="${webpackScriptUrl}" async defer></script>`;

    pushScriptName(scriptFilepath)

    const popupHtml = makePopupLayout({
      bodyContent:   htmlContent,
      webpackScript: webpackScript
    })

    const fullHtmlPath = path.join(buildPath, htmlFilepath)

    mkdirp.sync(Remove.file(fullHtmlPath))

    fs.writeFileSync(fullHtmlPath, popupHtml)
  }

  // Background page
  if(manifest.background && manifest.background.page) {
    processHtmlPage(manifest.background.page)
  }

  // Browser action
  manifest.browser_action && manifest.browser_action.default_popup && processHtmlPage(manifest.browser_action.default_popup)

  // Page action
  manifest.page_action && manifest.page_action.default_popup && processHtmlPage(manifest.page_action.default_popup)

  // Chrome page overrides
  const overrides = manifest.chrome_url_overrides

  if(overrides) {
    // Bookmarks page
    overrides.bookmarks && processHtmlPage(overrides.bookmarks)
    // History page
    overrides.history && processHtmlPage(overrides.history)
    // Newtab page
    overrides.newtab && processHtmlPage(overrides.newtab)
  }

    // create icons folder if icons specified in manifest.json
    if (manifest.icons && Object.keys(manifest.icons).length) {
      console.log(clc.green(`Making 'build/icons'`))
      const sourceIconsPath = path.resolve(path.join('src', 'icons'));
      const destIconsPath = path.join(buildPath, "icons");
      // copies whole icons folder, sync method doesn't need callback
      fs.copySync(sourceIconsPath, destIconsPath);

    }


  // Writing build/manifest.json
  const manifestPath = path.join(buildPath, "manifest.json");

  console.log(clc.green(`Making 'build/manifest.json'`))
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), {encoding: 'utf8'})

  return scripts;
};
