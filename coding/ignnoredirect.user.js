// ==UserScript==
// @name         IGN no redirect
// @namespace    https://github.com/sffxzzp
// @version      0.02
// @description  Stop redirect to .中国
// @author       sffxzzp
// @match        *://*.ign.com/*
// @icon         https://www.ign.com/favicon.ico
// @run-at       document-start
// @updateURL    https://github.com/sffxzzp/userscripts/raw/master/coding/ignnoredirect.user.js
// ==/UserScript==

(function() {
    document.cookie = 'geoCC=US; path=/; domain=.ign.com;';
})();