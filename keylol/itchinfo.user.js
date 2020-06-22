// ==UserScript==
// @name         Itch.io Info
// @namespace    https://github.com/sffxzzp
// @description  快速匹配 Itch.io 游戏信息
// @include      https://steamdb.keylol.com/sync
// @include      http://steamdb.sinaapp.com/sync
// @include      /https?:\/\/keylol.com\/.*/
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @version      0.02
// @connect      itch.io
// @updateURL    https://github.com/sffxzzp/userscripts/raw/master/keylol/itchinfo.user.js
// ==/UserScript==

(function () {
    function get(page) {
        document.getElementById('itch_page').innerHTML = `第 ${page} 页`;
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: 'GET',
                url: 'https://itch.io/my-purchases?format=json&page='+page,
                timeout: 3e4,
                onload: function (res) {
                    resolve(JSON.parse(res.response));
                },
                onerror: reject,
                ontimeout: reject
            });
        });
    }
    function parsePage(html) {
        var page = (new DOMParser()).parseFromString(html, 'text/html');
        var data = [];
        page.querySelectorAll('.game_cell').forEach(function (game) {
            var node = game.querySelector('.game_title > a');
            data.push({title: node.innerHTML, url: node.getAttribute('href').split('download')[0]});
        });
        return data;
    }
    async function loadItch() {
        var page = 1;
        var exit = 0;
        var data = []
        while (exit == 0) {
            var pageData = await get(page);
            if (pageData.num_items < 1) {
                exit = 1;
            }
            else {
                data = data.concat(parsePage(pageData.content));
            }
            page += 1;
        }
        document.getElementById('itch_page').innerHTML = '完成';
        document.getElementById('itch_num').innerHTML = data.length;
        GM_setValue('itch', JSON.stringify(data));
        document.getElementById('itch_before').style.display = 'none';
        document.getElementById('itch_after').style.display = '';
    }
    function loadKeylol() {
        var data = GM_getValue('itch');
        if (data) {
            data = JSON.parse(data);
        }
        document.querySelectorAll('td[id^=postmessage_] a').forEach(function (a) {
            for (var game in data) {
                if (data[game].title.trim().toLowerCase() == a.innerHTML.trim().toLowerCase()) {
                    var nlink = document.createElement('a');
                    nlink.style = 'background-color: #5c8a00; color: white;'
                    nlink.href = data[game].url;
                    nlink.innerHTML = '[Itch.io]';
                    nlink.setAttribute('target', '_blank');
                    a.parentNode.insertBefore(nlink, a);
                    a.innerHTML = ' ' + a.innerHTML;
                    break;
                }
            }
        });
    }
    if (document.URL == 'https://steamdb.keylol.com/sync' || document.URL == 'http://steamdb.sinaapp.com/sync') {
        var newspan = document.createElement('div');
        newspan.className = 'span6';
        newspan.innerHTML = '<h3>正在读取你的 Itch.io 游戏库 <span id="itch_page">第 1 页</span></h3><div id="itch_before" class="progress progress-success progress-striped active"><div style="width: 100%;" class="bar"></div></div><div id="itch_after" style="display: none;" class="alert alert-success"><strong>成功读取并记录了 <span id="itch_num">0</span> 个条目</strong></div>';
        document.getElementById('withScript').appendChild(newspan);
        var trash = document.querySelector('.icon-trash').onclick;
        document.querySelector('#reset').onclick = function () {
            GM_deleteValue('itch');
            trash();
        }
        loadItch();
    }
    else {
        loadKeylol();
    }
})();
