const isFirefox = typeof browser !== "undefined" && typeof browser.runtime !== "undefined";
const isChrome = typeof chrome !== "undefined" && typeof browser === "undefined";
document.body.classList.add(isFirefox ? "firefox" : "chrome");

let isAndroid = (navigator.userAgent.includes('Android'));

var options;

// Load from storage
async function load() {
    options = await chrome.storage.sync.get().then(function (storedSettings) {
        return storedSettings;
    });

    set();
}

function save() {
    chrome.storage.sync.set(options);
}

async function set() {
    for (const key in options) {
        var element = document.querySelector('#' + key);
        if (element != null) {
            switch (typeof (options[key])) {
                case ('boolean'):
                    element.checked = options[key];
                    break;
                case ('string'):
                    element.value = options[key];
                    break;
            }
        }
    }
}

// On change, save
document.addEventListener('change', event => {
    changeSetting(event);
});

async function changeSetting(event) {
    switch (event.target.type) {
        case ('checkbox'):
            options[event.target.id] = event.target.checked;
            break;
        default:
            options[event.target.id] = event.target.value;
            break;
    }
    save();
}

// On load, load
document.addEventListener('DOMContentLoaded', event => {
    load();
});

document.addEventListener('focus', event => {
    set();
});