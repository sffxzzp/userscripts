// ==UserScript==
// @name         Gdajie Instant Show Link
// @namespace    https://coding.net/u/sffxzzp
// @version      0.02
// @description  try to take over the world!
// @author       sffxzzp
// @match        *://*.gdajie.com/topics/*
// @icon         http://verycd.gdajie.com/favicon.ico
// @grant        GM_xmlhttpRequest
// @connect      verycd.gdajie.com
// @updateURL    https://sffxzzp.coding.net/p/userscripts/d/userscripts/git/raw/master/gdajie.user.js
// ==/UserScript==

(function() {
    var util = (function () {
        function util() {}
        util.xhr = function (xhrData) {
            return new Promise(function(resolve, reject) {
                GM_xmlhttpRequest({
                    method: xhrData.method || "get",
                    url: xhrData.url,
                    data: xhrData.data,
                    responseType: xhrData.type || "",
                    timeout: 3e4,
                    onload: function onload(res) {
                        return resolve({ response: res, body: res.response });
                    },
                    onerror: reject,
                    ontimeout: reject
                });
            });
        };
        return util;
    })();
    var gisl = (function () {
        function gisl() {}
        gisl.prototype.getLink = function (node) {
            node.innerHTML += '...';
            var ed2kre = /(ed2k:\/\/.*?\/)/gi;
            util.xhr({
                url: node.getAttribute('data-href')
            }).then(function (res) {
                var link = res.body.match(ed2kre)[0];
                console.log(node);
                node.href = link;
                node.innerHTML += '√';
                node.onclick = function () {}
            });
        }
        gisl.prototype.run = function () {
            var _this = this;
            document.querySelectorAll('#emuleFile a').forEach(function (node) {
                node.setAttribute('data-href', node.href);
                node.href = 'javascript:void(0);';
                node.onclick = function () {
                    _this.getLink(this);
                }
            });
        }
        return gisl;
    })();
    var program = new gisl();
    program.run();
})();