// ==UserScript==
// @name         Steam Link Unblock
// @namespace    https://coding.net/u/sffxzzp
// @version      0.05
// @description  Display all blocked links in Steam review.
// @author       sffxzzp
// @icon         https://store.steampowered.com/favicon.ico
// @match        *://steamcommunity.com/app/*/reviews/*
// @match        *://store.steampowered.com/app/*
// @match        *://steamcommunity.com/*/recommended/*
// @updateURL    https://github.com/sffxzzp/userscripts/raw/master/coding/steamlinkunblock.user.js
// @downloadURL  https://github.com/sffxzzp/userscripts/raw/master/coding/steamlinkunblock.user.js
// ==/UserScript==

(function() {
    function observe(id='') {
        document.querySelectorAll('.bb_removedlink').forEach(function (node) {
            node.innerHTML = '';
            node.parentNode.querySelector('.collapsed_link').setAttribute('style', '');
        });
        if (id != '') {
            var target = document.getElementById(id);
            var observer = new MutationObserver(function (recs) {
                for (let i=0;i<recs.length;i++) {
                    let rec = recs[i];
                    rec.target.querySelectorAll('.bb_removedlink').forEach(function (node) {
                        node.innerHTML = '';
                        node.parentNode.querySelector('.collapsed_link').setAttribute('style', '');
                    });
                }
            });
            observer.observe(target, { childList: true, subtree: true });
        }
    }
    if (location.href.indexOf('reviews') >= 0) {
        observe('AppHubCards');
    }
    else if (location.href.indexOf('store.steampowered.com') >= 0) {
        observe('Reviews_summary');
    }
    else {
        observe();
    }
})();
