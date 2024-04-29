// ==UserScript==
// @name         Netease Cloud Game AD Skipper
// @namespace    https://github.com/sffxzzp
// @version      0.02
// @description  nothing
// @author       sffxzzp
// @match        *://static-ssl.mediav.com/*
// @match        *://cloudgame.webapp.163.com/2021drawcz/*
// @grant        GM_addStyle
// @updateURL    https://github.com/sffxzzp/userscripts/raw/master/other/neteasecgadskipper.user.js
// @downloadURL  https://github.com/sffxzzp/userscripts/raw/master/other/neteasecgadskipper.user.js
// ==/UserScript==

(function() {
    if (location.href.indexOf('mediav.com')>-1) {
        setInterval(function () {document.querySelector('div.close-video').click()}, 500);
    } else {
        GM_addStyle(".adspcConfirmCon {display: none !important;}");
        setInterval(function () {document.querySelector('div.cofirm-btns > a.g-Btn').click()}, 500);
    }
})();
