const { BrowserWindow } = require('electron');

class MainWindow extends BrowserWindow {
    constructor(file, isDev) {
        super({
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

          this.loadFile(file);

          if (isDev) {
            this.webContents.openDevTools();
          }
    };
};

module.exports = MainWindow;