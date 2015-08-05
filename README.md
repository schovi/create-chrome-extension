# Webpack Chrome extension

Bootstrap playground for developing Chrome extensions with all javascript features like [NPM package manager](https://www.npmjs.com/), [Webpack](http://webpack.github.io/), [Babel](https://babeljs.io/), [React](https://facebook.github.io/react/) and almost everything you want.

## Installation

1. `npm install`
2. `npm install gulp -g`

## Usage

You can do anything in src/ as you wish, except following:
- Only javascripts directly in src/ can be used as entry points in your manifest.json
- src/manifest.json is processed and updated by package.json (name, description and version) and scripts have to point into src/xxx.js

If you want to change behaviour of development environment you can edit dev-env/ directory

## How to run development environment

You should do this before editing any code to see how it works.

1. run `gulp` which will start webpack-dev-server
2. in Chrome open `chrome://extensions/`
3. check `Developer mode`
4. click on `Load unpacked extension`
5. add REPOSITORY_DIRECTORY/build
6. Now you can check background script via link in extension `Inspect views: background page` and you will see some messages in console
7. And open any http (not https) page and open development tools and console. You can see messages from content scripts.

## How to build extension

1. run `gulp -p`
2. It will compile scripts, styles and other assets into release/build/
3. It will make chrome extension into release/build.crx with certificate release/build.pem

## TODO

- [x] Make manifest.json dynamic based on package.json name, description, version.
- [x] Move everything from build directory and leave it only for building development extenstion.
- [x] Make production build. Replace injector scripts with final builded one.
- [x] Make Hot reload works. There is problem with including hot reload chunks which are included via new script tag into DOM. new code is then eval in default (window) context and not in context of extension. Have to do same hack as you can see in injector files and download chunks via XMLHttpRequest.
- [x] Move `config/manifest.json`, `util/make_injector.js` and `util/make_manifest.js` somewhere out of src to keep src in full will of developer
- [x] Create extension from build process and move it into release/
- [ ] Detect Chrome path for building extension
- [ ] Solve Hot reload fix better than overriding file in /node_modules. It is really ugly and hacky :)
- [ ] Create example repository with React app in content script (We already did that, so just create that repo :)
- [ ] Test assets (images, fonts etc) and convert them into base64 into javascripts (including styles)
- [ ] Reload extension after manifest and/or config file changed
- [ ] Allow to define entry scripts other way than define them in manifest.json


## Licence

Webpack Chrome Extension is released under the [MIT License](http://www.opensource.org/licenses/MIT).
