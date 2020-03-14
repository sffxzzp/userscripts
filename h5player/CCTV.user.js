// ==UserScript==
// @name         HTML5 on CCTV
// @namespace    https://github.com/sffxzzp
// @version      0.06
// @description  Replace Flash Player with HTML5 Player on tv.cctv.com
// @author       sffxzzp
// @include      /^https?://tv.cctv.com/\d*/\d*/\d*/VIDE.*.shtml*/
// @require      https://cdn.jsdelivr.net/npm/dplayer/dist/DPlayer.min.js
// @require      https://cdn.jsdelivr.net/npm/hls.js/dist/hls.min.js
// @icon         https://tv.cctv.com/favicon.ico
// @connect      vdn.apps.cntv.cn
// @connect      hls.cntv.baishancdnx.cn
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
            var h5css = util.createElement({node: 'link', content: {rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/dplayer/dist/DPlayer.min.css'}});
            document.head.appendChild(h5css);
            var container = document.querySelector('.video_left');
            GM_addStyle('.gwA151201_ind01, .retrieve {z-index: 0 !important;}');
            util.setElement({node: container, content: {style: 'height: 100%'}, html: '<div id="dplayer" style="width: 100%; height: 100%;"></div>'});
            var dp = new DPlayer({
                container: container.children[0],
                video: {
                    quality: m3u8,
                    defaultQuality: m3u8.length-1
                }
            });
            var curTime = localStorage.getItem(unsafeWindow.guid);
            if (curTime) {
                dp.seek(curTime);
                dp.notice('已跳转到上次观看进度 '+Math.floor(curTime)+' 秒', 2000);
            }
            dp.on('timeupdate', function () {
                if (dp.video.duration-dp.video.currentTime > 30) {
                    localStorage.setItem(unsafeWindow.guid, dp.video.currentTime);
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
                util.xhr({
                    url: res.body.hls_url
                }).then(function (res) {
                    var vlist = res.body.split('\n');
                    var m3u8s = [];
                    vlist.forEach(function (v) {
                        if (v.indexOf('m3u8')>-1) {
                            m3u8s.push('https://hls.cntv.baishancdnx.cn'+v);
                        }
                    });
                    m3u8s.reverse();
                    var m3u8 = [{name: '超清', url: '', type: 'hls'}, {name: '高清', url: '', type: 'hls'}, {name: '标清', url: '', type: 'hls'}, {name: '流畅', url: '', type: 'hls'}];
                    for (let i=0;i<m3u8s.length;i++) {
                        m3u8[i].url = m3u8s[i];
                    }
                    m3u8.reverse();
                    _this.addPlayer(m3u8);
                });
            });
        };
        return h5onCCTV;
    })();
    var program = new h5onCCTV();
    program.run();
})();
