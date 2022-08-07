// ==UserScript==
// @name         Steam 2019 Rewards
// @namespace    https://coding.net/u/sffxzzp
// @version      0.04
// @description  Steam 2019 Luna New Year Rewards Fast Redeem.
// @author       sffxzzp
// @match        *://store.steampowered.com/lny2019/rewards
// @icon         https://store.steampowered.com/favicon.ico
// @grant        unsafeWindow
// @updateURL    https://sffxzzp.coding.net/p/userscripts/d/userscripts/git/raw/master/steam2019rewards.user.js
// ==/UserScript==

(function() {
    var coins = parseInt(document.querySelector('.rewards_current_points').innerText.replace(/,/gi, ''));
    var owns = unsafeWindow.g_rgOwnedItems;
    var lists = unsafeWindow.g_rgItemDefs;
    var banner = document.querySelector('.rewards_spend_tokens');
    var newbtn = document.createElement('a');
    var success = 0;
    newbtn.innerHTML = '点击按顺序兑换背景&表情';
    newbtn.setAttribute('style', 'margin-left:20px;');
    newbtn.onclick = function () {
        for (var itemid=14;itemid<30;itemid++) {
            var owned = false;
            if (itemid==17) {continue;}
            var rgItemdef = lists[itemid];
            for (var id in owns) {
                if (itemid==id) {
                    owned = true;
                    break;
                }
            }
            if (owned == false) {
                var price = rgItemdef.price;
                if (coins-price>=0) {
                    coins -= price;
                    redeem(itemid);
                }
                else {
                    redeem(0);
                    break;
                }
            }
        }
        this.onclick = function () {
            alert('您已点击过一次了，请点击确定刷新后再试！');
            location.href = location.href;
        }
    }
    banner.appendChild(newbtn);
    function redeem(itemid) {
        var ownnum = 0;
        for (var id in owns) {
            ownnum += 1;
        }
        if (itemid == 0) {
            alert('兑换完成，当前已有'+ownnum+'件物品。\n由于代币不足，仅兑换了'+success+'件物品。');
        }
        else {
            unsafeWindow.$J.post(
                'https://store.steampowered.com/lny2019/ajaxredeemtokens/',
                { sessionid: unsafeWindow.g_sessionID, itemid: itemid }
            );
            success += 1;
        }
        if (success >= 15) {
            alert('兑换完成，当前已有'+ownnum+'件物品。');
        }
    }
})();