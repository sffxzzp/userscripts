// ==UserScript==
// @name         Humble Games Collection Tools
// @namespace    https://github.com/sffxzzp
// @version      0.01
// @description  A script that displays games info in Humble Games Collection
// @author       sffxzzp
// @match        *://www.humblebundle.com/membership/collection*
// @icon         https://cdn.humblebundle.com/static/hashed/46cf2ed85a0641bfdc052121786440c70da77d75.png
// @grant        GM_openInTab
// @updateURL    https://github.com/sffxzzp/userscripts/raw/master/HumbleGamesCollection/HGCT.user.js
// @downloadURL  https://github.com/sffxzzp/userscripts/raw/master/HumbleGamesCollection/HGCT.user.js
// ==/UserScript==

(function() {
    var util = (function () {
        function util() {}
        util.xhr = function (xhrData) {
            return new Promise(function(resolve, reject) {
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
            });
        };
        util.createElement = function (data) {
            var node;
            if (data.node) {
                node = document.createElement(data.node);
                if (data.content) {
                    this.setElement({node: node, content: data.content});
                }
                if (data.html) {
                    node.innerHTML = data.html;
                }
            }
            return node;
        };
        util.setElement = function (data) {
            if (data.node) {
                for (let name in data.content) {
                    data.node.setAttribute(name, data.content[name]);
                }
                if (data.html!=undefined) {
                    data.node.innerHTML = data.html;
                }
            }
        };
        return util;
    })();
    var hgct = (function () {
        var hgct = function () {};
        hgct.prototype.getData = async function () {
            var index = 0;
            var result = [];
            var done = false;
            while (!done) {
                var res = await util.xhr({ url: "https://www.humblebundle.com/client/catalog?index=" + index, method: "get" });
                res = JSON.parse(res.body);
                if (res.length == 0) {
                    done = true;
                } else {
                    for (let i of res) {
                        result.push(i);
                    }
                }
                index++;
            }
            return result;
        };
        hgct.prototype.run = async function () {
            var res = await this.getData();

            var outputHTML = "<h1>Humble Games Collection List</h1>";
            for (let i of res) {
                outputHTML += `<div style="height: 150px; display: inline-block; width: 33.3333%; vertical-align: top;">`;
                outputHTML += `<div style="font-size: 20px; font-weight: bold;">${i['human-name']}</div>`;
                outputHTML += ``;
                for (let platform in i.downloads) {
                    outputHTML += `<div style="margin-top: 5px;"><span style="text-transform: capitalize;">${platform}: </span>`;
                    for (let method in i.downloads[platform].url) {
                        outputHTML += `<button style="padding: 8px 15px; margin: 0 10px; text-transform: capitalize;" class="hgct-download primary-button" data-machine-name="${i.downloads[platform].machine_name}" data-filename="${i.downloads[platform].url[method]}">${method}</button>`;
                    }
                    outputHTML += `</div>`;
                }
                outputHTML += `</div>`;
            }

            var base = document.querySelector('div.page-wrap');
            var target = base.querySelector('div.base-main-wrapper');

            var list = util.createElement({ node: "div", content: { style: "width: 80%; margin: 0 auto; margin-top: 20px;" }, html: outputHTML });
            base.insertBefore(list, target);

            document.querySelectorAll('button.hgct-download').forEach(function (node) {
                node.onclick = async function () {
                    var filename = this.getAttribute('data-filename').split('/')[1];
                    var torrent = this.getAttribute('data-filename').indexOf('.torrent') > 0;
                    var res = await util.xhr({ url: "https://www.humblebundle.com/api/v1/user/download/sign", method: "post", data: `machine_name=${this.getAttribute('data-machine-name')}&filename=${this.getAttribute('data-filename')}` });
                    res = JSON.parse(res.body);
                    var url = "";
                    if (torrent) {
                        url = res.signed_torrent_url;
                    } else {
                        url = res.signed_url;
                    }
                    GM_openInTab(url, {active: true});
                };
            });
        };
        return hgct;
    })();
    var main = new hgct();
    main.run();
})();
