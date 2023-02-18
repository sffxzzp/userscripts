// ==UserScript==
// @name         Steam Emoticon Larger
// @namespace    https://github.com/sffxzzp
// @version      0.04
// @description  protect your eyesight
// @author       sffxzzp
// @icon         https://store.steampowered.com/favicon.ico
// @match        *://steamcommunity.com/profiles/*
// @match        *://steamcommunity.com/id/*
// @match        *://steamcommunity.com/sharedfiles/filedetails/?id=*
// @match        *://steamcommunity.com/workshop/filedetails/discussion/*
// @match        *://steamcommunity.com/discussions/forum/*
// @match        *://steamcommunity.com/app/*/discussions/*
// @grant        GM_addStyle
// @updateURL    https://github.com/sffxzzp/userscripts/raw/master/steam/emoticonlarger.user.js
// @downloadURL  https://github.com/sffxzzp/userscripts/raw/master/steam/emoticonlarger.user.js
// ==/UserScript==

(function() {
    if (location.href.indexOf('edit/info') > 0) {
        GM_addStyle('[class*="emoticon_EmoticonItem_"] { height: 48px !important; width: 48px !important; } [class*="emoticon_EmoticonItem_"] > img[class*="emoticon_emoticon_"] { height: 40px !important; width: 40px !important; }');
        let bodyobs = document.getElementsByClassName('flat_page')[0];
        let observer = new MutationObserver(function (recs) {
            for (let i=0;i<recs.length;i++) {
                let rec = recs[i];
                rec.addedNodes.forEach(function (node) {
                    if (node.classList && node.classList.contains('visible')) {
                        document.querySelectorAll('[class*="emoticon_EmoticonItem_"]').forEach(function (node) {
                            node.querySelector('img').src = node.querySelector('img').src.replace('emoticon', 'emoticonlarge');
                        });
                    }
                })
            }
        });
        observer.observe(bodyobs, { childList: true, subtree: true });
    } else {
        GM_addStyle('.emoticon_popup_content .emoticon_option { line-height: 48px !important; height: 48px !important; width: 58px !important; } .emoticon_option > img.emoticon { height: 48px !important; width: 48px !important; }');
        let bodyobs = document.getElementsByClassName('flat_page')[0];
        let observer = new MutationObserver(function (recs) {
            for (let i=0;i<recs.length;i++) {
                let rec = recs[i];
                if (rec.target.classList.contains('emoticon_popup')) {
                    document.querySelectorAll('.emoticon_popup_content .emoticon_option').forEach(function (node) {
                        node.querySelector('img').src = node.querySelector('img').src.replace('emoticon', 'emoticonlarge');
                    });
                    break;
                }
            }
        });
        observer.observe(bodyobs, { childList: true, subtree: true });
    }
})();
