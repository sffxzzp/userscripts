// ==UserScript==
// @name         Steam Store Video Downloader
// @namespace    https://github.com/sffxzzp
// @version      0.02
// @description  add download button in store page to get videos.
// @author       sffxzzp
// @match        *://store.steampowered.com/app/*
// @icon         https://store.steampowered.com/favicon.ico
// @grant        none
// @updateURL    https://github.com/sffxzzp/userscripts/raw/master/steam/storevideodownloader.user.js
// @downloadURL  https://github.com/sffxzzp/userscripts/raw/master/steam/storevideodownloader.user.js
// ==/UserScript==

(async function() {
    let appid = parseInt(document.querySelector('div.game.game_page_background').dataset.miniprofileAppid);
    let appData = (await fetch('https://store.steampowered.com/api/appdetails?appids=' + appid).then(res => res.json()))[appid].data.movies;
    let movies = {};
    appData.forEach(function (data) {
        movies[data.id] = data.mp4.max || data.webm.max;
    });
    document.querySelectorAll('div#highlight_strip_scroll > div.highlight_strip_movie').forEach(function (node) {
        let assetId = parseInt(node.id.split('_')[2]);
        if (movies[assetId]) {
            node.ondblclick = function () {
                window.open(movies[assetId]);
            }
        }
    });
})();
