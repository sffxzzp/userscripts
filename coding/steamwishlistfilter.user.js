// ==UserScript==
// @name         Steam Wishlist Filter
// @namespace    https://coding.net/u/sffxzzp
// @version      0.06
// @description  Filter that displays wanted discounts level.
// @author       sffxzzp
// @match        *://store.steampowered.com/wishlist/*
// @icon         https://store.steampowered.com/favicon.ico
// @connect      store.steampowered.com
// @updateURL    https://github.com/sffxzzp/userscripts/raw/master/coding/steamwishlistfilter.user.js
// @grant        unsafeWindow
// ==/UserScript==

(function() {
    unsafeWindow.CWishlistController.prototype.BPassesFilters = function(unAppId, rgFilters) {
        var appInfo = unsafeWindow.g_rgAppInfo[unAppId];
        if (!appInfo) {
            return false;
        }
        var rgelMatchedElements = [];
        var elParent = this.rgElements[unAppId];
        if (rgFilters.term) {
            var rgTerms = rgFilters.term.split(' ');
            for (var j = 0; j < rgTerms.length; j++) {
                var bMatchesTerm = false;
                if (rgTerms[j].length == 0 || !appInfo.name) {
                    continue;
                }
                if (appInfo.name.toLowerCase().indexOf(rgTerms[j].toLowerCase()) !== -1) {
                    bMatchesTerm = true
                    rgelMatchedElements.push(unsafeWindow.$J('.title', elParent));
                }
                for (var i = 0; i < appInfo.tags.length; i++) {
                    if (appInfo.tags[i].toLowerCase().indexOf(rgTerms[j].toLowerCase()) !== -1) {
                        bMatchesTerm = true;
                        rgelMatchedElements.push(unsafeWindow.$J('.tag[data-tag-index=\'' + i + '\']', elParent));
                    }
                }
                if (!bMatchesTerm) {
                    return false;
                }
                for (i = 0; i < rgelMatchedElements.length; i++) {
                    rgelMatchedElements[i].addClass('term_matched');
                    this.rgTermMatchedElements.push(rgelMatchedElements[i])
                }
            }
        }
        if (rgFilters.ex_earlyaccess && appInfo.early_access) {
            return false;
        }
        if (rgFilters.ex_prerelease && appInfo.prerelease) {
            return false;
        }
        if (rgFilters.ex_vr && appInfo.vr_only) {
            return false;
        }
        var bPassesPriceFilters = !rgFilters.price_1 && !rgFilters.price_2 && !rgFilters.price_wallet;
        for (i = 0; i < appInfo.subs.length; i++) {
            if (rgFilters.price_1 && appInfo.subs[i].price <= unsafeWindow.g_rgPriceBrackets[0]) {
                bPassesPriceFilters = true;
            }
            if (rgFilters.price_2 && appInfo.subs[i].price <= unsafeWindow.g_rgPriceBrackets[1]) {
                bPassesPriceFilters = true;
            }
            if (rgFilters.price_wallet && appInfo.subs[i].price <= unsafeWindow.g_nWalletCents) {
                bPassesPriceFilters = true;
            }
        }
        if (!bPassesPriceFilters) {
            return false;
        }
        var bPassesDiscountFilters = !rgFilters.discount_any && !rgFilters.discount_50 && !rgFilters.discount_75 && !rgFilters.discount_diy;
        for (i = 0; i < appInfo.subs.length; i++) {
            if (rgFilters.discount_any && appInfo.subs[i].discount_pct > 0) {
                bPassesDiscountFilters = true;
            }
            if (rgFilters.discount_50 && appInfo.subs[i].discount_pct >= 50) {
                bPassesDiscountFilters = true;
            }
            if (rgFilters.discount_75 && appInfo.subs[i].discount_pct >= 75) {
                bPassesDiscountFilters = true;
            }
            if (rgFilters.discount_diy && appInfo.subs[i].discount_pct >= rgFilters.diynuml && appInfo.subs[i].discount_pct <= rgFilters.diynumh) {
                bPassesDiscountFilters = true;
            }
        }
        if (!bPassesDiscountFilters) {
            return false;
        }
        if (rgFilters.type && rgFilters.type != 'all') {
            if (rgFilters.type == 'Video' && appInfo.type != "Video" && appInfo.type != "Movie" && appInfo.type != "Series" && appInfo.type != "Episode") {
                return false;
            } else if (appInfo.type != rgFilters.type) {
                return false;
            }
        }
        if (rgFilters.platform && rgFilters.platform != 'all') {
            if (rgFilters.platform == 'mac' && !appInfo.mac) {
                return false;
            } else if (rgFilters.platform == 'linux' && !appInfo.linux) {
                return false;
            }
        }
        return true;
    };
    var util = (function() {
        function util() {}
        util.createElement = function(data) {
            var node;
            if (data.node) {
                node = document.createElement(data.node);
                if (data.content) {
                    this.setElement({
                        node: node,
                        content: data.content
                    });
                }
                if (data.html) {
                    node.innerHTML = data.html;
                }
            }
            return node;
        };
        util.setElement = function(data) {
            if (data.node) {
                for (let name in data.content) {
                    data.node.setAttribute(name, data.content[name]);
                }
                if (data.html != undefined) {
                    data.node.innerHTML = data.html;
                }
            }
        };
        return util;
    })();
    var swfilter = (function() {
        function swfilter() {};
        swfilter.prototype.run = function() {
            var searchBar = document.getElementsByClassName('controls')[0];
            var style = util.createElement({
                node: "style",
                html: "#swfilternum:hover { border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 0 3px rgba(0,0,0,0.5) inset, 1px 1px 0 0 rgba(255,255,255,0);} #swfilternum {padding: 7px 10px;width: calc( 100% - 56px );box-sizing: border-box;background-color: rgba(0,0,0,0.1);border: 1px solid #000;color: #fff;border-radius: 3px;box-shadow: 0 0 3px rgba(0,0,0,0.5) inset, 1px 1px 0 0 rgba(255,255,255,0.2);}"
            })
            document.body.appendChild(style);
            var swfInput = util.createElement({
                node: "input",
                content: {
                    type: "text",
                    id: "swfilternum",
                    placeholder: "在此输入要过滤的折扣"
                }
            });
            searchBar.appendChild(swfInput);
            var swfButton = util.createElement({
                node: "div",
                content: {
                    class: "filter_tab settings_tab"
                },
                html: "过滤"
            });
            swfButton.onclick = function() {
                var input = document.getElementById("swfilternum").value;
                if (input.indexOf("-") > 0) {
                    input = input.split("-");
                    unsafeWindow.g_Wishlist.rgFilterSettings.diynuml = input[0];
                    unsafeWindow.g_Wishlist.rgFilterSettings.diynumh = input[1];
                } else {
                    unsafeWindow.g_Wishlist.rgFilterSettings.diynuml = input;
                    unsafeWindow.g_Wishlist.rgFilterSettings.diynumh = 100;
                }
                unsafeWindow.g_Wishlist.rgFilterSettings.discount_diy = true;
                unsafeWindow.g_Wishlist.Update();
            };
            searchBar.appendChild(swfButton);
        };
        return swfilter;
    })();
    var program = new swfilter();
    program.run();
})();