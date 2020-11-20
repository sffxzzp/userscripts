// ==UserScript==
// @name         Keylol SteamID Display
// @namespace    https://github.com/sffxzzp
// @version      0.06
// @description  Display hided SteamID in keylol's steam connect bar
// @author       sffxzzp
// @match        *://keylol.com/t*
// @match        *://keylol.com/forum.php?mod=viewthread&tid=*
// @connect      api.steampowered.com
// @connect      steamcommunity.com
// @icon         https://keylol.com/favicon.ico
// @grant        GM_xmlhttpRequest
// @updateURL    https://github.com/sffxzzp/userscripts/raw/master/keylol/stcnsteamid.user.js
// ==/UserScript==

(function() {
    // Get data from Steam Web API.
    var useapi = false;
    // API Key, copied from Enhanced Steam.
    var apikey = '824367C3B8AA3C7EADD70FF8A0DB3516';

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
    var ksd = (function () {
        var ksd = function () {};
        ksd.prototype.setNameToLocalStorage = function (steam64id, name) {
            var nameList = JSON.parse(localStorage.getItem('ksd')) || {};
            nameList[steam64id] = {name: name, last: (new Date()).getTime()};
            localStorage.setItem('ksd', JSON.stringify(nameList));
        }
        ksd.prototype.getNameFromSteam64ID = async function (steam64id) {
            var nameList = JSON.parse(localStorage.getItem('ksd')) || {};
            var nameItem = nameList[steam64id];
            if (nameItem && nameItem.last < (new Date()).getTime() - 86400000) {
                return nameItem.name;
            }
            else {
                var name = '';
                if (useapi) {
                    var apiData = await util.xhr({url: `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${apikey}&steamids=${steam64id}`});
                    name = JSON.parse(apiData.body).response.players[0].personaname;
                }
                else {
                    var xmlData = await util.xhr({url: `https://steamcommunity.com/profiles/${steam64id}/?xml=1`});
                    xmlData = (new DOMParser).parseFromString(xmlData.body, 'text/xml');
                    name = xmlData.querySelector('steamID').textContent;
                }
                this.setNameToLocalStorage(steam64id, name);
                return name;
            }
        };
        ksd.prototype.addSteamID = async function (node) {
            if (node.innerHTML.indexOf('社区昵称') < 0) {
                var steam64id = node.querySelector('.steam_connect_user_bar_link_repcn').href.split('profiles/')[1];
                var name = await this.getNameFromSteam64ID(steam64id);
                node.insertBefore(document.createTextNode(`社区昵称：${name} `), node.children[0]);
            }
        };
        ksd.prototype.run = function () {
            var _this = this;
            var stbar = document.querySelectorAll('.steam_connect_user_bar') || [];
            stbar.forEach(function (node) {
                _this.addSteamID(node);
            });
            var postlist = document.getElementById("postlist");
            var observer = new MutationObserver(function (recs) {
                for (let i=0;i<recs.length;i++) {
                    let rec = recs[i];
                    if (rec.target.id.substr(0, 8) == 'postlist') {
                        _this.addSteamID(rec.target.querySelector('.steam_connect_user_bar'));
                        break;
                    }
                }
            });
            observer.observe(postlist, { childList: true, subtree: true });
        };
        return ksd;
    })();
    var script = new ksd();
    script.run();
})();
