// ==UserScript==
// @name         SteamCN Thread Block
// @namespace    https://coding.net/u/sffxzzp
// @version      0.02
// @description  一键关闭&下沉&屏蔽帖子。
// @author       sffxzzp
// @match        *://keylol.com/t*
// @match        *://keylol.com/forum.php?mod=viewthread&tid=*
// @icon         https://keylol.com/favicon.ico
// @updateURL    https://sffxzzp.coding.net/p/userscripts/d/userscripts/git/raw/master/stcnthreadblock.user.js
// @grant        unsafeWindow
// ==/UserScript==

(function() {
    var config = { //默认配置部分，设置为 false 则不进行该操作，影响面板默认属性
        close: true, //关闭
        down: true, //下沉
        ban: true, //屏蔽
        reason: "" //操作理由，会以私信形式通知作者，不填则不设置
    }
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
    var stcntb = (function () {
        function stcntb() {};
        stcntb.prototype.getFormHash = function () {
            var form = document.getElementsByTagName("form")[0];
            for (var i=0;i<form.children.length;i++) {
                if (form.children[i].name=="formhash") {
                    return form.children[i].value;
                    break;
                }
            }
        }
        stcntb.prototype.getTopicPid = function () {
            return document.querySelector('div[id^=post_]').getAttribute('id').substr(5);
        }
        stcntb.prototype.operate = function (close, down, ban, reason) {
            var formhash = this.getFormHash();
            var atid = unsafeWindow.tid;
            var afid = unsafeWindow.fid;
            var apid = this.getTopicPid();
            reason = (reason === undefined ? '': encodeURIComponent(reason)+"&sendreasonpm=on");
            var operation = '';
            operation += (close ? '&operations%5B%5D=close': '');
            operation += (down ? '&operations%5B%5D=down': '');
            util.xhr({
                url: "forum.php?mod=topicadmin&action=moderate&optgroup=4&modsubmit=yes&infloat=yes&inajax=1",
                method: "POST",
                responseType: "document",
                data: "frommodcp=&formhash="+formhash+"&fid="+afid+"&redirect=&listextra=&handlekey=mods&moderate%5B%5D="+atid+"&expirationclose="+operation+"&reason="+reason
            }).then(function (result) {
                if (ban) {
                    util.xhr({
                        url: "forum.php?mod=topicadmin&action=banpost&modsubmit=yes&infloat=yes&modclick=yes&inajax=1",
                        method: "POST",
                        responseType: "document",
                        data: "formhash="+formhash+"&fid="+afid+"&tid="+atid+"&page=1&handlekey=mods&topiclist%5B%5D="+apid+"&banned=1&reason="+reason
                    }).then(function (result) {
                        location.reload();
                    });
                }
                else {
                    location.reload();
                }
            });
        }
        stcntb.prototype.showPanel = function (x, y) {
            var _this = this;
            var panelNode = document.getElementById('append_parent');
            var panel = util.createElement({
                node: "div",
                content: {
                    id: "quick_admin",
                    style: "position: absolute; background-color: white; top: "+(x+20)+"px; left: "+(y-100)+"px; z-index: 999;"
                },
                html: '<input type="checkbox" id="qa_close" '+(config.close?'checked':'')+' />关闭 <input type="checkbox" id="qa_down" '+(config.down?'checked':'')+' />下沉 <input type="checkbox" id="qa_ban" '+(config.ban?'checked':'')+' />屏蔽<br><input type="input" id="qa_reason" placeholder="操作理由" '+(config.reason!=''?'value="'+config.reason+'"':'')+'><br><center><button id="qa_ok">确定</button><span style="margin: 0 20px;"></span><button id="qa_no">取消</button></center>'
            });
            if (document.getElementById('quick_admin')) {
                var del = document.getElementById('quick_admin');
                del.parentNode.removeChild(del);
            }
            else {
                panelNode.appendChild(panel);
                document.getElementById('qa_ok').onclick = function () {
                    var close = document.getElementById('qa_close').checked;
                    var down = document.getElementById('qa_down').checked;
                    var ban = document.getElementById('qa_ban').checked;
                    var reason = document.getElementById('qa_reason').value;
                    _this.operate(close, down, ban, reason);
                };
                document.getElementById('qa_no').onclick = function () {
                    this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode);
                };
            }
        }
        stcntb.prototype.run = function () {
            var _this = this;
            var modmenu = document.getElementById('modmenu');
            var separator = util.createElement({node: "span", content: {class: "pipe"}, html: "|"});
            modmenu.appendChild(separator);
            var tbBtn = util.createElement({node: "a", content: {href: "javascript:;"}, html: "快捷操作"});
            tbBtn.onclick = function () {
                _this.showPanel(this.offsetTop, this.offsetLeft);
            }
            modmenu.appendChild(tbBtn);
        };
        return stcntb;
    })();
    var program = new stcntb();
    program.run();
})();