import Module from 'module'

export default function easyRequire(callback) {
  // const originalRequire = Module.prototype.require
  // const originalResolve = Module.prototype.resolve
  //
  // Module.prototype.require = function(...args) {
  //   console.log("custom require", ...args)
  //   return originalRequire.apply(this, args)
  // };
  //
  // Module.prototype.resolve = function(...args) {
  //   console.log("custom resolve", ...args)
  //   return originalResolve.apply(this, args)
  // }

  const result = callback()

  // Module.prototype.require = originalRequire
  // Module.prototype.resolve = originalResolve

  return result
}
