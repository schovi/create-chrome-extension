# Webpack Chrome extension

Bootstrap playground for developing Chrome extensions with all new features like [Webpack](http://webpack.github.io/), [Babel](https://babeljs.io/), [React](https://facebook.github.io/react/) and almost everything you want.

## Installation

1. `npm install`
2. `npm install gulp -g`

## Usage

### How to run whole thing.

You should do this before editing any code to see how it works.

1. run `gulp` which will start webpack-dev-server
2. in Chrome open `chrome://extensions/`
3. check `Developer mode`
4. click on `Load unpacked extension`
5. add REPOSITORY_DIRECTORY/build
6. Now you can check background script via link in extension `Inspect views: background page` and you will see some messages in console
7. And open any http (not https) page and open development tools and console. You can see messages from content scripts.

### Managing your code.

You can do anything in src/ as you wish, except following:

1. config/manifest.json
  - name, description, version is updated from package.json
  - scripts (`{background: {scripts:["background.js"], content_scripts: [{js:["content.js"]}]}`) are processed and for now have to be directly in src/
2. keep `util/make_injector.js` and `util/make_manifest.js`



## What it can do.

The manifest and everything is currently configured for support background and content scripts. If you want to add you program you can edit `src/background/index` and `src/content/index`. In second one you can see example of babel and import another file.

## TODO

- [x] Make manifest.json dynamic based on package.json name, description, version.
- [x] Move everything from build directory and leave it only for building development extenstion.
- [x] Make production build. Replace injector scripts with final builded one.
- [ ] Make Hot reload works. There is problem with including hot reload chunks which are included via new script tag into DOM. new code is then eval in default (window) context and not in context of extension. Have to do same hack as you can see in injector files and download chunks via XMLHttpRequest.
- [ ] Move `config/manifest.json`, `util/make_injector.js` and `util/make_manifest.js` somewhere out of src to keep src in full will of developer
- [ ] Create example repository with React app in content script (We already did that, so just create that repo :)
- [ ] Test assets (images, fonts etc) and convert them into base64 into javascripts (including styles)

## Licence

Webpack Chrome Extension is released under the [MIT License](http://www.opensource.org/licenses/MIT).
