// ==UserScript==
// @name         Bilibili jump to av num
// @namespace    https://github.com/sffxzzp
// @version      0.10
// @description  redirect bilibili's BVid to aid
// @author       sffxzzp
// @include      /https:\/\/www.bilibili.com\/video\/[Bb][Vv].*/
// @require      https://cdn.jsdelivr.net/npm/mathjs/dist/math.min.js
// @grant        unsafeWindow
// @icon         https://www.bilibili.com/favicon.ico
// @updateURL    https://github.com/sffxzzp/userscripts/raw/master/bilibili_b2a/b2a.user.js
// ==/UserScript==

(function() {
    math.config({number: 'BigNumber'});
    // from: https://www.zhihu.com/question/381784377/answer/1099438784
    var table='fZodR9XQDSUm21yCkr6zBqiveYah8bt4xsWpHnJE7jL5VG3guMTKNPAwcF';
    var tr = {};
    for (let i = 0; i < 58; i++) {
        tr[table[i]] = i;
    }
    var s = [11, 10, 3, 8, 4, 6, 2, 9, 5, 7]
    var xor = math.bignumber('177451812');
    var add = math.bignumber('100618342136696320');
    function dec(x) {
        let r = 0;
        for (let i = 0; i < 10; i++) {
            r = math.evaluate(r+'+'+tr[x[s[i]]]+'*58^'+i);
        }
        return math.subtract(r, add) ^ xor;
    }
    var bv = /video\/([Bb][Vv].*)/.exec(location.href)[1].split('/')[0];
    var av = dec(bv);
    var query = location.href.split('/?')[1];
    query = query == undefined ? '' : query;
    if (av) {
        history.replaceState(null, document.title, 'https://www.bilibili.com/video/av'+av+'/?'+query);
    }
})();
