// ==UserScript==
// @name         Keylol Admin Tools
// @namespace    https://github.com/sffxzzp
// @version      0.03
// @description  Add a fast way to edit user permissions.
// @author       sffxzzp
// @match        *://keylol.com/admin.php?*
// @match        *://dev.keylol.com/admin.php?*
// @icon         https://keylol.com/favicon.ico
// @grant        GM_xmlhttpRequest
// @updateURL    https://sffxzzp.coding.net/p/userscripts/d/userscripts/git/raw/master/keyloladmintool.user.js
// ==/UserScript==

(function() {
    var config = (function () {
        var config = function () {};
        config.forums = {
            '分享互赠': 254,
            '热点聚焦': 161,
            '综合讨论': 251,
            '社区活动': 238,
            '杉果': 316,
            '腾讯 WeGame': 325,
            '方块游戏平台': 332
        };
        config.forbidName = ['allowviewnew', 'allowpostnew', 'allowreplynew', 'allowgetattachnew', 'allowgetimagenew', 'allowpostattachnew', 'allowpostimagenew'];
        config.forbid = {
            161: [0, 0, -1, 0, 0, 0, 0],
            238: [-1, -1, -1, -1, -1, -1, -1],
            251: [0, 0, -1, 0, 0, 0, 0],
            254: [-1, -1, -1, -1, -1, -1, -1],
            316: [0, 0, -1, 0, 0, 0, 0],
            325: [0, 0, -1, 0, 0, 0, 0],
            332: [0, 0, -1, 0, 0, 0, 0]
        };
        return config;
    })();
    var util = (function () {
        function util() {}
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
    var kat = (function () {
        var kat = function () {};
        kat.prototype.getPosts = function (username, forumid) {
            return new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    method: "get",
                    url: `/admin.php?action=prune&perpage=0&starttime=2000-1-1&searchsubmit=1&forums=${forumid}&users=${username}`,
                    timeout: 3e4,
                    onload: res => resolve((new DOMParser()).parseFromString(res.response, "text/html").querySelector('.fixpadding .partition').innerText.split(' ')[1]),
                    onerror: reject,
                    ontimeout: reject
                });
            });
        };
        kat.prototype.setPermission = function (data) {
            var _this = this;
            return new Promise((resolve, reject) => {
                var xhr = new XMLHttpRequest();
                xhr.open("post", _this.posturl, true);
                xhr.setRequestHeader("content-type", "application/x-www-form-urlencoded");
                xhr.responseType = "";
                xhr.timeout = 3e4;
                xhr.onload = function(ev) {
                    var evt = ev.target;
                    resolve(evt.response);
                };
                xhr.onerror = reject;
                xhr.ontimeout = reject;
                xhr.send(data);
            });
        };
        kat.prototype.setClick = function () {
            var _this = this;
            document.querySelector('#kat_forbid').onclick = async function () {
                for (let fid in config.forbid) {
                    let reqData = `formhash=${_this.formhash}&scrolltop=&anchor=&addfid=${fid}`;
                    for (let i = 0; i < config.forbid[fid].length; i++) {
                        reqData += `&${config.forbidName[i]}=${config.forbid[fid][i]}`;
                    }
                    reqData += '&accesssubmit=提交';
                    await _this.setPermission(reqData);
                }
                location.reload();
            };
            document.querySelector('#kat_restore').onclick = async function () {
                for (let fid in config.forbid) {
                    let reqData = `formhash=${_this.formhash}&scrolltop=&anchor=&addfid=${fid}`;
                    for (let i = 0; i < config.forbid[fid].length; i++) {
                        reqData += `&${config.forbidName[i]}=0`;
                    }
                    reqData += '&accesssubmit=提交';
                    await _this.setPermission(reqData);
                }
                location.reload();
            };
        };
        kat.prototype.addPanel = async function () {
            var _this = this;
            if (document.querySelector('#cpcontainer') != null) {
                var container = document.querySelector('#cpcontainer');
                var targetNode = container.querySelector('#cpform');
                _this.formhash = targetNode.querySelector('input[name=formhash]').value;
                _this.posturl = '/'+targetNode.getAttribute('action');
                _this.username = container.querySelector('.nobdb th.partition').innerHTML.split(' - ')[1];
                var allPosts = await _this.getPosts(_this.username, 0);
                var newFList = `<tr><td>所有板块</td><td>${allPosts}</td><td>-</td></tr>`;
                var count;
                for (let f in config.forums) {
                    count = await _this.getPosts(_this.username, config.forums[f]);
                    newFList += `<tr><td>${f}</td><td>${count}</td><td>${(count/allPosts*100).toFixed(3)}%</td></tr>`;
                }
                for (let part of _this.posturl.split('&')) {
                    part = part.split('=');
                    if (part[0] == 'uid') {
                        _this.uid = parseInt(part[1]);
                    }
                }
                newFList += `<tr><td><a href="/admin.php?action=plugins&operation=config&identifier=sff_posts_stat&targetuid=${_this.uid}" target="_blank">回帖统计</a></td></tr>`;
                var newNode = util.createElement({node: 'table', content: {class: 'tb tb2'}, html: '<tbody><tr><th colspan="3" class="partition">快捷操作</th></tr><tr><td class="td27">板块</td><td class="td27">帖子数</td><td class="td27">百分比</td></tr>'+newFList+'<tr><td><div class="fixsel"><input type="submit" class="btn" id="kat_restore" value="恢复" />&nbsp;&nbsp;&nbsp;&nbsp;<input type="submit" class="btn" id="kat_forbid" value="禁止" /></div></td></tr></tbody>'});
                container.insertBefore(newNode, targetNode);
                _this.setClick();
            }
            else {
                setTimeout(function () {_this.addPanel()}, 500);
            }
        };
        kat.prototype.run = function () {
            if (location.href.indexOf('action=members&operation=access') > -1) {
                this.addPanel();
            }
        };
        return kat;
    })();
    var program = new kat();
    program.run();
})();