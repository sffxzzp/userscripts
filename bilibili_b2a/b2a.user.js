// ==UserScript==
// @name         Bilibili jump to av num
// @namespace    https://github.com/sffxzzp
// @version      0.02
// @description  redirect bilibili's BVid to aid
// @author       sffxzzp
// @match        https://www.bilibili.com/video/BV*
// @grant        unsafeWindow
// @icon         https://www.bilibili.com/favicon.ico
// @updateURL    https://github.com/sffxzzp/userscripts/raw/master/bilibili_b2a/b2a.user.js
// ==/UserScript==

(function() {
    location.href = location.href.substr(0, location.href.length-12)+'av'+unsafeWindow.aid;
})();
