// ==UserScript==
// @name         Steam Store BundleList
// @namespace    https://github.com/sffxzzp
// @icon         https://store.steampowered.com/favicon.ico
// @author       sffxzzp & GPT-5.5-Codex & GPT-6-Luna
// @version      1.0.6
// @description  Show every bundle from the current app BundleList on the app StorePage, sorted by discount percentage.
// @match        https://store.steampowered.com/app/*
// @run-at       document-idle
// @grant        none
// @updateURL    https://github.com/sffxzzp/userscripts/raw/master/steam/steamstorebundlelist.user.js
// @downloadURL  https://github.com/sffxzzp/userscripts/raw/master/steam/steamstorebundlelist.user.js
// ==/UserScript==

(() => {
    'use strict';

    var SteamBundleList = function () {
        var SECTION_ID = 'tm_bundlelist_discount_sorted';
        var SORT_CONTROL_ID = `${SECTION_ID}_sort`;
        var SORT_OPTIONS = [
            { value: 'name', key: 'sort_name' },
            { value: 'bundle_discount', key: 'sort_bundle_discount' },
            { value: 'total_discount', key: 'sort_total_discount' },
            { value: 'price', key: 'sort_price' },
        ];
        var TRANSLATIONS = {
            'zh-CN': {
                sort_name: '名称',
                sort_bundle_discount: '额外折扣',
                sort_total_discount: '总折扣',
                sort_price: '价格',
                section_title: '捆绑包',
                sort_label: '排序',
                loading: '正在读取 BundleList...',
                extra_discount: (value) => `额外 -${value}%`,
                item_count: (count) => `${count} 个项目`,
                bundle_discount: (value) => `捆绑包额外折扣 ${value}%`,
                details: '详情',
                add_to_cart: '加入购物车',
            },
            'zh-TW': {
                sort_name: '名稱',
                sort_bundle_discount: '額外折扣',
                sort_total_discount: '總折扣',
                sort_price: '價格',
                section_title: '組合包',
                sort_label: '排序',
                loading: '正在讀取 BundleList...',
                extra_discount: (value) => `額外 -${value}%`,
                item_count: (count) => `${count} 個項目`,
                bundle_discount: (value) => `組合包額外折扣 ${value}%`,
                details: '詳情',
                add_to_cart: '加入購物車',
            },
            en: {
                sort_name: 'Name',
                sort_bundle_discount: 'Extra discount',
                sort_total_discount: 'Total discount',
                sort_price: 'Price',
                section_title: 'Bundles',
                sort_label: 'Sort',
                loading: 'Loading BundleList...',
                extra_discount: (value) => `Extra -${value}%`,
                item_count: (count) => `${count} item${count === 1 ? '' : 's'}`,
                bundle_discount: (value) => `Bundle discount ${value}%`,
                details: 'Details',
                add_to_cart: 'Add to cart',
            },
        };
        var currentSort = 'bundle_discount';
        var bundles = [];
        var section = null;

        var getCurrentAppId = function () {
            var match = location.pathname.match(/^\/app\/(\d+)(?:\/|$)/);
            return match ? match[1] : '';
        };

        var getLanguage = function () {
            var candidates = [window.g_strLanguage, document.documentElement.lang];
            for (var candidate of candidates) {
                var value = String(candidate || '').trim().toLowerCase().replace(/_/g, '-');
                if (value === 'schinese' || value === 'zh' || value.startsWith('zh-cn') || value.startsWith('zh-hans')) { return 'zh-CN'; }
                if (value === 'tchinese' || value.startsWith('zh-tw') || value.startsWith('zh-hant') || value.startsWith('zh-hk') || value.startsWith('zh-mo')) { return 'zh-TW'; }
                if (value === 'english' || value === 'en' || value.startsWith('en-')) { return 'en'; }
            }
            return 'en';
        };

        var appId = getCurrentAppId();
        var language = getLanguage();
        var text = TRANSLATIONS[language];

        var css = `
            #${SECTION_ID} {
                margin: 18px 0;
            }

            #${SECTION_ID} .tm_bundle_header {
                align-items: center;
                color: #fff;
                display: flex;
                font-size: 20px;
                font-weight: 400;
                gap: 12px;
                justify-content: space-between;
                margin: 0 0 8px;
                text-transform: uppercase;
            }

            #${SECTION_ID} .tm_bundle_sort {
                align-items: center;
                display: flex;
                flex-shrink: 0;
                font-size: 12px;
                gap: 8px;
                text-transform: none;
                white-space: nowrap;
            }

            #${SECTION_ID} .tm_bundle_sort_label { color: #c7d5e0; font-weight: 600; }
            #${SECTION_ID} .tm_bundle_sort select {
                appearance: none;
                background:
                    linear-gradient(45deg, transparent 50%, #c7d5e0 50%) right 13px center / 5px 5px no-repeat,
                    linear-gradient(135deg, #c7d5e0 50%, transparent 50%) right 8px center / 5px 5px no-repeat,
                    linear-gradient(180deg, #23384a 0%, #172737 100%);
                border: 1px solid rgba(103, 193, 245, 0.22);
                border-radius: 2px;
                box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.03);
                color: #dfe3e6;
                cursor: pointer;
                font-size: 13px;
                height: 28px;
                min-width: 104px;
                padding: 0 28px 0 10px;
            }

            #${SECTION_ID} .tm_bundle_sort select:hover { border-color: rgba(103, 193, 245, 0.48); color: #fff; }
            #${SECTION_ID} .tm_bundle_sort select option { background: #172737; color: #dfe3e6; }
            #${SECTION_ID} .tm_bundle_status { background: rgba(0, 0, 0, 0.22); color: #acb2b8; padding: 12px; }

            #${SECTION_ID} .tm_bundle_card {
                align-items: center;
                background: rgba(0, 0, 0, 0.22);
                border-bottom: 1px solid rgba(255, 255, 255, 0.06);
                color: #c7d5e0;
                display: grid;
                grid-template-columns: 231px minmax(0, 1fr) auto;
                min-height: 88px;
                text-decoration: none;
            }

            #${SECTION_ID} .tm_bundle_card:hover { background: rgba(102, 192, 244, 0.16); color: #fff; text-decoration: none; }
            #${SECTION_ID} .tm_bundle_capsule { background: rgba(0, 0, 0, 0.25); height: 87px; object-fit: cover; width: 231px; }

            #${SECTION_ID} .tm_bundle_info {
                display: flex;
                flex-direction: column;
                justify-content: center;
                min-width: 0;
                padding: 12px 14px;
            }

            #${SECTION_ID} .tm_bundle_name { color: #fff; font-size: 16px; line-height: 21px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
            #${SECTION_ID} .tm_bundle_meta { color: #8f98a0; font-size: 12px; margin-top: 6px; }
            #${SECTION_ID} .tm_bundle_meta strong { color: #a4d007; }
            #${SECTION_ID} .tm_bundle_purchase { align-items: center; display: flex; gap: 8px; justify-content: flex-end; padding-right: 12px; }
            #${SECTION_ID} .tm_bundle_discount { align-items: center; background: #4c6b22; color: #a4d007; display: flex; font-size: 26px; min-height: 38px; padding: 0 8px; }
            #${SECTION_ID} .tm_bundle_discount_extra { font-size: 18px; white-space: nowrap; }
            #${SECTION_ID} .tm_bundle_prices { min-width: 82px; text-align: right; }
            #${SECTION_ID} .tm_bundle_original { color: #738895; font-size: 11px; line-height: 12px; text-decoration: line-through; }
            #${SECTION_ID} .tm_bundle_final { color: #c7d5e0; font-size: 13px; line-height: 16px; }
            #${SECTION_ID} .tm_bundle_actions { display: flex; flex-direction: column; gap: 6px; min-width: 92px; }
            #${SECTION_ID} .tm_bundle_actions a { text-align: center; }

            @media screen and (max-width: 700px) {
                #${SECTION_ID} .tm_bundle_card { grid-template-columns: 180px minmax(0, 1fr); }
                #${SECTION_ID} .tm_bundle_capsule { height: 68px; width: 180px; }
                #${SECTION_ID} .tm_bundle_purchase { grid-column: 1 / -1; justify-self: end; }
                #${SECTION_ID} .tm_bundle_actions a:first-child { display: none; }
            }
        `;

        var parseSsrRoots = function (html) {
            var doc = new DOMParser().parseFromString(html, 'text/html');
            var roots = [];
            doc.querySelectorAll('script[type="application/json"]').forEach((script) => {
                var raw = (script.textContent || '').trim().replace(/^<!--/, '').replace(/-->$/, '');
                if (!raw) { return; }
                try { roots.push(JSON.parse(raw)); } catch (_error) { /* Ignore malformed SSR data. */ }
            });

            var regex = /JSON\.parse\("((?:\\.|[^"\\])*)"\)/g;
            for (var script of doc.scripts) {
                if (script.type === 'application/json') { continue; }
                regex.lastIndex = 0;
                var match;
                while ((match = regex.exec(script.textContent || '')) !== null) {
                    try { roots.push(JSON.parse(`"${match[1]}"`)); } catch (_error) { /* Ignore unrelated JSON.parse calls. */ }
                }
            }
            return roots;
        };

        var collectQueries = function (roots) {
            var queries = [];
            var seen = new WeakSet();
            var visit = function (value) {
                if (value == null) { return; }
                if (typeof value === 'string') {
                    var source = value.trim();
                    if (source[0] !== '{' && source[0] !== '[') { return; }
                    try { visit(JSON.parse(source)); } catch (_error) { /* Ignore non-JSON strings. */ }
                    return;
                }
                if (Array.isArray(value)) {
                    value.forEach((item) => visit(item));
                    return;
                }
                if (typeof value !== 'object') { return; }
                if (Array.isArray(value.queryKey) && value.state) {
                    if (!seen.has(value)) { seen.add(value); queries.push(value); }
                    return;
                }
                if (Array.isArray(value.queries)) { visit(value.queries); }
                ['queryData', 'renderContext', 'dehydratedState', 'loaderData'].forEach((key) => {
                    if (value[key] !== undefined) { visit(value[key]); }
                });
            };
            visit(roots);
            return queries;
        };

        var extractBundles = function (html) {
            var items = new Map();
            var assets = new Map();
            collectQueries(parseSsrRoots(html)).forEach((query) => {
                var itemKey = query.queryKey[1];
                var include = query.queryKey[2];
                var data = query.state.data;
                if (typeof itemKey !== 'string' || !itemKey.startsWith('bundle_') || !data || data.success === false) { return; }
                var id = Number(itemKey.replace('bundle_', ''));
                if (!Number.isFinite(id)) { return; }
                if (include === 'default_info' && data.best_purchase_option) { items.set(id, data); } else if (include === 'include_assets') { assets.set(id, data); }
            });

            return Array.from(items.values()).map((item, index) => ({
                id: item.id,
                name: item.name || `Bundle ${item.id}`,
                url: `https://store.steampowered.com/${item.store_url_path || `bundle/${item.id}/`}`,
                includedGameCount: Array.isArray(item.included_appids) ? item.included_appids.length : Number(item.best_purchase_option.included_game_count || 0),
                option: item.best_purchase_option,
                asset: assets.get(item.id) || {},
                originalIndex: index,
            }));
        };

        var getPriceCents = function (bundle) {
            var value = Number(bundle.option.final_price_in_cents);
            return Number.isFinite(value) ? value : Number.MAX_SAFE_INTEGER;
        };

        var sortBundles = function (items, sortKey) {
            return [...items].sort((a, b) => {
                var delta = 0;
                if (sortKey === 'name') { delta = a.name.localeCompare(b.name, language, { numeric: true, sensitivity: 'base' }); }
                else if (sortKey === 'total_discount') { delta = Number(b.option.discount_pct || 0) - Number(a.option.discount_pct || 0); }
                else if (sortKey === 'price') { delta = getPriceCents(a) - getPriceCents(b); }
                else { delta = Number(b.option.bundle_discount_pct || 0) - Number(a.option.bundle_discount_pct || 0); }
                if (delta !== 0) { return delta; }
                var discountDelta = Number(b.option.discount_pct || 0) - Number(a.option.discount_pct || 0);
                if (discountDelta !== 0) { return discountDelta; }
                return a.originalIndex - b.originalIndex;
            });
        };

        var assetUrl = function (asset, filenameKey) {
            if (!asset.asset_url_format || !asset[filenameKey]) { return ''; }
            return `https://shared.fastly.steamstatic.com/store_item_assets/${asset.asset_url_format.replace('${FILENAME}', asset[filenameKey])}`;
        };

        var escapeHtml = function (value) {
            return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
        };

        var renderBundle = function (bundle) {
            var option = bundle.option;
            var discount = option.discount_pct == null ? null : Number(option.discount_pct);
            var bundleDiscount = Number(option.bundle_discount_pct || 0);
            var discountLabel = discount == null ? text.extra_discount(bundleDiscount) : `-${discount}%`;
            var discountClass = discount == null ? 'tm_bundle_discount tm_bundle_discount_extra' : 'tm_bundle_discount';
            var image = assetUrl(bundle.asset, 'small_capsule') || assetUrl(bundle.asset, 'header');
            var meta = [
                bundle.includedGameCount ? escapeHtml(text.item_count(bundle.includedGameCount)) : '',
                bundleDiscount ? `<strong>${escapeHtml(text.bundle_discount(bundleDiscount))}</strong>` : '',
            ].filter(Boolean).join(' · ');
            var imageHtml = image ? `<img class="tm_bundle_capsule" src="${escapeHtml(image)}" alt="">` : '<div class="tm_bundle_capsule"></div>';
            var originalPrice = option.formatted_original_price || option.formatted_price_before_bundle_discount || '';
            var originalPriceHtml = originalPrice ? `<div class="tm_bundle_original">${escapeHtml(originalPrice)}</div>` : '';

            return `
                <div class="tm_bundle_card" data-bundle-id="${bundle.id}">
                    <a href="${escapeHtml(bundle.url)}">${imageHtml}</a>
                    <a class="tm_bundle_info" href="${escapeHtml(bundle.url)}">
                        <div class="tm_bundle_name">${escapeHtml(bundle.name)}</div>
                        <div class="tm_bundle_meta">${meta}</div>
                    </a>
                    <div class="tm_bundle_purchase">
                        <div class="${discountClass}">${escapeHtml(discountLabel)}</div>
                        <div class="tm_bundle_prices">
                            ${originalPriceHtml}
                            <div class="tm_bundle_final">${escapeHtml(option.formatted_final_price || '')}</div>
                        </div>
                        <div class="tm_bundle_actions">
                            <a class="btn_blue_steamui btn_medium" href="${escapeHtml(bundle.url)}"><span>${escapeHtml(text.details)}</span></a>
                            <a class="btn_green_steamui btn_medium" href="javascript:addBundleToCart(${bundle.id});"><span>${escapeHtml(text.add_to_cart)}</span></a>
                        </div>
                    </div>
                </div>`;
        };

        var renderHeader = function () {
            var options = SORT_OPTIONS.map((option) => `<option value="${option.value}"${option.value === currentSort ? ' selected' : ''}>${text[option.key]}</option>`).join('');
            return `
                <h2 class="tm_bundle_header">
                    <span>${text.section_title}</span>
                    <label class="tm_bundle_sort">
                        <span class="tm_bundle_sort_label">${text.sort_label}</span>
                        <select id="${SORT_CONTROL_ID}">${options}</select>
                    </label>
                </h2>`;
        };

        var renderContent = function () {
            return `${renderHeader()}${sortBundles(bundles, currentSort).map(renderBundle).join('')}`;
        };

        var getInsertionPoint = function () {
            var purchaseArea = document.querySelector('#game_area_purchase');
            if (!purchaseArea) { return null; }
            var firstDlc = document.querySelector('#gameAreaDLCSection');
            return {
                purchaseArea: purchaseArea,
                before: firstDlc && firstDlc.parentElement === purchaseArea ? firstDlc : null,
                existingBundles: purchaseArea.querySelectorAll('.game_area_purchase_game_wrapper.dynamic_bundle_description'),
                bundleListLinks: purchaseArea.querySelectorAll(`a[href*="/bundlelist/${appId}"]`),
            };
        };

        var upsertSection = function (html) {
            var insertion = getInsertionPoint();
            if (!insertion) { return false; }
            insertion.existingBundles.forEach((node) => node.remove());
            insertion.bundleListLinks.forEach((node) => node.remove());
            if (!section) {
                section = document.createElement('div');
                section.id = SECTION_ID;
                section.addEventListener('change', (event) => {
                    if (event.target.id !== SORT_CONTROL_ID) { return; }
                    currentSort = event.target.value;
                    updateSection();
                });
                insertion.purchaseArea.insertBefore(section, insertion.before);
            }
            section.innerHTML = html;
            return true;
        };

        var updateSection = function () {
            if (!section) { return; }
            section.innerHTML = renderContent();
        };

        var addStyle = function () {
            if (document.getElementById(`${SECTION_ID}_style`)) { return; }
            var style = document.createElement('style');
            style.id = `${SECTION_ID}_style`;
            style.textContent = css;
            document.head.appendChild(style);
        };

        var init = function () {
            if (!appId) { return; }
            addStyle();
            upsertSection(`${renderHeader()}<div class="tm_bundle_status">${text.loading}</div>`);
            fetch(`https://store.steampowered.com/bundlelist/${appId}`, { credentials: 'include' })
                .then((response) => {
                    if (!response.ok) { throw new Error(`BundleList request failed: ${response.status}`); }
                    return response.text();
                })
                .then((html) => {
                    bundles = extractBundles(html);
                    if (!bundles.length) { throw new Error('No bundle data found in BundleList SSR data'); }
                    if (!upsertSection(renderContent())) { throw new Error('Cannot find StorePage purchase area'); }
                })
                .catch((error) => {
                    console.error('[Steam BundleList Discount Sort]', error);
                    if (section) { section.remove(); section = null; }
                });
        };

        return { init: init };
    }();

    SteamBundleList.init();
})();
