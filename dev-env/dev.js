import makeWebpackConfig from './webpack/config';
import webpackDevServer from './webpack/server';
import overrideHotUpdater from './override'
import Manifest from './manifest'
import * as paths from './paths'

// Override Webpack hot updater
overrideHotUpdater()

// Create manifest
const manifest = new Manifest(paths.manifest)
manifest.run()

// Start webpack dev server
const webpackConfig = makeWebpackConfig(manifest)
webpackDevServer(webpackConfig)
