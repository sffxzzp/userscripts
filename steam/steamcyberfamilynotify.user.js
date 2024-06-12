// ==UserScript==
// @name         Steam Cyber Family Nofify
// @namespace    https://github.com/sffxzzp
// @version      0.21
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
// @connect      store.steampowered.com
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
            var familyData = (await util.xhr({url: `https://api.steampowered.com/IFamilyGroupsService/GetFamilyGroupForUser/v1/?include_family_group_response=true&access_token=${access_token}`, type: 'json'})).body.response;
            var family_groupid = familyData.family_groupid;
            var family_members = {};
            var reqStr = "";
            for (let i = 0; i < familyData.family_group.members.length; i++) {
                family_members[familyData.family_group.members[i].steamid] = "";
                reqStr += "&steamids["+i+"]="+familyData.family_group.members[i].steamid;
            }
            var memberData = (await util.xhr({url: `https://api.steampowered.com/IPlayerService/GetPlayerLinkDetails/v1/?access_token=${access_token}${reqStr}`, type: 'json'})).body.response.accounts;
            memberData.forEach(function (member) {
                family_members[member.public_data.steamid] = member.public_data.persona_name;
            });
            var gameList = (await util.xhr({url: `https://api.steampowered.com/IFamilyGroupsService/GetSharedLibraryApps/v1/?family_groupid=${family_groupid}&include_own=true&access_token=${access_token}`, type: 'json'})).body.response;
            var steamid = gameList.owner_steamid;
            var tmpList = [];
            gameList.apps.forEach(function (game) {
                if (game.owner_steamids.indexOf(steamid) == -1) {
                    let ownersArr = [];
                    game.owner_steamids.forEach(function (steamid) {
                        ownersArr.push(family_members[steamid]);
                    });
                    tmpList.push({
                        appid: game.appid,
                        name: game.name,
                        time: game.rt_time_acquired,
                        owners: ownersArr,
                    });
                }
            });
            tmpList.sort(function (a, b) { return b.time - a.time });
            return tmpList.slice(0, 99);
        };
        csfn.prototype.run = async function () {
            var lastcheck = GM_getValue('time') || 0;
            var lastrun = GM_getValue('lastrun') || 0;
            var timeCond = (new Date()).getTime() - 79200000;
            var rTimeCond = (new Date()).getTime() - 1800000;
            if (lastcheck < timeCond && lastrun < rTimeCond) {
                var oldList = GM_getValue('list') || [];
                var oldIdList = [];
                oldList.forEach(function (game) {
                    oldIdList.push(game.appid);
                });
                var newList = [];
                GM_setValue('lastrun', (new Date()).getTime());
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
                    pushList.slice(0, 5).forEach(function (game) {
                        let text = `义父：${game.owners.join(',')}`
                        GM_notification({
                            text: text,
                            title: `赛博家庭新增：${game.name}`,
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
