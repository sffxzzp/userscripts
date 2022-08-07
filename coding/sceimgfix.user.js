// ==UserScript==
// @name         SteamCardExchange Img Fix
// @namespace    https://coding.net/u/sffxzzp
// @version      0.2
// @description  try fixing img load error in steamcardexchange
// @author       sffxzzp
// @match        *://www.steamcardexchange.net/index.php?gamepage-appid-*
// @icon         http://www.steamcardexchange.net/include/design/img/favicon_blue_small.png
// @updateURL    https://sffxzzp.coding.net/p/userscripts/d/userscripts/git/raw/master/sceimgfix.user.js
// ==/UserScript==

(function() {
    var imgs=document.getElementsByClassName('element-image');
    for (var i=0;i<imgs.length;i++) {
        if (!imgs[i].src.includes('community.edgecast.steamstatic.com')) {
            imgs[i].src=imgs[i].src.replace('http://', 'https://').replace('cdn.edgecast.steamstatic.com', 'cdn.akamai.steamstatic.com');
        }
    }
})();