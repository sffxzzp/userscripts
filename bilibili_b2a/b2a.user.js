// ==UserScript==
// @name         Bilibili BV 2 AV
// @namespace    https://github.com/sffxzzp
// @version      0.30
// @description  redirect bilibili's BVid to aid
// @author       sffxzzp
// @include      /https:\/\/www.bilibili.com\/video\/[Bb][Vv].*/
// @grant        unsafeWindow
// @icon         https://www.bilibili.com/favicon.ico
// @updateURL    https://github.com/sffxzzp/userscripts/raw/master/bilibili_b2a/b2a.user.js
// ==/UserScript==

(function() {
    var b2a_old = (function () {
        // from: https://www.zhihu.com/question/381784377/answer/1099438784
        var b2a_old = function () {
            this.table = 'fZodR9XQDSUm21yCkr6zBqiveYah8bt4xsWpHnJE7jL5VG3guMTKNPAwcF';
            this.tr = {};
            for (let i = 0; i < 58; i++) {
                this.tr[this.table[i]] = i;
            }
            this.s = [11, 10, 3, 8, 4, 6];
            this.xor = 177451812;
            this.add = 8728348608;
        }
        b2a_old.prototype.enc = function (x) {
            x = (x ^ this.xor) + this.add;
            let r = ['B', 'V', '1', ' ', ' ', '4', ' ', '1', ' ', '7', ' ', ' '];
            for (let i = 0; i < this.s.length; i++) {
                r[this.s[i]] = this.table[parseInt(x / Math.pow(58, i) % 58)];
            }
            return r.join('');
        }
        b2a_old.prototype.dec = function (x) {
            let r = 0;
            for (let i = 0; i < this.s.length; i++) {
                r += this.tr[x[this.s[i]]] * Math.pow(58, i);
            }
            return (r - this.add) ^ this.xor;
        }
        b2a_old.prototype.run = function () {
            let bv = /video\/([Bb][Vv].*)/.exec(location.href)[1].split('/')[0];
            let av = this.dec(bv);
            let query = location.href.split('/?')[1];
            query = query == undefined ? '' : '?'+query;
            if (av) {history.replaceState(null, document.title, 'https://www.bilibili.com/video/av'+av+'/'+query);}
        }
        return b2a_old;
    })();
    var b2a = (function () {
        var b2a = function () {};
        b2a.prototype.run = function () {
            let vd = unsafeWindow.__INITIAL_STATE__ && unsafeWindow.__INITIAL_STATE__.videoData;
            // let fp = unsafeWindow.gqs('p') || unsafeWindow.gqs('page') || null;
            // let p = fp ? fp - 1 : 0;
            let aid = vd.aid;
            // let bvid = vd.bvid;
            // let cid = (vd.pages[p] && vd.pages[p].cid) || vd.pages[0].cid;
            let query = location.href.split('/?')[1];
            query = query == undefined ? '' : '?'+query;
            if (aid) {history.replaceState(null, document.title, 'https://www.bilibili.com/video/av'+aid+'/'+query);}
        };
        return b2a;
    })();
    var script = new b2a();
    script.run();
})();
