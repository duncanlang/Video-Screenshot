chrome.runtime.onMessage.addListener((msg, sender, response) => {
    if (msg.name == "ACTION-CHECKMARK") {
        chrome.action.setBadgeText({ text: "✔" });
        chrome.action.setBadgeBackgroundColor({ color: "#4CAF50" });
        setTimeout(() => chrome.action.setBadgeText({ text: "" }), 1500);
    }
    else if (msg.name == "ACTION-ERROR") {
        chrome.action.setBadgeText({ text: "X" });
        chrome.action.setBadgeBackgroundColor({ color: "#ff0000" });
        setTimeout(() => chrome.action.setBadgeText({ text: "" }), 1500);
    }
    return true;
});


async function screenshotVideo() {
    const video = document.querySelector('video');
    if (!video) {
        chrome.runtime.sendMessage({ name: "ACTION-ERROR" }, () => { });
        return;
    }

    var options = await chrome.storage.sync.get().then(function (storedSettings) {
        return storedSettings;
    });

    // Create a canvas and draw the current video frame onto it
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to image data (Base64)
    const imageDataUrl = canvas.toDataURL('image/png');

    // Download image
    if (options["outputtype"] === "download" || options["outputtype"] === "both") {
        const a = document.createElement('a');
        a.href = imageDataUrl;
        a.download = 'video_frame.png';
        a.click();
    }

    debugger;

    // Copy to clipboard
    if (options["outputtype"] === "clipboard" || options["outputtype"] === "both") {
        canvas.toBlob((blob) => {
            const clipboardItem = new ClipboardItem({ [blob.type]: blob });
            navigator.clipboard.write([clipboardItem]);
        }, 'image/png');

        chrome.runtime.sendMessage({ name: "ACTION-CHECKMARK" }, () => { });
    }
}

async function InitDefaultSettings() {
    var options = await chrome.storage.sync.get().then(function (storedSettings) {
        return storedSettings;
    });

    // Default options
    if (options['outputtype'] == null) options['outputtype'] = 'download';

    // Save
    chrome.storage.sync.set(options);
}


chrome.action.onClicked.addListener(async (tab) => {
    if (!tab.url.includes('chrome://')  && !tab.url.startsWith('about:')) {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: screenshotVideo
        });
    }
});

chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason == 'install') {
        // Init the settings on first install
        InitDefaultSettings();
    }
    else if (details.reason == 'update') {
        // Init the settings on update just in case there are new settings added
        InitDefaultSettings();
    }
    else if (details.reason == 'browser_update' || details.reason == 'chrome_update') {

    }
});