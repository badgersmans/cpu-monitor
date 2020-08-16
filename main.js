const path = require("path");
const os = require("os");
const { app, BrowserWindow, Menu, ipcMain, shell } = require("electron");
const slash = require("slash");
const log = require("electron-log");

/* #region  variables */

// set env
process.env.NODE_ENV = "development";

// platform check
const isDev = process.env.NODE_ENV !== "production" ? true : false;
const isMac = process.platform === "darwin" ? true : false;

let mainWindow;
let aboutWindow;

/* #endregion */


function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: "Image Shrinker",
    width: isDev ? 800 : 500,
    height: isDev ? 800 : 700,
    icon: `${__dirname}/assets/icons/Icon_256x256.png`,
    resizable: isDev,
    backgroundColor: "white",

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

function createAboutWindow() {
  aboutWindow = new BrowserWindow({
    title: "About Image Shrinker",
    width: 300,
    height: 300,
    icon: `${__dirname}/assets/icons/Icon_256x256.png`,
    resizable: false,
    backgroundColor: "white",

    webPreferences: {
      nodeIntegration: false,
      nodeIntegrationInWorker: false,
      worldSafeExecuteJavaScript: true,
    },
  });
  aboutWindow.setMenu(null);
  aboutWindow.loadFile("./app/about.html");
}

const menu = [
  ...(isMac
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
    : []),

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

  ...(!isMac
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
    : []),
];

/* ipcMain.on('image:minimize', (e, options) => {
  options.destination = path.join(os.homedir(), 'image-shrinker')
  // console.log(options);
  shrinker(options);
}); */

/* async function shrinker({ imagePath, quality, destination }) {
  try {

    const pngQuality = quality / 100;

    const files = await imagemin([slash(imagePath)], {
      destination,
      plugins: [
        imageminMozjpeg({ quality }),
        imageminPngquant({
          quality: [pngQuality, pngQuality]
        })
      ]
    });
    log.info(files);

    shell.openPath(destination)

    mainWindow.webContents.send('image:done')

  } catch (error) {
    log.error(error);
  }
}; */



app.on("ready", () => {
  createMainWindow();
  const mainMenu = Menu.buildFromTemplate(menu);
  mainWindow.setMenu(mainMenu);

  mainWindow.on("closed", () => (mainWindow = null));
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
