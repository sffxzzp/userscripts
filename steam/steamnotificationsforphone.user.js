// ==UserScript==
// @name         Steam Notifications for Phone
// @namespace    https://github.com/sffxzzp
// @version      0.02
// @description  add some style that makes steam notification page more suitable for phone.
// @author       sffxzzp
// @match        *://steamcommunity.com/*/notifications
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    GM_addStyle('div#react_root > div:nth-child(2) > div:nth-child(2) {display: initial;} div#react_root > div:nth-child(2) > div:nth-child(2) > div:nth-child(2) {margin-top: 10px; max-width: initial;}');
})();
