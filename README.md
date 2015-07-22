# Installation

1. `npm install`
2. `npm install gulp -g`

# Usage

1. run `gulp` which will start webpack-dev-server
2. in Chrome open `chrome://extensions/`
3. check `Developer mode`
4. click on `Load unpacked extension`
5. add REPOSITORY_DIRECTORY/build

# What it can do.

The manifest and everything is currently configured for support background and content scripts. If you want to add you program you can edit `src/background/index` and `src/content/index`. In second one you can see example of babel and import another file.

# TODO

- [ ] Create example repository with React app in content script (We already did that, so just create that repo :)
- [ ] Make manifest.json dynamic based on package.json name, description, version.
- [ ] Move everything from build directory and leave it only for building development extenstion.
- [ ] Test assets (images, fonts etc) and convert them into base64 into javascripts (including styles)
- [ ] Make production build. Replace injector scripts with final builded one.
