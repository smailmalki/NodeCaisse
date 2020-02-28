const jquery = require('jquery')
const { app, BrowserWindow } = require('electron')

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
app.whenReady().then(createWindow)

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
    createWindow()
  }
})