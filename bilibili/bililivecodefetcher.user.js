// ==UserScript==
// @name         Bili Live Code Fetcher
// @namespace    https://github.com/sffxzzp
// @version      0.11
// @description  WTF is that 100 fans limit
// @author       sffxzzp
// @match        *://link.bilibili.com/p/center/index*
// @grant        GM_addStyle
// @icon         https://www.bilibili.com/favicon.ico
// @updateURL    https://github.com/sffxzzp/userscripts/raw/master/bilibili/bililivecodefetcher.user.js
// @downloadURL  https://github.com/sffxzzp/userscripts/raw/master/bilibili/bililivecodefetcher.user.js
// ==/UserScript==

(function() {
    var util = (function () {
        function util() {}
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
    let blcf = (function () {
        let blcf = function () {};
        blcf.prototype.getCookie = function (name) {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(';').shift();
        };
        blcf.prototype.getRoomID = async function () {
            let room = await fetch('https://api.live.bilibili.com/xlive/app-blink/v1/room/GetInfo?platform=pc', {credentials: 'include'}).then(res => res.json());
            return room.data.room_id;
        };
        blcf.prototype.getAreaList = async function () {
            let data = await fetch('https://api.live.bilibili.com/room/v1/Area/getList?show_pinyin=1').then(res => res.json());
            return data.data;
        };
        blcf.prototype.getLiveStatus = async function (roomid) {
            let data = await fetch(`https://api.live.bilibili.com/xlive/web-room/v2/index/getRoomPlayInfo?room_id=${roomid}`).then(res => res.json());
            console.log(data);
            return data.data.live_status;
        };
        blcf.prototype.getAreaSelected = function () {
            return parseInt(document.querySelector('#blcf_areaid').value)
        };
        blcf.prototype.setInfo = function (html) {
            document.querySelector('#blcf_info').innerHTML = html;
        };
        blcf.prototype.startLive = async function (roomid) {
            let data = new FormData();
            data.append('room_id', roomid);
            data.append('area_v2', this.getAreaSelected());
            data.append('platform', 'pc');
            data.append('csrf_token', this.getCookie('bili_jct'));
            data.append('csrf', this.getCookie('bili_jct'));
            data.append('visit_id', '');
            let res = await fetch('https://api.live.bilibili.com/room/v1/Room/startLive', {method: 'POST', body: data, credentials: 'include'}).then(res => res.json());
            let idata = new FormData();
            idata.append('csrf', this.getCookie('bili_jct'));
            // action 2 是刷新并获取身份码
            idata.append('action', 1);
            let ires = await fetch('https://api.live.bilibili.com/xlive/open-platform/v1/common/operationOnBroadcastCode', {method: 'POST', body: data, credentials: 'include'}).then(res => res.json());
            this.setInfo(`开播成功！<br>直播地址：${res.data.protocols[0].addr}<br>推流码：${res.data.protocols[0].code}<br>身份码：${ires.data.code}`);
        };
        blcf.prototype.stopLive = async function (roomid) {
            let data = new FormData();
            data.append('room_id', roomid);
            data.append('platform', 'pc');
            data.append('csrf_token', this.getCookie('bili_jct'));
            data.append('csrf', this.getCookie('bili_jct'));
            data.append('visit_id', '');
            await fetch('https://api.live.bilibili.com/room/v1/Room/stopLive', {method: 'POST', body: data, credentials: 'include'}).then(res => res.json());
            this.setInfo(`关播成功！`);
        };
        blcf.prototype.load = async function () {
            let _this = this;
            const roomid = await _this.getRoomID();
            const arealist = await _this.getAreaList();
            const isLive = await _this.getLiveStatus(roomid);

            GM_addStyle(`#blcf_areaid { height: 25px; padding: 2px 8px; line-height: 25px; border: 1px solid #aaa; border-radius: 4px; background-color: #fff; outline: none; } .blcf_button { margin-left: 10px; background-color: #23ade5; color: #fff; border-radius: 4px; padding: 3px 12px; } .blcf_button:disabled { color: #b4b4b4; background-color: #e9eaec; }`);

            let container = document.querySelector('section.live-setting-ctnr div.hint');

            container.appendChild(util.createElement({node: 'p', html: '<br>去你大爷的粉丝数限制，看我的：'}));

            let areaHTML = '';
            arealist.forEach(function (areaType) {
                areaHTML += `<option value="${areaType.id}" disabled>${areaType.name}</option>`;
                areaType.list.forEach(function (area) {
                    let selected = area.id == 235 ? ' selected' : '';
                    areaHTML += `<option value="${area.id}"${selected}>&nbsp;&nbsp;&nbsp;&nbsp;${area.name}</option>`;
                });
                areaHTML += `<option disabled></option>`;
            });
            let select = util.createElement({node: 'select', content: {id: 'blcf_areaid'}, html: areaHTML});
            container.appendChild(select);

            let startLive = util.createElement({node: 'button', content: {class: 'blcf_button'}, html: '开播'});
            if (isLive) {
                startLive.disabled = true;
            }
            startLive.onclick = function () {
                _this.startLive(roomid);
                startLive.disabled = true;
                stopLive.disabled = false;
            };
            container.appendChild(startLive);

            let stopLive = util.createElement({node: 'button', content: {class: 'blcf_button'}, html: '关播'});
            if (!isLive) {
                stopLive.disabled = true;
            }
            stopLive.onclick = function () {
                _this.stopLive(roomid);
                stopLive.disabled = true;
                startLive.disabled = false;
            };
            container.appendChild(stopLive);

            let info = util.createElement({node: 'div', content: {id: 'blcf_info'}, html: ''});
            container.appendChild(info);
        };
        blcf.prototype.run = async function () {
            const _this = this;
            let container = document.querySelector('main.app-body');
            let observer = new MutationObserver(function (recs) {
                for (let i = 0; i < recs.length; i++) {
                    let rec = recs[i];
                    if (rec.target.classList.contains('my-room')) {
                        let tgt = rec.target.querySelector('section.live-setting-ctnr') || null;
                        if (tgt) {
                            _this.load();
                        }
                        break;
                    }
                }
            });
            observer.observe(container, { childList: true, subtree: true });
        };
        return blcf;
    })();
    var live = new blcf();
    live.run();
})();
