// ==UserScript==
// @name         GOG Info
// @author       sffxzzp
// @namespace    https://github.com/sffxzzp
// @description  快速匹配 GOG 游戏信息
// @match        *://steamdb.keylol.com/sync
// @match        *://steamdb.sinaapp.com/sync
// @match        *://keylol.com/*
// @match        *://www.steamgifts.com/discussion/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_addStyle
// @version      1.02
// @connect      www.gog.com
// @icon         data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2257px%22%20height%3D%2254px%22%20viewBox%3D%220%200%2057%2054%22%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20transform%3D%22translate(0%20-.011)%22%3E%3Cmask%20id%3D%22A%22%20fill%3D%22%23fff%22%3E%3Cpath%20d%3D%22M0%20.012h56.539v53.802H0z%22%2F%3E%3C%2Fmask%3E%3Cpath%20d%3D%22M50.335%2025.837a2.46%202.46%200%200%201-2.461%202.463H37.316v-3.172h8.896.006a.95.95%200%200%200%20.947-.95v-.006-10.474-.008c0-.523-.422-.947-.947-.947h-.006-4.768-.009c-.518%200-.941.424-.941.947v.008%204.759.006c0%20.524.423.949.941.949h.009%203.81v3.173H39.78a2.46%202.46%200%200%201-2.464-2.46V12.03c0-1.36%201.102-2.462%202.464-2.462h8.094c1.357%200%202.461%201.102%202.461%202.462v13.807zm-.009%2018.413h-3.128v-9.698h-2.187H45a.93.93%200%200%200-.931.934v.006%208.758H40.94v-9.698h-2.191-.007a.93.93%200%200%200-.931.934v.006%208.766h-3.127V33.845c0-1.333%201.083-2.419%202.425-2.419h13.217V44.25zM32.318%2022.585H24.22a2.46%202.46%200%200%201-2.459-2.46V12.03a2.46%202.46%200%200%201%202.459-2.462h8.098c1.357%200%202.46%201.102%202.46%202.462v8.095a2.46%202.46%200%200%201-2.46%202.46zm-.14%2019.239c0%201.34-1.086%202.426-2.424%202.426h-7.977c-1.342%200-2.426-1.086-2.426-2.426v-7.979c0-1.333%201.084-2.419%202.426-2.419h7.977c1.338%200%202.424%201.086%202.424%202.419v7.979zM19.221%2025.837a2.46%202.46%200%200%201-2.462%202.463H6.203v-3.172h8.89.01c.524%200%20.944-.428.944-.95v-.006-10.474-.008c0-.523-.42-.947-.944-.947h-.01-4.763-.011c-.523%200-.943.424-.943.947v.008%204.759.006c0%20.524.42.949.943.949h.011%203.811v3.173H8.664a2.46%202.46%200%200%201-2.461-2.46V12.03a2.46%202.46%200%200%201%202.461-2.462h8.095c1.359%200%202.462%201.102%202.462%202.462v13.807zm-2.374%208.715H10.28h-.01a.93.93%200%200%200-.93.934v.006%204.694h.002l-.002.004c0%20.514.414.936.93.936h.01.68%205.887v3.132H8.64v-.008c-1.344%200-2.43-1.086-2.43-2.426v-7.979c0-1.333%201.086-2.419%202.43-2.419h8.207v3.126zM52.951.011H3.587A3.59%203.59%200%200%200%200%203.597v46.631a3.59%203.59%200%200%200%203.587%203.586h49.364a3.59%203.59%200%200%200%203.588-3.586V3.597A3.59%203.59%200%200%200%2052.951.011z%22%20fill%3D%22%23fff%22%20mask%3D%22url(%23A)%22%2F%3E%3C%2Fg%3E%3Cpath%20d%3D%22M30.661%2012.732c.525%200%20.936.424.936.947v.008%204.759.006c0%20.524-.411.949-.936.949h-.011-4.763-.007c-.525%200-.946-.425-.946-.949v-.006-4.759-.008c0-.523.421-.947.946-.947h4.781M28.123%2034.54a.93.93%200%200%201%20.928.935v.005%204.694c0%20.515-.414.936-.928.936h-.011-4.692v-.005c-.526.005-.94-.416-.94-.931V35.48v-.005a.93.93%200%200%201%20.93-.935h4.713%22%20fill%3D%22%23fff%22%2F%3E%3C%2Fsvg%3E
// @downloadURL  https://github.com/sffxzzp/userscripts/raw/master/keylol/goginfo.user.js
// @updateURL    https://github.com/sffxzzp/userscripts/raw/master/keylol/goginfo.user.js
// ==/UserScript==

