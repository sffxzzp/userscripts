// ==UserScript==
// @name         Steam Bundle Widget
// @namespace    https://github.com/sffxzzp
// @version      0.02
// @description  Add a steam like widget box to bundle links. modify @match to make it works for other sites.
// @author       sffxzzp
// @match        *://keylol.com/*
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand
// @grant        GM_getValue
// @grant        GM_setValue
// @connect      store.steampowered.com
// @icon         https://store.steampowered.com/favicon.ico
// @updateURL    https://github.com/sffxzzp/userscripts/raw/master/steam/steambundlewidget.user.js
// @downloadURL  https://github.com/sffxzzp/userscripts/raw/master/steam/steambundlewidget.user.js
// ==/UserScript==

(function() {
    var util = (function () {
        function util() {}
        util.xhr = function (xhrData) {
            return new Promise(function(resolve, reject) {
                if (!xhrData.xhr) {
                    var headers = xhrData.headers || {};
                    if (!headers["User-Agent"] && !headers["user-agent"]) {
                        headers["User-Agent"] = xhrData.ua || "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)";
                    }
                    GM_xmlhttpRequest({
                        method: xhrData.method || "get",
                        url: xhrData.url,
                        data: xhrData.data,
                        headers: headers,
                        responseType: xhrData.type || "",
                        timeout: 3e5,
                        anonymous: xhrData.anonymous !== false,
                        onload: function onload(res) {
                            return resolve({ response: res, body: res.response });
                        },
                        onerror: reject,
                        ontimeout: reject
                    });
                } else {
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
                }
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
    var sbw = (function () {
        var sbw = function () {};

        sbw.prototype.init = function () {
            this.CONFIG = {
                maxItems: 6,
                observeMutations: true,
                loadSteamCSS: true,
                uiLanguage: "auto",
                steamLanguage: "auto",
                region: "auto"
            };

            this.STRINGS = {
                "en": {
                    bundleLabel: "Bundle",
                    view: "View",
                    purchasePrefix: "Buy ",
                    includesItems: "Includes {count} items:",
                    yourPrice: "Your price:",
                    loading: "Loading bundle info…",
                    errorTitle: "Error",
                    errorDesc: "Unable to load this bundle info.",
                    menuSetRegion: "Set cc (region)…",
                    menuSetLanguage: "Set language…",
                    menuReset: "Reset cc/lang (auto)",
                    promptRegion: "Enter Steam cc (region), e.g. us, cn, jp:",
                    promptLanguage: "Enter Steam language, e.g. english, schinese:",
                    savedRegion: "Region saved:",
                    savedLanguage: "Language saved:",
                    resetDone: "Region/Language reset to auto."
                },
                "zh-CN": {
                    bundleLabel: "捆绑包",
                    view: "查看",
                    purchasePrefix: "购买 ",
                    includesItems: "包含 {count} 件物品：",
                    yourPrice: "您的价格：",
                    loading: "加载中…",
                    errorTitle: "错误",
                    errorDesc: "无法读取这件物品的信息。",
                    menuSetRegion: "设置 cc（地区）…",
                    menuSetLanguage: "设置 language…",
                    menuReset: "重置 cc/lang（自动）",
                    promptRegion: "请输入 Steam cc（地区），如 us、cn、jp：",
                    promptLanguage: "请输入 Steam 语言，如 english、schinese：",
                    savedRegion: "已保存地区：",
                    savedLanguage: "已保存语言：",
                    resetDone: "已重置为自动。"
                },
                "zh-TW": {
                    bundleLabel: "組合包",
                    view: "查看",
                    purchasePrefix: "購買 ",
                    includesItems: "包含 {count} 項物品：",
                    yourPrice: "您的價格：",
                    loading: "載入中…",
                    errorTitle: "錯誤",
                    errorDesc: "無法讀取這件物品的資訊。",
                    menuSetRegion: "設定 cc（地區）…",
                    menuSetLanguage: "設定 language…",
                    menuReset: "重置 cc/lang（自動）",
                    promptRegion: "請輸入 Steam cc（地區），如 us、cn、jp：",
                    promptLanguage: "請輸入 Steam 語言，如 english、schinese：",
                    savedRegion: "已儲存地區：",
                    savedLanguage: "已儲存語言：",
                    resetDone: "已重置為自動。"
                },
                "ja": {
                    bundleLabel: "バンドル",
                    view: "表示",
                    purchasePrefix: "購入 ",
                    includesItems: "{count} 個のアイテムを含む：",
                    yourPrice: "あなたの価格：",
                    loading: "読み込み中…",
                    errorTitle: "エラー",
                    errorDesc: "このバンドルの情報を取得できません。",
                    menuSetRegion: "cc（地域）を設定…",
                    menuSetLanguage: "language を設定…",
                    menuReset: "cc/lang を自動に戻す",
                    promptRegion: "Steam の cc（地域）を入力（例: us, cn, jp）:",
                    promptLanguage: "Steam の language を入力（例: english, schinese）:",
                    savedRegion: "地域を保存しました：",
                    savedLanguage: "言語を保存しました：",
                    resetDone: "自動に戻しました。"
                },
                "ru": {
                    bundleLabel: "Набор",
                    view: "Открыть",
                    purchasePrefix: "Купить ",
                    includesItems: "В наборе {count} товаров:",
                    yourPrice: "Ваша цена:",
                    loading: "Загрузка…",
                    errorTitle: "Ошибка",
                    errorDesc: "Не удалось загрузить информацию о наборе.",
                    menuSetRegion: "Задать cc (регион)…",
                    menuSetLanguage: "Задать language…",
                    menuReset: "Сбросить cc/lang (авто)",
                    promptRegion: "Введите Steam cc (регион), напр. us, cn, jp:",
                    promptLanguage: "Введите Steam language, напр. english, schinese:",
                    savedRegion: "Регион сохранён:",
                    savedLanguage: "Язык сохранён:",
                    resetDone: "Сброшено на авто."
                }
            };

            this.LOCALE_MAP = [
                { match: /^zh-cn/, ui: "zh-CN", steam: "schinese", region: "cn" },
                { match: /^(zh-tw|zh-hk)/, ui: "zh-TW", steam: "tchinese", region: "tw" },
                { match: /^ja/, ui: "ja", steam: "japanese", region: "jp" },
                { match: /^ko/, ui: "ko", steam: "koreana", region: "kr" },
                { match: /^ru/, ui: "ru", steam: "russian", region: "ru" },
                { match: /^fr/, ui: "fr", steam: "french", region: "fr" },
                { match: /^de/, ui: "de", steam: "german", region: "de" },
                { match: /^es/, ui: "es", steam: "spanish", region: "es" },
                { match: /^pt-br/, ui: "pt-BR", steam: "brazilian", region: "br" },
                { match: /^pt/, ui: "pt", steam: "portuguese", region: "pt" },
                { match: /^it/, ui: "it", steam: "italian", region: "it" },
                { match: /^pl/, ui: "pl", steam: "polish", region: "pl" },
                { match: /^tr/, ui: "tr", steam: "turkish", region: "tr" },
                { match: /^en-gb/, ui: "en", steam: "english", region: "gb" },
                { match: /^en/, ui: "en", steam: "english", region: "us" }
            ];

            this.BUNDLE_LINK_SELECTOR = "a[href*='store.steampowered.com/bundle/']";
            this.BUNDLE_URL_RE = /https?:\/\/store\.steampowered\.com\/bundle\/(\d+)/i;

            this.PREF_KEYS = { region: "sbw_region", language: "sbw_language" };

            this.bundleCache = new Map();
            this.processedLinks = new WeakSet();

            var locales = this.resolveLocales();
            this.uiLang = locales.uiLang;
            this.steamLang = locales.steamLang;
            this.region = locales.region;

            this.prefs = {
                region: this.getPref(this.PREF_KEYS.region, this.region),
                language: this.getPref(this.PREF_KEYS.language, this.steamLang)
            };

            var uiLangResolved = this.CONFIG.uiLanguage === "auto"
            ? this.mapUiLangFromSteam(this.prefs.language)
            : this.CONFIG.uiLanguage;
            this.uiLang = uiLangResolved;
            this.strings = this.STRINGS[this.uiLang] || this.STRINGS.en;
        };

        sbw.prototype.resolveLocales = function () {
            var raw = (navigator.language || "en").toLowerCase();
            var mapped = null;
            for (var i = 0; i < this.LOCALE_MAP.length; i++) {
                if (this.LOCALE_MAP[i].match.test(raw)) {
                    mapped = this.LOCALE_MAP[i];
                    break;
                }
            }
            if (!mapped) {
                mapped = { ui: "en", steam: "english", region: "us" };
            }

            var uiLang = this.CONFIG.uiLanguage === "auto" ? mapped.ui : this.CONFIG.uiLanguage;
            var steamLang = this.CONFIG.steamLanguage === "auto" ? mapped.steam : this.CONFIG.steamLanguage;
            var region = this.CONFIG.region === "auto" ? mapped.region : this.CONFIG.region;

            return { uiLang: uiLang, steamLang: steamLang, region: region };
        };

        sbw.prototype.mapUiLangFromSteam = function (steamLang) {
            var map = {
                schinese: "zh-CN",
                tchinese: "zh-TW",
                english: "en",
                japanese: "ja",
                russian: "ru"
            };
            return map[steamLang] || "en";
        };

        sbw.prototype.getPref = function (key, fallback) {
            var v = GM_getValue(key, "");
            return v ? v : fallback;
        };

        sbw.prototype.setPref = function (key, value) {
            if (value) { GM_setValue(key, value); }
        };

        sbw.prototype.clearPref = function (key) {
            GM_setValue(key, "");
        };

        sbw.prototype.refreshPage = function () {
            location.reload();
        };

        sbw.prototype.setupMenus = function () {
            if (typeof GM_registerMenuCommand !== "function") return;
            var self = this;

            GM_registerMenuCommand(this.strings.menuSetRegion, function () {
                var value = prompt(self.strings.promptRegion, self.prefs.region || "");
                if (value === null) return;
                var v = value.trim();
                if (!v) return;
                self.setPref(self.PREF_KEYS.region, v);
                alert(self.strings.savedRegion + " " + v);
                self.refreshPage();
            });

            GM_registerMenuCommand(this.strings.menuSetLanguage, function () {
                var value = prompt(self.strings.promptLanguage, self.prefs.language || "");
                if (value === null) return;
                var v = value.trim();
                if (!v) return;
                self.setPref(self.PREF_KEYS.language, v);
                alert(self.strings.savedLanguage + " " + v);
                self.refreshPage();
            });

            GM_registerMenuCommand(this.strings.menuReset, function () {
                self.clearPref(self.PREF_KEYS.region);
                self.clearPref(self.PREF_KEYS.language);
                alert(self.strings.resetDone);
                self.refreshPage();
            });
        };

        sbw.prototype.extractBundleId = function (href) {
            if (!href) return null;
            var match = href.match(this.BUNDLE_URL_RE);
            return match ? match[1] : null;
        };

        sbw.prototype.requestBundlePage = async function (bundleId) {
            var url = "https://store.steampowered.com/bundle/" + bundleId + "/?cc=" + encodeURIComponent(this.prefs.region) + "&l=" + encodeURIComponent(this.prefs.language);
            var res = await util.xhr({
                url: url,
                method: "get",
                headers: { "User-Agent": "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)" },
                anonymous: true
            });
            var status = res && res.response && typeof res.response.status === "number" ? res.response.status : 0;
            if (status >= 200 && status < 300) {
                return res.body;
            }
            throw new Error("HTTP " + status);
        };

        sbw.prototype.getText = function (doc, selector) {
            var el = doc.querySelector(selector);
            return el ? el.textContent.trim() : "";
        };

        sbw.prototype.parseBundleHtml = function (html, bundleId) {
            var doc = new DOMParser().parseFromString(html, "text/html");
            var name = this.getText(doc, "h2.pageheader");
            if (!name) return null;

            var priceOriginal = this.getText(doc, ".discount_original_price");
            var priceCurrent = this.getText(doc, ".discount_final_price");
            var discountBase = this.getText(doc, ".bundle_base_discount");
            var discountCurrent = this.getText(doc, ".discount_pct");

            var itemNodes = doc.querySelectorAll(".bundle_package_item .tab_item");
            var isMustPurchaseTogether = !!doc.querySelector(".bundle_package_item.must_purchase_as_set");
            var bundleType = isMustPurchaseTogether ? "must_purchase_together" : "complete_the_set";
            var allItems = [];
            for (var i = 0; i < itemNodes.length; i++) {
                var node = itemNodes[i];
                var key = node.getAttribute("data-ds-itemkey") || "";
                var parts = key.split("_");
                if (parts.length < 2) continue;
                var type = parts[0].toLowerCase();
                var id = parts[1].toLowerCase();
                var nameNode = node.querySelector(".tab_item_name");
                var itemName = nameNode ? nameNode.textContent.trim() : "";
                var pic = "";
                var capImg = node.querySelector(".tab_item_cap_img");
                if (capImg) {
                    var src = capImg.getAttribute("src");
                    if (src) { pic = src.split("?")[0].replace("184x69", "sm_120"); }
                }
                if (!pic) { pic = "https://media.steampowered.com/steam/" + type + "s/" + id + "/capsule_sm_120.jpg"; }
                allItems.push({ id: id, type: type, name: itemName, pic: pic });
            }

            return {
                url: "https://store.steampowered.com/bundle/" + bundleId + "/",
                name: name,
                type: bundleType,
                itemCount: allItems.length,
                itemNames: allItems.map(function (item) { return item.name; }),
                price: { original: priceOriginal, current: priceCurrent },
                discount: { base: discountBase, current: discountCurrent },
                items: allItems.slice(0, this.CONFIG.maxItems)
            };
        };

        sbw.prototype.fetchBundle = async function (bundleId) {
            var self = this;
            var key = bundleId + "|" + this.prefs.region + "|" + this.prefs.language;
            if (this.bundleCache.has(key)) return this.bundleCache.get(key);
            var promise = this.requestBundlePage(bundleId)
            .then(function (html) {
                var data = self.parseBundleHtml(html, bundleId);
                if (!data) throw new Error("Parse error");
                return data;
            })
            .catch(function (err) {
                self.bundleCache.delete(key);
                throw err;
            });
            this.bundleCache.set(key, promise);
            return promise;
        };

        sbw.prototype.append = function (parent, child) {
            if (parent && child) parent.appendChild(child);
        };

        sbw.prototype.ensureSteamCss = function (root) {
            if (!this.CONFIG.loadSteamCSS) return;
            if (!root) return;
            if (root.querySelector("link[data-sbw-steam='1']")) return;
            var links = [
                "https://store.steampowered.com/public/shared/css/motiva_sans.css?l=" + this.prefs.language,
                "https://store.steampowered.com/public/css/v6/store.css?l=" + this.prefs.language,
                "https://store.steampowered.com/public/css/v6/game.css?l=" + this.prefs.language,
                "https://store.steampowered.com/public/shared/css/shared_global.css?l=" + this.prefs.language,
                "https://store.steampowered.com/public/shared/css/buttons.css?l=" + this.prefs.language
            ];
            for (var i = 0; i < links.length; i++) {
                var link = util.createElement({ node: "link", content: { rel: "stylesheet", href: links[i], "data-sbw-steam": "1" } });
                root.appendChild(link);
            }
        };

        sbw.prototype.createWidgetHost = function () {
            var host = util.createElement({
                node: "div",
                content: {
                    style: "display:block;margin:6px 0;height:160px;width:100%;max-width:646px;overflow:hidden;",
                    "data-sbw-widget": "true"
                }
            });

            var root = host.attachShadow({ mode: "open" });

            var style = util.createElement({
                node: "style",
                html: ".sbw-container{border-radius:0;background:#282e39 !important;background-color:#282e39 !important;padding:8px 10px;height:140px;box-sizing:border-box;display:flex;flex-direction:column;font-size:13px;color:#c6d4df;}" +
                ".sbw-loading,.sbw-error{color:#c6d4df;font-size:14px;}" +
                ".sbw-header a{color:#fff;}" +
                ".sbw-title{margin-bottom:8px;flex:1 1 auto;min-height:0;overflow:hidden;}" +
                ".sbw-title h1{margin:0;font-size:21px;line-height:23px;font-weight:normal;}" +
                ".sbw-title a{color:#fff;text-decoration:none;}" +
                ".sbw-subtitle{margin-top:4px;color:#c6d4df;font-size:13px;line-height:18px;}" +
                ".sbw-subtitle .sbw-subtitle-label{color:#a4d007;}" +
                ".bundle_label{margin-left:6px;}" +
                ".bundle_contents_preview{margin-bottom:10px;flex:0 0 auto;}" +
                ".bundle_contents_preview_position{display:flex;flex-wrap:wrap;gap:4px;}" +
                ".bundle_contents_preview_item{display:inline-block;margin-right:0;}" +
                ".bundle_contents_preview_img{width:120px;height:auto;display:block;}" +
                ".sbw-container > .game_purchase_action{margin-top:auto !important;flex:0 0 auto;}" +
                ".sbw-must-purchase .bundle_contents_preview{display:none;}" +
                ".sbw-must-purchase .sbw-subtitle{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}"
            });

            var container = util.createElement({
                node: "div",
                content: { class: "sbw-container game_area_purchase_game_dropdown_subscription game_area_purchase_game" }
            });

            this.append(root, style);
            this.append(root, container);

            return { host: host, container: container, root: root };
        };

        sbw.prototype.clearContainer = function (container) {
            while (container.firstChild) container.removeChild(container.firstChild);
        };

        sbw.prototype.renderLoading = function (container) {
            this.clearContainer(container);
            var div = util.createElement({ node: "div", content: { class: "sbw-loading" } });
            div.textContent = this.strings.loading;
            this.append(container, div);
        };

        sbw.prototype.renderError = function (container) {
            this.clearContainer(container);
            var header = util.createElement({ node: "div", content: { class: "header_container" } });
            var h1 = util.createElement({ node: "h1", content: { class: "main_text" } });
            var a = util.createElement({ node: "a" });
            a.textContent = this.strings.errorTitle;
            this.append(h1, a);
            this.append(header, h1);

            var desc = util.createElement({ node: "div", content: { class: "desc" } });
            desc.textContent = this.strings.errorDesc;

            this.append(container, header);
            this.append(container, desc);
        };

        sbw.prototype.renderBundle = function (container, data) {
            this.clearContainer(container);
            container.classList.toggle("sbw-must-purchase", data.type === "must_purchase_together");

            var titleWrap = util.createElement({ node: "div", content: { class: "sbw-title" } });
            var title = util.createElement({ node: "h1" });
            var titleLink = util.createElement({ node: "a", content: { href: data.url, target: "_blank" } });
            titleLink.textContent = this.strings.purchasePrefix + data.name;
            var label = util.createElement({ node: "span", content: { class: "bundle_label" } });
            label.textContent = this.strings.bundleLabel;
            this.append(title, titleLink);
            if (data.type !== "must_purchase_together") {
                this.append(title, label);
            }
            this.append(titleWrap, title);

            if (data.type === "must_purchase_together") {
                var subtitle = util.createElement({ node: "div", content: { class: "sbw-subtitle" } });
                var subtitleLabel = util.createElement({ node: "span", content: { class: "sbw-subtitle-label" } });
                subtitleLabel.textContent = this.strings.includesItems.replace("{count}", String(data.itemCount));
                subtitle.appendChild(subtitleLabel);
                var subtitleText = document.createTextNode(data.itemNames.join("、"));
                subtitle.appendChild(subtitleText);
                this.append(titleWrap, subtitle);
            }

            var contents = util.createElement({ node: "div", content: { class: "bundle_contents_preview" } });
            var contentsPos = util.createElement({ node: "div", content: { class: "bundle_contents_preview_position" } });
            for (var i = 0; i < data.items.length; i++) {
                var item = data.items[i];
                var itemLink = util.createElement({
                    node: "a",
                    content: {
                        class: "bundle_contents_preview_item ds_collapse_flag app_impression_tracked",
                        href: "https://store.steampowered.com/" + item.type + "/" + item.id + "/",
                        target: "_blank"
                    }
                });
                var img = util.createElement({ node: "img", content: { class: "bundle_contents_preview_img", src: item.pic, alt: item.name || "" } });
                this.append(itemLink, img);
                this.append(contentsPos, itemLink);
            }
            this.append(contents, contentsPos);

            var action = util.createElement({ node: "div", content: { class: "game_purchase_action" } });
            var actionBg = util.createElement({ node: "div", content: { class: "game_purchase_action_bg" } });

            var discountBlock = util.createElement({ node: "div", content: { class: "discount_block game_purchase_discount" } });
            if (!data.discount.current && !data.discount.base) { discountBlock.classList.add("no_discount"); }

            if (data.discount.base) {
                var baseDiscount = util.createElement({ node: "div", content: { class: "bundle_base_discount" } });
                baseDiscount.textContent = data.discount.base;
                this.append(discountBlock, baseDiscount);
            }

            if (data.discount.current) {
                var discountPct = util.createElement({ node: "div", content: { class: "discount_pct" } });
                discountPct.textContent = data.discount.current;
                this.append(discountBlock, discountPct);
            }

            var discountPrices = util.createElement({ node: "div", content: { class: "discount_prices" } });

            if (data.price.original) {
                var original = util.createElement({ node: "div", content: { class: "discount_original_price" } });
                original.textContent = data.price.original;
                var current = util.createElement({ node: "div", content: { class: "discount_final_price" } });
                current.textContent = data.price.current;
                this.append(discountPrices, original);
                this.append(discountPrices, current);
            } else if (data.type === "must_purchase_together") {
                var finalPrice = util.createElement({ node: "div", content: { class: "discount_final_price" } });
                finalPrice.textContent = data.price.current;
                this.append(discountPrices, finalPrice);
            } else {
                var yourPrice = util.createElement({ node: "div", content: { class: "discount_final_price your_price" } });
                var labelDiv = util.createElement({ node: "div", content: { class: "your_price_label" } });
                labelDiv.textContent = this.strings.yourPrice;
                var priceDiv = util.createElement({ node: "div" });
                priceDiv.textContent = data.price.current;
                this.append(yourPrice, labelDiv);
                this.append(yourPrice, priceDiv);
                this.append(discountPrices, yourPrice);
            }

            this.append(discountBlock, discountPrices);
            this.append(actionBg, discountBlock);

            var btnWrap = util.createElement({ node: "div", content: { class: "btn_addtocart btn_packageinfo" } });
            var btnLink = util.createElement({ node: "a", content: { class: "btn_green_steamui btn_medium", href: data.url, target: "_blank" } });
            var btnSpan = util.createElement({ node: "span" });
            btnSpan.textContent = this.strings.view;
            this.append(btnLink, btnSpan);
            this.append(btnWrap, btnLink);
            this.append(actionBg, btnWrap);
            this.append(action, actionBg);

            this.append(container, titleWrap);
            this.append(container, contents);
            this.append(container, action);
        };

        sbw.prototype.getInsertAfterTarget = function (link) {
            var block = link.closest("p, li, dd, dt, blockquote");
            return block || link;
        };

        sbw.prototype.processLink = function (link) {
            if (!link || this.processedLinks.has(link)) return;
            if (link.closest("[data-sbw-widget='true']")) return;
            var bundleId = this.extractBundleId(link.href);
            if (!bundleId) return;

            this.processedLinks.add(link);

            var hostData = this.createWidgetHost();
            this.ensureSteamCss(hostData.root);
            this.renderLoading(hostData.container);

            var target = this.getInsertAfterTarget(link);
            target.insertAdjacentElement("afterend", hostData.host);

            var self = this;
            this.fetchBundle(bundleId)
                .then(function (data) { self.renderBundle(hostData.container, data); })
                .catch(function () { self.renderError(hostData.container); });
        };

        sbw.prototype.scan = function (root) {
            if (!root || !root.querySelectorAll) return;
            var links = root.querySelectorAll(this.BUNDLE_LINK_SELECTOR);
            for (var i = 0; i < links.length; i++) {
                this.processLink(links[i]);
            }
        };

        sbw.prototype.handleAddedNode = function (node) {
            if (node.nodeType !== Node.ELEMENT_NODE) return;
            if (node.matches && node.matches(this.BUNDLE_LINK_SELECTOR)) this.processLink(node);
            if (node.querySelectorAll) this.scan(node);
        };

        sbw.prototype.observe = function () {
            var self = this;
            var observer = new MutationObserver(function (mutations) {
                for (var i = 0; i < mutations.length; i++) {
                    var m = mutations[i];
                    for (var j = 0; j < m.addedNodes.length; j++) {
                        self.handleAddedNode(m.addedNodes[j]);
                    }
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });
        };

        sbw.prototype.run = async function () {
            this.init();
            this.setupMenus();
            this.scan(document.body);
            if (this.CONFIG.observeMutations && document.body) {
                this.observe();
            }
        };

        return sbw;
    })();
    var main = new sbw();
    main.run();
})();

