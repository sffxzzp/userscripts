// ==UserScript==
// @name         Keylol NewYear 2021
// @namespace    https://coding.net/u/sffxzzp
// @version      0.04
// @description  一键给整页扣蒸汽（2021年春节活动限定，蒸汽少于指定不扣
// @author       sffxzzp
// @match        *://keylol.com/t*
// @match        *://dev.keylol.com/t*
// @match        *://keylol.com/forum.php?mod=viewthread&tid=*
// @match        *://dev.keylol.com/forum.php?mod=viewthread&tid=*
// @icon         https://keylol.com/favicon.ico
// @updateURL    https://github.com/sffxzzp/userscripts/raw/master/coding/keylolnewyear2021.user.js
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
    var stcnbr = (function () {
        function stcnbr() {};
        var queue = 0;
        stcnbr.prototype.getFormHash = function () {
            var form = document.getElementsByTagName("form")[0];
            for (var i=0;i<form.children.length;i++) {
                if (form.children[i].name=="formhash") {
                    return form.children[i].value;
                    break;
                }
            }
        }
        stcnbr.prototype.rate = function (formhash, atid, pid, score, reason) {
            util.xhr({
                url: "forum.php?mod=misc&action=rate&ratesubmit=yes&infloat=yes&inajax=1",
                method: "POST",
                responseType: "document",
                data: "formhash="+formhash+"&tid="+atid+"&pid="+pid+"&referer=https%3A%2F%2Fsteamcn.com%2Fforum.php%3Fmod%3Dviewthread%26tid%3D"+atid+"%26page%3D0%23pid"+pid+"&handlekey=rate&"+score+"&reason="+reason
            }).then(function (result) {
                util.xhr({
                    url: "forum.php?mod=viewthread&tid="+atid+"&viewpid="+pid+"&inajax=1&ajaxtarget=post_"+pid,
                    method: "GET",
                    responseType: "document"
                }).then(function (result) {
                    document.getElementById("post_"+pid).innerHTML = result.body.getElementsByTagName("root")[0].childNodes[0].nodeValue;
                });
                queue -= 1;
                if (queue == 0) {
                    alert('完成！');
                }
            });
        }
        stcnbr.prototype.mass = function (score, reason) {
            var formhash = this.getFormHash();
            var atid = unsafeWindow.tid;
            var postlist = document.getElementById('postlist');
            reason = encodeURIComponent(reason);
            for (var i=0; i<postlist.children.length; i++) {
                var post = postlist.children[i];
                if (post.id.substr(0, 5) == "post_") {
                    var score3 = parseInt(post.querySelector('div[id^=favatar] .tns tr > td > p > a').innerHTML);
                    if (score3 >= parseInt(score)) {
                        this.rate(formhash, atid, post.id.substr(5), "score3=-"+score, reason);
                        queue += 1;
                    }
                }
            }
        }
        stcnbr.prototype.showPanel = function (x, y) {
            var _this = this;
            var panelNode = document.getElementById('append_parent');
            var panel = util.createElement({
                node: "div",
                content: {
                    id: "mass_rate",
                    style: "position: absolute; background-color: white; top: "+(x+20)+"px; left: "+(y-100)+"px; z-index: 99;"
                },
                html: "<input id=\"mass_score\" placeholder=\"请输入减蒸汽的数值\"/><br><input id=\"mass_reason\" placeholder=\"请输入评分原因\"/><br><button id=\"mass_ok\">确定</button>&nbsp;&nbsp;&nbsp;&nbsp;<button id=\"mass_close\">关闭</button>"
            });
            if (document.getElementById('mass_rate')) {
                var del = document.getElementById('mass_rate');
                del.parentNode.removeChild(del);
            }
            else {
                panelNode.appendChild(panel);
                var rate = document.getElementById('mass_rate');
                document.getElementById('mass_ok').onclick = function () {
                    var score = parseInt(document.getElementById('mass_score').value);
                    var reason = document.getElementById('mass_reason').value;
                    _this.mass(score, reason);
                };
                document.getElementById('mass_close').onclick = function () {
                    this.parentNode.parentNode.removeChild(this.parentNode);
                };
            }
        }
        stcnbr.prototype.run = function () {
            var _this = this;
            var modmenu = document.getElementById('modmenu');
            var mrBtn = util.createElement({node: "a", content: {href: "javascript:;", style: "float: right;"}, html: "批量扣蒸汽"});
            mrBtn.onclick = function () {
                _this.showPanel(this.getBoundingClientRect().top+document.documentElement.scrollTop, this.getBoundingClientRect().left+document.documentElement.scrollLeft);
            }
            modmenu.appendChild(mrBtn);
        };
        return stcnbr;
    })();
    var program = new stcnbr();
    program.run();
})();