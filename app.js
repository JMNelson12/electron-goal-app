'use strict';

const electron = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');
// const client = require('electron-connect').client;

// SET ENVIRONMENT
process.env.NODE_ENV = 'prod';

const {app, BrowserWindow } = electron;
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    x: 7,
    y: 35,
    width: 385,
    minWidth: 385,
    maxWidth: 385,
    height: 815,
    minHeight: 520,
    maxHeight: 815,
    icon: 'assets/icons/png/sunrise.png',
    frame: false
  });

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  mainWindow.on('closed', function () {
    mainWindow = null;
    app.quit();
  });
}

const mainMenuTemplate = [
  // Each object is a dropdown
  {
    label: 'File',
    submenu: [{
      label: 'Exit',
      accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
      click() {
        app.quit();
      }
    }]
  }
];

// Add developer tools option if in dev
if (process.env.NODE_ENV !== 'prod') {
  mainMenuTemplate.push({
    label: 'Developer Tools',
    submenu: [{
        role: 'reload'
      },
      {
        label: 'Toggle DevTools',
        accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
        click(item, focusedWindow) {
          focusedWindow.toggleDevTools();
        }
      }
    ]
  });
}

app.on('ready', createWindow);

app.on('closed', () => {
  app.quit();
  mainWindow = null;
})
app.on('window-all-closed', function () {
  app.quit();
  mainWindow = null;
});