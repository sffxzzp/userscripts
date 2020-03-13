// ==UserScript==
// @name         HTML5 on kankanews
// @namespace    https://github.com/sffxzzp
// @version      0.02
// @description  Replace Flash Player with HTML5 Player on www.kankanews.com
// @author       sffxzzp
// @include      /^https?://.*?.kankanews.com/a/.*?/\d*.shtml/
// @require      https://cdn.jsdelivr.net/npm/dplayer/dist/DPlayer.min.js
// @require      https://cdn.jsdelivr.net/npm/hls.js/dist/hls.min.js
// @icon         https://www.kankanews.com/favicon.ico
// @connect      vapi.kankanews.com
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @updateURL    https://github.com/sffxzzp/userscripts/raw/master/h5player/kankanews.user.js
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
    var h5onKK = (function () {
        function h5onKK() {};
        h5onKK.prototype.addPlayer = function (url) {
            var h5css = util.createElement({node: 'link', content: {rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/dplayer/dist/DPlayer.min.css'}});
            document.head.appendChild(h5css);
            var container = document.querySelector('.contentVideo') || document.querySelector('#videoCon');
            util.setElement({node: container, content: {style: 'height: 100%'}, html: '<div id="dplayer" style="width: 100%; height: 100%;"></div>'});
            GM_addStyle('.dplayer-controller .dplayer-icons .dplayer-label {margin: initial; text-align: initial; line-height: initial; margin-top: initial;} .dplayer-controller .dplayer-icons .dplayer-icon .dplayer-icon-content {display: initial;}');
            var dp = new DPlayer({
                container: container.children[0],
                video: {
                    url: url
                }
            });
        }
        h5onKK.prototype.getHLS = function (omsid) {
            var _this = this;
            util.xhr({
                url: `http://vapi.kankanews.com/index.php?app=api&mod=public&act=getvideo&id=${omsid}`,
            }).then(function (res) {
                var url = /<videourl><!\[CDATA\[(.*\.mp4)\]\]><\/videourl>/.exec(res.body)[1];
                if (url.length>1) {
                    _this.addPlayer(url);
                }
            });
        }
        h5onKK.prototype.run = function () {
            var _this = this;
            var flashvars = document.querySelector('param[name=flashvars]').value;
            if (flashvars.indexOf('omsid')>-1) {
                flashvars = flashvars.split('omsid=')[1];
                _this.getHLS(flashvars);
            }
            else if (flashvars.indexOf('xmlid')) {
                flashvars = flashvars.split('xmlid=')[1];
                util.xhr({
                    url: `http://www.kankanews.com/vxml/${flashvars}.xml`
                }).then(function (res) {
                    var urlvar = /<omsid>(\d*)<\/omsid>/.exec(res.body)[1];
                    _this.getHLS(urlvar);
                });
            }
        };
        return h5onKK;
    })();
    var program = new h5onKK();
    program.run();
})();
