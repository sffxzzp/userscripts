// ==UserScript==
// @name         Bilibili Auto SpeedUp
// @namespace    https://github.com/sffxzzp
// @version      0.01
// @description  Sets playback rate for video.
// @author       sffxzzp
// @match        *://www.bilibili.com/*
// @icon         https://www.bilibili.com/favicon.ico
// @grant        none
// @updateURL    https://github.com/sffxzzp/userscripts/raw/master/bilibili/autospeedup.user.js
// ==/UserScript==

(function() {
    var extraSpeeds = [2.5, 3, 4, 5];
    var player = document.querySelector('#bilibiliPlayer') || null;
    if (player) {
        var observer = new MutationObserver(function (recs) {
            for (let i=0;i<recs.length;i++) {
                let rec = recs[i];
                if (rec.target.classList.contains('bilibili-player-video-wrap')) {
                    var menu = rec.target.querySelector('.bilibili-player-video-btn-speed-menu');
                    var name = rec.target.querySelector('.bilibili-player-video-btn-speed-name');
                    extraSpeeds.forEach(function (speed) {
                        var nspeed = document.createElement('li');
                        nspeed.className = 'bilibili-player-video-btn-speed-menu-list ';
                        nspeed.setAttribute('data-value', speed);
                        nspeed.innerHTML = `${parseFloat(speed).toFixed(1)}x`;
                        menu.insertBefore(nspeed, menu.children[0]);
                    });
                    for (let j=0;j<menu.children.length;j++) {
                        menu.children[j].onclick = function () {
                            for (let k=0;k<menu.children.length;k++) {
                                menu.children[k].classList.remove('bilibili-player-active');
                            }
                            this.classList.add('bilibili-player-active');
                            player.querySelector('video').playbackRate = this.getAttribute('data-value');
                            localStorage.setItem('auto_speedup', this.getAttribute('data-value'));
                            if (this.getAttribute('data-value') != 1) {
                                name.innerHTML = this.innerHTML;
                            }
                            else {
                                name.innerHTML = '倍速';
                            }
                        }
                    }
                    var pbrate = localStorage.getItem('auto_speedup') || 1;
                    for (let l=0;l<menu.children.length;l++) {
                        if (menu.children[l].getAttribute('data-value')==pbrate) {
                            menu.children[l].click();
                        }
                    }
                    break;
                }
            }
        });
        observer.observe(player, { childList: true, subtree: true });
    }
})();
