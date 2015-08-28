import fs from 'fs';
import path from 'path';
import packageConfig from '../../package.json';
import manifestSkelet from '../../src/manifest.json';
import makeInjector from './make_injector';
import _ from 'lodash';
import clc from 'cli-color';
import * as Remove from './remove';
import makePopupLayout from './make_popup_layout';

export default function() {
  let buildPath

  if(process.env.NODE_ENV == "development") {
    buildPath = path.join(__dirname, '../../build');
  } else {
    buildPath = path.join(__dirname, '../../release/build');
  }

  // Prepare clear build
  rimraf.sync(buildPath)
  fs.mkdirSync(buildPath)

  const values = _.pick(packageConfig, 'name', 'description', 'version');

  const manifest = _.merge(manifestSkelet, values);

  // Content security policy
  if(process.env.NODE_ENV == 'development') {
    let csp = manifest["content_security_policy"] || ""

    if(~csp.indexOf('object-src')) {
      csp = csp.replace('object-src', "object-src 'self'")
    } else {
      csp = `object-src 'self'; ${csp}`
    }

    if(~csp.indexOf('script-src')) {
      csp = csp.replace('script-src', "script-src 'self' 'unsafe-eval' https://localhost:3001")
    } else {
      csp = `script-src 'self' 'unsafe-eval'; ${csp}`
    }

    manifest["content_security_policy"] = csp
  }

  // Process background, content and popup scripts
  const scripts = [];

  const pushScriptName = function(scriptName) {
    const scriptPath = path.join(__dirname, "../../src", scriptName)

    if(!fs.existsSync(scriptPath)) {
      console.warn(clc.red(`Missing script ${scriptPath}`))

      return
    }

    if(~scripts.indexOf(scriptName))
      return

    scripts.push(scriptName)
  }

  const processScriptName = function (scriptName) {
    if(process.env.NODE_ENV == 'development') {
      const injectorScript = makeInjector(scriptName);
      const injectorPath = path.join(buildPath, scriptName);

      console.log(clc.green(`Making injector 'build/${scriptName}'`))

      fs.writeFileSync(injectorPath, injectorScript, {encoding: 'utf8'})
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

  // Process each script
  _.each(scripts, processScriptName)


  // Process popup script
  // We dont need to wrap popup script into injector, so we can skipp processScriptName for that
  if(manifest.browser_action && manifest.browser_action.default_popup) {
    const bodyContentFilepath = manifest.browser_action.default_popup
    const bodyContent = fs.readFileSync(path.resolve(path.join('src', bodyContentFilepath)), {encoding: "utf8"})
    const bareFilepath = Remove.extension(bodyContentFilepath)
    const jsFilepath = `${bareFilepath}.js`
    const webpackScriptUrl = process.env.NODE_ENV == "development" ? `https://localhost:3001/${Remove.path(jsFilepath)}` : Remove.path(jsFilepath)
    const webpackScript = `<script src="${webpackScriptUrl}" async defer></script>`;

    pushScriptName(jsFilepath)

    const popupHtml = makePopupLayout({
      bodyContent:   bodyContent,
      webpackScript: webpackScript
    })

    fs.writeFileSync(path.join(buildPath, bodyContentFilepath), popupHtml)
    console.log(clc.green(`Making 'build/${bodyContentFilepath}'`))
  }


  // Writing build/manifest.json
  const manifestPath = path.join(buildPath, "manifest.json");

  console.log(clc.green(`Making 'build/manifest.json'`))
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), {encoding: 'utf8'})

  return scripts;
};
