const jquery = require('jquery')
//const { app, BrowserWindow } = require('electron')
const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

function createWindow () {
  // Cree la fenetre du navigateur.
  const win = new BrowserWindow({
    //width: 800,
    //height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })
	 win.setFullScreen(true)
  // and load the index.html of the app.
  win.loadFile('index.html')

  // Ouvre les DevTools.
  //win.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Certaines APIs peuvent être utilisées uniquement quand cet événement est émit.
//app.whenReady().then(createWindow)
global.mainWindow;

app.on('ready', function() {
  createWindow()
  
  var electronScreen = electron.screen;
  var displays = electronScreen.getAllDisplays();
  var externalDisplay = null;
  for (var i in displays) {
    if (displays[i].bounds.x != 0 || displays[i].bounds.y != 0) {
      externalDisplay = displays[i];
      break;
    }
  }


  if (externalDisplay) {
    mainWindow = new BrowserWindow({
      x: externalDisplay.bounds.x + 50,
      y: externalDisplay.bounds.y + 50,
      webPreferences: {
        nodeIntegration: true
      }
    });
    mainWindow.setFullScreen(true)
    mainWindow.setMenu(null)
    mainWindow.loadFile('deport.html')
    /*var ipcMain = require('electron').ipcMain;
    ipcMain.on('store-data', (event, payload) => {
      mainWindow.webContents.send('store-data', payload);
    });*/
  }
  
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // Sur macOS, il est commun pour une application et leur barre de menu
  // de rester active tant que l'utilisateur ne quitte pas explicitement avec Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // Sur macOS, il est commun de re-créer une fenêtre de l'application quand
  // l'icône du dock est cliquée et qu'il n'y a pas d'autres fenêtres d'ouvertes.
  if (BrowserWindow.getAllWindows().length === 0) {
    //createWindow()
  }
})