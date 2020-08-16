const { app, Menu, Tray } = require("electron");

class AppTray extends Tray {
    constructor(icon, mainWindow) {
        super(icon);

        this.setToolTip('CPU Monitor');

        this.mainWindow = mainWindow;

        this.on('click', () => {
            if (mainWindow.isVisible() === true) {
                this.mainWindow.hide();
            } else {
                this.mainWindow.show();
            }
        });

        
        this.on('right-click', () => {
            const contextMenu = Menu.buildFromTemplate([
            {
                label: 'Quit',
                click: () => {
                app.isQuitting = true
                app.quit();
                }
            }
            ]);

            this.popUpContextMenu(contextMenu);
        });
    };
};

module.exports = AppTray;