// ==UserScript==
// @name         Steam Gifting Scripts.
// @namespace    https://coding.net/u/sffxzzp
// @version      0.03
// @description  A script that makes gifting to one that already have the game possible.
// @author       sffxzzp
// @match        *://store.steampowered.com/checkout/sendgift/*
// @icon         https://store.steampowered.com/favicon.ico
// @updateURL    https://sffxzzp.coding.net/p/userscripts/d/userscripts/git/raw/master/steamgifting.user.js
// ==/UserScript==

(function() {
    document.querySelectorAll('.friend_block').forEach(node => {
        if (node.classList.contains('disabled')) {
            node.classList.remove('disabled');
            node.querySelector('input').removeAttribute('disabled');
        }
    });
})();