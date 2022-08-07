// ==UserScript==
// @name         Steam GameList Loader
// @namespace    https://github.com/sffxzzp
// @version      0.02
// @description  Replace the raw method of Steam shows the game list.
// @author       sffxzzp
// @match        *://steamcommunity.com/*/games/?tab=all
// @icon         https://store.steampowered.com/favicon.ico
// @grant        unsafeWindow
// @run-at       document-body
// @updateURL    https://sffxzzp.coding.net/p/userscripts/d/userscripts/git/raw/master/steamgamelistloader.user.js
// ==/UserScript==

(function () {
    var oriBGR = unsafeWindow.BuildGameRow;
    unsafeWindow.BuildGameRow = function () {};
    document.addEventListener('DOMContentLoaded', run);

    var sgl = (function () {
        function sgl() {}
        sgl.prototype.run = function () {
            this.injectFilter();
            this.load(0);
        };
        sgl.prototype.injectFilter = function () {
            document.querySelector('#gameFilter').removeAttribute('onkeyup');
            document.querySelector('#gameFilter').setAttribute('placeholder', '请输入三个以上字母');
            document.querySelector('#gameFilter').onkeyup = function () {
                let filterString = document.querySelector('#gameFilter').value.toLowerCase();
                if (filterString.length > 2) {
                    document.querySelector('#games_list_rows').innerHTML = '';
                    unsafeWindow.rgGames.forEach(function (game, index) {
                        var appid = game.appid;
                        if (parseInt(appid)!=appid) {return;}
                        var lc = game.name.toString().toLowerCase();
                        if (filterString.length == 0 || lc.indexOf( filterString ) != -1) {
                            oriBGR(game);
                        }
                    });
                }
            }
        };
        sgl.prototype.load = function (page, limit=100) {
            for (let i=page*limit;i<(page+1)*limit;i++) {
                oriBGR(unsafeWindow.rgGames[i]);
            }
        };
        return sgl;
    })();
    function run() {
        var program = new sgl();
        program.run();
    }
})();