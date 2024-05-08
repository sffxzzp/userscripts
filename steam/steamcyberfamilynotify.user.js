// ==UserScript==
// @name         Steam Cyber Family Nofify
// @namespace    https://github.com/sffxzzp
// @version      0.03
// @description  show recent purchase of your steam cyber family (will exclude what you already have)
// @author       sffxzzp
// @match        *://*/*
// @exclude      *://*.humblebundle.com/*
// @icon         https://store.steampowered.com/favicon.ico
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// @grant        GM_notification
// @connect      api.steampowered.com
// @updateURL    https://github.com/sffxzzp/userscripts/raw/master/steam/steamcyberfamilynotify.user.js
// @downloadURL  https://github.com/sffxzzp/userscripts/raw/master/steam/steamcyberfamilynotify.user.js
// ==/UserScript==

(function() {
    var util = (function () {
        function util() {}
        util.xhr = function (xhrData) {
            return new Promise(function(resolve, reject) {
                GM_xmlhttpRequest({
                    method: xhrData.method || "get",
                    url: xhrData.url,
                    data: xhrData.data,
                    headers: xhrData.headers || {},
                    responseType: xhrData.type || "",
                    timeout: 3e5,
                    onload: function onload(res) {
                        return resolve({ response: res, body: res.response });
                    },
                    onerror: reject,
                    ontimeout: reject
                });
            });
        };
        return util;
    })();
    var csfn = (function () {
        var csfn = function () {};
        csfn.prototype.getRecentList = async function () {
            var access_token = (await util.xhr({url: 'https://store.steampowered.com/pointssummary/ajaxgetasyncconfig', type: 'json'})).body.data.webapi_token;
            var family_groupid = (await util.xhr({url: `https://api.steampowered.com/IFamilyGroupsService/GetFamilyGroupForUser/v1/?include_family_group_response=true&access_token=${access_token}`, type: 'json'})).body.response.family_groupid;
            var gameList = (await util.xhr({url: `https://api.steampowered.com/IFamilyGroupsService/GetSharedLibraryApps/v1/?family_groupid=${family_groupid}&include_own=true&access_token=${access_token}`, type: 'json'})).body.response;
            var steamid = gameList.owner_steamid;
            var tmpList = [];
            gameList.apps.forEach(function (game) {
                if (game.owner_steamids.indexOf(steamid) == -1) {
                    tmpList.push({
                        appid: game.appid,
                        name: game.name,
                        time: game.rt_time_acquired,
                    });
                }
            });
            tmpList.sort(function (a, b) { return b.time - a.time });
            return tmpList.slice(0, 9);
        };
        csfn.prototype.run = async function () {
            var lastcheck = GM_getValue('time') || 0;
            if (lastcheck < (new Date()).getTime() - 79200000) {
                var oldList = GM_getValue('list') || [];
                var oldIdList = [];
                oldList.forEach(function (game) {
                    oldIdList.push(game.appid);
                });
                var newList = [];
                try {
                    newList = await this.getRecentList();
                }
                catch {
                    newList = await this.getRecentList();
                }
                var pushList = [];
                newList.forEach(function (game) {
                    if (oldIdList.indexOf(game.appid) == -1) {
                        pushList.push(game);
                    }
                });
                if (pushList.length > 0) {
                    GM_setValue('time', (new Date()).getTime());
                    GM_setValue('list', newList);
                    pushList.forEach(function (game) {
                        GM_notification({
                            text: game.name,
                            title: 'Steam 赛博家庭有新游戏了！',
                            url: `https://store.steampowered.com/app/${game.appid}/`,
                            timeout: 10000,
                        });
                    });
                } else {
                    GM_setValue('time', (new Date()).getTime() - 59400000);
                }
            }
        };
        return csfn;
    })();
    var s = new csfn();
    s.run();
})();
