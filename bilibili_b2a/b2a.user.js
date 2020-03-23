// ==UserScript==
// @name         Bilibili jump to av num
// @namespace    https://github.com/sffxzzp
// @version      0.03
// @description  redirect bilibili's BVid to aid
// @author       sffxzzp
// @match        https://www.bilibili.com/video/BV*
// @grant        unsafeWindow
// @icon         https://www.bilibili.com/favicon.ico
// @updateURL    https://github.com/sffxzzp/userscripts/raw/master/bilibili_b2a/b2a.user.js
// ==/UserScript==

(function() {
    location.href = 'https://www.bilibili.com/video/av'+unsafeWindow.aid;
})();
