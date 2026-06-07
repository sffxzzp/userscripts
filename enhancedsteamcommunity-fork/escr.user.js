// ==UserScript==
// @name            Enhanced Steam Community Fork (Refactored Version)
// @author          Deparsoul & onlyisu & sffxzzp & DevSplash
// @namespace       https://greasyfork.org/users/726
// @description     Add some extra functions to Steam Community
// @copyright       2015+,  Deparsoul & onlyisu & sffxzzp & DevSplash & GPT-5.5
// @version         2026.06.08
// @icon            https://store.steampowered.com/favicon.ico
// @license         GPL version 3 or any later version
// @match           http*://steamcommunity.com/*
// @match           http*://store.steampowered.com/*
// @run-at          document-end
// @grant           GM_xmlhttpRequest
// @grant           unsafeWindow
// @connect         www.steamcardexchange.net
// @updateURL       https://github.com/sffxzzp/userscripts/raw/refs/heads/master/enhancedsteamcommunity-fork/escr.user.js
// @downloadURL     https://github.com/sffxzzp/userscripts/raw/refs/heads/master/enhancedsteamcommunity-fork/escr.user.js
// @noframes
// ==/UserScript==

/*
 *This program is free software: you can redistribute it and/or modify
 *it under the terms of the GNU General Public License as published by
 *the Free Software Foundation, either version 3 of the License, or
 *(at your option) any later version.
 *
 *This program is distributed in the hope that it will be useful,
 *but WITHOUT ANY WARRANTY; without even the implied warranty of
 *MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *GNU General Public License for more details.
 *
 *You should have received a copy of the GNU General Public License
 *along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

(function () {
    'use strict';

    // 整个脚本运行在 Tampermonkey 沙箱内，页面全局通过 W (unsafeWindow) 访问，跨域 SCE 走 GM_xmlhttpRequest。
    const W = unsafeWindow;
    const T = messages(detectLanguage());

    // 当前用户库存 URL（徽章链接与库存缓存共用）
    const avatar = document.querySelector('#global_actions .user_avatar');
    const inventoryUrl = avatar ? avatar.href + 'inventory/' : '';

    // ---- 通用辅助 ----
    var lsGet = function (key) {
        const value = localStorage['esc_' + key];
        return value === undefined ? null : JSON.parse(value);
    };

    var lsSet = function (key, value) {
        localStorage['esc_' + key] = JSON.stringify(value);
    };

    var gmGet = function (url) {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({ method: 'GET', url: url, onload: r => resolve(r.responseText), onerror: reject, ontimeout: reject });
        });
    };

    // ---- Steam 同源请求 ----
    const api = {
        async json(url, options) {
            const response = await fetch(url, Object.assign({ credentials: 'include' }, options));
            if (!response.ok) { throw new Error('HTTP ' + response.status + ': ' + url); }
            return response.json();
        },
        post(url, data) {
            return api.json(url, { method: 'POST', body: new URLSearchParams(data) });
        },
        marketSearch(payload) {
            return api.json('/market/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    'X-Valve-Action-Type': 'ZFJAHYDA:SearchMarketListings',
                    'X-Valve-Request-Type': 'routeAction'
                },
                body: JSON.stringify([payload])
            });
        },
        orderBook(appid, hash) {
            return api.json('/market/orderbook?q=Load&qp=' + encodeURIComponent(JSON.stringify([appid, hash])));
        },
        cancelBuyOrder(sessionid, orderId) {
            return api.post('/market/cancelbuyorder/', { sessionid: sessionid, buy_orderid: orderId });
        },
        createBuyOrder(data) {
            return api.post('/market/createbuyorder/', data);
        },
        listingRender(appid, hash, params) {
            return api.json('/market/listings/' + appid + '/' + encodeURIComponent(hash) + '/render/?' + new URLSearchParams(params));
        },
        inventoryJson(baseUrl, appid, contextId) {
            return api.json(baseUrl + 'json/' + appid + '/' + contextId + '/');
        }
    };

    // ---- 库存过滤（库存页与交易报价页共用）----
    var applyInventoryFilter = function (filter, attempt) {
        attempt = attempt || 0;
        const inventory = W.g_ActiveInventory;
        if (inventory && inventory.ShowTags) { inventory.ShowTags(); }
        if (!filter) { return; }
        const filterElement = document.getElementById(filter);
        if (filterElement) {
            filterElement.click();
            return;
        }
        if (attempt < 20) { setTimeout(() => applyInventoryFilter(filter, attempt + 1), 500); }
    };

    // ---- 库存缓存（用于市场搜索页显示库存数量）----
    var updateInventoryCache = async function () {
        const activeUser = W.g_ActiveUser;
        const steamId = W.g_steamID;
        if (!steamId || !activeUser || activeUser.strSteamId != steamId) { return; }
        const appContexts = {};
        for (const appid in activeUser.rgAppInfo) {
            appContexts[appid] = Object.keys(activeUser.rgAppInfo[appid].rgContexts);
        }
        lsSet('inventory_app', appContexts);
        const inventory = {};
        for (const appid in appContexts) {
            for (const contextId of appContexts[appid]) {
                try {
                    const data = await api.inventoryJson(inventoryUrl, appid, contextId);
                    if (data.success) {
                        mergeInventory(inventory, data);
                        lsSet('inventory', inventory);
                    }
                } catch (err) {
                    console.error(err);
                }
            }
        }
    };

    var mergeInventory = function (inventory, data) {
        const inv = data.rgInventory;
        const des = data.rgDescriptions;
        for (const id in inv) {
            const item = inv[id];
            const description = des[item.classid + '_' + item.instanceid];
            if (!description) { continue; }
            const name = description.market_hash_name || description.market_name || description.name;
            const identifier = description.appid + '/' + name;
            inventory[identifier] = (inventory[identifier] || 0) + parseInt(item.amount);
        }
    };

    // ---- SteamCardExchange 徽章/表情/背景渲染 ----
    var processBadges = function (data) {
        data = data.replace(/https?:\/\/(community\.edgecast\.steamstatic\.com|steamcommunity-a\.akamaihd\.net|cdn\.steamcommunity\.com)\//g, "//steamcommunity-a.akamaihd.net/");
        data = data.replace(/https?:\/\/(cdn\.edgecast\.steamstatic\.com|steamcdn-a\.akamaihd\.net|cdn\.akamai\.steamstatic\.com)\//g, "//steamcdn-a.akamaihd.net/");
        const progress = document.querySelector('.gamecard_badge_progress');
        if (progress) {
            progress.style.bottom = 'auto';
            progress.style.top = 0;
        }
        const sce = new DOMParser().parseFromString(data, 'text/html');
        const target = document.querySelector('.badge_content.gamecard_details');
        if (!target) { return; }
        var nextSection = function (selector) {
            const marker = sce.querySelector(selector);
            return marker && marker.parentElement ? marker.parentElement.nextElementSibling : null;
        };

        const badges = location.href.indexOf('?border=1') != -1 ? nextSection('span[id$="-foilbadges"]') : nextSection('span[id$="-badges"]');
        renderBadges(target, badges);
        target.insertAdjacentHTML('beforeend', '<div style="clear: both"></div>');
        renderEmoticons(target, nextSection('span[id$="-emoticons"]'));
        target.insertAdjacentHTML('beforeend', '<div style="clear: both"></div>');
        renderBackgrounds(target, nextSection('span[id$="-backgrounds"]'));
    };

    var renderBadges = function (target, badges) {
        if (!badges) { return; }
        badges.querySelectorAll('div.items-center').forEach(badge => {
            if (badge.textContent.trim()) {
                const img = badge.querySelector('img');
                const text = badge.querySelector('.text-sm');
                const level = badge.querySelector('.mt-auto');
                target.insertAdjacentHTML('beforeend', '<div class="badge_info" style="float:left;width:80px;text-align:center;padding:5px;min-height:150px;"><div class="badge_info_image"><img src="' + (img ? img.src : '') + '"></div><div class="badge_info_description"><div class="badge_info_title">' + (text ? text.textContent : '') + '</div><div>' + (level ? level.innerHTML : '') + '</div></div><div style="clear: left;"></div></div>');
            }
        });
    };

    var renderEmoticons = function (target, emoticons) {
        if (!emoticons) { return; }
        emoticons.querySelectorAll('div.items-center').forEach(item => {
            if (item.textContent.trim()) {
                const large = item.querySelector('img[class^=h-]');
                const small = item.querySelector('img[class^=sm]');
                const title = item.querySelector('.text-center');
                const price = item.querySelector('.mt-auto');
                target.insertAdjacentHTML('beforeend', '<div class="badge_info" style="float:left;width:80px;text-align:center;padding:5px;"><div><img src="' + (large ? large.src : '') + '"></div><div><img src="' + (small ? small.src : '') + '"></div><div><div class="badge_info_title">' + (title ? title.textContent : '') + '</div><div>' + (price ? price.textContent : '') + '</div></div><div style="clear: left;"></div></div>');
            }
        });
    };

    var renderBackgrounds = function (target, backgrounds) {
        if (!backgrounds) { return; }
        backgrounds.querySelectorAll('div.items-center').forEach(item => {
            if (item.textContent.trim()) {
                const link = item.querySelector('.gallery-src');
                const image = item.querySelector('.gallery-image-anchor > img');
                const title = item.querySelector('.text-center');
                const price = item.querySelector('.mt-auto');
                const imageUrl = image ? image.src.replace('300x180f', '160x100f') : '';
                target.insertAdjacentHTML('beforeend', '<div class="badge_info" style="float:left;width:160px;text-align:center;padding:5px;"><div><a target="_blank" href="' + (link ? link.href : '') + '"><img src="' + imageUrl + '"></a></div><div><div class="badge_info_title">' + (title ? title.textContent : '') + '</div><div>' + (price ? price.textContent : '') + '</div></div><div style="clear: left;"></div></div>');
            }
        });
    };

    // ---- 徽章页：市场链接 + 批量购买 ----
    var badgePage = function () {
        const foil = location.href.indexOf('?border=1') != -1 ? 1 : 0;
        const levelElement = document.querySelector('.badge_current .badge_info_description>div:nth-child(2)');
        const levelMatch = levelElement && levelElement.textContent.match(/\d+/);
        const state = {
            cards: [],
            booster: null,
            appid: location.href.match(/gamecards\/(\d+)(?!\w)/)[1],
            batchState: 0,
            targetLevel: foil ? 1 : 5,
            currentLevel: levelMatch ? parseInt(levelMatch[0]) : 0,
            foil: foil,
            sessionId: W.g_sessionID,
            walletCurrency: 23,
            countryCode: JSON.parse(document.querySelector('#application_config').dataset.config).COUNTRY
        };

        var demandFor = function (card) { return Math.max(state.targetLevel - state.currentLevel - card.count, 0); };
        var formatPrice = function (price) { return W.v_currencyformat(price * 100, W.GetCurrencyCode(state.walletCurrency), state.countryCode); };

        var renderLinks = function () {
            const appid = state.appid;
            const linkMarket = '//steamcommunity.com/market/search?appid=753&category_753_item_class=tag_item_class_2&category_753_Game=tag_app_' + appid;
            const linkInventory = inventoryUrl + "#753_6?filter=tag_filter_753_6_Game_app_" + appid;
            const linkShowcase = 'https://www.steamcardexchange.net/index.php?gamepage-appid-' + appid;
            const inventoryLink = document.querySelector('.gamecards_inventorylink');
            if (inventoryLink) { inventoryLink.innerHTML = '<a class="btn_grey_grey btn_medium" target="_blank" id="batch_buy_card" href=' + linkMarket + '><span>' + T.BatchBuyCard + '</span></a>&nbsp;<a class="btn_grey_grey btn_medium" target="_blank" href=' + linkMarket + '><span>' + T.Market + '</span></a>&nbsp;<a class="btn_grey_grey btn_medium" target="_blank" href=' + linkInventory + '><span>' + T.Inventory + '</span></a>&nbsp;<a class="btn_grey_grey btn_medium" target="_blank" href=' + linkShowcase + '><span>' + T.Showcase + '</span></a>&nbsp;'; }
        };

        var moveNativeMultibuyButton = function () {
            document.querySelectorAll('.gamecards_inventorylink a').forEach(element => {
                const link = new URL(element.href);
                if (link.host.endsWith('.steamstatic.com')) {
                    link.host = location.host;
                    element.href = link.toString();
                }
                if (link.pathname === '/market/multibuy') {
                    element.target = "_blank";
                    const topLinks = document.querySelector('.badge_detail_tasks .gamecards_inventorylink');
                    if (topLinks) {
                        topLinks.append(element);
                        topLinks.append(document.createTextNode(' '));
                    }
                }
            });
        };

        var renderBatchPanel = function (anchor) {
            state.batchState = 1;
            const task = anchor.closest('.badge_detail_tasks');
            if (task) { task.insertAdjacentHTML('beforebegin', '<div class="badge_detail_tasks"><div class="gamecards_inventorylink">'+T.CurrentLevel+' : <span style="background-color: rgba(0, 0, 0, 0.2); border: 1px solid #000; border-radius: 3px; box-shadow: 1px 1px 0 0 rgba(91, 132, 181, 0.2); color: #909090; width: 30px; display: inline-block;">'+state.currentLevel+'</span>&nbsp;'+T.TargetLevel+' : <input type="text" value="5" id="target_level" style="width:30px;"></div><div class="gamecards_inventorylink" id="market_data">'+T.Loading+'</div></div><div style="clear: both"></div>'); }

            let buttons = '<br>' + T.BatchBuyBtn + ':';
            for (let j = 0; j < T.BatchBuyModes.length; ++j) {
                buttons += '&nbsp;<a class="btn_grey_grey btn_small_thin btn_batch_buy" style="display:none;" data-mode="' + j + '"><span>' + T.BatchBuyModes[j] + ' <span class="total_cost">?</span></span></a>';
            }
            const targetLevelInput = document.querySelector('#target_level');
            if (targetLevelInput) {
                targetLevelInput.insertAdjacentHTML('afterend', buttons);
                targetLevelInput.addEventListener('keyup', () => {
                    const level = targetLevelInput.value;
                    if (!isNaN(level)) {
                        state.targetLevel = parseInt(level);
                        refreshMarketTable();
                    }
                });
            }

            document.querySelectorAll('.btn_batch_buy').forEach(button => {
                button.addEventListener('click', () => {
                    const totalCost = button.querySelector('.total_cost').textContent;
                    const mode = button.dataset.mode;
                    W.ShowConfirmDialog(
                        T.BatchBuyConfirm,
                        T.BatchBuyMessage + totalCost,
                        T.Confirm + ' (' + totalCost + ')',
                        T.Cancel
                    ).done(() => {
                        document.querySelectorAll('.btn_batch_buy').forEach(b => {b.style.display = 'none'});
                        buy(mode);
                    });
                });
            });
        };

        var readCardsFromPage = function () {
            state.cards = [];
            document.querySelectorAll('.badge_detail_tasks .badge_card_set_cards .badge_card_set_card').forEach(card => {
                const nameElement = card.querySelector('.badge_card_set_text');
                const countElement = card.querySelector('.badge_card_set_text_qty');
                const name = nameElement ? nameElement.textContent.replace(/^\s+\(\d+\)/, '').trim() : '';
                let count = countElement ? countElement.textContent : '';
                count = count ? parseInt(count.replace(/[()]/g, '')) : 0;
                const imgElement = card.querySelector('img.gamecard');
                state.cards.push({ name: name, img: imgElement ? imgElement.src : '', count: count });
            });
        };

        var refreshMarketTable = function () {
            var content = '<table cellpadding=5 style="margin:auto;font-size:90%;">';
            content += '<tr><th>' + T.MarketCard + '</th><th>' + T.Name + '</th><th>' + T.Owned + '</th><th>' + T.Demand + '</th>';
            for (var j = 0; j < T.BatchBuyModes.length; ++j) {
                content += '<th>' + T.BatchBuyModes[j] + '</th>';
            }
            content += '<th>'+T.Supply+'</th><th>'+T.Order+'</th></tr>';

            var setCost = 0;
            var setCount = 0;
            var totalCost = [];
            var totalEstimate = [];
            var isComplete = true;
            for (var i = 0; i < state.cards.length; i++) {
                var card = state.cards[i];
                var demand = demandFor(card);
                if (card.price !== undefined) {
                    setCost += card.price[0];
                    setCount++;
                    var buyNowRemain = demand;
                    var buyNowAmount, buyNowPrice = 0, buyNowTotal = 0, buyNowLimit = 0;
                    for (j = 0; j < card.graph_sell.length; ++j) {
                        if (buyNowLimit && card.graph_sell[j][0] > buyNowLimit) { break; }
                        buyNowPrice = card.graph_sell[j][0];
                        if (!buyNowLimit) { buyNowLimit = buyNowPrice * 2; }
                        buyNowAmount = card.graph_sell[j][1];
                        if (j > 0) { buyNowAmount -= card.graph_sell[j - 1][1]; }
                        buyNowAmount = Math.min(buyNowAmount, buyNowRemain);
                        buyNowTotal += buyNowPrice * buyNowAmount;
                        buyNowRemain -= buyNowAmount;
                        if (buyNowRemain <= 0) { break; }
                    }
                    card.price[0] = buyNowPrice;
                    buyNowAmount = demand - buyNowRemain;
                    var buyNowText = formatPrice(buyNowPrice) + ' x ' + buyNowAmount + ' ≈ ' + formatPrice(buyNowTotal);
                    if (buyNowAmount < demand) { buyNowText = '<span style="color:red">' + buyNowText + '</span>'; }
                    card.price_text[0] = buyNowText;
                    totalEstimate[0] = (totalEstimate[0] || 0) + buyNowTotal;
                    for (j = 0; j < card.price.length; ++j) {
                        if (totalCost[j] === undefined) { totalCost[j] = 0; }
                        totalCost[j] += demand * card.price[j];
                    }
                } else { isComplete = false; }
                content += '<tr><td><img src="' + card.img + '" style="height:32px;"></td><td><a target="_blank" href="//steamcommunity.com/market/listings/753/' + encodeURIComponent(card.hash) + '">' + card.name + '</td><td>' + card.count + '</a></td><td>' + demand + '</td>';
                for (j = 0; j < T.BatchBuyModes.length; ++j) {
                    content += '<td>' + (card.price_text && card.price_text[j] ? card.price_text[j] : '?') + '</td>';
                }
                content += '<td>' + (card.quantity !== undefined ? card.quantity : '?') + '</td><td>' + (card.order !== undefined ? card.order : '?') + '</td></tr>';
            }
            content += "</table>";
            if (state.booster) {
                var booster = '<a target="_blank" href="' + state.booster.link + '">' + T.BoosterPack + '</a>: ' + state.booster.price + '&nbsp;';
                if (isComplete) { booster += T.ThreeCardAvg + ': ' + formatPrice(setCost / setCount * 3); }
                content = booster + content;
            }
            if (isComplete) {
                document.querySelectorAll('.btn_batch_buy').forEach((button, j) => {
                    var cost = button.querySelector('span.total_cost');
                    if (cost && totalCost[j] !== undefined) { cost.textContent = formatPrice(totalCost[j]) + (totalEstimate[j] ? ' ≈ ' + formatPrice(totalEstimate[j]) : ''); }
                });
                if (state.batchState == 1) {
                    document.querySelectorAll('.btn_batch_buy').forEach(button => {
                        button.style.display = '';
                    });
                    state.batchState = 2;
                }
            }
            const marketData = document.querySelector('#market_data');
            if (marketData) { marketData.innerHTML = content; }
        };

        var rebuildOrders = function (arr) {
            const result = [];
            for (let i = 0; i < arr.length; i += 2) {
                result.push([arr[i] / 100, arr[i + 1]]);
            }
            return result;
        };

        var findCardIndex = function (hash) {
            let match;
            if ((match = hash.match(/\d+-(.*)/))) {
                const hashName = match[1].trim();
                const index = state.cards.findIndex(card => card.name == hashName);
                if (index > -1) { return index; }
            }
            if ((match = hash.match(/\d+-(.*)\((Foil|Foil Trading Card|Trading Card)\)/))) {
                const foilName = match[1].trim();
                return state.cards.findIndex(card => card.name == foilName);
            }
            return -1;
        };

        var loadBooster = async function () {
            const data = await api.marketSearch({
                appid: 753,
                filters: {
                    category_753_item_class: ["tag_item_class_5"],
                    category_753_Game: ["tag_app_" + state.appid]
                },
                price: { eCurrency: state.walletCurrency },
                accessoryFilters: {},
                start: 0
            });
            if (data.results.length == 1) {
                const listing = data.results[0];
                state.booster = {
                    link: 'https://steamcommunity.com/market/listings/753/' + encodeURIComponent(listing.strHash),
                    quantity: listing.cSellOrders,
                    price: listing.strMinSellSubtotal
                };
            }
        };

        var loadCardMarketList = async function () {
            const data = await api.marketSearch({
                appid: 753,
                filters: {
                    category_753_item_class: ["tag_item_class_2"],
                    category_753_cardborder: ["tag_cardborder_" + state.foil],
                    category_753_Game: ["tag_app_" + state.appid]
                },
                price: { eCurrency: state.walletCurrency },
                accessoryFilters: {},
                start: 0
            });
            data.results.forEach(element => {
                const index = findCardIndex(element.strHash);
                if (index > -1) {
                    state.cards[index].quantity = element.cSellOrders;
                    state.cards[index].hash = element.strHash;
                }
                refreshMarketTable();
            });
        };

        var loadCardListing = function (i) {
            if (i >= state.cards.length) { return; }
            const card = state.cards[i];
            if (card.hash === undefined) {
                loadCardListing(i + 1);
                return;
            }
            api.orderBook(753, card.hash).then(data => {
                state.walletCurrency = data.data.eCurrency;
                var graphSell = rebuildOrders(data.data.rgCompactSellOrders);
                var graphBuy = rebuildOrders(data.data.rgCompactBuyOrders);
                card.graph_sell = graphSell;
                if (!graphSell.length) { return; }
                if (!graphBuy.length) { graphBuy = [graphSell[0]]; }

                card.price = [];
                card.price_text = [];
                card.price.push(null);
                card.price_text.push(null);

                card.price.push(graphSell[0][0]);
                card.price_text.push(formatPrice(graphSell[0][0]) + ' x ' + graphSell[0][1]);

                var j = 0;
                card.price.push(graphBuy[j][0]+0.01);
                card.price_text.push(formatPrice(graphBuy[j][0]+0.01));
                card.price.push(graphBuy[j][0]);
                card.price_text.push(formatPrice(graphBuy[j][0]) + ' x ' + graphBuy[j][1]);

                if (graphBuy[1]) { j = 1; }
                card.price.push(graphBuy[j][0]);
                card.price_text.push(formatPrice(graphBuy[j][0]) + ' x ' + graphBuy[j][1]);

                j = graphBuy.length - 1;
                card.price.push(graphBuy[j][0]);
                card.price_text.push(formatPrice(graphBuy[j][0]) + ' x ' + graphBuy[j][1]);

                refreshMarketTable();
                setTimeout(() => loadCardListing(i + 1), 500);
            }).catch(err => {
                console.error(err);
                alert(T.BatchBuyCheck);
            });
        };

        var loadMarket = async function () {
            if (state.foil == 0) { loadBooster().catch(console.error); }
            await loadCardMarketList();
            loadCardListing(0);
        };

        var buy = function (mode) {
            cancelBuy(0, mode);
        };

        var cancelBuy = function (i, mode) {
            if (i == state.cards.length) {
                placeBuy(0, mode);
                return;
            }
            const card = state.cards[i];
            if (card.order_id !== undefined) {
                api.cancelBuyOrder(state.sessionId, card.order_id).then(data => {
                    card.order = data.success == 1 ? '0' : T.Fail;
                    refreshMarketTable();
                    setTimeout(() => cancelBuy(i + 1, mode), 500);
                }).catch(err => {
                    console.error(err);
                    card.order = T.Fail;
                    refreshMarketTable();
                    setTimeout(() => cancelBuy(i + 1, mode), 500);
                });
            } else { cancelBuy(i + 1, mode); }
        };

        var placeBuy = function (i, mode) {
            if (i == state.cards.length) { return; }
            const card = state.cards[i];
            const demand = demandFor(card);
            if (card.hash !== undefined && demand > 0) {
                const price = card.price[mode];
                api.createBuyOrder({
                    sessionid: state.sessionId,
                    currency: state.walletCurrency,
                    appid: 753,
                    market_hash_name: card.hash,
                    price_total: Math.round(demand * price * 100),
                    quantity: demand
                }).then(data => {
                    card.order = data.success == 1 ? formatPrice(price) + ' x ' + demand : T.Fail;
                    card.order_id = data.buy_orderid;
                    refreshMarketTable();
                    setTimeout(() => placeBuy(i + 1, mode), 500);
                }).catch(err => {
                    console.error(err);
                    card.order = T.Fail;
                    refreshMarketTable();
                    setTimeout(() => placeBuy(i + 1, mode), 500);
                });
            } else { placeBuy(i + 1, mode); }
        };

        renderLinks();
        moveNativeMultibuyButton();
        const entry = document.querySelector('#batch_buy_card');
        if (entry) {
            entry.addEventListener('click', event => {
                event.preventDefault();
                event.stopPropagation();
                if (state.batchState == 0) {
                    renderBatchPanel(event.currentTarget);
                    readCardsFromPage();
                    loadMarket().catch(console.error);
                }
            });
        }
        document.querySelectorAll('.badge_card_set_text_qty').forEach(element => {element.style.color = 'red'});
    };

    // ---- 好友活动页：修复缺图 ----
    var friendActivityPage = function () {
        setTimeout(() => {
            const pagingControls = W.g_rgPagingControls;
            for (const prefix in pagingControls) {
                const originalResponseHandler = pagingControls[prefix].m_fnResponseHandler;
                pagingControls[prefix].SetResponseHandler(response => {
                    originalResponseHandler(response);
                    document.querySelectorAll('img[src$="friendactivity_noimage.jpg"]').forEach(img => {
                        const link = img.parentElement;
                        const appid = link ? link.dataset.dsAppid : null;
                        if (appid) {
                            link.href = '//store.steampowered.com/app/' + appid + '/?cc=hk';
                            img.src = '//cdn.akamai.steamstatic.com/steam/apps/' + appid + '/capsule_sm_120.jpg';
                        }
                    });
                });
            }
        }, 100);
    };

    // ---- 市场商品页：一键购买 ----
    var marketListingPage = function () {
        const form = document.querySelector('#market_listing_filter_form');
        if (form) { form.insertAdjacentHTML('beforeend', '<span class="market_listing_filter_searchhint" style="padding-left: 5px;"><label style="color:red;"><input id="escOneClickBuying" type="checkbox" />'+T.OneClickBuying+'</label></span>'); }
        const checkbox = document.querySelector('#escOneClickBuying');
        if (checkbox) {
            checkbox.checked = !!lsGet('one_click_buying');
            checkbox.addEventListener('change', () => lsSet('one_click_buying', checkbox.checked));
        }

        const table = document.querySelector('#searchResultsTable');
        if (table) {
            table.addEventListener('click', event => {
                const button = event.target.closest('.market_listing_buy_button');
                if (!button || !table.contains(button)) { return; }
                const row = button.closest('.market_listing_row');
                const priceText = row ? row.querySelector('.market_listing_price_with_fee') : null;
                const priceMatch = priceText ? priceText.textContent.match(/([\d.]+)/) : null;
                if (!priceMatch) { return; }
                const dialog = document.querySelector('#market_buynow_dialog');
                if (lsGet('one_click_buying') && parseFloat(priceMatch[1]) < 5) {
                    if (dialog) { dialog.style.opacity = 0; }
                    setTimeout(() => {
                        document.getElementById('market_buynow_dialog_purchase')?.click();
                        document.getElementById('market_buynow_dialog_cancel')?.click();
                    }, 100);
                    button.innerHTML = '<img src="//steamcommunity-a.akamaihd.net/public/images/login/throbber.gif">';
                    if (row) { setTimeout(() => {row.style.opacity = 0}, 20000); }
                } else if (dialog) { dialog.style.opacity = 1; }
            });
        }

        document.querySelectorAll('#market_buynow_dialog_accept_ssa, #market_buyorder_dialog_accept_ssa').forEach(element => {element.checked = true});
    };

    // ---- 市场搜索页：显示本地库存数量 ----
    var marketSearchPage = function () {
        const inventory = lsGet('inventory');
        document.querySelectorAll('.market_listing_row_link').forEach(link => {
            link.querySelectorAll('.market_listing_item_esc_amount').forEach(element => element.remove());
            const href = link.href || link.getAttribute('href') || '';
            const match = href.match(/steamcommunity\.com\/market\/listings\/([^$?]*)/);
            if (!match) { return; }
            const identifier = decodeURIComponent(match[1]);
            const name = link.querySelector('.market_listing_item_name');
            if (inventory && inventory.hasOwnProperty(identifier) && name) {
                const marker = document.createElement('span');
                marker.style.color = 'red';
                marker.className = 'market_listing_item_esc_amount';
                marker.textContent = '(' + inventory[identifier] + ') ';
                name.prepend(marker);
            }
        });
    };

    // ---- 年龄检查页：设置生日 cookie 并刷新 ----
    var ageCheckPage = function () {
        const expires = new Date();
        expires.setDate(expires.getDate() + 365);
        document.cookie = 'birthtime=-473356799; expires=' + expires.toGMTString() + ';path=/';
        location.reload();
    };

    // ---- 好友页：网页聊天入口 ----
    var friendsPage = function () {
        const container = document.querySelector('.manage_friends_btn_ctn');
        if (container) { container.insertAdjacentHTML('afterbegin', '<span class="btn_grey_black btn_details btn_small btn_manage_friends"><span><a target="_blank" href="//steamcommunity.com/chat/">' + T.WebChat + '</a></span></span>'); }
    };

    // ---- 库存页：出售辅助 + 库存缓存 ----
    var inventoryPage = function () {
        const filterMatch = location.href.match(/(#.*)\?filter=(.*)/);
        if (filterMatch) {
            location.hash = filterMatch[1];
            applyInventoryFilter(filterMatch[2]);
        }

        const acceptSsa = document.querySelector('#market_sell_dialog_accept_ssa');
        if (acceptSsa) { acceptSsa.checked = true; }

        document.head.insertAdjacentHTML('beforeend', '<link type="text/css" rel="stylesheet" href="//steamcommunity-a.akamaihd.net/public/css/skin_1/economy_market.css?v=1617814919">');

        const modalContent = document.querySelector('#market_sell_dialog .newmodal_content');
        if (modalContent) { modalContent.insertAdjacentHTML('beforeend', '<div style="border-top: 1px solid rgb(93, 137, 44); padding-top: 10px; margin-top: 8px;"><style>.market_listing_action_buttons{display:none;}</style><div class="market_content_block market_home_listing_table market_home_main_listing_table market_listing_table" id="searchResultsTable"><div id="searchResultsRows"></div></div></div>'); }

        var rememberLastSellPrice = function () {
            const priceInput = document.querySelector('#market_sell_currency_input');
            if (priceInput && priceInput.value) { lsSet('last_sell_price', priceInput.value); }
        };

        const acceptButton = document.querySelector('#market_sell_dialog_accept');
        if (acceptButton) { acceptButton.addEventListener('click', rememberLastSellPrice); }
        document.querySelectorAll('.market_dialog_input').forEach(input => {
            input.addEventListener('keydown', e => {
                rememberLastSellPrice();
                if (e.ctrlKey && e.keyCode == 13) {
                    setTimeout(() => {
                        if (W.SellItemDialog.m_bWaitingForUserToConfirm) { document.getElementById('market_sell_dialog_ok')?.click(); }
                    }, 100);
                }
            });
        });

        const originalSell = W.SellCurrentSelection;
        W.SellCurrentSelection = () => {
            const result = document.querySelector('#searchResultsRows');
            if (result) { result.style.display = 'none'; }
            let selectedItem = W.g_ActiveInventory.selectedItem;
            selectedItem = selectedItem.description || selectedItem;
            const marketHashName = selectedItem.market_hash_name || selectedItem.market_name;
            if (marketHashName) {
                api.listingRender(selectedItem.appid, marketHashName, {
                    query: '',
                    start: 0,
                    count: 20,
                    country: W.g_strCountryCode,
                    language: W.g_strLanguage,
                    currency: W.g_rgWalletInfo ? W.g_rgWalletInfo.wallet_currency : 1
                }).then(data => {
                    if (result) {
                        result.innerHTML = data.results_html;
                        result.style.display = '';
                    }
                }).catch(console.error);
            }
            originalSell();

            const lastSellPrice = lsGet('last_sell_price');
            const sellPriceInput = document.querySelector('#market_sell_currency_input');
            if (lastSellPrice && sellPriceInput) {
                sellPriceInput.value = lastSellPrice;
                W.SellItemDialog.OnInputKeyUp();
            }
            const dialog = document.querySelector('#market_sell_dialog');
            if (dialog) { dialog.style.top = W.scrollY + 'px'; }
        };

        setTimeout(updateInventoryCache, 1000);
    };

    // ---- 交易报价页：自动选择并过滤库存 ----
    var tradeOfferPage = function () {
        setTimeout(() => {
            document.querySelector('#inventory_select_their_inventory')?.click();
            document.querySelector('#inventory_select_your_inventory')?.click();

            const match = location.href.match(/for_tradingcard=(\d+)_/);
            if (!match) { return; }
            const filter = 'tag_filter_753_0_Game_app_' + match[1];
            setTimeout(() => W.TradePageSelectInventory(W.UserYou, 753, 0), 5);
            var applyFilter = function () { return applyInventoryFilter(filter); };
            setTimeout(applyFilter, 500);
            document.querySelectorAll('#inventory_select_their_inventory, #inventory_select_your_inventory').forEach(element => element.addEventListener('click', applyFilter));
        }, 500);
    };

    // ---- 路由分发 ----
    const routes = [
        [/^https?:\/\/steamcommunity\.com\/(id|profiles)\/.+\/gamecards\/[0-9]+/, badgePage],
        [/^https?:\/\/store\.steampowered\.com\/recommended\/friendactivity/, friendActivityPage],
        [/^https?:\/\/steamcommunity\.com\/market\/listings\/.+/, marketListingPage],
        [/^https?:\/\/steamcommunity\.com\/market\/search\?.+/, marketSearchPage],
        [/^https?:\/\/store\.steampowered\.com\/agecheck\/app\/[0-9]+\//, ageCheckPage],
        [/^https?:\/\/steamcommunity\.com\/(id|profiles)\/.+\/friends/, friendsPage],
        [/^https?:\/\/steamcommunity\.com\/(id|profiles)\/.+\/inventory/, inventoryPage],
        [/^https?:\/\/steamcommunity\.com\/tradeoffer\/.+/, tradeOfferPage]
    ];
    const route = routes.find(([pattern]) => pattern.test(location.href));
    if (route) { route[1](); }

    // 徽章页额外跨域加载 SteamCardExchange 数据
    const badgeMatch = location.href.match(/^https?:\/\/steamcommunity\.com\/(id|profiles)\/.+\/gamecards\/([0-9]+)/);
    if (badgeMatch) {
        gmGet('https://www.steamcardexchange.net/index.php?gamepage-appid-' + badgeMatch[2])
            .then(processBadges)
            .catch(console.error);
    }

    // ---- 语言与文案 ----
    function detectLanguage() {
        const cookieMatch = document.cookie.match(/(?:^|; )Steam_Language=([^;]*)/);
        if (cookieMatch) { return decodeURIComponent(cookieMatch[1]); }
        const headMatch = document.head.innerHTML.match(/l=([a-z]+)/);
        return headMatch ? headMatch[1] : '';
    }

    function messages(language) {
        const en = {
            Market: "View in Market",
            MarketAll: "All",
            MarketCard: "Card",
            MarketBackground: "Background",
            MarketEmoticon: "Emoticon",
            Inventory: "View in My Inventory",
            Showcase: "Card Showcase",
            EditBKG: "Edit Background",
            BKGTips: "Please enter your background image link:\n(resolution:1920x1200)",
            SearchFriends: "Search Friends",
            WebChat: "Web Chat",
            OneClickBuying: "1-Click buying",
            ViewMarket: "View in Market",
            SellItem: "Sell",
            BKGAlert: "Please set a background in edit profile page first!",
            ViewBKG: "View Background",
            ViewBKGSign: "Profile Background",
            LibrarySearch: "Advanced Search",
            BatchBuyCard: "Batch Buy Cards (Beta, Use at Your Own Risk)",
            BatchBuyBtn: "Batch Buy",
            BatchBuyConfirm: "Batch Buy Confirmation",
            BatchBuyMessage: "Your current buy orders will be canceled. Please keep this window open while placing orders. And you need to pay at most ",
            BatchBuyCheck: "Fail to fetch market info. You may need to open the market page of any card and try again",
            Confirm: "Confirm",
            Cancel: "Cancel",
            Name: "Name",
            Demand: "Demand",
            Supply: "Supply",
            Order: "Order",
            Owned: "Owned",
            Loading: "Loading...",
            TargetLevel: "Target Level",
            CurrentLevel: "Current Level",
            BoosterPack: "Booster Pack",
            ThreeCardAvg: "Three Cards",
            Fail: "Fail",
            BatchBuyModes: ["Buy Them Now", "Lowest Sell", "Highest Buy +0.01", "Highest Buy", "Second Buy", "Lowest"]
        };

        const localized = {
            schinese: {
                Market: "在“市场”中查看",
                MarketAll: "全部",
                MarketCard: "卡牌",
                MarketBackground: "背景",
                MarketEmoticon: "表情",
                Inventory: "在我的“库存”中查看",
                Showcase: "卡片展示橱窗",
                EditBKG: "编辑背景图",
                BKGTips: "请输入你的背景图链接:\n(分辨率:1920x1200)",
                SearchFriends: "搜索好友",
                WebChat: "网页聊天",
                OneClickBuying: "一键购买",
                ViewMarket: "在市场中查看",
                SellItem: "出售",
                BKGAlert: "请先在编辑个人资料页面设置一个背景！",
                ViewBKG: "查看背景图",
                ViewBKGSign: "个人资料背景",
                LibrarySearch: "高级搜索",
                BatchBuyCard: "批量购买卡牌（测试中，风险自负）",
                BatchBuyBtn: "批量下单",
                BatchBuyConfirm: "批量购买确认",
                BatchBuyMessage: "请注意，你目前已有的订购单会被取消。下单需要一段时间，请不要关闭窗口。本次批量下单的总金额为：",
                BatchBuyCheck: "无法获取市场信息，你可能需要先打开某张卡片的市场页面，再重新尝试本功能",
                Confirm: "确认",
                Cancel: "取消",
                Name: "名称",
                Demand: "需要",
                Supply: "供给",
                Order: "订单",
                Owned: "已有",
                Loading: "加载中...",
                TargetLevel: "目标等级",
                CurrentLevel: "当前等级",
                BoosterPack: "补充包",
                ThreeCardAvg: "三张卡",
                Fail: "出错",
                BatchBuyModes: ["尽快买齐", "最低卖价", "最高买价 +0.01", "最高买价", "第二买价", "最低出价"]
            },
            tchinese: {
                Market: "在“市集”中查看",
                MarketAll: "全部",
                MarketCard: "卡片",
                MarketBackground: "背景",
                MarketEmoticon: "表情",
                Inventory: "在我的“物品庫”中查看",
                Showcase: "卡片展示櫥窗",
                EditBKG: "編輯背景圖",
                BKGTips: "請輸入你的背景圖連結:\n(解析度:1920x1200)",
                SearchFriends: "搜索好友",
                WebChat: "網頁聊天",
                OneClickBuying: "一鍵購買",
                ViewMarket: "在市場中查看",
                SellItem: "販賣",
                BKGAlert: "請先在編輯個人檔案頁面設置一個背景！",
                ViewBKG: "查看背景圖",
                ViewBKGSign: "個人檔案背景",
                LibrarySearch: "高级搜索",
                BatchBuyCard: "批量購買卡牌（測試中，風險自負）",
                BatchBuyBtn: "批量下單",
                BatchBuyConfirm: "批量購買確認",
                BatchBuyMessage: "請注意，你目前已有的買單會被取消。下單需要一段時間，請不要關閉窗口。買單的總金額爲：",
                BatchBuyCheck: "無法獲取市場信息，你可能需要先打開某張卡片的市場頁面，再重新嘗試本功能",
                Confirm: "確認",
                Cancel: "取消",
                Name: "名稱",
                Demand: "需要",
                Supply: "供給",
                Order: "訂單",
                Owned: "已有",
                Loading: "加載中...",
                TargetLevel: "目標等級",
                CurrentLevel: "當前等級",
                BoosterPack: "補充包",
                ThreeCardAvg: "三張卡",
                Fail: "出錯",
                BatchBuyModes: ["儘快買齊", "最低賣價", "最高買價 +0.01", "最高買價", "第二買價", "最低出價"]
            }
        };

        return Object.assign({}, en, localized[language] || {});
    }
})();
