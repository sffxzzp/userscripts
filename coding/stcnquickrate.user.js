// ==UserScript==
// @name         SteamCN Quick Rate
// @namespace    https://coding.net/u/sffxzzp
// @version      0.05
// @description  一键快速评分。
// @author       sffxzzp
// @match        *://keylol.com/t*
// @match        *://keylol.com/forum.php?mod=viewthread&tid=*
// @icon         https://keylol.com/favicon.ico
// @updateURL    https://sffxzzp.coding.net/p/userscripts/d/userscripts/git/raw/master/stcnquickrate.user.js
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
    var stcnqr = (function () {
        function stcnqr() {};
        stcnqr.prototype.getFormHash = function () {
            var form = document.getElementsByTagName("form")[0];
            for (var i=0;i<form.children.length;i++) {
                if (form.children[i].name=="formhash") {
                    return form.children[i].value;
                    break;
                }
            }
        }
        stcnqr.prototype.onClick = function (_this, score, reason) {
            var formhash = this.getFormHash();
            var atid = tid;
            var pid = parseInt(_this.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.id.substr(5));
            reason = encodeURIComponent(reason);
            util.xhr({
                url: "/forum.php?mod=misc&action=rate&ratesubmit=yes&infloat=yes&inajax=1",
                method: "POST",
                responseType: "document",
                data: "formhash="+formhash+"&tid="+atid+"&pid="+pid+"&referer=https%3A%2F%2Fsteamcn.com%2Fforum.php%3Fmod%3Dviewthread%26tid%3D"+atid+"%26page%3D0%23pid"+pid+"&handlekey=rate&"+score+"&reason="+reason
            }).then(function (result) {
                util.xhr({
                    url: "/forum.php?mod=viewthread&tid="+atid+"&viewpid="+pid+"&inajax=1&ajaxtarget=post_"+pid,
                    method: "GET",
                    responseType: "document"
                }).then(function (result) {
                    document.getElementById("post_"+pid).innerHTML = result.body.getElementsByTagName("root")[0].childNodes[0].nodeValue;
                });
            });
        }
        stcnqr.prototype.run = function () {
            var _this = this;
            var postlist = document.getElementById('postlist');
            for (var i=0; i<postlist.children.length; i++) {
                var post = postlist.children[i];
                if (post.id.substr(0, 5) == "post_") {
                    var targetBar = post.getElementsByClassName("pob")[0].children[1];
                    var linkz = util.createElement({node: "a",content: {href: "javascript:;"},html: "快速+2蒸汽"});
                    linkz.onclick = function () {
                        _this.onClick(this, "score3=%2B2", "热心反馈");
                    };
                    targetBar.insertBefore(linkz, targetBar.children[0]);
                    var linkz2 = util.createElement({node: "a",content: {href: "javascript:;"},html: "快速+1蒸汽"});
                    linkz2.onclick = function () {
                        _this.onClick(this, "score3=%2B1", "热心反馈");
                    };
                    targetBar.insertBefore(linkz2, targetBar.children[0]);
                    var linkt = util.createElement({node: "a",content: {href: "javascript:;"},html: "快速+1体力"});
                    linkt.onclick = function () {
                        _this.onClick(this, "score1=%2B1", "给dalao递体力");
                    };
                    targetBar.insertBefore(linkt, targetBar.children[0]);
                }
            }
        };
        return stcnqr;
    })();
    var program = new stcnqr();
    program.run();
})();