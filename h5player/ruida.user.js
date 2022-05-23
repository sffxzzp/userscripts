// ==UserScript==
// @name         HTML5 on Ruida
// @namespace    https://github.com/sffxzzp
// @version      0.03
// @description  Replace Flash Player with HTML5 Player on elearning.ruidaedu.com and elearning.ruidakaoyan.com
// @author       sffxzzp
// @include      /^https?:\/\/elearning\.ruida(edu|kaoyan)\.com\/xcware\/video\/(h5video|videoPlay)\/videoPlay.*?.shtm.*/
// @require      https://unpkg.com/dplayer/dist/DPlayer.min.js
// @require      https://unpkg.com/hls.js/dist/hls.js
// @require      https://blueimp.github.io/JavaScript-MD5/js/md5.js
// @icon         https://www.ruidaedu.com/core/favicon.ico
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @grant        unsafeWindow
// @updateURL    https://github.com/sffxzzp/userscripts/raw/master/h5player/ruida.user.js
// @run-at       document-end
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
    var h5onRuida = (function () {
        var h5onRuida = function () {this.apikey = 'ig!@#nvi$%d'};
        h5onRuida.prototype.getKey = function (videoRefID, effectType, speedNum, protocol, loc2) {
            return md5(this.apikey+videoRefID+effectType+speedNum+protocol+loc2);
        };
        h5onRuida.prototype.setCata = function () {
            var _this = this;
            var cata = document.querySelectorAll('.catalog>div>a');
            if (cata.length == 0) {
                setTimeout(function () {_this.setCata()}, 500);
            }
            else {
                cata.forEach(function (node) {
                    node.onclick = function () {
                        cata.forEach(function (node) {node.setAttribute('class', 'clearfix')});
                        this.setAttribute('class', 'clearfix online cur');
                        _this.init(this.id);
                    };
                });
            }
        };
        h5onRuida.prototype.addPlayer = function (m3u8, videoRefID) {
            document.querySelector('video').pause();
            var container = document.querySelector('.videoBox');
            util.setElement({node: container, html: '<div id="dplayer" style="width: 100%; height: 100%;"></div>'});
            var pip = document.pictureInPictureEnabled ? [{text: '画中画模式', click: function () {document.querySelector('.dplayer-video').requestPictureInPicture().catch(console.log);}}] : [];
            var dp = new DPlayer({
                container: container.children[0],
                video: {
                    url: '//'+m3u8,
                    type: 'auto'
                },
                preload: 'none',
                contextmenu: pip
            });
            unsafeWindow.dp = dp;
            var curTime = localStorage.getItem(videoRefID);
            if (curTime) {
                dp.seek(curTime);
                var showTime = '';
                if (curTime > 3600) {showTime += ' '+parseInt(curTime/3600)+' 时'; curTime = curTime%3600;}
                if (curTime > 60) {showTime += ' '+parseInt(curTime/60)+' 分'; curTime = curTime%60;}
                showTime += ' '+parseInt(curTime)+' 秒';
                dp.notice('已跳转到上次观看进度'+showTime, 2000);
            }
            dp.on('timeupdate', function () {
                if ((dp.video.duration-dp.video.currentTime > 30) && dp.video.currentTime > 30) {
                    localStorage.setItem(videoRefID, dp.video.currentTime);
                }
                else {
                    localStorage.removeItem(videoRefID);
                }
            });
        };
        h5onRuida.prototype.initStyle = function () {
            var h5css = util.createElement({node: 'link', content: {rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/dplayer/dist/DPlayer.min.css'}});
            document.head.appendChild(h5css);
            GM_addStyle('#header {z-index: 0 !important;}');
        };
        h5onRuida.prototype.run = function () {
            var _this = this;
            this.initStyle();
            this.setCata();
            setTimeout(function () {_this.init()}, 2000);
        };
        h5onRuida.prototype.init = async function (vid) {
            if (vid==undefined) {
                vid = unsafeWindow.pageData.videoID;
            }
            var displayUrl = `${location.origin}${location.pathname}?cwareID=${unsafeWindow.pageData.cwareID}&videoID=${vid}`;
            history.replaceState(null, document.title, displayUrl);
            var videoRefID = unsafeWindow.pageData.videoRefID.split('.').slice(0, 3).join('.')+'.'+vid;
            var effectType = 'flash_g';
            var speedNum = '10';
            var protocol = 'hls';
            var loc2 = (new Date()).getTime();
            var key = this.getKey(videoRefID, effectType, speedNum, protocol, loc2);
            var url = `${location.origin}/xcware/video/videoPlay/service/getVideoDataForPlayer.shtm?videoRefID=${videoRefID}&effectType=${effectType}&speedNum=${speedNum}&protocol=${protocol}&_t=${loc2}&key=${key}&userID=${unsafeWindow.pageData.userID}`;
            var data = await util.xhr({url: url, type: 'json'});
            this.addPlayer(data.body.videoPath, videoRefID);
        };
        return h5onRuida;
    })();
    var program = new h5onRuida();
    program.run();
})();
