async function screenshotVideo() {
    const video = document.querySelector('video');
    if (!video) {
        console.log('No video element found!');
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

    // Copy to clipboard
    if (options["outputtype"] === "clipboard" || options["outputtype"] === "both") {
        canvas.toBlob((blob) => {
            const clipboardItem = new ClipboardItem({ [blob.type]: blob });
            navigator.clipboard.write([clipboardItem]);
        }, 'image/png');
    }
}


chrome.action.onClicked.addListener(async (tab) => {
    if (!tab.url.includes('chrome://')) {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: screenshotVideo
        });
    }
});