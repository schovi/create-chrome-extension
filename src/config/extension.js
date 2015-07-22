export default {
  "manifest_version": 2,
  "name": "Webpack Chrome Extension",
  "description": "",
  "version": "0.0.1",
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["app.js"]
    }
  ],
  "background": {
    "persistent": false,
    "scripts": ["background.js"]
  },
  "permissions": [
    "activeTab",
    "background",
    "clipboardRead",
    "clipboardWrite",
    "gcm",
    "notifications",
    "storage",
    "unlimitedStorage"
  ]
}
