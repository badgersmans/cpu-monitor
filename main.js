const path                                         = require("path");
const os                                           = require("os");
const { app, BrowserWindow, Menu, ipcMain, Tray }  = require("electron");
const slash                                        = require("slash");
const log                                          = require("electron-log");
const Store                                        = require('./Store');

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
  mainWindow = new BrowserWindow({
    title: "CPU Monitor",
    width: isDev ? 800 : 355,
    height: isDev ? 800 : 500,
    icon: `${__dirname}/assets/icons/icon.png`,
    resizable: isDev,
    show: false,

    webPreferences: {
      nodeIntegration: true,
      // nodeIntegrationInWorker: false,
      worldSafeExecuteJavaScript: true,
    },
  });

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
  mainWindow.loadFile("./app/index.html");
}


const menu = [

/*   ...(isMac
    ? [
        {
          label: app.name,
          submenu: [
            {
              label: "About",
              click: createAboutWindow,
            },
          ],
        },
      ]
    : []), */

  {
    role: "fileMenu",
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

/*   ...(!isMac
    ? [
        {
          label: "Help",
          submenu: [
            {
              label: "About",
              click: createAboutWindow,
            },
          ],
        },
      ]
    : []), */
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
  tray = new Tray(icon);

  tray.on('click', () => {
    if (mainWindow.isVisible() === true) {
      mainWindow.hide();
    } else {
      mainWindow.show();
    }
  });

  tray.on('right-click', () => {
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Quit',
        click: () => {
          app.isQuitting = true
          app.quit();
        }
      }
    ]);

    tray.popUpContextMenu(contextMenu);
  });

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
