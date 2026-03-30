// ==UserScript==
// @name         HTML5 on CCTV
// @namespace    https://github.com/sffxzzp
// @version      0.20
// @description  Replace Flash Player with HTML5 Player on tv.cctv.com
// @author       sffxzzp
// @include      /^https?://tv.cctv.com/\d*/\d*/\d*/VIDE.*.shtml*/
// @require      https://fastly.jsdelivr.net/npm/hls.js@1.1.3/dist/hls.min.js
// @require      https://fastly.jsdelivr.net/npm/artplayer/dist/artplayer.js
// @icon         https://tv.cctv.com/favicon.ico
// @connect      vdn.apps.cntv.cn
// @connect      hls.cntv.myhwcdn.cn
// @connect      newcntv.qcloudcdn.com
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @grant        unsafeWindow
// @updateURL    https://github.com/sffxzzp/userscripts/raw/master/h5player/CCTV.user.js
// ==/UserScript==

(function() {
    var util = (function () {
        function util() {}
        util.xhr = function (xhrData) {
            return new Promise(function(resolve, reject) {
                if (!xhrData.xhr) {
                    GM_xmlhttpRequest({
                        method: xhrData.method || "get",
                        url: xhrData.url,
                        data: xhrData.data,
                        headers: xhrData.headers || {},
                        responseType: xhrData.type || "",
                        timeout: 3e4,
                        onload: function onload(res) {
                            return resolve({ response: res, body: res.response });
                        },
                        onerror: reject,
                        ontimeout: reject
                    });
                } else {
                    var xhr = new XMLHttpRequest();
                    xhr.open(xhrData.method || "get", xhrData.url, true);
                    if (xhrData.method === "post") {xhr.setRequestHeader("content-type", "application/x-www-form-urlencoded; charset=utf-8");}
                    if (xhrData.cookie) {xhr.withCredentials = true;}
                    xhr.responseType = xhrData.responseType || "";
                    xhr.timeout = 3e4;
                    if (xhrData.headers) {for (var k in xhrData.headers) {xhr.setRequestHeader(k, xhrData.headers[k]);}}
                    xhr.onload = function(ev) {
                        var evt = ev.target;
                        resolve({ response: evt, body: evt.response });
                    };
                    xhr.onerror = reject;
                    xhr.ontimeout = reject;
                    xhr.send(xhrData.data);
                }
            });
        };
        util.createElement = function (data) {
            var node;
            if (data.node) {
                node = document.createElement(data.node);
                if (data.content) {this.setElement({node: node, content: data.content});}
                if (data.html) {node.innerHTML = data.html;}
            }
            return node;
        };
        util.setElement = function (data) {
            if (data.node) {
                for (let name in data.content) {data.node.setAttribute(name, data.content[name]);}
                if (data.html!=undefined) {data.node.innerHTML = data.html;}
            }
        };
        return util;
    })();
    var h5onCCTV = (function () {
        function h5onCCTV() {};
        h5onCCTV.prototype.addPlayer = function (m3u8) {
            var container = document.querySelector('.video_left');
            GM_addStyle('.gwA151201_ind01, .retrieve, .buttonVal, #page_body > .column_wrapper, .video, .video .right_but, .cnt_share, [class^=jscroll] {z-index: auto !important;} .nav2 > div > div {z-index: 1 !important;}');
            util.setElement({node: container, content: {style: 'height: 100%'}, html: '<div id="artplayer" style="width: 100%; height: 100%;"></div>'});
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
            var art = new Artplayer({
                container: container.children[0],
                url: m3u8[m3u8.length-1].url,
                type: 'm3u8',
                customType: {
                    m3u8: playM3u8,
                },
                volume: 1,
                pip: true,
                setting: true,
                playbackRate: true,
                aspectRatio: true,
                fullscreen: true,
                fullscreenWeb: true,
                controls: [{
                    name: 'hd',
                    html: 'HD',
                    position: 'right',
                    selector: m3u8.map(function (item) {
                        return {
                            html: item.name,
                            default: item.url === m3u8[m3u8.length-1].url,
                        };
                    }),
                    onSelect: function (item) {
                        art.switchQuality(item.url);
                    }
                }],
            });
            art.isFocus = true;
            unsafeWindow.Artplayer = Artplayer;

            var curTime = localStorage.getItem(unsafeWindow.guid);
            if (curTime) {
                art.once('video:loadedmetadata', function () {
                    art.currentTime = curTime;
                    var showTime = '';
                    if (curTime > 3600) {showTime += ' '+parseInt(curTime/3600)+' 时'; curTime = curTime%3600;}
                    if (curTime > 60) {showTime += ' '+parseInt(curTime/60)+' 分'; curTime = curTime%60;}
                    showTime += ' '+parseInt(curTime)+' 秒';
                    art.notice.show = '已跳转到上次观看进度'+showTime;
                });
            }
            art.on('video:timeupdate', function () {
                if ((art.duration-art.currentTime > 30) && art.currentTime > 30) {
                    localStorage.setItem(unsafeWindow.guid, art.currentTime);
                }
                else {
                    localStorage.removeItem(unsafeWindow.guid);
                }
            });
        }
        h5onCCTV.prototype.run = function () {
            var _this = this;
            util.xhr({
                url: `https://vdn.apps.cntv.cn/api/getHttpVideoInfo.do?pid=${unsafeWindow.guid}`,
                type: 'json'
            }).then(function (res) {
                var url = res.body.hls_url.replace('://', '/').split('/');
                url = `${url[0]}://newcntv.qcloudcdn.com/${url.slice(2).join('/')}`;
                util.xhr({
                    url: url
                }).then(function (res) {
                    var vlist = res.body.split('\n');
                    var m3u8 = [];
                    vlist.forEach(function (v) {
                        if (v.indexOf('/200.m3u8')>-1) {m3u8.push({name: '流畅', url: 'https://newcntv.qcloudcdn.com'+v, type: 'hls'});}
                        else if (v.indexOf('/450.m3u8')>-1) {m3u8.push({name: '低清', url: 'https://newcntv.qcloudcdn.com'+v, type: 'hls'});}
                        else if (v.indexOf('/850.m3u8')>-1) {m3u8.push({name: '标清', url: 'https://newcntv.qcloudcdn.com'+v, type: 'hls'});}
                        else if (v.indexOf('/1200.m3u8')>-1) {m3u8.push({name: '高清', url: 'https://newcntv.qcloudcdn.com'+v, type: 'hls'});}
                        else if (v.indexOf('/2000.m3u8')>-1) {m3u8.push({name: '超清', url: 'https://newcntv.qcloudcdn.com'+v, type: 'hls'});}
                    });
                    _this.addPlayer(m3u8);
                });
            });
        };
        return h5onCCTV;
    })();
    var program = new h5onCCTV();
    program.run();

    // 增加快捷键
    document.onkeydown = function() {
        let video = document.querySelector('video');
        let pbrate = video.playbackRate || 1;
        let step = 30;
        var toggleFullscreen = function () {
            let art = unsafeWindow.Artplayer || null;
            if (art) {
                let player = art.instances[0];
                player.fullscreen = !player.fullscreen;
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
            let art = unsafeWindow.Artplayer || null;
            if (art) {
                let player = art.instances[0];
                player.fullscreenWeb = !player.fullscreenWeb;
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
        var prtScr = function () {
            let canvas = document.createElement('canvas');
            canvas.height = video.videoHeight;
            canvas.width = video.videoWidth;
            let ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            GM_openInTab(canvas.toDataURL('image/jpeg'), false);
        };
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
