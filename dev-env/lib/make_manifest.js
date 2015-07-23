import fs from 'fs';
import path from 'path';
import packageConfig from '../../package.json';
import manifestSkelet from '../../src/manifest.json';
import makeInjector from './make_injector';
import _ from 'lodash';
import rmrf from 'rmrf';

export default function() {
  const buildPath = path.join(__dirname, '../../build');

  // Prepare clear build
  rmrf(buildPath)
  fs.mkdirSync(buildPath)

  const values = _.pick(packageConfig, 'name', 'description', 'version');

  const manifest = _.merge(manifestSkelet, values);

  if(process.env.NODE_ENV == 'development') {
    manifest["content_security_policy"] = "script-src 'self' 'unsafe-eval'; object-src 'self'"
  }

  const manifestPath = path.join(buildPath, "manifest.json");

  console.log(`Making 'manifest.json' in '${manifestPath}'`)
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), {encoding: 'utf8'})

  const scripts = [];

  const pushScriptName = function(scriptName) {
    if(~scripts.indexOf(scriptName))
      return

    scripts.push(scriptName)
  }

  const processScriptName = function (scriptName) {
    if(process.env.NODE_ENV == 'development') {
      const injectorScript = makeInjector(scriptName);
      const injectorPath = path.join(buildPath, scriptName);

      console.log(`Making injector for '${scriptName}' in '${injectorPath}'`)

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

  _.each(scripts, processScriptName)

  return scripts;
};
