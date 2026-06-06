// ==UserScript==
// @name         Steam Wishlist Filter (React Version)
// @namespace    https://github.com/sffxzzp
// @version      1.01
// @description  Filter that displays wanted discounts level in the new React-based wishlist page.
// @author       sffxzzp & GPT-5.5-codex
// @match        *://store.steampowered.com/wishlist
// @match        *://store.steampowered.com/wishlist/*
// @icon         https://store.steampowered.com/favicon.ico
// @grant        none
// @run-at       document-start
// @updateURL    https://github.com/sffxzzp/userscripts/raw/master/steam/steamwishlistfilter.user.js
// @downloadURL  https://github.com/sffxzzp/userscripts/raw/master/steam/steamwishlistfilter.user.js
// ==/UserScript==

(function() {
    'use strict';

    const swfu = {
        parseDiscount(value) {
            const number = Number.parseInt(value, 10);
            return Number.isFinite(number) && number >= 1 && number <= 100 ? number : 0;
        },
        getDiscount(key) {
            return this.parseDiscount(localStorage.getItem(key) || '');
        },
        setDiscount(key, discount) {
            if (discount) { localStorage.setItem(key, String(discount)); }
            else { localStorage.removeItem(key); }
        },
        decodeBase64(value) {
            const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
            const padded = normalized + '='.repeat((4 - normalized.length % 4) % 4);
            return Uint8Array.from(atob(padded), char => char.charCodeAt(0));
        },
        encodeBase64(bytes) {
            const raw = Array.from(bytes, byte => String.fromCharCode(byte)).join('');
            return btoa(raw).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        },
        createNode(tag, props = {}, style = '') {
            const node = document.createElement(tag);
            Object.assign(node, props);
            if (style) { node.style.cssText = style; }
            return node;
        },
        onReady(callback) {
            if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', callback, { once: true }); }
            else { callback(); }
        }
    };

    class SWFWishlist {
        constructor() {
            this.controlId = 'swfilter-react-control';
            this.storageKey = 'swfilter_min_discount';
            this.endpoint = 'GetWishlistSortedFiltered';
            this.queryKeys = ['WishlistSortedFiltered', 'WishlistAppData'];
            this.discountMarker = [0x2a, 0x03, 0xa8, 0x01];
            this.active = false;
            this.lastNativeDiscount = '';
            this.setFilters = null;
            this.queryClient = null;
            this.uiSyncTimer = 0;
        }

        run() {
            this.active = Boolean(this.discount);
            this.installFetchPatch();
            this.installReactHook();
            this.observePage();
            swfu.onReady(() => this.injectControl());
        }

        get discount() {
            return swfu.getDiscount(this.storageKey);
        }

        set discount(value) {
            swfu.setDiscount(this.storageKey, value);
            this.active = Boolean(value);
        }

        installFetchPatch() {
            const originalFetch = window.fetch;
            window.fetch = (input, init) => {
                const rawUrl = typeof input === 'string' ? input : input && input.url;
                const patchedUrl = this.patchRequestUrl(rawUrl);
                const nextInput = typeof input === 'string'
                    ? patchedUrl
                    : input instanceof Request && patchedUrl !== rawUrl
                    ? new Request(patchedUrl, input)
                    : input;
            return originalFetch.call(window, nextInput, init).then(response => {
                if (rawUrl && rawUrl.includes(this.endpoint)) { this.scheduleUiSync(); }
                return response;
            });
        };
        }

        patchRequestUrl(rawUrl) {
            if (!this.active || !this.discount || typeof rawUrl !== 'string' || !rawUrl.includes(this.endpoint)) { return rawUrl; }
            try {
                const url = new URL(rawUrl, location.href);
                for (const [key, value] of url.searchParams.entries()) {
                    const bytes = this.tryDecode(value);
                    if (bytes && this.replaceNativeDiscount(bytes)) {
                        url.searchParams.set(key, swfu.encodeBase64(bytes));
                        return url.toString();
                    }
                }
            } catch {}
            return rawUrl;
        }

        tryDecode(value) {
            if (!value || value.length < 12) { return null; }
            try {
                return swfu.decodeBase64(value);
            } catch {
                return null;
            }
        }

        replaceNativeDiscount(bytes) {
            for (let i = 0; i <= bytes.length - this.discountMarker.length - 1; i++) {
                if (!this.discountMarker.every((byte, offset) => bytes[i + offset] === byte)) { continue; }

                const valueIndex = i + this.discountMarker.length;
                if (bytes[valueIndex] === 50 || bytes[valueIndex] === 75) {
                    bytes[valueIndex] = this.discount;
                    return true;
                }
            }
            return false;
        }

        installReactHook() {
            const hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
            if (hook && hook._swfilterWrapped) { return; }
            if (hook) {
                const originalCommit = hook.onCommitFiberRoot;
                hook.onCommitFiberRoot = (rendererID, root, ...args) => {
                    window.setTimeout(() => this.inspectFiberRoot(root), 0);
                    if (originalCommit) { return originalCommit.apply(hook, [rendererID, root, ...args]); }
                };
                hook._swfilterWrapped = true;
                return;
            }
            Object.defineProperty(window, '__REACT_DEVTOOLS_GLOBAL_HOOK__', {
                configurable: true,
                value: {
                    supportsFiber: true,
                    renderers: new Map(),
                    _swfilterWrapped: true,
                    inject(renderer) {
                        const id = this.renderers.size + 1;
                        this.renderers.set(id, renderer);
                        return id;
                    },
                    onCommitFiberRoot: (rendererID, root) => {
                        window.setTimeout(() => this.inspectFiberRoot(root), 0);
                    }
                }
            });
        }

        inspectFiberRoot(root) {
            if (!root || !root.current) { return; }
            const stack = [root.current];
            const visited = new Set();
            while (stack.length > 0) {
                const node = stack.pop();
                if (!node || visited.has(node)) { continue; }
                visited.add(node);
                this.capture(node.memoizedProps);
                if (node.child) { stack.push(node.child); }
                if (node.sibling) { stack.push(node.sibling); }
            }
        }

        capture(props) {
            if (!props) { return; }
            if (props.client && typeof props.client.invalidateQueries === 'function') { this.queryClient = props.client; }
            if (Object.prototype.hasOwnProperty.call(props, 'strMinDiscount')) {
                this.lastNativeDiscount = props.strMinDiscount;
                if (typeof props.setFilters === 'function') { this.setFilters = props.setFilters; }
            }
        }

        clearCache() {
            if (!this.queryClient) { return; }
            for (const queryKey of this.queryKeys) {
                try {
                    if (typeof this.queryClient.removeQueries === 'function') { this.queryClient.removeQueries({ queryKey: [queryKey], exact: false }); }
                    this.queryClient.invalidateQueries({ queryKey: [queryKey], exact: false });
                } catch {}
            }
        }

        apply(value) {
            const discount = swfu.parseDiscount(value);
            this.discount = discount;
            this.updateUrl(discount);
            if (!this.setFilters) { return; }
            this.clearCache();
            if (discount) {
                const nativeDiscount = this.lastNativeDiscount === '50' ? '75' : '50';
                this.setFilters(filters => ({ ...filters, strMinDiscount: nativeDiscount }));
                this.scheduleUiSync();
            } else {
                this.setFilters(filters => ({ ...filters, strMinDiscount: '' }));
            }
        }

        updateUrl(discount) {
            const url = new URL(location.href);
            if (discount) { url.searchParams.set('sw_min_discount', String(discount)); }
            else { url.searchParams.delete('sw_min_discount'); }
            history.replaceState(history.state, document.title, url.toString());
        }

        injectControl() {
            if (!document.body || document.getElementById(this.controlId)) { return; }
            const control = swfu.createNode('div', { id: this.controlId }, 'position:fixed;right:16px;top:96px;z-index:2147483647;display:flex;gap:6px;align-items:center;padding:8px;background:#171a21;border:1px solid #3d4450;color:#c7d5e0;box-shadow:0 2px 12px rgba(0,0,0,.35);font:13px Arial,sans-serif');
            const input = swfu.createNode('input', {
                type: 'number',
                min: '1',
                max: '100',
                placeholder: '折扣',
                value: localStorage.getItem(this.storageKey) || new URL(location.href).searchParams.get('sw_min_discount') || ''
            }, 'width:64px;background:#0e141b;border:1px solid #445468;color:#fff;padding:5px 7px');
            const suffix = swfu.createNode('span', { textContent: '%+' });
            const applyButton = swfu.createNode('button', { type: 'button', textContent: '过滤' }, 'background:#316282;border:0;color:#fff;padding:6px 10px;cursor:pointer');
            const clearButton = swfu.createNode('button', { type: 'button', textContent: '清除' }, 'background:#3b4350;border:0;color:#fff;padding:6px 10px;cursor:pointer');
            applyButton.addEventListener('click', () => this.apply(input.value));
            clearButton.addEventListener('click', () => {
                input.value = '';
                this.apply('');
            });
            input.addEventListener('keydown', event => {
                if (event.key === 'Enter') { this.apply(input.value); }
            });
            control.append(input, suffix, applyButton, clearButton);
            document.body.appendChild(control);
        }

        scheduleUiSync() {
            if (this.uiSyncTimer) { return; }
            this.uiSyncTimer = window.setTimeout(() => {
                this.uiSyncTimer = 0;
                this.syncUiText();
            }, 50);
        }

        syncUiText() {
            if (!this.discount || !document.body) { return; }
            const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
                acceptNode: node => {
                    if (node.parentElement && node.parentElement.closest(`#${this.controlId}`)) { return NodeFilter.FILTER_REJECT; }
                    const text = node.nodeValue || '';
                    return text.length <= 80 && /\b\d{1,3}\s*%/.test(text) && !/-\s*\d{1,3}\s*%/.test(text)
                        ? NodeFilter.FILTER_ACCEPT
                        : NodeFilter.FILTER_REJECT;
                }
            });
            const nodes = [];
            while (walker.nextNode()) {
                nodes.push(walker.currentNode);
            }
            for (const node of nodes) {
                const nextText = node.nodeValue.replace(/(^|[^\-])\b(?:[1-9]\d?|100)\s*%/g, `$1${this.discount}%`);
                if (nextText !== node.nodeValue) { node.nodeValue = nextText; }
            }
        }

        observePage() {
            new MutationObserver(() => {
                this.injectControl();
                this.scheduleUiSync();
            }).observe(document.documentElement, {
                childList: true,
                subtree: true
            });
        }
    }

    const swf = new SWFWishlist();
    swf.run();
})();
