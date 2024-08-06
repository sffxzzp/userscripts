// ==UserScript==
// @name         Anime SpeedUp
// @namespace    https://github.com/sffxzzp
// @version      1.43
// @description  Enhance experiences of anime sites.
// @author       sffxzzp
// @match        *://www.zzzfun.one/*
// @match        *://omofun.in/vod/play/*
// @match        *://www.5dm.link/html5/player/*
// @match        *://*/?url=age_*
// @match        *://*/m3u8/?url=age_*
// @match        *://*/vip/?url=age_*
// @match        *://*/*/*/a-pic.php*
// @match        *://ani.gamer.com.tw/animeVideo.php*
// @grant        GM_addStyle
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
        let adskiptimeout = setTimeout(function () {
            if (adskip.classList.contains('enable')) {
                video.muted = false;
                adskip.click();
                clearTimeout(adskiptimeout);
            } else {
                adskipfunc();
            }
        }, 1000);
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
                if (adskip) {
                    mutation.target.querySelector('video').muted = true;
                    adskipfunc();
                }
            }
        });
        adobserver.observe(document.getElementById('ani_video'), {childList: true});
    }

    // zzzfun 增加网页全屏按钮
    if (location.href.indexOf('vod_play_id_') >= 0) {
        let bar = document.querySelector('.p-oper');
        let webPrev = document.querySelector('a.prev');
        let webNext = document.querySelector('a.next');
        let webFull = document.createElement('a');
        webFull.onclick = function () {
            let elem = document.querySelector('td#playleft > iframe');
            if (!elem.getAttribute('isfull')) {
                bar.classList.add('webfs');
                document.body.style.overflow = "hidden";
                webPrev.style = "position: fixed; top: 20px; right: 180px; z-index: 101; margin-right: 0;";
                webNext.style = "position: fixed; top: 20px; right: 100px; z-index: 101; margin-right: 0;";
                this.style = "position: fixed; top: 20px; right: 0; z-index: 101; margin-right: 10px;";
                elem.style = "position: fixed; width: 100vw; height: 100vh; left: 0; top: 0; z-index: 100;";
                elem.setAttribute('isfull', "true");
            } else {
                bar.classList.remove('webfs');
                document.body.style.overflow = "auto";
                webPrev.style = "";
                webNext.style = "";
                this.style = "";
                elem.style = "";
                elem.setAttribute('isfull', "");
            }
        };
        webFull.href = "javascript:;";
        webFull.className = "copy";
        webFull.innerHTML = "网页全屏";
        document.querySelector('div.p-oper').appendChild(webFull);
    }

    // 增加快捷键
    document.onkeydown = function() {
        let video = document.querySelector('video');
        let pbrate = video.playbackRate || 1;
        let step = 30;
        var toggleFullscreen = function () {
            var fsElement = document.querySelector('#artplayer') || document.querySelector('#player') || document.querySelector('div.ABP-Player');
            if (fsElement && !document.fullscreenElement) {
                fsElement.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        }
        var goVideo = function (direct) {
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
        if (event.key == "n") {goVideo(1);}
        if (event.key == "p") {goVideo(-1);}
        if (event.key == ">" && event.shiftKey) {video.currentTime += step;}
        if (event.key == "<" && event.shiftKey) {video.currentTime -= step;}
        if (event.key == "f") {toggleFullscreen();}
        if (event.key == "=" && event.repeat === false) {pbrate = pbrate * 2;}
        if (event.key == "-" && event.repeat === false) {pbrate = pbrate / 2;}
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
        if (event.key == "=") {pbrate = pbrate / 2;}
        if (event.key == "-") {pbrate = pbrate * 2;}
        video.playbackRate = pbrate;
    };
})();
