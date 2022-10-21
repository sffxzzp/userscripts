// ==UserScript==
// @name         Epic Info
// @author       sffxzzp
// @namespace    https://github.com/sffxzzp
// @description  快速匹配 Epic 游戏信息
// @include      https://steamdb.keylol.com/sync
// @include      http://steamdb.sinaapp.com/sync
// @include      /^https?:\/\/www\.epicgames\.com/account\/v2\/payment\/ajaxGetOrderHistory.*/
// @include      /https?:\/\/keylol\.com\/.*/
// @grant        GM_xmlhttpRequest
// @grant        GM_openInTab
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @version      0.13
// @connect      www.epicgames.com
// @connect      store-content.ak.epicgames.com
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAAB0CAMAAABE6mf9AAABZVBMVEUAAAD////////////Kysr////////////////7+/v9/f3////f399WVlYYGBi2trb5+fn+/v7Q0ND////+/v7+/v77+/v5+fn////8/Pz////8/Pz///+qqqrS0tL8/PzZ2dnPz8/////////////Ly8v+/v6SkpL///+tra2lpaX////Z2dn39/fGxsb+/v75+fn9/f3U1NT9/f38/Pz////8/Pz9/f39/f3f39/39/f5+fn7+/u2trb8/PyTk5P9/f3n5+f+/v74+Pjc3Nz9/f36+vr29vb7+/v///+5ubn8/Pze3t79/f2hoaH7+/v6+vr09PT29vbi4uK2trbBwcH6+vr7+/v////7+/vZ2dnr6+v19fX6+vr5+fnm5uaenp7ExMTe3t7+/v7b29v19fX////T09POzs7Ly8u3t7f5+fnHx8fn5+fS0tLNzc3AwMC9vb309PTIyMjh4eHc3Nz///9NXM+cAAAAdnRSTlMA+/D2BPT55VIRCe0mCAQJ44oZ3KWEwiXozYEcqzAc6x8U067gVJpS4jgWw40ZEtm7lg2hIbtwYw1lB9fIPxUOaS91VyN/Ku/SspmUj45US0U1MCxoSObczXxIQjqtqk9EPoZaOre2hGQsHvJ6d1mAUHBdp6J24GlrDAAACARJREFUaN7tmvlb2jAYx5s0LZTqKhRsOTaxdKzKwAMExxgiCJMxpsKct85jl7sv/v4lQQYIgld3PI/fn5I8aT59efO+Sd8HhkHp5SmNrZkjVgtaw4hBMY8GzWFQCtRcChN2GaBmpoARZJY1MxmUApkgrJkuRuNrposxm0EhXcZuIDeQ/xcCoNgqDpAU1+xDtpGDeFjvN7qi5UQi2w8C9ClPq3ZUwIbszX6pqKk8XVQrkX45xNKePpM/tFIdegI63xvCp/YdQlPhBxqA5WpzIO2tZIYhyeC+CulXS6TDDT9QBNuJhNghJveEDN++xTQlfVoE0OVgWoSEzV2I13UOkN4dO8TAyb1I6xTBGuKvAqGDq6/YVgh4+AAz2iiH+lUhzPjXoVYIt4ubbbr1boc9B0Rq+uQEggSv1ysg0hxcHeZbICNvIvUJMUWJpemMY4/YHyJtZhu7qwEJZ30BX3YAkeXe7XJNCFh7O0cX3liX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
// @downloadURL  https://github.com/sffxzzp/userscripts/raw/master/keylol/epicinfo.user.js
// @updateURL    https://github.com/sffxzzp/userscripts/raw/master/keylol/epicinfo.user.js
// ==/UserScript==

