// ==UserScript==
// @name         7L rewards displayer
// @namespace    https://github.com/sffxzzp
// @description  显示赠楼价值
// @include      /https?:\/\/keylol.com\/.*/
// @grant        GM_xmlhttpRequest
// @version      0.01
// @updateURL    https://github.com/sffxzzp/userscripts/raw/master/keylol/7lrewards.user.js
// ==/UserScript==

(function () {
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
        return util;
    })();
    var srd = (function () {
        var srd = function () {};
        srd.prototype.setValue = function (name, value) {
            var data = JSON.parse(localStorage.getItem('srd_data'));
            if (data != null) {
                data[name] = value;
            }
            else {
                data = {};
                data[name] = value;
            }
            localStorage.setItem('srd_data', JSON.stringify(data));
        };
        srd.prototype.getValue = function (name) {
            var data = JSON.parse(localStorage.getItem('srd_data'));
            if (data != null) {
                if (data.hasOwnProperty(name)) {
                    return data[name];
                }
                else {
                    return false;
                }
            }
            return false;
        };
        srd.prototype.run = function () {
            var _this = this;
            document.querySelectorAll('td[id^=postmessage_] a').forEach(async function (node) {
                var match;
                if (match = node.href.match(/\/(store\.steampowered|steamcommunity)\.com\/app\/(\d+)/)) {
                    var res;
                    if (res = _this.getValue(match[2])) {
                        console.log(`名称：${res.name}\t\t\t价值：${res.award} 蒸汽`);
                    }
                    else {
                        res = await util.xhr({
                            url: `https://keylol.com/plugin.php?id=steamcn_gift:select2&type=steam&q=${match[2]}&page=1`,
                            type: 'json'
                        });
                        res = res.body.items[0];
                        _this.setValue(match[2], res);
                        console.log(`名称：${res.name}\t\t\t价值：${res.award} 蒸汽`);
                    }
                }
            });
        };
        return srd;
    })();
    var script = new srd();
    script.run();
})();
