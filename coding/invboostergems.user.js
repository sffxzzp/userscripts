// ==UserScript==
// @name         Inventory Booster Gems
// @namespace    https://coding.net/u/sffxzzp
// @version      0.03
// @description  A script that displays needed gems.
// @author       sffxzzp
// @match        *://steamcommunity.com/*/inventory*
// @icon         https://store.steampowered.com/favicon.ico
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @updateURL    https://github.com/sffxzzp/userscripts/raw/master/coding/invboostergems.user.js
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
                    xhr.open(
                        xhrData.method || "get",
                        xhrData.url,
                        true
                    );
                    if (xhrData.method === "POST") {
                        xhr.setRequestHeader(
                            "content-type",
                            "application/x-www-form-urlencoded; charset=utf-8"
                        );
                    }
                    if (xhrData.cookie) xhr.withCredentials = true;
                    xhr.responseType = xhrData.responseType || "";
                    xhr.timeout = 3e4;
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
    var ibg = (function () {
        function ibg() {}
        ibg.prototype.getInfo = function () {
            util.xhr({
                url: 'https://steamcommunity.com/tradingcards/boostercreator/',
                xhr: true
            }).then(function (res) {
                let dre = /(\[{"appid".*}\])/ig
                var dinfo = JSON.parse(dre.exec(res.body)[1]);
                unsafeWindow.ibg_info = dinfo;
            });
        }
        ibg.prototype.showRes = function (app, node) {
            if (node.childElementCount<1) {
                var narea = util.createElement({
                    node: 'div',
                    content: {
                        class: 'ibg_price'
                    },
                    html: '需要的宝珠为：'+app.price
                });
                node.appendChild(narea);
            }
        }
        ibg.prototype.Start = function () {
            let _this = this;
            _this.getInfo();
            var steaminv = document.getElementsByClassName("inventory_page_right")[0];
            var observer = new MutationObserver(function (recs) {
                for (let i=0;i<recs.length;i++) {
                    let rec = recs[i];
                    if (rec.target.parentNode.classList.contains('item_desc_description') && rec.target.parentNode.parentNode.classList.contains('app753') && rec.target.childElementCount>0) {
                        let tag = rec.target.parentNode.getElementsByClassName('item_desc_game_info')[0].children[2].innerText;
                        if (tag == '补充包' || tag == 'Booster') {
                            let appidre = /OpenBooster\( (\d*),/ig
                            let appid = appidre.exec(rec.target.children[0].href);
                            if (appid!=null) {
                                appid = parseInt(appid[1]);
                                console.log(appid);
                                unsafeWindow.ibg_info.forEach(function (app) {
                                    if (app.appid == appid) {
                                        console.log(app);
                                        _this.showRes(app, rec.target.parentNode.getElementsByClassName('hover_item_name')[0]);
                                    }
                                });
                                break;
                            }
                        }
                    }
                }
            });
            observer.observe(steaminv, { childList: true, subtree: true });
        };
        return ibg;
    })();
    var program = new ibg();
    program.Start();
})();