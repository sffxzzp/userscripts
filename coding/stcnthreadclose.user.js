// ==UserScript==
// @name         SteamCN Thread Close
// @namespace    https://coding.net/u/sffxzzp
// @version      0.04
// @description  一键关闭帖子。
// @author       sffxzzp
// @match        *://keylol.com/t*
// @match        *://keylol.com/forum.php?mod=viewthread&tid=*
// @icon         https://keylol.com/favicon.ico
// @updateURL    https://github.com/sffxzzp/userscripts/raw/master/coding/stcnthreadclose.user.js
// @grant        unsafeWindow
// ==/UserScript==

(function() {
    var util = (function () {
        function util() {}
        util.xhr = function (xhrData) {
            return new Promise(function(resolve, reject) {
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
    var stcntc = (function () {
        function stcntc() {};
        stcntc.prototype.getFormHash = function () {
            var form = document.getElementsByTagName("form")[0];
            for (var i=0;i<form.children.length;i++) {
                if (form.children[i].name=="formhash") {
                    return form.children[i].value;
                    break;
                }
            }
        }
        stcntc.prototype.onClick = function (reason) {
            var formhash = this.getFormHash();
            var atid = unsafeWindow.tid;
            var afid = unsafeWindow.fid;
            reason = encodeURIComponent(reason);
            util.xhr({
                url: "forum.php?mod=topicadmin&action=moderate&optgroup=4&modsubmit=yes&infloat=yes&inajax=1",
                method: "POST",
                responseType: "document",
                data: "frommodcp=&formhash="+formhash+"&fid="+afid+"&redirect=&listextra=page%253D1&handlekey=mods&moderate%5B%5D="+atid+"&expirationclose=&operations%5B%5D=close&reason="+reason+"&sendreasonpm=on"
            }).then(function (result) {
                location.reload();
            });
        }
        stcntc.prototype.run = function () {
            var _this = this;
            var modmenu = document.getElementById('modmenu');
            var separator = util.createElement({node: "span", content: {class: "pipe"}, html: "|"});
            modmenu.appendChild(separator);
            var tcBtn = util.createElement({node: "a", content: {href: "javascript:;"}, html: "一键关闭"});
            tcBtn.onclick = function () {
                _this.onClick("问题似乎已解决，如有重开需要请短消息联系当前操作的管理人员。关闭也可选最佳答案");
            }
            modmenu.appendChild(tcBtn);
        };
        return stcntc;
    })();
    var program = new stcntc();
    program.run();
})();