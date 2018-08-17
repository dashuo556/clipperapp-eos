const {app, Menu, BrowserWindow} = require('electron');

process.env.TZ = "UTC"


let mainWindow;

app.on('ready', () => {
  mainWindow = new BrowserWindow({
      height: 500,
      width: 600
  });

  mainWindow.loadURL('file://' + __dirname + '/index.html');
});