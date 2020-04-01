// ==UserScript==
// @name         Block Service Workers
// @namespace    https://github.com/sffxzzp
// @version      0.01
// @description  Stop loading service worker, add domain to @include to enable on specified site.
// @author       sffxzzp
// @include      /https?://(keylol.com).*/
// @grant        unsafeWindow
// @run-at       document-start
// ==/UserScript==

(function() {
    unsafeWindow.navigator.serviceWorker.register = function () {};
})();
