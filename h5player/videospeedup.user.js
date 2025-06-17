// ==UserScript==
// @name         Anime SpeedUp
// @namespace    https://github.com/sffxzzp
// @version      1.61
// @description  Enhance experiences of anime sites.
// @author       sffxzzp
// @match        *://omofun.in/vod/play/*
// @match        *://www.5dm.link/html5/player/*
// @match        *://*/?url=age_*
// @match        *://*/m3u8/?url=age_*
// @match        *://*/vip/?url=age_*
// @match        *://*/*/*/a-pic.php*
// @match        *://ani.gamer.com.tw/animeVideo.php*
// @match        *://player.moedot.net/*
// @match        *://jiexi.modujx01.com/?url=*
// @match        *://www.age*.*/play/*/*/*
// @grant        GM_addStyle
// @grant        GM_openInTab
// @grant        GM_webRequest
// @grant        unsafeWindow
// @updateURL    https://github.com/sffxzzp/userscripts/raw/master/h5player/videospeedup.user.js
// @downloadURL  https://github.com/sffxzzp/userscripts/raw/master/h5player/videospeedup.user.js
// ==/UserScript==

(function() {
    // 尝试屏蔽广告
    GM_webRequest([
        { selector: '*://www.googletagmanager.com/*', action: 'cancel' },
        { selector: '*://*.g.doubleclick.net/*', action: 'cancel' },
        { selector: '*://connect.facebook.net/*', action: 'cancel' },
        { selector: '*://*.2mdn.net/*', action: 'cancel' },
        { selector: '*://pagead2.googlesyndication.com/*', action: 'cancel' }
    ], function (info, message, details) {
        console.log(info, message, details);
    });

    // 一些界面微调
    GM_addStyle('.p-oper { position: sticky; bottom: 0; } .p-oper.webfs { position: relative; } .ABP-Comment-List, div#egg_mask, div#egg_box { display: none; } .ABP-Unit .ABP-Player { width: unset; } .BH_background .container-player .player .videoframe.vjs-fullwindow {height: 100vh !important;} body:has(div.video.fullwindow) { overflow: hidden; }');

    // 动画疯年龄验证跳过、广告到时间跳过
    let adskipfunc = function () {
        let video = document.querySelector('div#video-container video');
        let adskip = document.querySelector('div#adSkipButton');
        if (adskip) {
            let adskiptimeout = setTimeout(function () {
                if (adskip.classList.contains('enable')) {
                    video.muted = false;
                    adskip.click();
                    clearTimeout(adskiptimeout);
                } else {
                    adskipfunc();
                }
            }, 1000);
        }
    };
    if (location.href.indexOf('ani.gamer.com.tw') >= 0) {
        let observer = new MutationObserver(function (mutationList) {
            for (let mutation of mutationList) {
                let r18btn = mutation.target.querySelector('div.R18 button#adult');
                if (r18btn) {
                    r18btn.click();
                }
            }
        });
        observer.observe(document.getElementById('video-container'), {childList: true, subtree: true})
        let adobserver = new MutationObserver(function (mutationList) {
            for (let mutation of mutationList) {
                let adskip = mutation.target.querySelector('div#adSkipButton');
                let adskip1 = mutation.target.querySelector('div.videoAdUiSkipContainer');
                if (adskip || adskip1) {
                    mutation.target.querySelector('video').muted = true;
                    adskipfunc();
                }
            }
        });
        adobserver.observe(document.getElementById('ani_video'), {childList: true});
    }
    if (location.href.indexOf('player.moedot.net') >= 0) {
        let observer = new MutationObserver(function (mutationList) {
            for (let mutation of mutationList) {
                let skipbtn = mutation.target.querySelector('a.ec-ok') || mutation.target.querySelector('a.ec-no');
                if (skipbtn) {
                    skipbtn.click();
                }
            }
        });
        observer.observe(document.body, {childList: true, subtree: true})
    }

    // agedm PC 屏蔽
    if (location.href.indexOf('agedm') >= 0 && location.href.indexOf('play') >= 0) {
        if (document.querySelector('div#cpraid') != null) {
            https://m.agedm.org/#/play/20240076/1/1
            location.href = location.href.replace('www.', 'm.').replace('.org/', '.org/#/');
        }
    }

    // 增加快捷键
    document.onkeydown = function() {
        let video = document.querySelector('video');
        let pbrate = video.playbackRate || 1;
        let step = 30;
        var toggleFullscreen = function () {
            let art = unsafeWindow.Artplayer || null;
            let dp = unsafeWindow.DPlayer || null;
            if (art) {
                let player = art.instances[0];
                player.fullscreen = !player.fullscreen;
            } else if (dp) {
                if (dp.fullScreen.isFullScreen()) {
                    dp.fullScreen.cancel();
                } else {
                    dp.fullScreen.request();
                }
            } else {
                if (!document.fullscreenElement) {
                    let fsElement = document.querySelector('#artplayer') || document.querySelector('#player') || document.querySelector('div.ABP-Player') || document.querySelector('div.art-video-player');
                    fsElement.requestFullscreen();
                } else {
                    document.exitFullscreen();
                }
            }
        }
        var toggleFullscreenWeb = function () {
            if (location.href.indexOf("ani.gamer.com.tw/animeVideo.php") >= 0) {
                return;
            }
            let art = unsafeWindow.Artplayer || null;
            let dp = unsafeWindow.DPlayer || null;
            if (art) {
                let player = art.instances[0];
                player.fullscreenWeb = !player.fullscreenWeb;
            } else if (dp) {
                if (dp.fullScreen.isFullScreen('web')) {
                    dp.fullScreen.cancel('web');
                } else {
                    dp.fullScreen.request('web');
                }
            } else {
                if (unsafeWindow.fsWeb) {
                    video.style.height = '';
                    video.style.width = '';
                    video.style.position = '';
                    video.style.top = '';
                    video.style.left = '';
                    video.style.zIndex = 10;
                    video.style.background = '';
                    document.body.style.overflow = '';
                    unsafeWindow.fsWeb = false;
                } else {
                    video.style.height = '100vh';
                    video.style.width = '100vw';
                    video.style.position = 'fixed';
                    video.style.top = '0px';
                    video.style.left = '0px';
                    video.style.zIndex = 999999;
                    video.style.background = 'black';
                    document.body.style.overflow = 'hidden';
                    unsafeWindow.fsWeb = true;
                }
            }
        }
        var goVideo = function (direct) {
            if (location.href.indexOf('player.moedot.net') >= 0) {
                location.href = decodeURIComponent(location.href).replace(/(\d+)\.mp4$/, (_, n) => String(+n+(direct > 0 ? 1 : -1)).padStart(n.length, '0') + '.mp4');
            }
            let target = "";
            let next = "";
            let prev = "";
            let win;
            if (location.href.indexOf("ani.gamer.com.tw/animeVideo.php") >= 0) {
                win = window;
                next = "button.vjs-next-button";
                prev = "button.vjs-pre-button";
            } else {
                win = window.parent;
                next = "a.next";
                prev = "a.prev";
            }
            if (direct > 0) {
                target = next;
            } else if (direct < 0) {
                target = prev;
            }
            if (target != "") {
                target = win.document.querySelector(target);
            }
            if (target != null) {
                target.click();
            }
        };
        var prtScr = function () {
            let canvas = document.createElement('canvas');
            canvas.height = video.videoHeight;
            canvas.width = video.videoWidth;
            let ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            GM_openInTab(canvas.toDataURL('image/jpeg'), false);
        };
        if (event.key == "n") {goVideo(1);}
        if (event.key == "p") {goVideo(-1);}
        if (event.key == ">" && event.shiftKey) {video.currentTime += step;}
        if (event.key == "<" && event.shiftKey) {video.currentTime -= step;}
        if (event.key == "f") {toggleFullscreen();}
        if (event.key == "t") {toggleFullscreenWeb();}
        if (event.key == "P" && event.shiftKey) {prtScr();}
        if (event.key == "=" && event.repeat === false) {pbrate = pbrate * 2; unsafeWindow.ratePress = true;}
        if (event.key == "-" && event.repeat === false) {pbrate = pbrate / 2; unsafeWindow.ratePress = true;}
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
        video.playbackRate = pbrate;
    };
    document.onkeyup = function() {
        let video = document.querySelector('video');
        let pbrate = video.playbackRate || 1;
        if (event.key == "=" && unsafeWindow.ratePress) {pbrate = pbrate / 2; unsafeWindow.ratePress = false;}
        if (event.key == "-" && unsafeWindow.ratePress) {pbrate = pbrate * 2; unsafeWindow.ratePress = false;}
        video.playbackRate = pbrate;
    };
})();
