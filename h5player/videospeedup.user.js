// ==UserScript==
// @name         Anime SpeedUp
// @namespace    https://github.com/sffxzzp
// @version      1.10
// @description  Enhance experiences of anime sites.
// @author       sffxzzp
// @match        *://www.zzzfun.one/*
// @match        *://omofun.in/vod/play/*
// @match        *://www.5dm.link/html5/player/*
// @match        *://*/?url=age_*
// @match        *://*/vip/?url=age_*
// @grant        GM_addStyle
// @grant        unsafeWindow
// @updateURL    https://github.com/sffxzzp/userscripts/raw/master/h5player/videospeedup.user.js
// @downloadURL  https://github.com/sffxzzp/userscripts/raw/master/h5player/videospeedup.user.js
// ==/UserScript==

(function() {
    GM_addStyle('.ABP-Comment-List { display: none; } .ABP-Unit .ABP-Player { width: unset; }');
    if ((location.href.indexOf("www.zzzfun.one") && location.href.indexOf("/user_login.html")) >= 0) {
        document.querySelector('#user_name').value = "sffxzzp";
        document.querySelector('#user_pwd').value = "zzpzhx";
        document.querySelector('#btn_submit').click();
    }
    if (location.href.indexOf('vod_play_id_') >= 0) {
        let webPrev = document.querySelector('a.prev');
        let webNext = document.querySelector('a.next');
        let webFull = document.createElement('a');
        webFull.onclick = function () {
            let elem = document.querySelector('td#playleft > iframe');
            if (!elem.getAttribute('isfull')) {
                document.body.style.overflow = "hidden";
                webPrev.style = "position: fixed; top: 20px; right: 180px; z-index: 101; margin-right: 0;";
                webNext.style = "position: fixed; top: 20px; right: 100px; z-index: 101; margin-right: 0;";
                this.style = "position: fixed; top: 20px; right: 0; z-index: 101; margin-right: 10px;";
                elem.style = "position: fixed; width: 100vw; height: 100vh; left: 0; top: 0; z-index: 100;";
                elem.setAttribute('isfull', "true");
            } else {
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
    document.onkeydown = function() {
        let video = document.querySelector('video');
        let pbrate = video.playbackRate || 1;
        let step = 30;
        function toggleFullscreen() {
            var fsElement = document.querySelector('#artplayer') || document.querySelector('#player') || document.querySelector('div.ABP-Player');
            if (!document.fullscreenElement) {
                fsElement.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        }
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
