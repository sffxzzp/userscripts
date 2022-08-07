// ==UserScript==
// @name         IGN no redirect
// @namespace    https://github.com/sffxzzp
// @version      0.02
// @description  Stop redirect to .中国
// @author       sffxzzp
// @match        *://*.ign.com/*
// @icon         https://www.ign.com/favicon.ico
// @run-at       document-start
// @updateURL    https://sffxzzp.coding.net/p/userscripts/d/userscripts/git/raw/master/ignnoredirect.user.js
// ==/UserScript==

(function() {
    document.cookie = 'geoCC=US; path=/; domain=.ign.com;';
})();