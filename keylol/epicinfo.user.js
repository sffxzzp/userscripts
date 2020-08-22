// ==UserScript==
// @name         Epic Info
// @namespace    https://github.com/sffxzzp
// @description  快速匹配 Epic 游戏信息
// @include      https://steamdb.keylol.com/sync
// @include      http://steamdb.sinaapp.com/sync
// @include      /https?:\/\/keylol.com\/.*/
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_removeValue
// @version      0.02
// @connect      www.epicgames.com
// @connect      store-content.ak.epicgames.com
// @icon         https://www.epicgames.com/favicon.ico
// @updateURL    https://github.com/sffxzzp/userscripts/raw/master/keylol/epicinfo.user.js
// ==/UserScript==

(function () {
    function get(page) {
        document.getElementById('epic_page').innerHTML = `第 ${page+1} 页`;
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: 'GET',
                url: 'https://www.epicgames.com/account/v2/payment/ajaxGetOrderHistory?page='+page,
                timeout: 3e4,
                onload: function (res) {
                    resolve(JSON.parse(res.response));
                },
                onerror: reject,
                ontimeout: reject
            });
        });
    }
    function parsePage(orders, namespace) {
        var data = [];
        orders.forEach(function (order) {
            if (order.orderStatus == 'COMPLETED') {
                order.items.forEach(function (game) {
                    if (namespace.hasOwnProperty(game.namespace)) {
                        if (data.indexOf(namespace[game.namespace]) < 0) {
                            data.push(namespace[game.namespace]);
                        }
                    }
                });
            }
        });
        return data;
    }
    async function loadEpic() {
        var page = 0;
        var exit = 0;
        var data = [];
        var namespace = await new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: 'GET',
                url: 'https://store-content.ak.epicgames.com/api/content/productmapping',
                timeout: 3e4,
                onload: function (res) {
                    resolve(JSON.parse(res.response));
                },
                onerror: reject,
                ontimeout: reject
            });
        });
        while (exit == 0) {
            var pageData = await get(page);
            if (pageData.orders.length < 1) {
                exit = 1;
            }
            else {
                data = data.concat(parsePage(pageData.orders, namespace));
            }
            page += 1;
        }
        document.getElementById('epic_page').innerHTML = '完成';
        document.getElementById('epic_num').innerHTML = data.length;
        GM_setValue('epic', JSON.stringify(data));
        document.getElementById('epic_before').style.display = 'none';
        document.getElementById('epic_after').style.display = '';
    }
    function loadKeylol() {
        var data = GM_getValue('epic');
        if (data) {
            data = JSON.parse(data);
        }
        document.querySelectorAll('[id^=pid] a').forEach(function (a) {
            if (a.href.indexOf('epicgames.com')>-1) {
                for (var game of data) {
                    if (a.href.indexOf(game)>-1) {
                        a.style = 'background-color: #5c8a00; color: white;';
                    }
                }
            }
        });
    }
    if (document.URL == 'https://steamdb.keylol.com/sync' || document.URL == 'http://steamdb.sinaapp.com/sync') {
        var newspan = document.createElement('div');
        newspan.className = 'span6';
        newspan.innerHTML = '<h3>正在读取你的 Epic 游戏库 <span id="epic_page">第 1 页</span></h3><div id="epic_before" class="progress progress-success progress-striped active"><div style="width: 100%;" class="bar"></div></div><div id="epic_after" style="display: none;" class="alert alert-success"><strong>成功读取并记录了 <span id="epic_num">0</span> 个条目</strong></div>';
        document.getElementById('withScript').appendChild(newspan);
        var trash = document.querySelector('.icon-trash').onclick;
        document.querySelector('#reset').onclick = function () {
            GM_deleteValue('epic');
            trash();
        }
        loadEpic();
    }
    else {
        loadKeylol();
    }
})();
