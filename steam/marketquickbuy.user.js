// ==UserScript==
// @name         Steam Market Quick Buy
// @namespace    https://github.com/sffxzzp
// @version      0.01
// @description  isolated and pure javascript version "quick buy" function from SIH.
// @author       sffxzzp
// @match        *://steamcommunity.com/market/listings/*/*
// @icon         https://store.steampowered.com/favicon.ico
// @updateURL    https://github.com/sffxzzp/userscripts/raw/master/steam/marketquickbuy.user.js
// @downloadURL  https://github.com/sffxzzp/userscripts/raw/master/steam/marketquickbuy.user.js
// @grant        unsafeWindow
// ==/UserScript==

(function() {
    var util = (function () {
        var util = function () {};
        util.xhr = function (xhrData) {
            return new Promise(function(resolve, reject) {
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
    var cmqb = (function () {
        var cmqb = function () {};
        cmqb.prototype.load = function () {
            var _this = this;
            document.querySelectorAll('.market_listing_row[id^="listing_"]').forEach(function (node) {
                let idListing = node.id.substring(8);
                let rgListing = unsafeWindow.g_rgListingInfo[idListing];
                let asset = null;
                if (rgListing) {
                    asset = rgListing.asset;
                } else {
                    return;
                }
                let rgItem = unsafeWindow.g_rgAssets[asset.appid][asset.contextid][asset.id];
                if (rgListing.price > 0 && !node.querySelector('.item_market_action_button').classList.contains('smqb')) {
                    let quickBuyBtn = util.createElement({node: 'a', content: {href: 'javascript:;', class: 'item_market_action_button item_market_action_button_green smqb'}, html: '<span class="item_market_action_button_edge item_market_action_button_left"></span><span class="item_market_action_button_contents">快速购买</span><span class="item_market_action_button_edge item_market_action_button_right"></span><span class="item_market_action_button_preload"></span></a>'});
                    quickBuyBtn.onclick = function () {
                        this.style.display = 'none';
                        node.querySelector('.market_listing_buy_button').appendChild(util.createElement({node: 'img', content: {src: 'https://steamcommunity-a.akamaihd.net/public/images/login/throbber.gif', alt: '请稍候…'}}));
                        let Subtotal = parseInt(rgListing.converted_price, 10);
                        let FeeAmount = parseInt(rgListing.converted_fee, 10);
                        let Total = Subtotal + FeeAmount;
                        let data = `sessionid=${unsafeWindow.g_sessionID}&currency=${unsafeWindow.g_rgWalletInfo.wallet_currency}&subtotal=${Subtotal}&fee=${FeeAmount}&total=${Total}&quantity=1`;
                        util.xhr({
                            url: `https://steamcommunity.com/market/buylisting/${idListing}`,
                            method: 'post',
                            data: data,
                            xhr: true
                        }).then(function (res) {
                            if (res.response.status == 200) {
                                if (node.style.display != 'none') {
                                    node.querySelector('.market_listing_buy_button').innerHTML = '成功！';
                                } else {
                                    alert('成功！');
                                }
                            } else {
                                node.querySelector('.market_listing_buy_button img').remove();
                                let data = JSON.parse(res.body);
                                if (data && data.message) {
                                    node.querySelector('.market_listing_buy_button').innerHTML = data.message;
                                }
                            }
                        }).catch(console.log);
                    };
                    unsafeWindow.AddItemHoverToElement(quickBuyBtn, rgItem);
                    let btnPlace = node.querySelector('.market_listing_buy_button');
                    btnPlace.innerHTML = '';
                    btnPlace.appendChild(quickBuyBtn);
                }
            });
        };
        cmqb.prototype.run = function () {
            var _this = this;
            this.load();
            var csgoinv = document.getElementById("searchResultsRows");
            var observer = new MutationObserver(function (recs) {
                for (let i=0;i<recs.length;i++) {
                    let rec = recs[i];
                    if (rec.target.classList.contains('market_listing_item_img_container')) {
                        _this.load();
                        break;
                    }
                }
            });
            observer.observe(csgoinv, { childList: true, subtree: true });
        };
        return cmqb;
    })();
    var script = new cmqb();
    script.run();
})();
