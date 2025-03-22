// ==UserScript==
// @name         Steam Cyber Family Nofify
// @namespace    https://github.com/sffxzzp
// @version      0.50
// @description  show recent purchase of your steam cyber family (will exclude what you already have)
// @author       sffxzzp
// @match        *://*/*
// @exclude      *://*.humblebundle.com/*
// @icon         https://store.steampowered.com/favicon.ico
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// @grant        GM_notification
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
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
        csfn.prototype.notifyOn = GM_getValue('csfn_notify', true);
        csfn.prototype.wishlistOn = GM_getValue('csfn_wishlist', true);
        csfn.prototype.menu = [];
        csfn.prototype.getAccessToken = async function () {
            this.access_token = (await util.xhr({url: 'https://store.steampowered.com/pointssummary/ajaxgetasyncconfig', type: 'json'})).body.data.webapi_token;
        };
        csfn.prototype.getFamilyData = async function () {
            return (await util.xhr({url: `https://api.steampowered.com/IFamilyGroupsService/GetFamilyGroupForUser/v1/?include_family_group_response=true&access_token=${this.access_token}`, type: 'json'})).body.response;
        };
        csfn.prototype.getMemberData = async function (reqStr) {
            return (await util.xhr({url: `https://api.steampowered.com/IPlayerService/GetPlayerLinkDetails/v1/?access_token=${this.access_token}${reqStr}`, type: 'json'})).body.response.accounts;
        };
        csfn.prototype.getGameList = async function (family_groupid) {
            return (await util.xhr({url: `https://api.steampowered.com/IFamilyGroupsService/GetSharedLibraryApps/v1/?family_groupid=${family_groupid}&include_own=true&access_token=${this.access_token}`, type: 'json'})).body.response;
        };
        csfn.prototype.getMembers = async function (members) {
            var family_members = {};
            var reqStr = "";
            for (let i = 0; i < members.length; i++) {
                family_members[members[i].steamid] = "";
                reqStr += "&steamids["+i+"]="+members[i].steamid;
            }
            var memberData = await this.getMemberData(reqStr);
            memberData.forEach(function (member) {
                family_members[member.public_data.steamid] = member.public_data.persona_name;
            });
            return family_members;
        };
        csfn.prototype.getRecentList = async function () {
            await this.getAccessToken();
            var familyData = await this.getFamilyData();
            var family_groupid = familyData.family_groupid;
            var family_members = await this.getMembers(familyData.family_group.members);
            var gameList = await this.getGameList(family_groupid);
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
            return tmpList;
        };
        csfn.prototype.secondsDisplay = function (seconds) {
            if (seconds <= 0) {
                return "无冷却时间";
            }
            var outStr = "冷却时间：";
            var leftSeconds = seconds;
            var days = parseInt(leftSeconds / 86400);
            leftSeconds %= 86400;
            if (days > 0) {
                outStr += days + " 天 ";
            }
            var hours = parseInt(leftSeconds / 3600);
            leftSeconds %= 3600;
            if (hours > 0) {
                outStr += hours + " 小时 ";
            }
            if (seconds < 3600) {
                outStr = "冷却时间：";
                var minutes = parseInt(seconds / 60);
                leftSeconds %= 60;
                if (minutes > 0) {
                    outStr += minutes + " 分钟 " + leftSeconds + " 秒 ";
                }
            }
            return outStr;
        };
        csfn.prototype.displayCoolDown = async function () {
            var _this = this;
            var cdData = GM_getValue("cddata") || null;
            var currentTime = parseInt((new Date()).getTime() / 1000);
            if (cdData == null) {
                await this.getAccessToken();
                var familyData = await this.getFamilyData();
                var family_groupid = familyData.family_groupid;
                var family_members = await this.getMembers(familyData.family_group.members);
                cdData = {};
                for (let i = 0; i < familyData.family_group.members.length; i++) {
                    cdData[family_members[familyData.family_group.members[i].steamid]] = {
                        steamid: familyData.family_group.members[i].steamid,
                        cooldown: familyData.family_group.members[i].cooldown_seconds_remaining == 0 ? 0 : familyData.family_group.members[i].cooldown_seconds_remaining + currentTime,
                    };
                }
                GM_setValue("cddata", cdData);
            }
            document.querySelectorAll('div.avatarHolder ~ div').forEach(function (node) {
                if (node.querySelector('div.scfn-cd')) {return}
                var nickname = node.querySelector('div > div > div').firstChild.nodeValue;
                var cdDiv = document.createElement('div');
                cdDiv.className = "scfn-cd"
                cdDiv.style = "font-size: 14px; color: darkgray";
                cdDiv.innerHTML = _this.secondsDisplay(cdData[nickname].cooldown - currentTime);
                node.appendChild(cdDiv);
            });
        };
        csfn.prototype.coolDown = function () {
            var _this = this;
            var target = document.querySelector('div[data-featuretarget="family-management"]');
            var observer = new MutationObserver(function (recs) {
                for (let i=0;i<recs.length;i++) {
                    let rec = recs[i];
                    if (rec.target.querySelector('div.avatarHolder') != null) {
                        setTimeout(function () {_this.displayCoolDown()}, 500);
                        break;
                    }
                }
            });
            observer.observe(target, { childList: true, subtree: true });
        };
        csfn.prototype.notify = async function () {
            var lastcheck = GM_getValue('time') || 0;
            var lastrun = GM_getValue('lastrun') || 0;
            var timeCond = (new Date()).getTime() - 43200000;
            var rTimeCond = (new Date()).getTime() - 1800000;
            if (lastcheck < timeCond && lastrun < rTimeCond) {
                GM_setValue('lastrun', (new Date()).getTime());
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
        csfn.prototype.wishlist = function () {
            var _this = this;
            setTimeout(function () {
                if (unsafeWindow.SSR.reactRoot._internalRoot) {
                    _this.initWishlist();
                } else {
                    _this.wishlist();
                }
            }, 1000);
        };
        csfn.prototype.initWishlist = function () {
            var _this = this;
            var wishlistDiv = document.querySelector("section > div:last-child");
            var observer = new MutationObserver(function (recs) {
                _this.updateWishlist();
            });
            observer.observe(wishlistDiv, { childList: true, subtree: true, characterData: true });
        };
        csfn.prototype.getAppid = function (link) {
            let m = link.match(/app\/(\d+)/);
            return m ? Number(m[1]) : null;
        };
        csfn.prototype.updateWishlist = function () {
            var _this = this;
            var familyOwnedGameList = GM_getValue('list') || [];
            var familyOwnedGameAppids = [];
            familyOwnedGameList.forEach(function (game) {
                familyOwnedGameAppids.push(game.appid);
            });
            delete familyOwnedGameList;
            var gameList = document.querySelector('div.Panel > div.Panel > div:has(div[data-index])');
            gameList.querySelectorAll('div[data-index] > div').forEach(function (gameNode) {
                let appid = _this.getAppid(gameNode.querySelector("a[href*='/app/']").href);
                if (familyOwnedGameAppids.indexOf(appid)>0) {
                    gameNode.style.background = "linear-gradient(to right, #47bfff 5%, #1a44c2 60%)";
                }
            });
        };
        csfn.prototype.clearMenu = function () {
            this.menu.forEach(function (menuid) {
                GM_unregisterMenuCommand(menuid);
            });
            this.menu = [];
            this.registerMenu();
        };
        csfn.prototype.registerMenu = function () {
            var _this = this;
            _this.menu = [];
            var notifyMenuId = GM_registerMenuCommand(_this.notifyOn ? '禁用通知' : '启用通知', function () {
                _this.notifyOn = !_this.notifyOn;
                GM_setValue('csfn_notify', _this.notifyOn);
                _this.clearMenu();
            });
            _this.menu.push(notifyMenuId);
            var wishlistMenuId = GM_registerMenuCommand(_this.wishlistOn ? '禁用愿望单高亮' : '启用愿望单高亮', function () {
                _this.wishlistOn = !_this.wishlistOn;
                GM_setValue('csfn_wishlist', _this.wishlistOn);
                _this.clearMenu();
                location.reload();
            });
            _this.menu.push(wishlistMenuId);
        };
        csfn.prototype.run = async function () {
            this.registerMenu();
            if (location.href.indexOf('https://store.steampowered.com/account/familymanagement')>-1) {
                this.coolDown();
            }
            else if (location.href.indexOf('https://store.steampowered.com/wishlist/')>-1) {
                if (this.wishlistOn) {
                    this.wishlist();
                }
            }
            else {
                if (this.notifyOn) {
                    this.notify();
                }
            }
        };
        return csfn;
    })();
    var s = new csfn();
    s.run();
})();
