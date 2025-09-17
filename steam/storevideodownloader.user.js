// ==UserScript==
// @name         Steam Store Video Downloader
// @namespace    https://github.com/sffxzzp
// @version      0.10
// @description  add download button in store page to get videos.
// @author       sffxzzp
// @match        *://store.steampowered.com/app/*
// @icon         https://store.steampowered.com/favicon.ico
// @grant        none
// @updateURL    https://github.com/sffxzzp/userscripts/raw/master/steam/storevideodownloader.user.js
// @downloadURL  https://github.com/sffxzzp/userscripts/raw/master/steam/storevideodownloader.user.js
// ==/UserScript==

(async function() {
    document.querySelectorAll('div#highlight_strip_scroll > div.highlight_strip_movie').forEach(function (node) {
        let assetId = parseInt(node.id.split('_')[2]);
        let movie = document.querySelector(`div#highlight_movie_${assetId}`);
        let mUrl = JSON.parse(movie.dataset.props).hlsManifest;
        if (mUrl) {
            node.ondblclick = function () {
                prompt("m3u8 url: ", mUrl);
            }
        }
    });
})();
