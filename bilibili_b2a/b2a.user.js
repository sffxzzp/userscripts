// ==UserScript==
// @name         Bilibili jump to av num
// @namespace    https://github.com/sffxzzp
// @version      0.01
// @description  redirect bilibili's BVid to aid
// @author       sffxzzp
// @match        https://www.bilibili.com/video/BV*
// @grant        unsafeWindow
// @icon         https://www.bilibili.com/favicon.ico
// ==/UserScript==

(function() {
    location.href = location.href.substr(0, location.href.length-12)+'av'+unsafeWindow.aid;
})();