(function() {
    var util = (function () {
        function util() {}
        util.xhr = function (xhrData) {
            return new Promise(function(resolve, reject) {
                GM_xmlhttpRequest({
                    method: xhrData.method || "get",
                    url: xhrData.url,
                    data: xhrData.data,
                    headers: xhrData.headers || {},
                    responseType: xhrData.type || "",
                    timeout: 3e5,
                    onload: function onload(res) {
                        return resolve({ response: res, body: res.response });
                    },
                    onerror: reject,
                    ontimeout: reject
                });
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
    var gog = (function () {
        let gog = function () {};
        gog.prototype.library = GM_getValue('gi_library') || [];
        gog.prototype.getData = async function () {
            let page = 1;
            let totalPage = 1000000;
            let library = new Set;
            while (page <= totalPage) {
                document.getElementById('gog_page').innerHTML = `第 ${page} 页`;
                let res = await util.xhr({url: 'https://www.gog.com/account/getFilteredProducts?mediaType=1&sortBy=release_date_desc&page='+page}).then(res => res.body);
                if (res.startsWith('<!DOCTYPE html>')) {
                    document.getElementById('gog_page').innerHTML = `未登录`;
                    return;
                }
                let data = JSON.parse(res);;
                totalPage = data.totalPages;
                for (let game of data.products) {
                    if (game.url != '') {
                        library.add(game.url.replace(/^\/\w+/, ''));
                    }
                }
                page += 1;
            }
            library = [...library];
            GM_setValue('gi_library', library);
            this.library = library;
            document.getElementById('gog_before').style.display = 'none';
            document.getElementById('gog_after').style.display = '';
            document.getElementById('gog_num').innerHTML = library.length;
            document.getElementById('gog_page').innerHTML = '完成';
        };
        gog.prototype.loadUI = function () {
            let _this = this;
            GM_addStyle('.row-fluid {display: flex; flex-wrap: wrap; justify-content: space-between;} .row-fluid:before, .row-fluid:after {display: none !important;} .span6 {margin-left: 0px !important;}');
            let newspan = util.createElement({node: 'div', content: {class: 'span6'}, html: '<h3>正在读取你的 GOG 游戏库 <span id="gog_page">第 1 页</span></h3><div id="gog_before" class="progress progress-success progress-striped active"><div style="width: 100%;" class="bar"></div></div><div id="gog_after" style="display: none;" class="alert alert-success"><strong>成功读取并记录了 <span id="gog_num">0</span> 个条目</strong></div>'});
            document.getElementById('withScript').appendChild(newspan);
            var trash = document.querySelector('.icon-trash').onclick;
            document.querySelector('#reset').onclick = function () {
                _this.removeData('library');
                trash();
            }
        };
        gog.prototype.load = function () {
            let _this = this;
            let selector = 'a';
            if (location.href.indexOf('keylol.com') > 0) {
                selector = '[id^=pid] a';
            }
            document.querySelectorAll(selector).forEach(function (a) {
                if (a.href.indexOf('gog.com')>-1) {
                    for (var game of _this.library) {
                        if (a.href.indexOf(game)>-1) {
                            a.style = 'background-color: #86328a; color: white;';
                        }
                    }
                }
            });
        };
        gog.prototype.run = function () {
            if (document.URL == 'https://steamdb.keylol.com/sync' || document.URL == 'http://steamdb.sinaapp.com/sync') {
                this.loadUI();
                this.getData();
            } else {
                this.load();
            }
        };
        return gog;
    })();
    var scr = new gog();
    scr.run();
})();
