// ==UserScript==
// @name         Keylol Steam Ignored Games
// @author       sffxzzp
// @namespace    https://github.com/sffxzzp
// @description  快速匹配已忽略 Steam 游戏信息
// @match        *://keylol.com/*
// @grant        GM_getResourceText
// @version      0.02
// @resource     userdata https://store.steampowered.com/dynamicstore/userdata
// @icon         https://store.steampowered.com/favicon.ico
// @updateURL    https://github.com/sffxzzp/userscripts/raw/master/keylol/steamignoredgames.user.js
// @downloadURL  https://github.com/sffxzzp/userscripts/raw/master/keylol/steamignoredgames.user.js
// ==/UserScript==

(function () {
    let data = JSON.parse(GM_getResourceText('userdata'));
    let iApps = [], iSubs = [];
    for (let i in data.rgIgnoredApps) {
        iApps.push(i);
    }
    document.querySelectorAll('[id^=pid] a').forEach(function (a) {
        if (a.href.indexOf('store.steampowered.com')>-1) {
            for (var app of iApps) {
                if (a.href.indexOf(app)>-1) {
                    a.style = 'background-color: gray; color: white;';
                }
            }
        }
    });
})();
