// ==UserScript==
// @name         SteamCN Larger Font Size
// @namespace    https://coding.net/u/sffxzzp
// @version      0.03
// @description  Adjust font size of discuz to disable font too small.
// @author       sffxzzp
// @match        *://keylol.com/*
// @icon         https://keylol.com/favicon.ico
// @updateURL    https://github.com/sffxzzp/userscripts/raw/master/coding/stcnlargerfont.user.js
// ==/UserScript==

(function() {
    document.querySelectorAll('font[size="1"]').forEach(function (node) {
        node.setAttribute('size', '2');
    });
})();