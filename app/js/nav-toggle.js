const nav = document.getElementById('nav');


// toggle nav
ipcRenderer.on('nav:toggle', () => {
    nav.classList.toggle('hide');
});