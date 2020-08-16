const path             = require("path");
const os               = require("os");
const { app, Menu, ipcMain} = require("electron");
const slash            = require("slash");
const Store            = require('./Store');
const MainWindow       = require('./MainWindow');
const AppTray          = require('./AppTray');

/* #region  variables */

// set env
process.env.NODE_ENV = "development";

// platform check
const isDev = process.env.NODE_ENV !== "production" ? true : false;
const isMac = process.platform === "darwin" ? true : false;

let mainWindow;
let tray;

// Init store and defaults
const store = new Store({
  configName: 'user-settings',
  defaults: {
    settings: {
      cpuOverload: 80,
      alertFrequency: 5
    }
  }
});

/* #endregion */


function createMainWindow() {
  mainWindow = new MainWindow("./app/index.html", isDev);
}


const menu = [


  {
    role: "fileMenu",
  },
  {
    label: 'View',
    submenu: [
      {
        label: 'Toggle Navigation',
        click: () => mainWindow.webContents.send('nav:toggle')
      }
    ]
  },

  ...(isDev
    ? [
        {
          label: "Developer",
          submenu: [
            { role: "reload" },
            { role: "forcereload" },
            { type: "separator" },
            { role: "toggledevtools" },
          ],
        },
      ]
    : []),

];


app.on("ready", () => {
  createMainWindow();

  mainWindow.webContents.on('dom-ready', () => {
    mainWindow.webContents.send('settings:get', store.get('settings'));
  });

  const mainMenu = Menu.buildFromTemplate(menu);
  mainWindow.setMenu(mainMenu);

  mainWindow.on('close', e => {
    if (!app.isQuitting) {
      e.preventDefault();
      mainWindow.hide();
    }

    return true;
  });

  const icon = path.join(__dirname, 'assets', 'icons', 'tray_icon.png');

  // create tray
  tray = new AppTray(icon, mainWindow);

  mainWindow.on("closed", () => (mainWindow = null));
});


// set settings
ipcMain.on('settings:set', (e, settings) => {
  store.set('settings', settings);
  mainWindow.webContents.send('settings:get', store.get('settings'));
});


app.on("window-all-closed", () => {
  if (!isMac) {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});
