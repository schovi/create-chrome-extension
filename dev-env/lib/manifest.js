import fs from 'fs'
import chokidar from 'chokidar'

import FixCsp from './manifest/fix-csp'
import MergePackage from './manifest/merge-package'
import ProcessAssets from './manifest/process-assets'

const isDevelopment = process.env.NODE_ENV == 'development'

export default class Manifest {
  constructor(path) {
    this.path = path
    this.onChange = this.onChange.bind(this)
    // this.watch()
  }

  get path() {
    return this._path
  }

  set path(val) {
    this._path = val
  }

  // Start as plugin in webpack
  apply() {
    this.processManifest()
    this.watch()
  }

  watch() {
    chokidar.watch(this.path).on('change', this.onChange)
  }

  onChange(event, path) {
    this.processManifest()
  }

  processManifest() {
    let manifest = JSON.parse(fs.readFileSync(this.path, 'utf8'))

    // Fix csp for devel
    manifest = FixCsp(manifest)
    // Mege package.json
    manifest = MergePackage(manifest)
    // Process assets


    console.log(manifest)
  }
}
