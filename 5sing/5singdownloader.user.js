// ==UserScript==
// @name         5sing downloader
// @namespace    https://github.com/sffxzzp
// @version      0.01
// @description  Download mp3 from 5sing without download.
// @author       sffxzzp
// @match        *://5sing.kugou.com/*/*
// @grant        unsafeWindow
// @grant        GM_download
// @updateURL    https://github.com/sffxzzp/userscripts/raw/master/5sing/5singdownloader.user.js
// ==/UserScript==

(function() {
    'use strict';
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
                        timeout: 3e5,
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
                    xhr.responseType = xhrData.type || "";
                    xhr.timeout = 3e5;
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
    var fsd = (function () {
        var fsd = function () {};
        fsd.prototype.setDownloadButton = function (songUrl, songName) {
            var downButton = document.querySelector('.view_player_down');
            util.setElement({
                node: downButton,
                html: `<a href="javascript:;" id="fs_download" class="action_down" target="_blank"><b class="v_b"></b>直接下载</a>`
            });
            document.querySelector('#fs_download').onclick = function () {
                GM_download(songUrl, songName);
            };
        };
        fsd.prototype.run = async function () {
            var songData = JSON.parse(atob(unsafeWindow.globals.ticket)) || null;
            if (songData != null) {
                var songID = songData.songID;
                var songType = songData.songType;
                var downData = await util.xhr({
                    url: `http://service.5sing.kugou.com/song/getsongurl?songid=${songID}&songtype=${songType}`,
                    type: 'json',
                    xhr: true
                });
                downData = downData.body.data;
                var songAuthor = downData.user.NN || 'Unknown';
                var songName = `[${songAuthor}]${downData.songName}`;
                var songUrl = downData.lqurl;
                this.setDownloadButton(songUrl, songName);
            }
        };
        return fsd;
    })();
    var program = new fsd();
    program.run();
})();
