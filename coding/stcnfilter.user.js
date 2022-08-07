// ==UserScript==
// @name         SteamCN Filter
// @Namespace    https://coding.net/u/sffxzzp
// @version      0.34
// @author       sffxzzp
// @match        *://keylol.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @icon         https://keylol.com/favicon.ico
// @updateURL    https://github.com/sffxzzp/userscripts/raw/master/coding/stcnfilter.user.js
// ==/UserScript==

(function() {
    //隐藏板块与分类
    //var hide = ["欧气满满", "交易中心", "技术问题"];
    var hide = [];
    //隐藏对应关键词
    //var keyword = ["PUBG", "绝地求生"];
    var keyword = [];
    //隐藏指定用户id
    var userid = ["随便写一些id", "随便写一些id"];
    //隐藏投票贴
    //var novote = true;
    var novote = false;
    document.onkeyup = function () {}

    var stcnFilter = (function (hide, keyword, userid, novote) {
        function stcnFilter() {};
        stcnFilter.prototype.setStorage = function (id) {
            var cur = GM_getValue("read");
            if (cur) {
                cur = JSON.parse(cur);
                if (cur.indexOf(id)<0) {cur.push(id);}
            }
            else {cur = [id];}
            GM_setValue("read", JSON.stringify(cur));
        };
        stcnFilter.prototype.getStorage = function () {
            var cur = GM_getValue("read");
            if (cur) {
                cur = JSON.parse(cur);
                if (cur.length>1000) {cur = cur.splice(cur.length-1000);}
                return cur;
            }
            else {return null;}
        };
        stcnFilter.prototype.setBackground = function (tid) {
            if (tid!=null) {
                var tds = tid.children[0].children;
                for (var j=0;j<tds.length;j++) {
                    tds[j].setAttribute("style", "background:#ccc;");
                }
            }
        };
        stcnFilter.prototype.exec = function () {
            var _this = this;
            var threads = document.querySelectorAll("#threadlist tbody>tr>td.by>a");
            for (var i=0;i<threads.length;i++) {
                if (hide.indexOf(threads[i].innerText)>=0) {
                    threads[i].parentNode.parentNode.setAttribute("style", "display:none;");
                }
            }
            threads = document.querySelectorAll("#threadlist tbody>tr>th.common>em>a");
            for (i=0;i<threads.length;i++) {
                if (hide.indexOf(threads[i].getAttribute("title"))>=0) {
                    threads[i].parentNode.parentNode.parentNode.setAttribute("style", "display:none;");
                }
            }
            threads = document.querySelectorAll("#threadlist tbody>tr>th.common>a");
            threads.forEach(function (node) {
                for (i=0;i<keyword.length;i++) {
                    if (node.innerText.indexOf(keyword[i])>=0) {
                        node.parentNode.parentNode.setAttribute("style", "display:none;");
                    };
                }
            });
            threads = document.querySelectorAll("#threadlist tbody>tr>td.by>cite>a[href^=\"suid-\"]");
            threads.forEach(function (node) {
                for (i=0;i<userid.length;i++) {
                    if (node.innerText.indexOf(userid[i])>=0) {
                        node.parentNode.parentNode.parentNode.parentNode.setAttribute("style", "display:none;");
                    };
                }
            });
            if (novote==true) {
                threads = document.querySelectorAll("#threadlist tbody>tr>td.icn>a>img[alt=投票]");
                threads.forEach(function (node) {
                    node.parentNode.parentNode.parentNode.parentNode.setAttribute("style", "display:none;");
                })
            }
            var cur = _this.getStorage();
            if (cur!=null) {
                for (i=0;i<cur.length;i++) {
                    var tid = document.getElementById(cur[i]);
                    _this.setBackground(tid);
                }
            }
            threads = document.querySelectorAll("#threadlist tbody>tr a.xst");
            for (i=0;i<threads.length;i++) {
                threads[i].onmousedown = function () {
                    var tnode = this;
                    while (tnode.id.indexOf('thread_')<0) {
                        tnode = tnode.parentNode;
                    }
                    _this.setStorage(tnode.getAttribute("id"));
                    _this.setBackground(tnode);
                };
            }
        };
        stcnFilter.prototype.run = function () {
            var _this = this;
            var postlist = document.querySelector('.bm_c > table');
            var observer = new MutationObserver(function (recs) {
                _this.exec();
            });
            observer.observe(postlist, { childList: true, subtree: true });
            _this.exec();
        };
        return stcnFilter;
    })(hide, keyword, userid, novote);
    var tlist = document.getElementById('threadlist') || null;
    if (tlist) {
        var script = new stcnFilter();
        script.run();
    }
})();