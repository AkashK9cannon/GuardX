{
  "name": "guardx",
  "version": "0.1.0",
  "description": "Web Browser built using Chromium, Nodejs and electronJS",
  "main": "index.js",
  "icon": "./sysMedia/images/logo/lwthbg.png",
  "scripts": {
    "test": "electron .",
    "dist": "electron-builder"
  }, 
  "build": {
    "appId": "com.guardx.app",
    "productName": "GuardX Browser",
    "icon": "sysMedia/images/logo/appicon",
    "directories": {
      "buildResources": "assets",
      "output": "dist"
    },
    "files": [
      "**/*"
    ],
    "win": {
      "target": "nsis",
      "icon": "sysMedia/images/logo/FavIcon.ico"
    },
    "mac": {
      "icon": "sysMedia/images/logo/FavIcon.ico"
    },
    "Linux": {
      "icon": "sysMedia/images/logo/FavIcon.ico"
    }
  },
  "keywords": [],
  "author": "Akash Khuntia",
  "license": "ISC",
  "licenses": [
    {
      "Name": "Chromium-Opensource-Project"
    },{
      "Name": "Nodejs"
    },{
      "Name": "ElectronJs"
    },{
      "Name": "GuardX"
    }
  ],
  "type": "commonjs"
}


My app Folder Structure currently
AppScripts:
  css
  Html
  Js
sysMedia: 
  icons
  images:
    logo:
.env
errors.md
index.js
package.json
preload.json
settings.json
settings.js
Tabs.json
TabStore.js
