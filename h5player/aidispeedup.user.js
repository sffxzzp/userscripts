// ==UserScript==
// @name         Aidi SpeedUp
// @namespace    https://github.com/sffxzzp
// @version      0.01
// @description  add new playback rate to aidi.tv
// @author       sffxzzp
// @match        *://aidi.tv/player/?url=*
// @include      ^.*?\/\/aidi\.tv\/player\/\?url=.*$
// @grant        none
// @updateURL    https://github.com/sffxzzp/userscripts/raw/master/h5player/aidispeedup.user.js
// ==/UserScript==

(function() {
    var checkPlayer = function () {
        setTimeout(function () {
            var player = document.querySelector('.yzmplayer-setting-speed-panel') || null;
            if (player) {
                setSpeed();
            }
            else {
                checkPlayer();
            }
        }, 500);
    };
    var setSpeed = function () {
        var video = document.querySelector('video');
        var panel = document.querySelector('.yzmplayer-setting-speed-panel');
        var title = document.querySelector('.yzmplayer-setting-speeds > .title');
        var speednew = document.createElement('div');
        speednew.className = 'yzmplayer-setting-speed-item';
        speednew.setAttribute('data-speed', '3');
        speednew.innerHTML = '<span class="yzmplayer-label">3.0x</span>';
        speednew.onclick = function () {
            video.playbackRate = 3;
            title.innerHTML = '3.0x';
        }
        panel.appendChild(speednew);
        var speednew1 = document.createElement('div');
        speednew1.className = 'yzmplayer-setting-speed-item';
        speednew1.setAttribute('data-speed', '4');
        speednew1.innerHTML = '<span class="yzmplayer-label">4.0x</span>';
        speednew1.onclick = function () {
            video.playbackRate = 4;
            title.innerHTML = '4.0x';
        }
        panel.appendChild(speednew1);
        document.querySelector('.yzmplayer-logo').style.display = 'none';
    };
    checkPlayer();
})();
