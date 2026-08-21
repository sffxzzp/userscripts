// ==UserScript==
// @name         Keylol Steam Ignored Games
// @author       sffxzzp
// @namespace    https://github.com/sffxzzp
// @description  快速匹配已忽略 Steam 游戏信息
// @match        *://keylol.com/*
// @grant        GM_getResourceText
// @version      0.05
// @resource     userdata https://store.steampowered.com/dynamicstore/userdata
// @icon         https://store.steampowered.com/favicon.ico
// @updateURL    https://github.com/sffxzzp/userscripts/raw/master/keylol/steamignoredgames.user.js
// @downloadURL  https://github.com/sffxzzp/userscripts/raw/master/keylol/steamignoredgames.user.js
// ==/UserScript==

(function () {
    let data = JSON.parse(GM_getResourceText('userdata'));
    const ignoredApps = new Set(Object.keys(data.rgIgnoredApps));

    document.querySelectorAll('[id^=pid] a').forEach(function (a) {
        if (!a.href.includes('store.steampowered.com')) {
            return;
        }
        const match = a.href.match(/\/app\/(\d+)(?:\/|$)/);
        if (!match) {
            return;
        }
        const appId = match[1];
        if (ignoredApps.has(appId) && !(a.classList.contains("steam-info-own") && a.classList.contains("steam-info-wish")) && a.style.backgroundColor === "") {
            a.style.backgroundColor = 'gray';
            a.style.color = 'white';
        }
    });
})();
