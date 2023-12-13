// ==UserScript==
// @name         Multibuy Button
// @namespace    https://github.com/sffxzzp
// @version      0.01
// @description  add multibuy button to Steam badge page
// @author       sffxzzp
// @match        *://steamcommunity.com/*/gamecards/*/*
// @icon         https://store.steampowered.com/favicon.ico
// @updateURL    https://github.com/sffxzzp/userscripts/raw/master/steam/multibuy.user.js
// @downloadURL  https://github.com/sffxzzp/userscripts/raw/master/steam/multibuy.user.js
// @grant        none
// ==/UserScript==

(function() {
    let mb = (function () {
        let mb = function () {};
        mb.prototype.xhr = function (xhrData) {
            return new Promise((resolve, reject) => {
                var xhr = new XMLHttpRequest();
                xhr.open(xhrData.method || "get", xhrData.url, true);
                if (xhrData.method === "post") {xhr.setRequestHeader("content-type", "application/x-www-form-urlencoded; charset=utf-8");}
                if (xhrData.cookie) {xhr.withCredentials = true;}
                xhr.responseType = xhrData.type || "";
                xhr.timeout = 3e5;
                if (xhrData.headers) {for (var k in xhrData.headers) {xhr.setRequestHeader(k, xhrData.headers[k]);}}
                xhr.onload = function(ev) {
                    var evt = ev.target;
                    resolve({ response: evt, body: evt.response });
                };
                xhr.onerror = reject;
                xhr.ontimeout = reject;
                xhr.send(xhrData.data);
            });
        };
        mb.prototype.getCards = async function () {
            let cards = [];
            // use english page to prevent name not found error.
            let eng = await this.xhr({url: location.href.replace(location.search, '') + "?l=english"});
            let epage = (new DOMParser()).parseFromString(eng.body, 'text/html');
            epage.querySelectorAll('.badge_card_set_cards > .badge_card_set_card').forEach(node => {
                let name = node.querySelector('.badge_card_set_text').textContent.replace(/^\s+\(\d+\)/, '').trim();
                let count = node.querySelector('.badge_card_set_text_qty');
                count = count ? parseInt(count.textContent.replace(/[()]/g, '')) : 0;
                cards.push({ name: name, count: count});
            });
            return cards;
        };
        mb.prototype.getAppID = function () {
            let match = location.href.match(/^https?:\/\/steamcommunity.com\/(id|profiles)\/.+\/gamecards\/([0-9]+)/);
            return match ? match[2] : 0;
        };
        mb.prototype.getCurrentLevel = function () {
            let c = document.querySelector('.badge_current .badge_info_description > div:nth-child(2)');
            return c ? parseInt(c.textContent.match(/\d+/)) : 0;
        };
        mb.prototype.addButton = function (url) {
            let target = document.querySelector('.badge_cards_to_collect');
            let ctn;
            if (target.children.length == 0) {
                ctn = document.createElement('div');
                ctn.className = 'gamecards_inventorylink';
            } else {
                ctn = target.querySelector('.gamecards_inventorylink');
            }
            let btn = document.createElement('a');
            btn.href = url;
            btn.className = 'btn_grey_grey btn_medium';
            btn.target = '_blank';
            btn.innerHTML = '<span>批量购买卡牌</span>';
            ctn.appendChild(btn);
            if (target.children.length == 0) {
                target.appendChild(ctn);
            }
        };
        mb.prototype.init = async function () {
            let cards = await this.getCards();
            let appid = this.getAppID();
            let clevel = this.getCurrentLevel();
            let tlevel = 5;
            let mburl = 'https://steamcommunity.com/market/multibuy?appid=753';
            for (let card of cards) {
                let qty = tlevel-clevel-card.count;
                qty = qty < 0 ? 0 : qty;
                mburl += `&items[]=${appid}-${card.name}&qty[]=${qty}`;
            }
            this.addButton(mburl);
        };
        return mb;
    })();
    var btn = new mb();
    btn.init();
})();