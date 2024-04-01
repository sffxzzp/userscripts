// ==UserScript==
// @name         5sing downloader
// @namespace    https://github.com/sffxzzp
// @version      0.10
// @description  Download mp3 from 5sing without download.
// @author       sffxzzp
// @match        *://5sing.kugou.com/*/*
// @grant        unsafeWindow
// @grant        GM_download
// @updateURL    https://github.com/sffxzzp/userscripts/raw/master/5sing/5singdownloader.user.js
// @downloadURL  https://github.com/sffxzzp/userscripts/raw/master/5sing/5singdownloader.user.js
// ==/UserScript==

(function() {
    'use strict';
    var util = (function () {
        function util() {}
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
            var _this = this;
            if (unsafeWindow.globals.hasOwnProperty('ticket')) {
                var songData = JSON.parse(atob(unsafeWindow.globals.ticket)) || null;
                if (songData != null) {
                    var songID = songData.songID;
                    var songType = songData.songType;
                    var params = {
                        songid: songData.songID,
                        songtype: songData.songType,
                        version: '6.6.72'
                    };
                    unsafeWindow.globalSign(params, null, async function (get, post) {
                        var downData = await unsafeWindow.$.ajax({
                            url: `https://5sservice.kugou.com/song/getsongurl`,
                            type: 'GET',
                            dataType: 'json',
                            data: get,
                            xhrFields: {withCredetials: true}
                        });
                        downData = downData.data;
                        var songAuthor = downData.user.NN || 'Unknown';
                        var songName = `[${songAuthor}]${downData.songName}`;
                        var songUrl = downData.lqurl;
                        _this.setDownloadButton(songUrl, songName);
                    });
                }
            } else {
                setTimeout(function () {_this.run()}, 1000);
            }
        };
        return fsd;
    })();
    var program = new fsd();
    program.run();
})();
