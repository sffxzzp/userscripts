// ==UserScript==
// @name         HTML5 on CWL
// @namespace    https://github.com/sffxzzp
// @version      0.01
// @description  Replace Flash Player with HTML5 Player on http://www.cwl.gov.cn/ygkj/kjzb/
// @author       sffxzzp
// @match        *://www.cwl.gov.cn/ygkj/kjzb/
// @require      https://unpkg.com/dplayer/dist/DPlayer.min.js
// @require      https://unpkg.com/hls.js/dist/hls.js
// @icon         http://www.cwl.gov.cn/favicon.ico
// @grant        GM_addStyle
// @grant        unsafeWindow
// @updateURL    https://github.com/sffxzzp/userscripts/raw/master/h5player/CWL.user.js
// @downloadURL  https://github.com/sffxzzp/userscripts/raw/master/h5player/CWL.user.js
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
    var h5onCWL = (function () {
        function h5onCWL() {};
        h5onCWL.prototype.addPlayer = function (m3u8) {
            var h5css = util.createElement({node: 'link', content: {rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/dplayer/dist/DPlayer.min.css'}});
            document.head.appendChild(h5css);
            var container = document.querySelector('#divShowFirst');
            GM_addStyle('.main-container-header-title {margin: 0 auto;} #showImg {display: none;}');
            util.setElement({node: container, content: {style: 'height: 100%'}, html: '<div id="dplayer" style="width: 100%; height: 100%;"></div>'});
            var pip = document.pictureInPictureEnabled ? [{text: '画中画模式', click: function () {document.querySelector('.dplayer-video').requestPictureInPicture().catch(console.log);}}] : [];
            var dp = new DPlayer({
                container: container.children[0],
                live: true,
                video: {
                    url: m3u8
                },
                preload: 'none',
                contextmenu: pip
            });
            unsafeWindow.dp = dp;
        }
        h5onCWL.prototype.run = function () {
            var _this = this;
            _this.addPlayer('http://tv.cwl.gov.cn/channels/fckj/kjzb/m3u8:sd');
        };
        return h5onCWL;
    })();
    var program = new h5onCWL();
    program.run();
})();
