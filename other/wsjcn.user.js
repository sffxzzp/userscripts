// ==UserScript==
// @name         WSJ CN Full Text
// @namespace    https://github.com/sffxzzp
// @version      0.01
// @description  full text display of cn.wsj.com
// @author       sffxzzp
// @match        *://cn.wsj.com/articles/*
// @match        *://cn.wsj.com/amp/articles/*
// @grant        GM_addStyle
// @updateURL    https://raw.githubusercontent.com/sffxzzp/userscripts/master/other/wsjcn.user.js
// @downloadURL  https://raw.githubusercontent.com/sffxzzp/userscripts/master/other/wsjcn.user.js
// ==/UserScript==

(function() {
    if (location.href.indexOf('cn.wsj.com/articles') > -1) {
        location.href = location.href.replace('/articles', '/amp/articles');
    }
    if (location.href.indexOf('/amp/articles') > -1) {
        GM_addStyle('amp-subscriptions-dialog,div.wsj-ad { display: none !important; } [subscriptions-action]:not(.i-amphtml-subs-display),[subscriptions-actions]:not(.i-amphtml-subs-display),[subscriptions-section=actions]:not(.i-amphtml-subs-display),body.i-amphtml-subs-delegated [subscriptions-section=actions],body.i-amphtml-subs-grant-unk [subscriptions-action],body.i-amphtml-subs-grant-unk [subscriptions-section=actions],body:not(.i-amphtml-subs-grant-no) [subscriptions-section=content-not-granted],body:not(.i-amphtml-subs-grant-yes) [subscriptions-section=content],body:not(.i-amphtml-subs-loading) [subscriptions-section=loading] { display: block !important; }');
    }
})();
