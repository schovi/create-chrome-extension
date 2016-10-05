# Create Chrome Extension

Bootstrap project for developing any kind Chrome extensions with all javascript features like [NPM packages](https://www.npmjs.com/), [Webpack](http://webpack.github.io/), [Babel](https://babeljs.io/), [React](https://facebook.github.io/react/) and almost everything you want.

## WARNING

This is proof new version inspired by [Create React App](https://github.com/facebookincubator/create-react-app). It is not fully working, but you can follow it and help to make it better.
It is still in state of transition from [Webpack Chrome Extension](https://github.com/schovi/webpack-chrome-extension) and not everything is in README or work on 100%.


**Turn this**

manifest.json
```json
{
  "content_scripts": [{
    "js": ["jquery.min.js", "jquery-spellchecker.min.js", "jquery-megamask.min.js", "jquery-scrolltie.min.js", "my-plugins.js", "app.js"],
    "css": ["app.css"]
  }]
}
```

**Into this**

manifest.json
```json
{
  "content_scripts": [{
    "js": ["app.js"]
  }]
}
```

Run `npm install jquery jquery-spellchecker jquery-megamask jquery-scrolltie --save`

app.js
```js
import 'jquery'
import 'jquery-spellchecker'
import 'jquery-megamask'
import 'jquery-scrolltie'
import './my-plugins'

import "./app.css"

// Here start my application
$('input').spellchecker()
```

## Environment support

- [Babel](http://babeljs.io/)
- [Webpack](https://webpack.github.io/)

## Extension features support

- [Browser action](https://developer.chrome.com/extensions/browserAction)
- [Page action](https://developer.chrome.com/extensions/pageAction)
- [Background Pages (Scripts)](https://developer.chrome.com/extensions/background_pages)
  - Support both background scripts or page
- [Content scripts](https://developer.chrome.com/extensions/content_scripts)
  - Supports only scripts. Stylesheets can be easily made and use with webpack
- [Override Pages](https://developer.chrome.com/extensions/override)
  - You can customize **newtab**, **history**, or **bookmarks**

## Installation

In your project
`npm install -D chrome-extension-scripts`

## Run development environment

You should do this before editing any code to see how it works.

1. run `chrome-extension run [path to manifest.json] -o [path to build directory]`
2. in Chrome open `chrome://extensions/`
3. check `Developer mode`
4. click on `Load unpacked extension`
5. add your build directory
6. changing of manifest.json wont trigger hot reloading and you have to rerun step 1.

## Build production extension

1. run `chrome-extension build [path to manifest.json] -o [path to release directory]`
2. It will compile scripts, styles and other assets into your release directory
3. It will make chrome extension into your release directory with certificate

## chrome-extension command api

**Run** `chrome-extension run [manifest_path] -o [build_path] -e [environment]`

**Build** `chrome-extension build [manifest_path] -o [build_path] -e [environment]`

## Example

- in this repo see `example/manifest.json` for basic usage of background script, content script, action popup and chrome url overrides.
- all scripts and/or html pages from manifest.json are piped through preprocessor and prepared for using all features.
- in your scripts you can use **npm packages, babel, react (jsx), styles (with preprocessors) and any modern javascript feature** you know.
- when your extension does exactly what you want, you can run make production ready `.crx` build.

How to run it

1. clone this repository `git clone git@github.com:schovi/webpack-chrome-extension.git`
2. run `npm install`
3. run `npm run example`
4. to build extension run `npm run example:build`

## Troubleshoting

1. everything looks fine, but scripts from webpack arent loading.
  - Probably problem with development ssl certificates. Open any script (i.e. https://localhost:3001/path_to_your_script.js) in separate tab and allow chrome to load it anyway. Then reload extension.

#### Done
- [x] detect Chrome path for building extension

#### Future

- [ ] allow to pass existing `.pem` when building extension
- [ ] experiment with hot middleware (hints in NOTE.md)
- [ ] allow to have "static" files which will be merged into build
- [ ] allow to reload extension when popup html file changed
- [ ] solve Hot reload fix better than overriding file in /node_modules. It is really ugly and hacky
- [ ] test assets without base64
- [ ] add support for [extension updating](https://developer.chrome.com/extensions/packaging#update)
