// ==UserScript==
// @name         Acfun Auto SpeedUp
// @namespace    https://github.com/sffxzzp
// @version      0.01
// @description  Sets playback rate for video.
// @author       sffxzzp
// @match        *://www.acfun.cn/*
// @icon         https://www.acfun.cn/favicon.ico
// @grant        none
// @updateURL    https://github.com/sffxzzp/userscripts/raw/master/acfun/autospeedup.user.js
// ==/UserScript==

(function() {
    // 额外的加速选项，可自定义
    var extraSpeeds = [2.5, 3, 4, 5];
    // 是否记忆速度以在其他视频自动变速
    var remember = true;

    var player = document.querySelector('#ACPlayer') || null;
    if (player) {
        var observer = new MutationObserver(function (recs) {
            for (let i=0;i<recs.length;i++) {
                let rec = recs[i];
                if (rec.target.classList.contains('container-plugins-inner')) {
                    var menu = rec.target.querySelector('.speed-panel > ul');
                    var name = rec.target.querySelector('.speed > span');
                    if (menu.children.length >= extraSpeeds.length + 6) {
                        break;
                    }
                    addSpeeds(menu, name);
                    break;
                }
            }
        });
        observer.observe(player, { childList: true, subtree: true });
    }
    function addSpeeds(menu, name) {
        extraSpeeds.forEach(function (speed) {
            var nspeed = document.createElement('li');
            nspeed.setAttribute('data-val', speed);
            nspeed.innerHTML = `${Math.round(speed * 100) / 100}x`;
            menu.insertBefore(nspeed, menu.children[0]);
        });
        for (let j=0;j<menu.children.length;j++) {
            menu.children[j].onclick = function () {
                player.querySelector('video').playbackRate = this.getAttribute('data-val');
                localStorage.setItem('auto_speedup', this.getAttribute('data-val'));
            }
        }
        if (remember) {
            var pbrate = localStorage.getItem('auto_speedup') || 1;
            for (let l=0;l<menu.children.length;l++) {
                if (menu.children[l].getAttribute('data-val')==pbrate) {
                    setTimeout(function () {menu.children[l].click();}, 500);
                    break;
                }
            }
        }
    }

    var keydown = document.onkeydown || function () {};
    document.onkeydown = function () {
        keydown();
        if (event.key == 'N' && event.shiftKey) {
            var next = player.querySelector('.btn-next-part > .control-btn') || null;
            console.log(next);
            if (next) {next.click();}
        }
    }
})();
