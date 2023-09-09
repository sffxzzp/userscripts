// ==UserScript==
// @name         iKanBot ArtPlayer
// @namespace    https://github.com/sffxzzp
// @version      0.03
// @description  Replace ikanbot.com's default player to artplayer
// @author       sffxzzp
// @match        *://www.ikanbot.com/play/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/sffxzzp/userscripts/master/other/ikanbot.user.js
// @downloadURL  https://raw.githubusercontent.com/sffxzzp/userscripts/master/other/ikanbot.user.js
// @run-at       document-end
// ==/UserScript==

(function() {
    let container = document.querySelector('#pc-player').parentNode;
    container.innerHTML = '<iframe id="player-frame" src="https://tools.ore-imo.tk/video/" style="border: none; width: 100%; height: 100%;" allowfullscreen="true"></iframe>';
    container.style.height = '600px';

    function load() {
        document.querySelectorAll('div[name=lineData]').forEach(function (node) {
            var link = node.getAttribute('udata');
            let vbtn = document.createElement('div');
            vbtn.innerHTML = node.innerHTML;
            vbtn.setAttribute('link', link);
            vbtn.setAttribute('class', 'lineData');
            vbtn.onclick = function () {
                document.querySelector('#player-frame').src = "https://tools.ore-imo.tk/video/?" + this.getAttribute('link');
                document.querySelectorAll('div.lineData').forEach(function (node) {
                    node.style.background = "white";
                })
                this.style.background = "cyan";
            };
            node.parentNode.appendChild(vbtn);
            node.parentNode.removeChild(node);
        });
        document.querySelector('div.lineData').click();
    }

    var lineData = document.getElementById('lineContent');
    var observer = new MutationObserver(function (recs) {
        load();
    });
    observer.observe(lineData, { childList: true, subtree: true });
})();
