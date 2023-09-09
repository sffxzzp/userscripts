// ==UserScript==
// @name         iKanBot ArtPlayer
// @namespace    https://github.com/sffxzzp
// @version      0.04
// @description  Replace ikanbot.com's default player to artplayer
// @author       sffxzzp
// @require      https://unpkg.com/hls.js/dist/hls.min.js
// @require      https://unpkg.com/flv.js/dist/flv.min.js
// @require      https://unpkg.com/dashjs/dist/dash.all.min.js
// @require      https://unpkg.com/artplayer/dist/artplayer.js
// @match        *://www.ikanbot.com/play/*
// @grant        GM_webRequest
// @grant        unsafeWindow
// @updateURL    https://raw.githubusercontent.com/sffxzzp/userscripts/master/other/ikanbot.user.js
// @downloadURL  https://raw.githubusercontent.com/sffxzzp/userscripts/master/other/ikanbot.user.js
// @run-at       document-start
// ==/UserScript==

(function() {
    // block webpage's default video.js
    GM_webRequest([
        { selector: '*://cdn.staticfile.org/video.js/*', action: 'cancel' }
    ], function (info, message, details) {
        console.log(info, message, details);
    });
    // add a videojs to keep page js run without errors
    unsafeWindow.videojs = function (div, options) {};

    // the rest of the code should run when document loaded instead of document-start
    document.addEventListener('DOMContentLoaded', init);
    function init() {
        var playM3u8 = function (video, url, art) {
            if (Hls.isSupported()) {
                if (art.hls) {
                    art.hls.destroy();
                }
                const hls = new Hls();
                hls.loadSource(url);
                hls.attachMedia(video);
                art.hls = hls;
                art.on('destroy', function () {
                    hls.destroy();
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
            } else {
                art.notice.show = 'Unsupported: m3u8';
            }
        };
        var playFlv = function (video, url, art) {
            if (flvjs.isSupported()) {
                if (art.flv) {
                    art.flv.destroy();
                }
                const flv = flvjs.createPlayer({ type: 'flv', url });
                flv.attachMediaElement(video);
                flv.load();
                art.flv = flv;
                art.on('destroy', function () {
                    flv.destroy();
                });
            } else {
                art.notice.show = 'Unsupported: flv'
            }
        };
        var playMpd = function (video, url, art) {
            if (dashjs.supportsMediaSource()) {
                if (art.dash) {
                    art.dash.destroy();
                }
                const dash = dashjs.MediaPlayer().create();
                dash.initialize(video, url, art.option.autoplay);
                art.dash = dash;
                art.on('destroy', function () {
                    dash.destroy();
                });
            } else {
                art.notice.show = 'Unsupported: mpd'
            }
        };

        Artplayer.PLAYBACK_RATE = [0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3, 4, 8];

        document.querySelector('video').pause();
        let container = document.querySelector('#pc-player').parentNode;
        container.innerHTML = '';
        container.style.height = '600px';
        const art = new Artplayer({
            container: container,
            url: '',
            volume: 1,
            flip: true,
            playbackRate: true,
            aspectRatio: true,
            setting: true,
            pip: true,
            fullscreen: true,
            fullscreenWeb: true,
            miniProgressBar: true,
            fastForward: true,
            autoOrientation: true,
            airplay: true,
            customType: {
                m3u8: playM3u8,
                flv: playFlv,
                mpd: playMpd,
            },
        });
        art.isFocus = true;
        art.pause();
        let dp = null;

        document.onkeydown = function() {
            let video = art || document.querySelector('video');
            let pbrate = video.playbackRate || 1;
            let step = 30;
            function toggleFullscreen() { if (art) { art.fullscreen = !art.fullscreen; } else if (dp) { if (dp.fullScreen.isFullScreen()) { dp.fullScreen.cancel(); } else { dp.fullScreen.request(); }} else { if (!document.fullscreenElement) { video.requestFullscreen(); } else { document.exitFullscreen(); }}}
            function notice(text) {if (art) { art.notice.show = text; } else if (dp) { dp.notice(text); }}
            if (event.key == ">" && event.shiftKey) {video.currentTime += step;notice(`快进 ${step} 秒`);}
            if (event.key == "<" && event.shiftKey) {video.currentTime -= step;notice(`快退 ${step} 秒`);}
            if (event.key == "f") { toggleFullscreen(); }
            if (event.key == "+" && event.shiftKey) {pbrate += 0.5;}
            if (event.key == "_" && event.shiftKey) {pbrate -= 0.5;}
            if (event.key == "!" && event.shiftKey) {pbrate = 1;}
            if (event.key == "@" && event.shiftKey) {pbrate = 2;}
            if (event.key == "#" && event.shiftKey) {pbrate = 3;}
            if (event.key == "$" && event.shiftKey) {pbrate = 4;}
            if (event.key == "%" && event.shiftKey) {pbrate = 5;}
            if (event.key == "^" && event.shiftKey) {pbrate = 6;}
            if (event.key == "&" && event.shiftKey) {pbrate = 7;}
            if (event.key == "*" && event.shiftKey) {pbrate = 8;}
            if (pbrate != video.playbackRate) {notice(`速度：${pbrate}x`)}
            video.playbackRate = pbrate;
        };

        function load() {
            document.querySelectorAll('div[name=lineData]').forEach(function (node) {
                var link = node.getAttribute('udata');
                let vbtn = document.createElement('div');
                vbtn.innerHTML = node.innerHTML;
                vbtn.setAttribute('link', link);
                vbtn.setAttribute('class', 'lineData');
                vbtn.onclick = function () {
                    art.switchUrl(this.getAttribute('link'));
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
    }
})();
