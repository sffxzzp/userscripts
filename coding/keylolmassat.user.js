// ==UserScript==
// @name         Keylol Mass At
// @namespace    https://coding.net/u/sffxzzp
// @version      0.01
// @description  一键at当前整页。
// @author       sffxzzp
// @match        *://keylol.com/t*
// @match        *://keylol.com/forum.php?mod=viewthread&tid=*
// @icon         https://keylol.com/favicon.ico
// @updateURL    https://sffxzzp.coding.net/p/userscripts/d/userscripts/git/raw/master/keylolmassat.user.js
// ==/UserScript==

(function() {
    var kma = (function () {
        var kma = function () {};
        kma.prototype.getSelfUID = function () {
            return document.querySelector('#nav-user-action-bar > ul > li.dropdown > a').getAttribute('href').split('-')[1];
        };
        kma.prototype.getReplyNames = function () {
            var names = [];
            var suid = this.getSelfUID();
            document.querySelectorAll('.authi > .xw1').forEach(function (node) {
                var uid = node.getAttribute('href').split('-')[1];
                if (parseInt(uid) != parseInt(suid)) {
                    names.push(node.innerHTML);
                }
            });
            return names;
        };
        kma.prototype.getAtList = function () {
            var names = this.getReplyNames();
            return '@'+names.join(' @');
        };
        kma.prototype.addButton = function () {
            var _this = this;
            var buttonBar = document.querySelector('.fpd');
            var atButton = buttonBar.querySelector('#fastpostat');
            var newButton = document.createElement('a');
            newButton.href = "javascript:;";
            newButton.className = 'fat';
            newButton.onclick = function () {
                document.querySelector('#fastpostmessage').value += _this.getAtList();
            };
            newButton.innerHTML = '@此页';
            buttonBar.insertBefore(newButton, atButton);
        };
        kma.prototype.init = function () {
            this.addButton();
        };
        return kma;
    })();
    var script = new kma();
    script.init();
})();