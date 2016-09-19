const electron = require('electron')
const fs = require('fs')
const app = electron.app
const BrowserWindow = electron.BrowserWindow

let mainWindow

function createWindow () {
  mainWindow = new BrowserWindow({width: 800, height: 600, "node-integration": false})
  mainWindow.loadURL("file://" + __dirname + "/index.html?game=" + gameName)

  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

var gameName;

function initialize() {
  fs.readFile('CURRGAME', (err, data) => {
    if (err) {
      app.quit();
      return;
    }
    gameName = data;
    console.log(data);
    createWindow();
  });
}

app.on('ready', initialize)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    initialize()
  }
})