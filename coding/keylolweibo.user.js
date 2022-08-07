// ==UserScript==
// @name         Weibo stats button for Keylol
// @namespace    https://github.com/sffxzzp
// @version      0.02
// @description  Add a button to Weibo that stats.
// @author       sffxzzp
// @include      /https?:\/\/(www\.)?weibo\.com\/p\/\d*?\/(home|manage).*/
// @icon         https://keylol.com/favicon.ico
// @updateURL    https://sffxzzp.coding.net/p/userscripts/d/userscripts/git/raw/master/keylolweibo.user.js
// @grant        none
// ==/UserScript==

(function() {
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
    var wsbfk = (function () {
        var wsbfk = function () {};
        wsbfk.prototype.run = function () {
            var btnFrame = util.createElement({
                node: 'iframe',
                content: {
                    src: 'https://keylol.com/sff_stats/index.php',
                    style: 'border: none; width: 50px; height: 50px; border-radius: 50%; position: fixed; left: 20px; top: 70px;'
                }
            });
            document.body.appendChild(btnFrame);
        };
        return wsbfk;
    })();
    (new wsbfk()).run();
})();