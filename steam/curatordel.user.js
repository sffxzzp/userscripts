// ==UserScript==
// @name         Curator Delete Review Button
// @namespace    https://github.com/sffxzzp
// @version      0.01
// @description  add a delete button in curator's review create page.
// @author       sffxzzp
// @match        *://store.steampowered.com/curator/*/admin/review_create/*
// @icon         https://store.steampowered.com/favicon.ico
// @grant        unsafeWindow
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
    var cdrb = (function () {
        var cdrb = function () {};
        cdrb.prototype.addButton = function () {
            var tarDiv = document.querySelector('.post_review_ctn');
            var appid = document.querySelector('input[name=appid]').value;
            var delBtn = util.createElement({
                node: 'a',
                content: {
                    class: 'btn_darkred_white_innerfade btn_medium',
                    href: '#',
                    style: 'float: right;'
                },
                html: '<span>删除评测</span>'
            });
            delBtn.onclick = function () {
                var modal = unsafeWindow.ShowConfirmDialog("删除该评测？", `您确定想要删除您对 appid: ${appid} 的评测？`);
                modal.done(function(){
                    util.xhr({
                        xhr: true,
                        url: unsafeWindow.g_strCuratorAdminURL + 'ajaxdeletereview/',
                        data: `appid=${appid}&sessionid=${unsafeWindow.g_sessionID}`,
                        type: 'json',
                        method: 'post'
                    }).then(function (res) {
                        if (res.body.success == 1) {
                            location.href = unsafeWindow.g_strCuratorAdminURL + 'reviews_manage';
                        }
                        else {
                            unsafeWindow.ShowAlertDialog("出错了！", `错误（${res.body.success}）`);
                        }
                    }).catch(console.log);
                });
            };
            tarDiv.appendChild(delBtn);
        };
        cdrb.prototype.run = function () {
            this.addButton();
        };
        return cdrb;
    })();
    var script = new cdrb();
    script.run();
})();
