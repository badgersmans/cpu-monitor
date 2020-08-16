const path            = require('path');
const { ipcRenderer } = require('electron');
const osu             = require('node-os-utils');
const { settings }    = require('cluster');
const cpu             = osu.cpu;
const memory          = osu.mem;
const os              = osu.os;

let cpuOverload;
let alertFrequency;


// get settings and values
ipcRenderer.on('settings:get', (e, settings) => {
    cpuOverload    = +settings.cpuOverload;
    alertFrequency = +settings.alertFrequency;
});


// run every 2 seconds
setInterval(() => {
    // CPU usage
    cpu.usage().then(info => {
        document.getElementById('cpu-usage').innerText = `${info}%`;
        
        document.getElementById('cpu-progress').style.width = `${info}%`;

        // make progress bar red if overload
        if(info >= cpuOverload) {
            document.getElementById('cpu-progress').style.background = 'red';
        } else {
            document.getElementById('cpu-progress').style.background = '#30c88b';
        }

        // check overload
        if(info >= cpuOverload && runNotify(alertFrequency)) {
            notifyUser({
                title: 'CPU overload',
                body: `CPU is over ${cpuOverload}%`,
                icon: path.join(__dirname, 'img', 'icon.png')
            });

            localStorage.setItem('lastNotify', +new Date())
        }

    });

    // cpu free
    cpu.free().then(info => {
        document.getElementById('cpu-free').innerText = `${info}%`;
    });
    
    
    // uptime
    document.getElementById('system-uptime').innerText = secondsToDhms(os.uptime());

}, 2000);

// show days, hours, minutes, seconds
function secondsToDhms(seconds) {
    seconds = +seconds
    var d = Math.floor(seconds / (3600*24));
    var h = Math.floor(seconds % (3600*24) / 3600);
    var m = Math.floor(seconds % 3600 / 60);
    var s = Math.floor(seconds % 60);

    return `${d}d, ${h}h, ${m}m, ${s}s`;
};


// send notification
function notifyUser(options) {
    new Notification(options.title, options);
};

// check time since last notification
function runNotify(frequency) {
    if(localStorage.getItem('lastNotify') === null) {
        // store timestamp
        localStorage.setItem('lastNotify', +new Date());
        
        return true;
    }

    const notifyTime = new Date(parseInt(localStorage.getItem('lastNotify')));
    const now        = new Date();

    const timeDifference = Math.abs(now - notifyTime);
    const minutesPast    = Math.ceil(timeDifference / (1000 * 60));

    if (minutesPast > frequency) {
        return true;
    } else {
        return false;
    }
};


// set CPU model
document.getElementById('cpu-model').innerText = cpu.model();

// computer name
document.getElementById('computer-name').innerText = os.hostname();

// OS
document.getElementById('os').innerText = `${os.type()} ${os.arch()}`;

// total RAM
memory.info().then(info => {
    document.getElementById('system-memory').innerText = info.totalMemMb;
});


















