// ==UserScript==
// @name         Steam Store Video Downloader
// @namespace    https://github.com/sffxzzp
// @version      0.11
// @description  add download button in store page to get videos.
// @author       sffxzzp
// @match        *://store.steampowered.com/app/*
// @icon         https://store.steampowered.com/favicon.ico
// @grant        none
// @updateURL    https://github.com/sffxzzp/userscripts/raw/master/steam/storevideodownloader.user.js
// @downloadURL  https://github.com/sffxzzp/userscripts/raw/master/steam/storevideodownloader.user.js
// ==/UserScript==

(function() {
    document.querySelectorAll('div#highlight_strip_scroll > div.highlight_strip_movie').forEach(function (node) {
        let assetId = parseInt(node.id.split('_')[2]);
        let movie = document.querySelector(`div#highlight_movie_${assetId}`);
        let mUrls = JSON.parse(movie.dataset.props).dashManifests;
        let mUrl = '';
        let found264 = false;
        for (let u of mUrls) {
            if (u.indexOf('h264') > 0) {
                mUrl = u;
                found264 = true;
            }
        }
        if (found264 == false) {
            mUrl = mUrls[0];
        }
        if (mUrl) {
            node.ondblclick = function () {
                prompt("url: ", mUrl);
            }
        }
    });
})();
