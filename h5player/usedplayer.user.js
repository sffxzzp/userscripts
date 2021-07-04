// ==UserScript==
// @name         Use DPlayer
// @namespace    https://github.com/sffxzzp
// @version      0.01
// @description  try to extract m3u8 address from <video>.
// @author       sffxzzp
// @include      /^https?://(?!tools\.sffxzzp\.workers\.dev).*/
// @grant        GM_openInTab
// @updateURL    https://github.com/sffxzzp/userscripts/raw/master/h5player/usedplayer.user.js
// ==/UserScript==

(function() {
    setTimeout(function () {
        var src = document.querySelector('video').src || '';
        if (src.indexOf('http') == 0) {
            if (confirm(`检测到地址：${src}\n\n是否在新标签页打开？`)) {
                GM_openInTab('https://tools.sffxzzp.workers.dev/video/?'+src, {active: true});
            }
        }
    }, 1000);
})();
