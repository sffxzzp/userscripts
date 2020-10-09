// ==UserScript==
// @name         Keylol SteamID Display
// @namespace    https://github.com/sffxzzp
// @version      0.02
// @description  Display hided SteamID in keylol's steam connect bar
// @author       sffxzzp
// @match        *://keylol.com/t*
// @match        *://keylol.com/forum.php?mod=viewthread&tid=*
// @connect      steamcommunity.com
// @icon         https://keylol.com/favicon.ico
// @grant        GM_xmlhttpRequest
// @updateURL    https://github.com/sffxzzp/userscripts/raw/master/keylol/stcnsteamid.user.js
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
    var ksd = (function () {
        var ksd = function () {};
        ksd.prototype.setNameToLocalStorage = function (steam64id, name) {
            var nameList = JSON.parse(localStorage.getItem('ksd')) || {};
            nameList[steam64id] = name;
            localStorage.setItem('ksd', JSON.stringify(nameList));
        }
        ksd.prototype.getNameFromSteam64ID = async function (steam64id) {
            var nameList = JSON.parse(localStorage.getItem('ksd')) || {};
            var name = nameList[steam64id];
            if (name) {
                return name;
            }
            else {
                var xmlData = await util.xhr({url: `https://steamcommunity.com/profiles/${steam64id}/?xml=1`});
                xmlData = (new DOMParser).parseFromString(xmlData.body, 'text/xml');
                name = xmlData.querySelector('steamID').textContent;
                this.setNameToLocalStorage(steam64id, name);
                return name;
            }
        };
        ksd.prototype.run = function () {
            var _this = this;
            var stbar = document.querySelectorAll('.steam_connect_user_bar') || [];
            stbar.forEach(async function (node) {
                var steam64id = node.querySelector('.steam_connect_user_bar_link_repcn').href.split('profiles/')[1];
                var name = await _this.getNameFromSteam64ID(steam64id);
                node.innerHTML = `社区昵称：${name} ` + node.innerHTML;
            });
        };
        return ksd;
    })();
    var script = new ksd();
    script.run();
})();
