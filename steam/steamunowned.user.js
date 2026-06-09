// ==UserScript==
// @name         Steam Unowned Games
// @namespace    https://github.com/sffxzzp
// @version      2.0.1
// @description  Display games on the “All Games” page for Steam friends that the friend owns but the currently logged-in user does not.
// @author       sffxzzp & GPT-5.5-codex
// @match        https://steamcommunity.com/profiles/*/games*
// @match        https://steamcommunity.com/id/*/games*
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @connect      store.steampowered.com
// @run-at       document-idle
// @icon         https://store.steampowered.com/favicon.ico
// @updateURL    https://github.com/sffxzzp/userscripts/raw/master/steam/steamunowned.user.js
// @downloadURL  https://github.com/sffxzzp/userscripts/raw/master/steam/steamunowned.user.js
// ==/UserScript==

(() => {
    "use strict";

    var CONFIG = {
        panelId: "codex-steam-unowned-panel",
        styleId: "codex-steam-unowned-style",
        startTimeout: 15000,
        storeUserDataUrl: "https://store.steampowered.com/dynamicstore/userdata/",
    };

    var SteamUnowned = function () {
        this.collapsed = true;
        this.loading = false;
        this.loaded = false;
        this.error = null;
        this.filter = "";
        this.panel = null;
        this.observerStarted = false;
        this.friendGames = [];
        this.myOwnedAppids = new Set();
        this.commonAppids = new Set();
        this.missingGames = [];
    };

    SteamUnowned.prototype.init = function () {
        if (new URLSearchParams(location.search).get("tab") !== "all") { return; }

        this.injectStyle();
        this.observePanel();
        this.render({ status: "展开后加载数据。" });
    };

    SteamUnowned.prototype.expand = function () {
        this.collapsed = false;
        if (this.loaded) { this.renderResult(); return; }
        if (this.error) { this.renderError(this.error); return; }
        this.render({ status: "正在读取好友游戏数据..." });
        this.load();
    };

    SteamUnowned.prototype.collapse = function () {
        this.collapsed = true;
        this.render({ status: "展开后加载数据。" });
    };

    SteamUnowned.prototype.load = async function () {
        if (this.loaded || this.loading) { return; }

        this.loading = true;
        this.error = null;

        try {
            await this.waitForSteamData();

            var queryData = this.getQueryData();
            var currentSteamId = this.getCurrentSteamId(queryData);
            var targetSteamId = this.getTargetSteamId(queryData, currentSteamId);

            if (!currentSteamId) { throw new Error("没有找到当前登录用户 SteamID，请确认已登录 Steam 社区。"); }
            if (!targetSteamId) { throw new Error("没有找到好友 SteamID。"); }
            if (currentSteamId === targetSteamId) { throw new Error("当前页面是自己的游戏页，不是好友游戏页。"); }

            this.friendGames = this.getOwnedGames(queryData, targetSteamId);
            if (!this.friendGames.length) { throw new Error("没有从当前页面缓存中读取到好友全部游戏列表。"); }

            this.render({ status: "已读取好友 " + this.friendGames.length + " 个游戏，正在读取你的游戏库..." });

            this.myOwnedAppids = await this.loadMyOwnedAppids();
            this.commonAppids = new Set(this.friendGames.map((game) => Number(game.appid)).filter((appid) => {
                return this.myOwnedAppids.has(appid);
            }));
            this.missingGames = this.friendGames.filter((game) => {
                return !this.myOwnedAppids.has(Number(game.appid));
            }).sort((a, b) => {
                return String(a.name || "").localeCompare(String(b.name || ""), "zh-Hans-CN");
            });

            this.loaded = true;
            this.renderResult();
        } catch (error) {
            this.error = error;
            this.renderError(error);
        } finally {
            this.loading = false;
        }
    };

    SteamUnowned.prototype.waitForSteamData = function () {
        var self = this;
        var startedAt = Date.now();

        return new Promise((resolve, reject) => {
            var tick = () => {
                if (self.getQueryData().queries.length || self.getLoaderData().length) { resolve(); return; }
                if (Date.now() - startedAt > CONFIG.startTimeout) { reject(new Error("等待 Steam 页面数据超时。")); return; }
                setTimeout(tick, 200);
            };
            tick();
        });
    };

    SteamUnowned.prototype.getPageWindow = function () {
        return typeof unsafeWindow !== "undefined" ? unsafeWindow : window;
    };

    SteamUnowned.prototype.getLoaderData = function () {
        var pageWindow = this.getPageWindow();
        var loaderData = pageWindow.SSR && pageWindow.SSR.loaderData;
        if (!Array.isArray(loaderData)) { return []; }

        return loaderData.map((item) => {
            if (typeof item !== "string") { return item; }
            try {
                return JSON.parse(item);
            } catch (_) {
                return null;
            }
        }).filter(Boolean);
    };

    SteamUnowned.prototype.getQueryData = function () {
        var pageWindow = this.getPageWindow();
        var queryData = pageWindow.SSR && pageWindow.SSR.renderContext && pageWindow.SSR.renderContext.queryData;
        if (!queryData) { return { queries: [] }; }
        if (typeof queryData !== "string") { return queryData; }

        try {
            return JSON.parse(queryData);
        } catch (_) {
            return { queries: [] };
        }
    };

    SteamUnowned.prototype.getCurrentSteamId = function (queryData) {
        var pageWindow = this.getPageWindow();
        if (pageWindow.g_steamID) { return String(pageWindow.g_steamID); }

        var renderUser = pageWindow.SSR && pageWindow.SSR.renderContext && pageWindow.SSR.renderContext.user;
        if (renderUser && renderUser.steamid) { return String(renderUser.steamid); }

        var loaderUser = this.getLoaderData().find((item) => {
            return item && typeof item === "object" && item.steamid && !item.listData;
        });
        if (loaderUser) { return String(loaderUser.steamid); }

        var currentUserQuery = this.findQuery(queryData, (key) => {
            return key[0] === "CurrentUser";
        });
        var currentSteamId = currentUserQuery && currentUserQuery.state && currentUserQuery.state.data && currentUserQuery.state.data.steamid;
        return currentSteamId ? String(currentSteamId) : "";
    };

    SteamUnowned.prototype.getTargetSteamId = function (queryData, currentSteamId) {
        var profileMatch = location.pathname.match(/\/profiles\/(\d+)\/games/i);
        if (profileMatch) { return profileMatch[1]; }

        var loaderProfile = this.getLoaderData().find((item) => {
            return item && typeof item === "object" && item.steamid && item.listData;
        });
        if (loaderProfile) { return String(loaderProfile.steamid); }

        var query = this.findQuery(queryData, (key) => {
            return (key[0] === "PlayerLinkDetails" || key[0] === "OwnedGames") && key[1] && String(key[1]) !== String(currentSteamId);
        });
        return query && query.queryKey && query.queryKey[1] ? String(query.queryKey[1]) : "";
    };

    SteamUnowned.prototype.findQuery = function (queryData, predicate) {
        var queries = Array.isArray(queryData && queryData.queries) ? queryData.queries : [];
        return queries.find((query) => {
            return Array.isArray(query.queryKey) && predicate(query.queryKey, query);
        });
    };

    SteamUnowned.prototype.getOwnedGames = function (queryData, steamId) {
        var query = this.findQuery(queryData, (key) => {
            return key[0] === "OwnedGames" && String(key[1]) === String(steamId);
        });
        var games = query && query.state && query.state.data;
        if (!Array.isArray(games)) { return []; }

        return games.filter((game) => {
            return Number.isFinite(Number(game.appid));
        });
    };

    SteamUnowned.prototype.loadMyOwnedAppids = async function () {
        var data = await this.requestJson(CONFIG.storeUserDataUrl);
        var ownedAppids = this.extractNumbers(data && data.rgOwnedApps);
        var ownedPackageIds = this.extractNumbers(data && data.rgOwnedPackages);
        var packageAppids = this.extractPackageAppids(data && data.rgMasterSubApps, ownedPackageIds);
        var appids = Array.from(new Set(ownedAppids.concat(packageAppids)));

        if (appids.length) { return new Set(appids); }

        var keys = data && typeof data === "object" ? Object.keys(data).join(", ") : "无";
        throw new Error("dynamicstore/userdata 中 rgOwnedApps 为空，且无法从 rgOwnedPackages 映射出 appid。rgOwnedApps=" + ownedAppids.length + "，rgOwnedPackages=" + ownedPackageIds.length + "，包映射 appid=" + packageAppids.length + "。返回字段：" + keys);
    };

    SteamUnowned.prototype.requestJson = function (url) {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: "GET",
                url: url,
                headers: { Accept: "application/json" },
                responseType: "json",
                onload: (response) => {
                    if (response.status < 200 || response.status >= 300) {
                        reject(new Error("读取 Steam dynamicstore/userdata 失败：HTTP " + response.status));
                        return;
                    }

                    if (response.response && typeof response.response === "object") {
                        resolve(response.response);
                        return;
                    }

                    try {
                        resolve(JSON.parse(response.responseText));
                    } catch (error) {
                        reject(new Error("Steam dynamicstore/userdata 返回的不是 JSON：" + (error.message || error)));
                    }
                },
                onerror: () => {
                    reject(new Error("读取 Steam dynamicstore/userdata 网络请求失败。"));
                },
                ontimeout: () => {
                    reject(new Error("读取 Steam dynamicstore/userdata 请求超时。"));
                },
            });
        });
    };

    SteamUnowned.prototype.extractNumbers = function (value) {
        if (Array.isArray(value)) { return value.map(Number).filter(Number.isFinite); }
        if (value && typeof value === "object") { return Object.keys(value).map(Number).filter(Number.isFinite); }
        return [];
    };

    SteamUnowned.prototype.extractPackageAppids = function (masterSubApps, ownedPackageIds) {
        var self = this;
        if (!masterSubApps || typeof masterSubApps !== "object" || !ownedPackageIds.length) { return []; }

        return ownedPackageIds.flatMap((packageId) => {
            return self.extractNestedNumbers(masterSubApps[String(packageId)] || masterSubApps[packageId]);
        }).filter(Number.isFinite);
    };

    SteamUnowned.prototype.extractNestedNumbers = function (value) {
        var self = this;
        if (Array.isArray(value)) { return value.flatMap((item) => self.extractNestedNumbers(item)); }
        if (Number.isFinite(Number(value))) { return [Number(value)]; }
        if (value && typeof value === "object" && Number.isFinite(Number(value.appid))) { return [Number(value.appid)]; }
        if (value && typeof value === "object") { return Object.values(value).flatMap((item) => self.extractNestedNumbers(item)); }
        return [];
    };

    SteamUnowned.prototype.renderResult = function () {
        var games = this.getFilteredGames();
        var stats = this.getStats(games);

        this.render({ stats: stats, games: games });
    };

    SteamUnowned.prototype.updateResults = function () {
        var games = this.getFilteredGames();
        var stats = this.getStats(games);
        var oldStats = this.panel && this.panel.querySelector(".su-stats");
        var oldList = this.panel && this.panel.querySelector(".su-list");

        if (oldStats) { oldStats.replaceWith(this.createStats(stats)); }
        if (oldList) { oldList.replaceWith(this.createGameList(games)); }
    };

    SteamUnowned.prototype.getStats = function (games) {
        var stats = [
            ["好友全部游戏", this.friendGames.length],
            ["你的游戏", this.myOwnedAppids.size],
            ["共同拥有", this.commonAppids.size],
            ["你没有", this.missingGames.length],
        ];

        if (this.filter) { stats.push(["当前显示", games.length]); }
        return stats;
    };

    SteamUnowned.prototype.getFilteredGames = function () {
        var keyword = this.filter.trim().toLowerCase();
        if (!keyword) { return this.missingGames; }

        return this.missingGames.filter((game) => {
            return String(game.name || "").toLowerCase().includes(keyword) || String(game.appid).includes(keyword);
        });
    };

    SteamUnowned.prototype.renderError = function (error) {
        this.render({ status: "脚本运行失败：" + (error.message || error), isError: true });
    };

    SteamUnowned.prototype.render = function (options) {
        var panel = this.getPanel();
        var title = options.title || "好友拥有而我没有的游戏";

        panel.innerHTML = "";
        panel.appendChild(this.createHeader(title));

        if (this.collapsed && !options.isError) { return; }
        if (Array.isArray(options.stats)) { panel.appendChild(this.createStats(options.stats)); }
        else if (options.status) { panel.appendChild(this.createStatus(options.status, options.isError)); }
        if (Array.isArray(options.games)) { panel.appendChild(this.createToolbar(options.games)); panel.appendChild(this.createGameList(options.games)); }
    };

    SteamUnowned.prototype.getPanel = function () {
        if (this.panel) { this.attachPanel(); return this.panel; }

        this.panel = document.createElement("section");
        this.panel.id = CONFIG.panelId;
        this.attachPanel();
        return this.panel;
    };

    SteamUnowned.prototype.attachPanel = function () {
        var parent = document.body || document.documentElement;
        if (this.panel && this.panel.parentElement !== parent) { parent.appendChild(this.panel); }
    };

    SteamUnowned.prototype.observePanel = function () {
        var self = this;
        if (this.observerStarted) { return; }

        this.observerStarted = true;
        new MutationObserver(() => {
            if (self.panel && !document.documentElement.contains(self.panel)) { self.attachPanel(); }
        }).observe(document.documentElement, { childList: true, subtree: true });
    };

    SteamUnowned.prototype.createHeader = function (title) {
        var header = document.createElement("div");
        var heading = document.createElement("h2");
        var button = document.createElement("button");

        header.className = "su-header";
        heading.textContent = title;
        button.type = "button";
        button.className = "su-icon-button";
        button.textContent = this.collapsed ? "+" : "−";
        button.title = this.collapsed ? "展开面板" : "折叠面板";
        button.addEventListener("click", this.collapsed ? this.expand.bind(this) : this.collapse.bind(this));

        header.appendChild(heading);
        header.appendChild(button);
        return header;
    };

    SteamUnowned.prototype.createStatus = function (status, isError) {
        var node = document.createElement("div");
        node.className = isError ? "su-status su-error" : "su-status";
        node.textContent = status;
        return node;
    };

    SteamUnowned.prototype.createStats = function (stats) {
        var grid = document.createElement("div");
        grid.className = "su-stats";

        stats.forEach((stat) => {
            var item = document.createElement("div");
            var label = document.createElement("span");
            var value = document.createElement("strong");

            item.className = "su-stat";
            label.className = "su-stat-label";
            value.className = "su-stat-value";
            label.textContent = stat[0];
            value.textContent = stat[1];

            item.appendChild(label);
            item.appendChild(value);
            grid.appendChild(item);
        });

        return grid;
    };

    SteamUnowned.prototype.createToolbar = function (games) {
        var self = this;
        var toolbar = document.createElement("div");
        var search = document.createElement("input");
        var copy = document.createElement("button");

        toolbar.className = "su-toolbar";
        search.type = "search";
        search.placeholder = "搜索名称或 AppID";
        search.value = this.filter;
        search.addEventListener("input", () => {
            self.filter = search.value;
            self.updateResults();
        });

        copy.type = "button";
        copy.textContent = "复制清单";
        copy.addEventListener("click", () => {
            self.copyGames(self.getFilteredGames(), copy);
        });

        toolbar.appendChild(search);
        toolbar.appendChild(copy);
        return toolbar;
    };

    SteamUnowned.prototype.createGameList = function (games) {
        var list = document.createElement("div");
        list.className = "su-list";

        if (!games.length) {
            var empty = document.createElement("div");
            empty.className = "su-empty";
            empty.textContent = "没有匹配的游戏。";
            list.appendChild(empty);
            return list;
        }

        games.forEach((game) => {
            list.appendChild(this.createGameItem(game));
        }, this);
        return list;
    };

    SteamUnowned.prototype.createGameItem = function (game) {
        var item = document.createElement("a");
        var image = document.createElement("img");
        var content = document.createElement("div");
        var name = document.createElement("div");
        var meta = document.createElement("div");

        item.className = "su-game";
        item.href = "https://store.steampowered.com/app/" + game.appid + "/";
        item.target = "_blank";
        item.rel = "noreferrer";

        image.loading = "lazy";
        image.alt = "";
        image.src = game.img_icon_url
            ? "https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/apps/" + game.appid + "/" + game.img_icon_url + ".jpg"
        : "https://cdn.cloudflare.steamstatic.com/steam/apps/" + game.appid + "/capsule_184x69.jpg";

        content.className = "su-game-content";
        name.className = "su-game-name";
        meta.className = "su-game-meta";
        name.textContent = game.name || "(App " + game.appid + ")";
        meta.textContent = "AppID " + game.appid;

        content.appendChild(name);
        content.appendChild(meta);
        item.appendChild(image);
        item.appendChild(content);
        return item;
    };

    SteamUnowned.prototype.copyGames = async function (games, button) {
        var oldText = button.textContent;
        var text = games.map((game) => {
            return game.appid + "\t" + (game.name || "");
        }).join("\n");

        await navigator.clipboard.writeText(text);
        button.textContent = "已复制";
        setTimeout(() => {
            button.textContent = oldText;
        }, 1200);
    };

    SteamUnowned.prototype.injectStyle = function () {
        if (document.getElementById(CONFIG.styleId)) { return; }

        var style = document.createElement("style");
        style.id = CONFIG.styleId;
        style.textContent = `
      #${CONFIG.panelId} {
        position: fixed;
        z-index: 99999;
        top: 88px;
        right: 6px;
        width: min(420px, calc(100vw - 32px));
        max-height: calc(100vh - 112px);
        display: flex;
        flex-direction: column;
        color: #dbe2ea;
        background: #111923;
        border: 1px solid rgba(102, 192, 244, 0.35);
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45);
        font-family: Arial, Helvetica, sans-serif;
      }
      #${CONFIG.panelId} .su-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 12px 14px 8px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }
      #${CONFIG.panelId} h2 {
        margin: 0;
        font-size: 16px;
        line-height: 1.3;
        font-weight: 600;
      }
      #${CONFIG.panelId} button,
      #${CONFIG.panelId} input {
        font: inherit;
      }
      #${CONFIG.panelId} button {
        color: #dbe2ea;
        background: #24384a;
        border: 1px solid rgba(255, 255, 255, 0.12);
        cursor: pointer;
      }
      #${CONFIG.panelId} button:hover {
        background: #2f4d66;
      }
      #${CONFIG.panelId} .su-icon-button {
        width: 28px;
        height: 28px;
        padding: 0;
        font-size: 22px;
        line-height: 24px;
      }
      #${CONFIG.panelId} .su-status {
        padding: 10px 14px;
        color: #9fb5c8;
        font-size: 12px;
        line-height: 1.45;
      }
      #${CONFIG.panelId} .su-error {
        color: #ffb3a7;
      }
      #${CONFIG.panelId} .su-stats {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        padding: 10px 14px 12px;
      }
      #${CONFIG.panelId} .su-stat {
        min-width: 0;
        padding: 7px 8px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.07);
      }
      #${CONFIG.panelId} .su-stat-label {
        display: block;
        overflow: hidden;
        color: #9fb5c8;
        font-size: 11px;
        line-height: 1.25;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      #${CONFIG.panelId} .su-stat-value {
        display: block;
        margin-top: 2px;
        color: #edf3f8;
        font-size: 15px;
        line-height: 1.2;
      }
      #${CONFIG.panelId} .su-toolbar {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 8px;
        padding: 0 14px 12px;
      }
      #${CONFIG.panelId} input {
        min-width: 0;
        color: #dbe2ea;
        background: #0b121a;
        border: 1px solid rgba(255, 255, 255, 0.15);
        padding: 7px 9px;
      }
      #${CONFIG.panelId} .su-toolbar button {
        padding: 7px 10px;
        white-space: nowrap;
      }
      #${CONFIG.panelId} .su-list {
        overflow: auto;
        padding: 0 10px 10px;
      }
      #${CONFIG.panelId} .su-game {
        display: grid;
        grid-template-columns: 32px 1fr;
        gap: 10px;
        align-items: start;
        padding: 7px 6px;
        color: inherit;
        text-decoration: none;
        border-top: 1px solid rgba(255, 255, 255, 0.06);
      }
      #${CONFIG.panelId} .su-game:hover {
        background: rgba(102, 192, 244, 0.12);
      }
      #${CONFIG.panelId} .su-game img {
        width: 32px;
        height: 32px;
        object-fit: cover;
        background: #0b121a;
      }
      #${CONFIG.panelId} .su-game-content {
        min-width: 0;
      }
      #${CONFIG.panelId} .su-game-name {
        overflow: hidden;
        color: #edf3f8;
        font-size: 13px;
        line-height: 1.3;
        overflow-wrap: anywhere;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
      }
      #${CONFIG.panelId} .su-game-meta,
      #${CONFIG.panelId} .su-empty {
        color: #8194a6;
        font-size: 12px;
        line-height: 1.4;
      }
      #${CONFIG.panelId} .su-empty {
        padding: 14px 6px;
      }
      @media (max-width: 700px) {
        #${CONFIG.panelId} {
          top: 64px;
          right: 6px;
          width: calc(100vw - 12px);
          max-height: calc(100vh - 84px);
        }
      }
    `;
        document.head.appendChild(style);
    };

    new SteamUnowned().init();
})();
