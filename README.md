# Webpack Chrome extension

Bootstrap project for developing any kind Chrome extensions with all javascript features like [NPM packages](https://www.npmjs.com/), [Webpack](http://webpack.github.io/), [Babel](https://babeljs.io/), [React](https://facebook.github.io/react/) and almost everything you want.

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

1. `npm install`
2. Thats all :)

## Usage

- Whole repository (package) is simple example extension.
- Check `src/manifest.json` for basic usage of background script, content script, action popup and chrome url overrides.
- All scripts and/or html pages from manifest.json are piped through preprocessor and prepared for using all features.
- When your extension does exactly what you want, you can run `gulp -p` for creating production `.crx` build.
- All your codebase belongs only to `src/` directory
- In your scripts you can use **npm packages, babel, react (jsx), styles (with preprocessors) and any modern javascript feature** you know.

## How to run development environment

You should do this before editing any code to see how it works.

1. run `npm start` (or `npm run dev`) which will start webpack-dev-server
2. in Chrome open `chrome://extensions/`
3. check `Developer mode`
4. click on `Load unpacked extension`
5. add REPOSITORY_DIRECTORY/build
6. Now you can check background script via link in extension `Inspect views: background page` and you will see some messages in console
7. Navigate to any http or **https** page and open development tools and console. You can see messages from content scripts.
8. Find extension icon (puzzle image) right from adress bar.
  1. Click with left mouse button to show html content
  2. Click with right mouse button and select `Inspect Popup`. Then in console you can see some messages
9. You can edit your codebase with almost 100% hot/full reload support.

## How to build extension

1. run `npm run build`
2. It will compile scripts, styles and other assets into release/build/
3. It will make chrome extension into release/build.crx with certificate release/build.pem

## Troubleshoting

1. Everything looks fine, but scripts from webpack arent loading.
  - Probably problem with development ssl certificates. Open any script (i.e. https://localhost:3001/background/index.js) in separate tab and allow chrome to load it anyway. Then reload extension.

## TODO

#### Done
- [x] Make manifest.json dynamic based on package.json name, description, version.
- [x] Move everything from build directory and leave it only for building development extenstion.
- [x] Make production build. Replace injector scripts with final builded one.
- [x] Make Hot reload works. There is problem with including hot reload chunks which are included via new script tag into DOM. new code is then eval in default (window) context and not in context of extension. Have to do same hack as you can see in injector files and download chunks via XMLHttpRequest.
- [x] Move `config/manifest.json`, `util/make_injector.js` and `util/make_manifest.js` somewhere out of src to keep src in full will of developer
- [x] Create extension from build process and move it into release/
- [x] Test assets base64 support
- [x] Add asset example. Icon for actions
- [x] Drop gulp

#### Future

- [ ] Experiment with hot middleware (hints in NOTE.md)
- [ ] Split webpack config into **core** and **user** parts. **Core** are necessary for working this whole thing and **user** are developer customs.
- [ ] Allow to have "static" files which will be merged into build
- [ ] Allow to reload extension when popup html file changed
- [ ] Detect Chrome path for building extension
- [ ] Solve Hot reload fix better than overriding file in /node_modules. It is really ugly and hacky
- [ ] Create example repository with React app
- [ ] Test assets without base64
- [ ] Allow to define entry scripts other way than define them in manifest.json
- [ ] Add support for [extension updating](https://developer.chrome.com/extensions/packaging#update)

## Licence

Webpack Chrome Extension is released under the [MIT License](http://www.opensource.org/licenses/MIT).
