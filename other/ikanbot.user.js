// ==UserScript==
// @name         iKanBot ArtPlayer
// @namespace    https://github.com/sffxzzp
// @version      0.70
// @description  Replace ikanbot.com's default player to artplayer
// @author       sffxzzp
// @require      https://fastly.jsdelivr.net/npm/hls.js@1.1.3/dist/hls.min.js
// @require      https://fastly.jsdelivr.net/npm/flv.js/dist/flv.min.js
// @require      https://fastly.jsdelivr.net/npm/dashjs/dist/dash.all.min.js
// @require      https://fastly.jsdelivr.net/npm/artplayer/dist/artplayer.js
// @match        *://*.ikanbot.com/play/*
// @grant        GM_webRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        unsafeWindow
// @updateURL    https://raw.githubusercontent.com/sffxzzp/userscripts/master/other/ikanbot.user.js
// @downloadURL  https://raw.githubusercontent.com/sffxzzp/userscripts/master/other/ikanbot.user.js
// @run-at       document-start
// ==/UserScript==

(function() {
    // try to unload player
    function unload() {
        if (unsafeWindow.videojs.players.hasOwnProperty('ikanbot-player')) {
            unsafeWindow.videojs.players['ikanbot-player'].unloadTech_();
            clearInterval(intID);
        }
    }
    let intID = setInterval(function () {unload()}, 1000);

    let menuid;
    let NoAD = GM_getValue('ikan_noad', false);

    var initMenu = function () {
        menuid = GM_registerMenuCommand(NoAD ? '关闭去广告' : '开启去广告', function () {
            NoAD = !NoAD;
            GM_setValue('ikan_noad', NoAD);
            GM_unregisterMenuCommand(menuid);
            initMenu();
            location.reload();
        });
    }
    initMenu();

    var tsNumber = function (str) {
        let matches = str.match(/(\d+)\.ts/)
        if (matches) {
            return parseInt(matches[1])
        }
        return null
    }

    var m3u8HandlerIndex = function (content) {
        let lines = content.split('\n');
        let processed_lines = [];
        let index = 0;
        let name_len;
        let pre_name;
        let next_name;

        for (let line of lines) {
            if (line.endsWith('.ts')) {
                if (!next_name) {
                    pre_name = line.split('.ts')[0];
                    // 文件名长度为 32 的话一般是 hash 名称，处理会导致只输出一个片段
                    if (pre_name.length == 32) {
                        return content;
                    }
                    name_len = pre_name.length;
                    index++;
                    const str_index = String(index);
                    next_name = `${pre_name.substring(0, name_len - str_index.length)}${str_index}.ts`;
                } else {
                    if (next_name != line) {
                        processed_lines.pop();
                        if (processed_lines[processed_lines.length - 1] == '#EXT-X-DISCONTINUITY') {
                            processed_lines.pop();
                        }
                        continue;
                    } else {
                        index++;
                        const str_index = String(index);
                        // plist 系列命名，本身名字就是变长的，需要另行处理
                        if ((pre_name && pre_name.includes('plist')) || pre_name && pre_name.includes('output')) {
                            next_name = `${pre_name.substring(0, name_len - 1)}${str_index}.ts`;
                        } else {
                            next_name = `${pre_name.substring(0, name_len - str_index.length)}${str_index}.ts`;
                        }
                    }
                }
            }
            processed_lines.push(line);
        }
        return processed_lines.join('\n');
    }

    var m3u8Handler = function (content) {
        // 处理特征：序号问题
        content = m3u8HandlerIndex(content);
        let lines = content.split('\n');
        let nameLen = 0;
        // 处理过的结果
        let result = [];
        for (let i = 0; i < lines.length; i++) {
            // 处理 ts
            if (lines[i].includes('.ts')) {
                // 尚未初始化名称长度
                if (nameLen == 0) {
                    nameLen = lines[i].length;
                }
            }
            // 处理特征：#EXT-X-DISCONTINUITY 作为起始点
            if (lines[i].startsWith('#EXT-X-DISCONTINUITY')) {
                // 处理特征：ts 文件名长度大于 nameLen，且 nameLen 已初始化并且大于 13（排除 plist0.ts 以及 output0.ts 情形）
                if (lines[i + 2] && lines[i + 2].includes('.ts') && lines[i + 2].length > nameLen && nameLen != 0 && nameLen > 13) {
                    // i + 1 是片段长度，i + 2 才是文件名
                    let j = i + 2;
                    // 判断这一行是否是 ts 文件名，不是则为 Discontinuity 结束或者文件结束
                    // 以及文件名长度是否大于 nameLen，即文件名长度异常
                    while (lines[j] && lines[j].includes('.ts') && lines[j].length > nameLen) {
                        // 查找下一个文件名
                        j += 2;
                    }
                    // 使 index 为文件名异常的最后一个片段，将被跳过
                    i = j;
                }
                // 处理特征：6.666667 开头片段
                // 处理特征：6.133333 开头片段
                else if ((lines[i + 1] && lines[i + 1].indexOf('6.666667') > -1) || (lines[i + 1] && lines[i + 1].indexOf('6.133333') > -1)) {
                    // i + 1 是片段长度，若碰到 #EXT-X-DISCONTINUITY 则结束
                    let j = i + 1;
                    while (lines[j] && lines[j].startsWith('#EXTINF')) {
                        j += 2;
                    }
                    i = j;
                }
                // 否则正常输出
                else {
                    result.push(lines[i]);
                }
            }
            // 否则正常输出
            else {
                result.push(lines[i]);
            }
        }
        return result.join('\n');
    }

    var m3u8Filter = function (content) {
        try {
            return m3u8Handler(content);
        } catch (e) {
            return content;
        }
    }

    // 参考：https://github.com/senshinya/MoonTV/blob/78fe2485e3631886fada728ab95ed58e06432ece/src/app/play/page.tsx#L415
    class CustomHlsJsLoader extends Hls.DefaultConfig.loader {
        constructor(config) {
            super(config);
            const load = this.load.bind(this);
            this.load = function (context, config, callbacks) {
                // 拦截manifest和level请求
                if (context.type === 'manifest' || context.type === 'level') {
                    const onSuccess = callbacks.onSuccess;
                    callbacks.onSuccess = function (response, stats, context, networkDetails) {
                        // 如果是m3u8文件，处理内容以移除广告分段
                        if (response.data && typeof response.data === 'string') {
                            console.log(response.data);
                            // 过滤掉广告段 - 实现更精确的广告过滤逻辑
                            response.data = m3u8Filter(response.data);
                            console.log(response.data);
                        }
                        return onSuccess(response, stats, context, networkDetails);
                    };
                }
                // 执行原始load方法
                load(context, config, callbacks);
            };
        }
    }

    // the rest of the code should run when document loaded instead of document-start
    document.addEventListener('DOMContentLoaded', init);
    function init() {
        var playM3u8 = function (video, url, art) {
            if (Hls.isSupported()) {
                if (art.hls) {
                    art.hls.destroy();
                }
                let NoAD = GM_getValue('ikan_noad', false);
                const hls = new Hls({
                    lowLatencyMode: true,
                    maxBufferLength: 30,
                    backBufferLength: 30,
                    maxBufferSize: 60 * 1000 * 1000,
                    loader: NoAD ? CustomHlsJsLoader : Hls.DefaultConfig.loader,
                });
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

        var hideScrollBar = function (fullscreen) {
            if (fullscreen) {
                document.body.style.overflow = "hidden";
            } else {
                document.body.style.overflow = "";
            }
        };

        Artplayer.PLAYBACK_RATE = [0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3, 4, 8];
        Artplayer.ASPECT_RATIO = ['default', '4:3', '16:9', '21:9'];

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
        art.on('fullscreen', hideScrollBar);
        art.on('fullscreenWeb', hideScrollBar);
        let dp = null;
        unsafeWindow.fsWeb = false;

        document.onkeydown = function() {
            let video = art || document.querySelector('video');
            let pbrate = video.playbackRate || 1;
            let step = 30;
            function toggleFullscreen() { if (art) { art.fullscreen = !art.fullscreen; } else if (dp) { if (dp.fullScreen.isFullScreen()) { dp.fullScreen.cancel(); } else { dp.fullScreen.request(); }} else { if (!document.fullscreenElement) { video.requestFullscreen(); } else { document.exitFullscreen(); }}}
            function toggleWebFullscreen() { if (art) { art.fullscreenWeb = !art.fullscreenWeb; } else if (dp) { if (dp.fullScreen.isFullScreen('web')) { dp.fullScreen.cancel('web'); } else { dp.fullScreen.request('web'); } } else { if (unsafeWindow.fsWeb) { video.style.height = ''; video.style.width = ''; video.style.position = ''; video.style.top = ''; video.style.left = ''; video.style.zIndex = 10; video.style.background = ''; document.body.style.overflow = ''; unsafeWindow.fsWeb = false; } else { video.style.height = '100vh'; video.style.width = '100vw'; video.style.position = 'fixed'; video.style.top = '0px'; video.style.left = '0px'; video.style.zIndex = 999999; video.style.background = 'black'; document.body.style.overflow = 'hidden'; unsafeWindow.fsWeb = true; } } }
            function goEpisode(prev) {
                let videoId = document.getElementById("current_id").value;
                let nextEpisode = null;
                if (prev) {
                    nextEpisode = document.querySelector('.playing')?.previousElementSibling || null;
                } else {
                    nextEpisode = document.querySelector('.playing+div') || null;
                }
                if (nextEpisode != null) {
                    art.switchUrl(nextEpisode.getAttribute('link'));
                    document.querySelectorAll('div.lineData').forEach(function (node) {
                        node.style.background = "white";
                        node.classList.remove('playing');
                    })
                    nextEpisode.style.background = "cyan";
                    nextEpisode.classList.add('playing');
                    unsafeWindow.savePlayHistory({
                        videoId: videoId,
                        lineId: nextEpisode.id,
                        title: document.getElementById("video_title").innerText,
                        name: nextEpisode.innerText,
                        date: (new Date()).getTime(),
                    });
                }
            }
            var goPrev = function () {goEpisode(true);}
            var goNext = function () {goEpisode(false);}
            function notice(text) {if (art) { art.notice.show = text; } else if (dp) { dp.notice(text); }}
            if (event.key == ">" && event.shiftKey) {video.currentTime += step;notice(`快进 ${step} 秒`);}
            if (event.key == "<" && event.shiftKey) {video.currentTime -= step;notice(`快退 ${step} 秒`);}
            if (event.key == "a" && event.shiftKey) { if (art) {art.aspectRatio = 'default'} }
            if (event.key == "s" && event.shiftKey) { if (art) {art.aspectRatio = '21:9'} }
            if (event.key == "f") {toggleFullscreen();}
            if (event.key == "t") {toggleWebFullscreen();}
            if (event.key == "p") {goPrev();}
            if (event.key == "n") {goNext();}
            if (event.key == "=" && event.repeat === false) {pbrate = pbrate * 2; unsafeWindow.ratePress = true;}
            if (event.key == "-" && event.repeat === false) {pbrate = pbrate / 2; unsafeWindow.ratePress = true;}
            if (event.key == " " && event.shiftKey) { if (art) {art.toggle()} else {video.paused == true ? video.play() : video.pause()} }
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
            if (pbrate != video.playbackRate) {video.playbackRate = pbrate; notice(`速度：${pbrate}x`);}
        };
        document.onkeyup = function() {
            let video = art || document.querySelector('video');
            let pbrate = video.playbackRate || 1;
            function notice(text) {if (art) { art.notice.show = text; } else if (dp) { dp.notice(text); }}
            if (event.key == "=" && unsafeWindow.ratePress) {pbrate = pbrate / 2; unsafeWindow.ratePress = false;}
            if (event.key == "-" && unsafeWindow.ratePress) {pbrate = pbrate * 2; unsafeWindow.ratePress = false;}
            video.playbackRate = pbrate;
            if (pbrate != video.playbackRate) {notice(`速度：${pbrate}x`);}
        };
        function load() {
            let video = art.video || document.querySelector('video');
            let videoId = document.getElementById("current_id").value;
            document.querySelectorAll('div[name=lineData]').forEach(function (node) {
                var link = node.getAttribute('udata');
                let vbtn = document.createElement('div');
                vbtn.innerHTML = node.innerHTML;
                vbtn.setAttribute('link', link);
                vbtn.setAttribute('class', 'lineData');
                vbtn.id = node.id;
                vbtn.onclick = function () {
                    art.switchUrl(this.getAttribute('link'));
                    document.querySelectorAll('div.lineData').forEach(function (node) {
                        node.style.background = "white";
                        node.classList.remove('playing');
                    })
                    this.style.background = "cyan";
                    this.classList.add('playing');
                    unsafeWindow.savePlayHistory({
                        videoId: videoId,
                        lineId: this.id,
                        title: document.getElementById("video_title").innerText,
                        name: this.innerText,
                        date: (new Date()).getTime(),
                    })
                    video.scrollIntoView({behavior: "smooth", block: "center"});
                };
                node.parentNode.appendChild(vbtn);
                node.parentNode.removeChild(node);
            });
            let historyV = unsafeWindow.getPlayHistory(videoId);
            if (historyV) {
                try { if (historyV.lineId) { document.getElementById(historyV.lineId).click(); }} catch (e) {}
            } else {
                document.querySelector('div.lineData').click();
            }
        }
        var lineData = document.getElementById('lineContent');
        var observer = new MutationObserver(function (recs) {
            load();
        });
        observer.observe(lineData, { childList: true, subtree: true });
    }
})();
