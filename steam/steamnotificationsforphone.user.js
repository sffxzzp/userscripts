// ==UserScript==
// @name         Steam Notifications for Phone
// @namespace    https://github.com/sffxzzp
// @version      0.01
// @description  add some style that makes steam notification page more suitable for phone.
// @author       sffxzzp
// @match        *://steamcommunity.com/*/notifications
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    GM_addStyle('div[class^=notifications_NotificationsBody] {display: initial;} div[class^=notifications_NotificationFiltersCtn] {margin-top: 10px;}');
})();
