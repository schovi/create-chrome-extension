import path from 'path';
import fs from 'fs';

export default function() {

  // HACK
  // Override Webpack HOT code loader with my custom one.
  // Hot update is loaded via XMLHttpRequest and evaled in extension
  // context instead of including script tag with that hot update

  const originalJsonpMainTemplatePath  = require.resolve(path.join(__dirname, '../../node_modules/webpack/lib/JsonpMainTemplate.runtime.js'))
  const overridenJsonpMainTemplatePath = require.resolve(path.join(__dirname, '../override/JsonpMainTemplate.runtime.js'))
  const overridenJsonpMainTemplate     = fs.readFileSync(overridenJsonpMainTemplatePath, {encoding: "utf8"})

  console.log("Overriding original", originalJsonpMainTemplatePath, "with custom", overridenJsonpMainTemplatePath)

  fs.writeFileSync(originalJsonpMainTemplatePath, overridenJsonpMainTemplate)
}
