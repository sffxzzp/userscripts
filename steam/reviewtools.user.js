// ==UserScript==
// @name         Steam Review Edit-tools
// @namespace    https://github.com/sffxzzp
// @version      0.01
// @description  Add edit tools to steam review.
// @author       sffxzzp
// @match        *://store.steampowered.com/app/*
// @icon         https://store.steampowered.com/favicon.ico
// @connect      steamcommunity.com
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @updateURL    https://github.com/sffxzzp/userscripts/raw/master/steam/reviewtools.user.js
// ==/UserScript==

(function() {
    var util = (function () {
        function util() {}
        util.xhr = function (xhrData) {
            return new Promise(function(resolve, reject) {
                if (!xhrData.xhr) {
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
    var sre = (function () {
        var sre = function () {};
        sre.prototype.run = async function () {
            var commPage = await util.xhr({url: 'https://steamcommunity.com/'});
            var commData = (new DOMParser()).parseFromString(commPage.body, 'text/html');
            var commSessionRegExp = /g_sessionID = "(.*?)";/g;
            var commSessionID = commSessionRegExp.exec(commData.querySelector('.responsive_page_content > script').innerHTML);
            if (commSessionID.length > 1) {
                localStorage.setItem('sre_sessionID', commSessionID[1]);
                this.addStyles();
                this.addButtons();
            }
            else {
                alert('未登录社区');
            }
        };
        sre.prototype.addStyles = function () {
            GM_addStyle('#preview_body .bb_ul > li, #preview_body ol {list-style-position: inside}');
        };
        sre.prototype.wrapURL = function (inputBox, start, end) {
            this.wrapSelection(inputBox, start, end);
        };
        sre.prototype.wrapList = function (inputBox, start, end, item) {
            var txtStart = inputBox.value.substring(0, inputBox.selectionStart);
            var txtEnd = inputBox.value.substring(inputBox.selectionEnd, inputBox.value.length);
            var selText = inputBox.value.substring(inputBox.selectionStart, inputBox.selectionEnd);
            selText = '\n' + item + selText.split('\n').join('\n' + item) + '\n';
            inputBox.value = txtStart + start + selText + end + txtEnd;
        };
        sre.prototype.wrapSelection = function (inputBox, start, end) {
            var txtStart = inputBox.value.substring(0, inputBox.selectionStart);
            var txtEnd = inputBox.value.substring(inputBox.selectionEnd, inputBox.value.length);
            var selText = inputBox.value.substring(inputBox.selectionStart, inputBox.selectionEnd);
            inputBox.value = txtStart + start + selText + end + txtEnd;
        };
        sre.prototype.addButtons = function () {
            var _this = this;
            var target = document.querySelector('#review_container .content');
            var inputBox = target.querySelector('#game_recommendation');
            var targetCtl = target.querySelector('.controls');

            var previewBox = util.createElement({node: 'div', content: {id: 'preview_body', class: 'body_text', style: 'padding: 10px; background-color: #222b35; margin-right: 7px;'}});
            target.insertBefore(previewBox, targetCtl);

            var ctrlBar = util.createElement({node: 'div', content: {class: 'editGuideSubSectionControls', style: 'padding: 3px;'}});
            var boldBtn = util.createElement({node: 'a', content: {class: 'btn_grey_black btn_small_thin', style: 'margin: 1px;'}, html: '<span><img src="https://steamcommunity-a.akamaihd.net/public/images/sharedfiles/guides/format_bold.png"></span>'});
            boldBtn.onclick = function () {
                _this.wrapSelection(inputBox, '[b]', '[/b]');
            };
            ctrlBar.appendChild(boldBtn);
            var uLineBtn = util.createElement({node: 'a', content: {class: 'btn_grey_black btn_small_thin', style: 'margin: 1px;'}, html: '<span><img src="https://steamcommunity-a.akamaihd.net/public/images/sharedfiles/guides/format_underline.png"></span>'});
            uLineBtn.onclick = function () {
                _this.wrapSelection(inputBox, '[u]', '[/u]');
            };
            ctrlBar.appendChild(uLineBtn);
            var italicBtn = util.createElement({node: 'a', content: {class: 'btn_grey_black btn_small_thin', style: 'margin: 1px;'}, html: '<span><img src="https://steamcommunity-a.akamaihd.net/public/images/sharedfiles/guides/format_italic.png"></span>'});
            italicBtn.onclick = function () {
                _this.wrapSelection(inputBox, '[i]', '[/i]');
            };
            ctrlBar.appendChild(italicBtn);
            var strikeBtn = util.createElement({node: 'a', content: {class: 'btn_grey_black btn_small_thin', style: 'margin: 1px;'}, html: '<span><img src="https://steamcommunity-a.akamaihd.net/public/images/sharedfiles/guides/format_strike.png"></span>'});
            strikeBtn.onclick = function () {
                _this.wrapSelection(inputBox, '[strike]', '[/strike]');
            };
            ctrlBar.appendChild(strikeBtn);
            var urlBtn = util.createElement({node: 'a', content: {class: 'btn_grey_black btn_small_thin', style: 'margin: 1px;'}, html: '<span><img src="https://steamcommunity-a.akamaihd.net/public/images/sharedfiles/guides/format_link.png"></span>'});
            urlBtn.onclick = function () {
                _this.wrapURL(inputBox, '[url]', '[/url]');
            };
            ctrlBar.appendChild(urlBtn);
            var listBtn = util.createElement({node: 'a', content: {class: 'btn_grey_black btn_small_thin', style: 'margin: 1px;'}, html: '<span><img src="https://steamcommunity-a.akamaihd.net/public/images/sharedfiles/guides/format_bullet.png"></span>'});
            listBtn.onclick = function () {
                _this.wrapList(inputBox, '[list]', '[/list]', '[*] ');
            };
            ctrlBar.appendChild(listBtn);
            var h1Btn = util.createElement({node: 'a', content: {class: 'btn_grey_black btn_small_thin', style: 'margin: 1px;'}, html: '<span><img src="https://steamcommunity-a.akamaihd.net/public/images/sharedfiles/guides/format_header1.png"></span>'});
            h1Btn.onclick = function () {
                _this.wrapSelection(inputBox, '[h1]', '[/h1]');
            };
            ctrlBar.appendChild(h1Btn);

            var helpBtn = util.createElement({node: 'a', content: {class: 'btn_grey_black btn_small_thin', style: 'margin: 1px;', href: 'javascript:void(0);', onclick: `window.open( 'https://steamcommunity.com/comment/Recommendation/formattinghelp','formattinghelp','height=640,width=640,resize=yes,scrollbars=yes' );`}, html: '<span>格式帮助</span>'});
            ctrlBar.appendChild(helpBtn);
            var previewBtn = util.createElement({node: 'a', content: {class: 'btn_grey_black btn_small_thin', style: 'margin: 1px; margin-right: 7px; float: right;'}, html: '<span>预览</span>'});
            previewBtn.onclick = async function () {
                var commSessionID = localStorage.getItem('sre_sessionID');
                var previewData = await util.xhr({url: 'https://steamcommunity.com/groups/keylol-player-club/announcements/preview', method: 'post', type: 'json', data: `sessionID=${commSessionID}&action=preview&headline=&body=${inputBox.value}`, headers: {"content-type": "application/x-www-form-urlencoded; charset=utf-8"}});
                previewData = previewData.body.body;
                previewBox.innerHTML = previewData;
            };
            ctrlBar.appendChild(previewBtn);
            target.insertBefore(ctrlBar, inputBox);
        };
        return sre;
    })();
    var s = new sre();
    s.run();
})();