(function () {
    function fixNamespace(namespace) {
        for (let ns in namespace) {
            namespace[ns] = `p(roduct)?/${namespace[ns]}(/home)?$`;
        }
        namespace['3f7bd21610f743e598fa8e955500f5b7'] = 'p(roduct)?/evoland-legendary-edition-5753ec(/home)?$';
        namespace['bd1047eb76fd4fd490fcb8f668e5deda'] = 'p(roduct)?/toejam-and-earl-back-in-the-groove-cddc16(/home)?$';
        namespace['25b5ab5928784a74a502f6a84bb8b49f'] = 'p(roduct)?/darkwood-fa73bd(/home)?$';
        namespace['5a85738bd9e74940ad8409ed8a2c680a'] = 'p(roduct)?/slain-aea303(/home)?$';
        namespace['8d123dcc4b5c4d168f7de7b3e1ed7d47'] = 'p(roduct)?/rising-hell-253707(/home)?$';
        namespace['aa7c3e6b5a2a4ca8962270c15bddb861'] = 'p(roduct)?/runbow-fc9fa4(/home)?$';
        namespace['bc079f73f020432fac896d30c8e2c330'] = 'p(roduct)?/gloomhaven-92f741(/home)?$';
        namespace['6098a8c7375c43458a22163a637c0c2f'] = 'p(roduct)?/spirit-of-the-north-f58a66(/home)?$';
        namespace['5fcf6f3031c547f789e29c18b422ca67'] = 'p(roduct)?/realm-royale-reforged--epic-launch-bundle(/home)?$';
        namespace['6006c7c9d8534b0ca4605ea3a759f3e1'] = 'p(roduct)?/submerged-hidden-depths-6065a1(/home)?$';
        namespace['0bef9383794a4d779ba0628084b14cba'] = 'p(roduct)?/rumbleverse--boom-boxer-content-pack(/home)?$';
        namespace['b29663f909b94b0b83deb76f147e9e4f'] = 'p(roduct)?/cook-serve-delicious-3-fb9aae(/home)?$';
        namespace['5a6d34ba28bc45d081d9311c3885feef'] = 'p(roduct)?/unrailed-e19729(/home)?$';
        namespace['70d9536d99af4c70a55e4c23989f4225'] = 'p(roduct)?/lawn-mowing-simulator-838bf3(/home)?$';
        namespace['e1e92771f6774072bb1b8d0a0a6197f7'] = 'p(roduct)?/wonder-boy-the-dragons-trap-26381d(/home)?$';
        namespace['d250bdf072934b70ab080c6fcee77734'] = 'p(roduct)?/iratus-d0e5ba(/home)?$';
        namespace['1b737464d3c441f8956315433be02d3b'] = 'p(roduct)?/a-game-of-thrones-5858a3(/home)?$';
        namespace['dd9648d29088406e9e2a61ba33fc13f6'] = 'p(roduct)?/paradigm-875c5c(/home)?$';
        namespace['25d726130e6c4fe68f88e71933bda955'] = 'p(roduct)?/terraforming-mars-18c3ad(/home)?$';
        namespace['100f8957d16d4d2d89716775b5767779'] = 'p(roduct)?/riverbond-782aa4(/home)?$';
        namespace['e25eba2210804006a61763a4108322de'] = 'p(roduct)?/insurmountable-b02c31(/home)?$';
        namespace['b15fbb77440547c29567bfa76a878a32'] = ['bundles/bioshock-the-collection', 'p(roduct)?/bioshock-remastered(/home)?$', 'p(roduct)?/bioshock-2-remastered(/home)?$', 'p(roduct)?/bioshock-infinite-complete-edition(/home)?$'];
        namespace['85189f7cf7a64f86aa6aa91d81d36c08'] = ['bundles/borderlands-the-handsome-collection', 'p(roduct)?/borderlands-2(/home)?$', 'p(roduct)?/borderlands-the-pre-sequel(/home)?$'];
        namespace['bd8a7e894699493fb21503837f7b66c5'] = ['bundles/shadowrun-collection', 'p(roduct)?/shadowrun-returns(/home)?$', 'p(roduct)?/shadowrun-hong-kong(/home)?$', 'p(roduct)?/shadowrun-dragonfall(/home)?$'];
        namespace['4d1607defb8840cdb849d47d012b249b'] = ['p(roduct)?/lego-batman(/home)?$', 'p(roduct)?/lego-batman-2(/home)?$', 'p(roduct)?/lego-batman-3(/home)?$'];
        namespace['86ce9e7a94704e8eb1f9dbe16310e701'] = ['p(roduct)?/batman-arkham-asylum(/home)?$', 'p(roduct)?/batman-arkham-city(/home)?$', 'p(roduct)?/batman-arkham-knight(/home)?$'];
        return namespace;
    }
    function get(page, lastCreatedAt) {
        document.getElementById('epic_page').innerHTML = `第 ${page+1} 页`;
        var lastLink = '';
        if (lastCreatedAt > 0) {lastLink = '&lastCreatedAt='+encodeURIComponent(new Date(lastCreatedAt).toISOString());}
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: 'GET',
                url: 'https://www.epicgames.com/account/v2/payment/ajaxGetOrderHistory?locale=zh-CN&page='+page+lastLink,
                timeout: 3e4,
                onload: function (res) {
                    try {
                        resolve(JSON.parse(res.response));
                    }
                    catch (err) {
                        document.getElementById('epic_page').innerHTML = '错误';
                        GM_openInTab('https://www.epicgames.com/account/v2/payment/ajaxGetOrderHistory?locale=zh-CN&page=1', false);
                    }
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
                            data = data.concat(namespace[game.namespace]);
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
        namespace = fixNamespace(namespace);
        var lastCreatedAt = 0;
        while (exit == 0) {
            var pageData = await get(page, lastCreatedAt);
            if (pageData.orders.length < 1) {
                exit = 1;
            }
            else {
                lastCreatedAt = pageData.orders[pageData.orders.length-1].createdAtMillis;
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
                    if ((new RegExp(game)).test(a.href)) {
                        a.style = 'background-color: darkorange; color: white;';
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
    else if (document.URL.indexOf('https://www.epicgames.com/account/v2/payment/ajaxGetOrderHistory')>-1) {
        alert('该弹出页面用于解决同步错误。\n请在页面完整打开后，刷新同步页面。');
    }
    else {
        loadKeylol();
    }
})();
