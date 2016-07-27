import path from 'path';
import fs from 'fs';
import color from 'colors/safe';

export default function() {

  // HACK
  // Override Webpack HOT code loader with my custom one.
  // Hot update is loaded via XMLHttpRequest and evaled in extension
  // context instead of including script tag with that hot update

  const JsonpMainTemplateRuntimePath   = 'node_modules/webpack/lib/JsonpMainTemplate.runtime.js'
  const originalJsonpMainTemplatePath  = path.resolve(__dirname, '../..', JsonpMainTemplateRuntimePath)
  const overridenJsonpMainTemplatePath = path.resolve(__dirname, '../..', 'templates/JsonpMainTemplate.runtime.js')
  const overridenJsonpMainTemplate     = fs.readFileSync(overridenJsonpMainTemplatePath, {encoding: "utf8"})

  console.log(color.green(`Overriding '${JsonpMainTemplateRuntimePath}'`))

  fs.writeFileSync(originalJsonpMainTemplatePath, overridenJsonpMainTemplate)

  const logApplyResultPath          = 'node_modules/webpack/hot/log-apply-result.js'
  const originalLogApplyResultPath  = path.resolve(__dirname, '../..', logApplyResultPath)
  const overridenLogApplyResultPath = path.resolve(__dirname, '../..', 'templates/log-apply-results.js')
  const overridenLogApplyResult     = fs.readFileSync(overridenLogApplyResultPath, {encoding: "utf8"})

  console.log(color.green(`Overriding '${logApplyResultPath}'`))

  fs.writeFileSync(originalLogApplyResultPath, overridenLogApplyResult)

}
