// ==UserScript==
// @name         Steam Market Show More (React Version)
// @namespace    https://github.com/sffxzzp
// @version      1.0
// @description  Show more price listings in the new React-based market page.
// @author       sffxzzp & Gemini 2.5 pro
// @match        *://steamcommunity.com/market/listings/*/*
// @icon         https://store.steampowered.com/favicon.ico
// @grant        unsafeWindow
// @updateURL    https://github.com/sffxzzp/userscripts/raw/master/steam/marketshowmore.user.js
// @downloadURL  https://github.com/sffxzzp/userscripts/raw/master/steam/marketshowmore.user.js
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // 需要显示的行数范围 0-100
    const NUM_ROWS_TO_SHOW = 20;
    const PATCH_INSTANCE_PROP_NAME = '_isPatchedByShowMoreScript';

    if (unsafeWindow.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
        return;
    }
    console.log("Steam Market Show More: Creating fake hook...");

    const fakeHook = {
        onCommitFiberRoot: function(rendererID, root, ...args) {
            // 在每次React提交渲染后，都尝试处理组件树
            setTimeout(() => processFiberRoot(root), 200);
        },
        inject: function(renderer) {
            const id = (fakeHook.renderers.size || 0) + 1;
            fakeHook.renderers.set(id, renderer);
            return id;
        },
        supportsFiber: true,
        renderers: new Map(),
    };
    Object.defineProperty(unsafeWindow, '__REACT_DEVTOOLS_GLOBAL_HOOK__', { value: fakeHook, configurable: true });

    function processFiberRoot(root) {
        const stack = [root.current];
        const visited = new Set();
        // 用一个集合来跟踪本轮渲染中已经打过补丁的组件定义，避免重复操作
        const patchedDefinitions = new Set();

        while (stack.length > 0) {
            const node = stack.pop();
            if (!node || visited.has(node)) continue;
            visited.add(node);

            const { type, memoizedProps } = node;

            if (memoizedProps && Array.isArray(memoizedProps.orders) && memoizedProps.hasOwnProperty('currency')) {
                const componentFunction = (type && type.type) ? type.type : type;
                if (!componentFunction || typeof componentFunction !== 'function') continue;

                // 如果这个组件定义在本轮提交中已经被处理过，就跳过
                if (patchedDefinitions.has(componentFunction)) continue;

                console.log(`Steam Market Show More: Found target component definition. Patching...`);

                const originalComponent = componentFunction;

                // 这是我们的包装组件
                const PatchedComponent = (props, ...args) => {
                    // 如果 props 没有被处理过，并且包含 orders 数组
                    if (!props[PATCH_INSTANCE_PROP_NAME] && props.orders && Array.isArray(props.orders)) {

                        const ordersProxy = new Proxy(props.orders, {
                            get(target, prop, receiver) {
                                if (prop === 'slice') {
                                    return function(start, end) {
                                        if (start === 0 && end === 6) {
                                            console.log(`Steam Market Show More: Intercepted .slice(0, 6), replacing with .slice(0, ${NUM_ROWS_TO_SHOW})`);
                                            return target.slice(0, NUM_ROWS_TO_SHOW);
                                        }
                                        return target.slice(start, end);
                                    };
                                }
                                return Reflect.get(target, prop, receiver);
                            }
                        });

                        // 创建一个新的 props 对象，包含代理和我们的标记
                        const newProps = {
                            ...props,
                            orders: ordersProxy,
                            [PATCH_INSTANCE_PROP_NAME]: true
                        };

                        // 使用新的 props 调用原始组件
                        return originalComponent.apply(this, [newProps, ...args]);
                    }

                    // 如果 props 已经被处理过，或者不符合条件，直接调用原始组件
                    return originalComponent.apply(this, [props, ...args]);
                };

                // 替换组件定义
                try {
                    if (type && type.type) {
                        type.type = PatchedComponent;
                    } else if (node.type && typeof node.type === 'function') {
                        node.type = PatchedComponent;
                    }
                } catch (e) {
                    console.error("Steam Market Show More: Failed to patch component type.", e);
                }

                // 将这个组件定义加入已处理列表
                patchedDefinitions.add(componentFunction);
                console.log("Steam Market Show More: Patch successful!");
            }

            if (node.child) stack.push(node.child);
            if (node.sibling) stack.push(node.sibling);
        }
    }
})();
