// ==UserScript==
// @name         Keylol Remove Rate
// @namespace    https://coding.net/u/sffxzzp
// @version      0.04
// @description  一键撤销整贴评分。
// @author       sffxzzp
// @include      /https?:\/\/(dev\.)?keylol\.com\/(t\d*.*|forum.php?mod=viewthread&tid=\d*)/
// @icon         https://keylol.com/favicon.ico
// @updateURL    https://sffxzzp.coding.net/p/userscripts/d/userscripts/git/raw/master/stcnremoverate.user.js
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// ==/UserScript==

(function() {
    var util = (function () {
        function util() {}
        util.sleep = function (delay) {
            return new Promise(resolve => {
                setTimeout(resolve, delay);
            });
        };
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
                    xhr.responseType = xhrData.type || "";
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
    var klrr = (function () {
        function klrr() {};
        klrr.prototype.getFormHash = function () {
            var form = document.getElementsByTagName("form")[0];
            for (var i=0;i<form.children.length;i++) {
                if (form.children[i].name=="formhash") {
                    return form.children[i].value;
                    break;
                }
            }
        }
        klrr.prototype.getMaxPages = function () {
            if (document.querySelector('.pg > label > span')) {
                return document.querySelector('.pg > label > span').title.split(' ')[1];
            }
            else {
                return 1;
            }
        }
        klrr.prototype.massremove = async function () {
            var formhash = this.getFormHash();
            var atid = unsafeWindow.tid;
            var maxpage = this.getMaxPages();
            var info = document.getElementById('massremove_info');
            for (var i=1; i<=maxpage; i++) {
                info.innerHTML += `正在撤回第 ${i} 页...`;
                await this.removepage(atid, i);
                await util.sleep(1000);
                info.innerHTML += '完毕！<br>'
            }
        }
        klrr.prototype.removepage = function (tid, page) {
            var _this = this;
            return new Promise((resolve, reject) => {
                util.xhr({
                    url: `${location.origin}/t${tid}-${page}-1`,
                    xhr: true
                }).then(async res => {
                    var p = (new DOMParser()).parseFromString(res.body, 'text/html');
                    var postlist = p.querySelectorAll('#postlist > div[id^=post_]')
                    for (var i=0; i<postlist.length; i++) {
                        var node = postlist[i];
                        if (node.querySelector('.pi > strong > a > img.vm') == null) {
                            await _this.removepid(tid, node.getAttribute('id').split('_')[1]);
                            await util.sleep(1000);
                        }
                    };
                    resolve();
                });
            });
        }
        klrr.prototype.removepid = function (tid, pid) {
            var _this = this;
            return new Promise((resolve, reject) => {
                util.xhr({
                    url: `${location.origin}/forum.php?mod=misc&action=removerate&tid=${tid}&pid=${pid}`,
                    xhr: true
                }).then(async res => {
                    var p = (new DOMParser()).parseFromString(res.body, 'text/html');
                    var data = [];
                    p.querySelectorAll('#rateform .list > tbody > tr > td > input').forEach(function (node) {
                        data.push(node.value);
                    });
                    if (data.length > 0) {
                        await _this.sendremove(tid, pid, data);
                    }
                    resolve();
                });
            });
        }
        klrr.prototype.sendremove = function (tid, pid, data) {
            var formhash = this.getFormHash();
            var pData = '';
            data.forEach(function (rec) {
                pData += '&logidarray%5B%5D='+rec.replace(/ /g, '+');
            });
            return util.xhr({
                url: `${location.origin}/forum.php?mod=misc&action=removerate&ratesubmit=yes&infloat=yes&inajax=1`,
                method: 'post',
                data: `formhash=${formhash}&tid=${tid}&pid=${pid}&referer=${encodeURIComponent(location.origin+'/t'+tid+'-1-1')}&handlekey=rate${pData}&chkall=on&reason=`,
                xhr: true
            });
        }
        klrr.prototype.showPanel = function (x, y) {
            var _this = this;
            var panelNode = document.getElementById('append_parent');
            var panel = util.createElement({
                node: "div",
                content: {
                    id: "mass_removerate",
                    style: "display: none; position: absolute; background-color: white; top: "+(x+20)+"px; left: "+y+"px;z-index:999;"
                },
                html: "<div id=\"massremove_info\" style=\"color: red;\">危险操作，请注意！<br>按确定键将开始撤销整贴全部评分。<br>页数可能较多，所以请耐心等待。<br></div><button id=\"massremove_ok\">确定</button>&nbsp;&nbsp;&nbsp;&nbsp;<button id=\"massremove_close\">关闭</button>"
            });
            if (!document.getElementById('mass_removerate')) {
                panelNode.appendChild(panel);
                document.getElementById('massremove_ok').onclick = function () {
                    this.onclick = function () {};
                    _this.massremove();
                };
                document.getElementById('massremove_close').onclick = function () {
                    this.parentNode.style.display = 'none';
                };
            }
            if (document.getElementById('mass_removerate').style.display = '') {
                document.getElementById('mass_removerate').style.display = 'none';
            }
            else {
                document.getElementById('mass_removerate').style.display = '';
            }
        }
        klrr.prototype.run = function () {
            var _this = this;
            var modmenu = document.getElementById('modmenu');
            var mrBtn = util.createElement({node: "a", content: {href: "javascript:;", style: "float: right; margin: 0 10px;"}, html: "撤销全部评分"});
            mrBtn.onclick = function () {
                _this.showPanel(this.offsetTop, this.offsetLeft);
            }
            modmenu.appendChild(mrBtn);
        };
        return klrr;
    })();
    var program = new klrr();
    program.run();
})();