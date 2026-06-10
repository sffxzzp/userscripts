// ==UserScript==
// @name         Steam Store BundleList
// @namespace    https://github.com/sffxzzp
// @icon         https://store.steampowered.com/favicon.ico
// @author       sffxzzp & GPT-5.5-codex
// @version      1.0.3
// @description  Show every bundle from the current app BundleList on the app StorePage, sorted by discount percentage.
// @match        https://store.steampowered.com/app/*
// @run-at       document-idle
// @grant        none
// @updateURL    https://github.com/sffxzzp/userscripts/raw/master/steam/steamstorebundlelist.user.js
// @downloadURL  https://github.com/sffxzzp/userscripts/raw/master/steam/steamstorebundlelist.user.js
// ==/UserScript==

(function () {
    'use strict';

    const APP_ID = getCurrentAppId();
    const BUNDLELIST_URL = `https://store.steampowered.com/bundlelist/${APP_ID}`;
    const SECTION_ID = 'tm_bundlelist_discount_sorted';
    const SORT_CONTROL_ID = `${SECTION_ID}_sort`;
    const SORT_OPTIONS = [
        { value: 'name', label: '名称' },
        { value: 'bundle_discount', label: '额外折扣' },
        { value: 'total_discount', label: '总折扣' },
        { value: 'price', label: '价格' },
    ];
    let currentSort = 'bundle_discount';

    if (!APP_ID) {
        return;
    }

    function getCurrentAppId() {
        const match = location.pathname.match(/^\/app\/(\d+)(?:\/|$)/);
        return match ? match[1] : '';
    }

    const css = `
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

    #${SECTION_ID} .tm_bundle_sort_label {
      color: #c7d5e0;
      font-weight: 600;
    }

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

    #${SECTION_ID} .tm_bundle_sort select:hover {
      border-color: rgba(103, 193, 245, 0.48);
      color: #fff;
    }

    #${SECTION_ID} .tm_bundle_sort select option {
      background: #172737;
      color: #dfe3e6;
    }

    #${SECTION_ID} .tm_bundle_status {
      background: rgba(0, 0, 0, 0.22);
      color: #acb2b8;
      padding: 12px;
    }

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

    #${SECTION_ID} .tm_bundle_card:hover {
      background: rgba(102, 192, 244, 0.16);
      color: #fff;
      text-decoration: none;
    }

    #${SECTION_ID} .tm_bundle_capsule {
      background: rgba(0, 0, 0, 0.25);
      height: 87px;
      object-fit: cover;
      width: 231px;
    }

    #${SECTION_ID} .tm_bundle_info {
      display: flex;
      flex-direction: column;
      justify-content: center;
      min-width: 0;
      padding: 12px 14px;
    }

    #${SECTION_ID} .tm_bundle_name {
      color: #fff;
      font-size: 16px;
      line-height: 21px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    #${SECTION_ID} .tm_bundle_meta {
      color: #8f98a0;
      font-size: 12px;
      margin-top: 6px;
    }

    #${SECTION_ID} .tm_bundle_meta strong {
      color: #a4d007;
    }

    #${SECTION_ID} .tm_bundle_purchase {
      align-items: center;
      display: flex;
      gap: 8px;
      justify-content: flex-end;
      padding-right: 12px;
    }

    #${SECTION_ID} .tm_bundle_discount {
      align-items: center;
      background: #4c6b22;
      color: #a4d007;
      display: flex;
      font-size: 26px;
      min-height: 38px;
      padding: 0 8px;
    }

    #${SECTION_ID} .tm_bundle_discount_extra {
      font-size: 18px;
      white-space: nowrap;
    }

    #${SECTION_ID} .tm_bundle_prices {
      min-width: 82px;
      text-align: right;
    }

    #${SECTION_ID} .tm_bundle_original {
      color: #738895;
      font-size: 11px;
      line-height: 12px;
      text-decoration: line-through;
    }

    #${SECTION_ID} .tm_bundle_final {
      color: #c7d5e0;
      font-size: 13px;
      line-height: 16px;
    }

    #${SECTION_ID} .tm_bundle_actions {
      display: flex;
      flex-direction: column;
      gap: 6px;
      min-width: 92px;
    }

    #${SECTION_ID} .tm_bundle_actions a {
      text-align: center;
    }

    @media screen and (max-width: 700px) {
      #${SECTION_ID} .tm_bundle_card {
        grid-template-columns: 180px minmax(0, 1fr);
      }

      #${SECTION_ID} .tm_bundle_capsule {
        height: 68px;
        width: 180px;
      }

      #${SECTION_ID} .tm_bundle_purchase {
        grid-column: 1 / -1;
        justify-self: end;
      }

      #${SECTION_ID} .tm_bundle_actions a:first-child {
        display: none;
      }
    }

  `;

    function addStyle() {
        if (document.getElementById(`${SECTION_ID}_style`)) {
            return;
        }

        const style = document.createElement('style');
        style.id = `${SECTION_ID}_style`;
        style.textContent = css;
        document.head.appendChild(style);
    }

    function parseJsonParseCalls(html) {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const parsed = [];
        const re = /JSON\.parse\("((?:\\.|[^"\\])*)"\)/g;

        for (const script of doc.scripts) {
            const text = script.textContent || '';
            let match;
            while ((match = re.exec(text)) !== null) {
                try {
                    const jsonText = JSON.parse(`"${match[1]}"`);
                    const root = JSON.parse(jsonText);
                    parsed.push(root);

                    if (typeof root.queryData === 'string') {
                        parsed.push(JSON.parse(root.queryData));
                    }
                } catch (_err) {
                    // Some inline scripts contain small JSON.parse calls that are not SSR data.
                }
            }
        }

        return parsed;
    }

    function walk(value, visit) {
        if (!value || typeof value !== 'object') {
            return;
        }

        visit(value);

        if (Array.isArray(value)) {
            for (const item of value) {
                walk(item, visit);
            }
            return;
        }

        for (const key of Object.keys(value)) {
            walk(value[key], visit);
        }
    }

    function extractBundles(html) {
        const items = new Map();
        const assets = new Map();

        for (const root of parseJsonParseCalls(html)) {
            walk(root, (obj) => {
                if (!Array.isArray(obj.queryKey) || !obj.state || !obj.state.data) {
                    return;
                }

                const itemKey = obj.queryKey[1];
                const include = obj.queryKey[2];
                if (typeof itemKey !== 'string' || !itemKey.startsWith('bundle_')) {
                    return;
                }

                const id = Number(itemKey.replace('bundle_', ''));
                if (!Number.isFinite(id)) {
                    return;
                }

                if (include === 'default_info' && obj.state.data.best_purchase_option) {
                    items.set(id, obj.state.data);
                } else if (include === 'include_assets') {
                    assets.set(id, obj.state.data);
                }
            });
        }

        return Array.from(items.values())
            .map((item, index) => ({
            id: item.id,
            name: item.name || `Bundle ${item.id}`,
            url: `https://store.steampowered.com/${item.store_url_path || `bundle/${item.id}/`}`,
            includedGameCount: Array.isArray(item.included_appids)
            ? item.included_appids.length
            : Number(item.best_purchase_option.included_game_count || 0),
            option: item.best_purchase_option,
            asset: assets.get(item.id) || {},
            originalIndex: index,
        }));
    }

    function getPriceCents(bundle) {
        const value = Number(bundle.option.final_price_in_cents);
        return Number.isFinite(value) ? value : Number.MAX_SAFE_INTEGER;
    }

    function sortBundles(bundles, sortKey) {
        return [...bundles].sort((a, b) => {
            let delta = 0;

            if (sortKey === 'name') {
                delta = a.name.localeCompare(b.name, document.documentElement.lang || undefined, {
                    numeric: true,
                    sensitivity: 'base',
                });
            } else if (sortKey === 'total_discount') {
                delta = Number(b.option.discount_pct || 0) - Number(a.option.discount_pct || 0);
            } else if (sortKey === 'price') {
                delta = getPriceCents(a) - getPriceCents(b);
            } else {
                delta = Number(b.option.bundle_discount_pct || 0) - Number(a.option.bundle_discount_pct || 0);
            }

            if (delta !== 0) {
                return delta;
            }

            const discountDelta = Number(b.option.discount_pct || 0) - Number(a.option.discount_pct || 0);
            if (discountDelta !== 0) {
                return discountDelta;
            }

            return a.originalIndex - b.originalIndex;
        });
    }

    function assetUrl(asset, filenameKey) {
        if (!asset.asset_url_format || !asset[filenameKey]) {
            return '';
        }

        return `https://shared.fastly.steamstatic.com/store_item_assets/${asset.asset_url_format.replace(
            '${FILENAME}',
            asset[filenameKey],
        )}`;
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function renderBundle(bundle) {
        const option = bundle.option;
        const discount = option.discount_pct == null ? null : Number(option.discount_pct);
        const bundleDiscount = Number(option.bundle_discount_pct || 0);
        const discountLabel = discount == null ? `额外 -${bundleDiscount}%` : `-${discount}%`;
        const discountClass = discount == null ? 'tm_bundle_discount tm_bundle_discount_extra' : 'tm_bundle_discount';
        const discountValue = discount == null ? 0 : discount;
        const originalPrice = option.formatted_original_price || option.formatted_price_before_bundle_discount || '';
        const image = assetUrl(bundle.asset, 'small_capsule') || assetUrl(bundle.asset, 'header');
        const meta = [
            bundle.includedGameCount ? escapeHtml(`${bundle.includedGameCount} 个项目`) : '',
            bundleDiscount ? `<strong>${escapeHtml(`捆绑包额外折扣 ${bundleDiscount}%`)}</strong>` : '',
        ]
        .filter(Boolean)
        .join(' · ');

        return `
      <div class="tm_bundle_card" data-bundle-id="${bundle.id}" data-discount="${discountValue}">
        <a href="${escapeHtml(bundle.url)}">
          ${
        image
            ? `<img class="tm_bundle_capsule" src="${escapeHtml(image)}" alt="">`
        : '<div class="tm_bundle_capsule"></div>'
    }
        </a>
        <a class="tm_bundle_info" href="${escapeHtml(bundle.url)}">
          <div class="tm_bundle_name">${escapeHtml(bundle.name)}</div>
          <div class="tm_bundle_meta">${meta}</div>
        </a>
        <div class="tm_bundle_purchase">
          <div class="${discountClass}">${escapeHtml(discountLabel)}</div>
          <div class="tm_bundle_prices">
            ${
        originalPrice
            ? `<div class="tm_bundle_original">${escapeHtml(originalPrice)}</div>`
        : ''
    }
            <div class="tm_bundle_final">${escapeHtml(option.formatted_final_price || '')}</div>
          </div>
          <div class="tm_bundle_actions">
            <a class="btn_blue_steamui btn_medium" href="${escapeHtml(bundle.url)}"><span>详情</span></a>
            <a class="btn_green_steamui btn_medium" href="javascript:addBundleToCart(${bundle.id});"><span>加入购物车</span></a>
          </div>
        </div>
      </div>
    `;
    }

    function renderHeader() {
        const options = SORT_OPTIONS.map((option) => `
            <option value="${escapeHtml(option.value)}"${option.value === currentSort ? ' selected' : ''}>${escapeHtml(option.label)}</option>
        `).join('');

        return `
      <h2 class="tm_bundle_header">
        <span>捆绑包</span>
        <label class="tm_bundle_sort">
          <span class="tm_bundle_sort_label">排序</span>
          <select id="${SORT_CONTROL_ID}">${options}</select>
        </label>
      </h2>
    `;
    }

    function renderBundlesContent(bundles) {
        return `
      ${renderHeader()}
      ${sortBundles(bundles, currentSort).map(renderBundle).join('')}
    `;
    }

    function findInsertionPoint() {
        const purchaseArea = document.querySelector('#game_area_purchase');
        if (!purchaseArea) {
            return null;
        }

        const firstDlc = document.querySelector('#gameAreaDLCSection');
        const existingBundles = Array.from(
            purchaseArea.querySelectorAll('.game_area_purchase_game_wrapper.dynamic_bundle_description'),
        );
        const bundleListLinks = Array.from(purchaseArea.querySelectorAll(`a[href*="/bundlelist/${APP_ID}"]`));

        return {
            purchaseArea,
            before: firstDlc && firstDlc.parentElement === purchaseArea ? firstDlc : null,
            existingBundles,
            bundleListLinks,
        };
    }

    function upsertSection(html) {
        const insertion = findInsertionPoint();
        if (!insertion) {
            return false;
        }

        for (const node of insertion.existingBundles) {
            node.remove();
        }

        for (const node of insertion.bundleListLinks) {
            node.remove();
        }

        let section = document.getElementById(SECTION_ID);
        if (!section) {
            section = document.createElement('div');
            section.id = SECTION_ID;
            insertion.purchaseArea.insertBefore(section, insertion.before);
        }

        section.innerHTML = html;
        return true;
    }

    function hideSection() {
        const section = document.getElementById(SECTION_ID);
        if (section) {
            section.remove();
        }
    }

    function bindSortControl(bundles) {
        const select = document.getElementById(SORT_CONTROL_ID);
        if (!select) {
            return;
        }

        select.addEventListener('change', () => {
            currentSort = select.value;
            upsertSection(renderBundlesContent(bundles));
            bindSortControl(bundles);
        });
    }

    async function main() {
        addStyle();
        upsertSection(`${renderHeader()}<div class="tm_bundle_status">正在读取 BundleList...</div>`);

        const response = await fetch(BUNDLELIST_URL, { credentials: 'include' });
        if (!response.ok) {
            throw new Error(`BundleList request failed: ${response.status}`);
        }

        const html = await response.text();
        const bundles = extractBundles(html);
        if (!bundles.length) {
            throw new Error('No bundle data found in BundleList SSR data');
        }

        const content = renderBundlesContent(bundles);

        if (!upsertSection(content)) {
            throw new Error('Cannot find StorePage purchase area');
        }

        bindSortControl(bundles);
    }

    main().catch((err) => {
        console.error('[Steam BundleList Discount Sort]', err);
        hideSection();
    });
})();
