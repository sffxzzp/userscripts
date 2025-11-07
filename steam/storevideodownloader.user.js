// ==UserScript==
// @name         Steam Store Video Downloader
// @namespace    https://github.com/sffxzzp
// @version      0.20
// @description  add download button in store page to get videos.
// @author       sffxzzp
// @match        *://store.steampowered.com/app/*
// @icon         https://store.steampowered.com/favicon.ico
// @grant        unsafeWindow
// @updateURL    https://github.com/sffxzzp/userscripts/raw/master/steam/storevideodownloader.user.js
// @downloadURL  https://github.com/sffxzzp/userscripts/raw/master/steam/storevideodownloader.user.js
// ==/UserScript==

(function() {
    var carousel = document.querySelector("div.gamehighlight_desktopcarousel");
    var observer = new MutationObserver(function (recs) {
        if (carousel.children[0].children.length == 4) {
            loadBtn();
        }
    });
    observer.observe(carousel, { childList: true, subtree: true });

    function loadBtn() {
        if (unsafeWindow.ssvdLoaded) {
            return;
        }
        unsafeWindow.ssvdLoaded = true;
        let trailers = JSON.parse(document.querySelector('div.gamehighlight_desktopcarousel').dataset.props).trailers;
        document.querySelectorAll('div.gamehighlight_desktopcarousel >div > div:last-child > div:first-child > div:has(svg.SVGIcon_Button)').forEach(function (node) {
            let imgSrc = node.querySelector('img').src;
            let mUrl = '';
            let found264 = false;
            let target;
            for (let trailer of trailers) {
                if (trailer.thumbnail == imgSrc) {
                    target = trailer;
                }
            }
            if (target) {
                for (let u of target.dashManifests) {
                    if (u.indexOf('h264') > 0) {
                        mUrl = u;
                        found264 = true;
                    }
                }
                if (found264 == false) {
                    mUrl = target.dashManifests[0];
                }
                if (mUrl) {
                    node.ondblclick = function () {
                        prompt("url: ", mUrl);
                    }
                } else {
                    node.ondblclick = function () {
                        alert('no url found.');
                    }
                }
            } else {
                node.ondblclick = function () {
                    alert('no url found.')
                }
            }
        });
    }
})();
