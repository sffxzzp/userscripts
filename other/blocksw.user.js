// ==UserScript==
// @name         Block Service Workers
// @namespace    https://github.com/sffxzzp
// @version      0.04
// @description  Stop loading service worker, add domain to @include to disable on specified site.
// @author       sffxzzp
// @include      /https?://(?!www\.bilibili|bilibili).*/
// @grant        unsafeWindow
// @run-at       document-start
// @updateURL    https://github.com/sffxzzp/userscripts/raw/master/other/blocksw.user.js
// ==/UserScript==

(function() {
    unsafeWindow.navigator.serviceWorker.register = function () {};
})();
