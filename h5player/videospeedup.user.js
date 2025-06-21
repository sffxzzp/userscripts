// ==UserScript==
// @name         Anime SpeedUp
// @namespace    https://github.com/sffxzzp
// @version      1.70
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
// @include      *://www.agedm.*/play/*/*/*
// @match        *://dm.xifanacg.com/watch/*/*/*.html
// @match        *://dm1.xfdm.pro/watch/*/*/*.html
// @grant        GM_addStyle
// @grant        GM_openInTab
// @grant        GM_webRequest
// @grant        unsafeWindow
// @updateURL    https://github.com/sffxzzp/userscripts/raw/master/h5player/videospeedup.user.js
// @downloadURL  https://github.com/sffxzzp/userscripts/raw/master/h5player/videospeedup.user.js
// ==/UserScript==

(function() {
    // 输出当前页面地址
    console.log(location.href);

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


    // 处理 ArtPlayer 自动 Focus 问题
    let setFocusArt = function () {
        setTimeout(function () {
            let artplayer = unsafeWindow.Artplayer;
            if (artplayer && artplayer.instances && artplayer.instances.length > 0) {
                artplayer.instances[0].isFocus = true;
            } else {
                setFocusArt();
            }
        }, 1000);
    }
    setFocusArt();

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
    // 处理动画疯广告自动 30s 跳过，以及年龄弹窗
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
    // 处理稀饭动漫的 10s 等待
    if (location.href.indexOf('player.moedot.net') >= 0) {
        let observer = new MutationObserver(function (mutationList) {
            for (let mutation of mutationList) {
                let skipbtn = mutation.target.querySelector('a.ec-ok') || mutation.target.querySelector('a.ec-no');
                if (skipbtn) {
                    skipbtn.click();
                    setFocusArt();
                }
            }
        });
        observer.observe(document.body, {childList: true, subtree: true});
    }
    // 通用上下页监听
    let messageListener = function (selector) {
        console.log("listening " + selector);
        unsafeWindow.addEventListener("message", function (event) {
            const data = event.data;
            if (data.command == 'govideo') {
                let current = document.querySelector(selector);
                let target = "#";
                let sibling = (data.next) ? current.nextElementSibling : (data.prev) ? current.previousElementSibling : null;
                if (sibling) {
                    let link = sibling.tagName.toLowerCase() === 'a' ? sibling : sibling.querySelector('a');
                    if (link && link.href) {
                        target = link.href;
                    }
                }
                if (target !== "#") {
                    location.href = target;
                }
            }
        });
    };
    // 稀饭动漫上下页监听
    if (location.href.indexOf('xfdm.pro') >= 0 || location.href.indexOf('dm.xifanacg.com') >= 0) {
        messageListener("ul.anthology-list-play > li.on");
    }
    // age动漫
    if (location.href.indexOf('agedm') >= 0 && location.href.indexOf('play') >= 0) {
        // PC 屏蔽跳转手机版
        if (document.querySelector('div#cpraid') != null) {
            location.href = location.href.replace('www.', 'm.').replace('.org/', '.org/#/');
        }
        // 上下页监听
        messageListener("ul.video_detail_episode > li:has(div[class*=playing])");
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
        var goVideoSel = function (selector, direct) {
            let current = document.querySelector(selector);
            if (!current) return;
            let target = "#";
            let sibling = (direct > 0) ? current.nextElementSibling : (direct < 0) ? current.previousElementSibling : null;
            if (sibling) {
                let link = sibling.tagName.toLowerCase() === 'a' ? sibling : sibling.querySelector('a');
                if (link && link.href) {
                    target = link.href;
                }
            }
            if (target !== "#") {
                location.href = target;
            }
        };
        var goVideo = function (direct) {
            if (location.href.indexOf("ani.gamer.com.tw/animeVideo.php") >= 0) {
                let next = "button.vjs-next-button";
                let prev = "button.vjs-pre-button";
                let target = document.querySelector(direct > 0 ? next : prev);
                if (target != null) {
                    target.click();
                }
            } else if (location.href.indexOf('omofun') >= 0) {
                goVideoSel("div.module-play-list > div.module-play-list-content > a:has(.playon)", direct);
            } else if (location.href.indexOf('5dm') >= 0) {
                if (direct > 0) {
                    unsafeWindow.YZM.video.next();
                }
            } else {
                unsafeWindow.parent.postMessage({
                    command: "govideo",
                    prev: direct < 0,
                    next: direct > 0,
                }, "*");
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
