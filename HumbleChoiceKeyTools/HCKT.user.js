// ==UserScript==
// @name         Humble Choice Key Tools
// @namespace    https://github.com/sffxzzp
// @version      0.23
// @description  Display Humble Choice region restriction infomation, and select game without reveal it's key, and reveal all selected keys.
// @author       sffxzzp
// @match        *://www.humblebundle.com/subscription/*
// @icon         https://humblebundle-a.akamaihd.net/static/hashed/46cf2ed85a0641bfdc052121786440c70da77d75.png
// @grant        GM_xmlhttpRequest
// @updateURL    https://github.com/sffxzzp/userscripts/raw/master/HumbleChoiceKeyTools/HCKT.user.js
// ==/UserScript==

(function () {
    var common = (function () {
        function common() {}
        common.countryMap = {
            AD: '安道尔',
            AE: '阿拉伯联合酋长国',
            AF: '阿富汗',
            AG: '安提瓜和巴布达',
            AI: '安圭拉',
            AL: '阿尔巴尼亚',
            AM: '亚美尼亚',
            AO: '安哥拉',
            AQ: '南极洲',
            AR: '阿根廷',
            AS: '美属萨摩亚',
            AT: '奥地利',
            AU: '澳大利亚',
            AW: '阿鲁巴',
            AX: '奥兰群岛',
            AZ: '阿塞拜疆',
            BA: '波斯尼亚和黑塞哥维那',
            BB: '巴巴多斯',
            BD: '孟加拉',
            BE: '比利时',
            BF: '布基纳法索',
            BG: '保加利亚',
            BH: '巴林',
            BI: '布隆迪',
            BJ: '贝宁',
            BL: '圣巴托洛缪岛',
            BM: '百慕大',
            BN: '文莱',
            BO: '玻利维亚',
            BQ: '博奈尔',
            BR: '巴西',
            BS: '巴哈马',
            BT: '不丹',
            BU: '缅甸',
            BV: '布韦岛',
            BW: '博兹瓦纳',
            BY: '白俄罗斯',
            BZ: '伯利兹',
            CA: '加拿大',
            CC: '科科斯（基林）群岛',
            CD: '刚果（金）',
            CF: '中非共和国',
            CG: '刚果（布）',
            CH: '瑞士',
            CI: '科特迪瓦',
            CK: '库克群岛',
            CL: '智利',
            CM: '喀麦隆',
            CN: '<b style="color: gold; font-size: 16px;">中国</b>',
            CO: '哥伦比亚',
            CR: '哥斯达黎加',
            CS: '塞尔维亚和黑山',
            CU: '古巴',
            CV: '佛得角',
            CW: '库拉索',
            CX: '圣诞岛',
            CY: '塞浦路斯',
            CZ: '捷克',
            DE: '德国',
            DJ: '吉布提',
            DK: '丹麦',
            DM: '多米尼克',
            DO: '多米尼加',
            DZ: '阿尔及利亚',
            EC: '厄瓜多尔',
            EE: '爱沙尼亚',
            EG: '埃及',
            EH: '西撒哈拉',
            ER: '厄立特里亚',
            ES: '西班牙',
            ET: '埃塞俄比亚',
            FI: '芬兰',
            FJ: '斐济',
            FK: '福克兰群岛',
            FM: '密克罗尼西亚',
            FO: '法罗群岛',
            FR: '法国',
            GA: '加蓬',
            GB: '英国',
            GD: '格林纳达',
            GE: '格鲁吉亚',
            GF: '法属圭亚那',
            GG: '根西',
            GH: '加纳',
            GI: '直布罗陀',
            GL: '格陵兰',
            GM: '冈比亚',
            GN: '几内亚',
            GP: '瓜德鲁普',
            GQ: '赤道几内亚',
            GR: '希腊',
            GS: '南乔治亚岛和南桑威奇群岛',
            GT: '危地马拉',
            GU: '关岛',
            GW: '几内亚比绍',
            GY: '圭亚那',
            HK: '<b style="color: gold; font-size: 16px;">香港</b>',
            HM: '赫德岛和麦克唐纳群岛',
            HN: '洪都拉斯',
            HR: '克罗地亚',
            HT: '海地',
            HU: '匈牙利',
            ID: '印尼',
            IE: '爱尔兰',
            IL: '以色列',
            IM: '马恩岛',
            IN: '印度',
            IO: '英属印度洋领地',
            IQ: '伊拉克',
            IR: '伊朗',
            IS: '冰岛',
            IT: '意大利',
            JE: '泽西岛',
            JM: '牙买加',
            JO: '约旦',
            JP: '日本',
            KE: '肯尼亚',
            KG: '吉尔吉斯',
            KH: '柬埔寨',
            KI: '基里巴斯',
            KM: '科摩罗',
            KN: '圣基茨和尼维斯',
            KP: '朝鲜',
            KR: '韩国',
            KW: '科威特',
            KY: '开曼群岛',
            KZ: '哈萨克斯坦',
            LA: '老挝',
            LB: '黎巴嫩',
            LC: '圣卢西亚',
            LI: '列支敦士登',
            LK: '斯里兰卡',
            LR: '利比里亚',
            LS: '莱索托',
            LT: '立陶宛',
            LU: '卢森堡',
            LV: '拉脱维亚',
            LY: '利比亚',
            MA: '摩洛哥',
            MC: '摩纳哥',
            MD: '摩尔多瓦',
            ME: '黑山',
            MF: '法属圣马丁',
            MG: '马达加斯加',
            MH: '马绍尔群岛',
            MK: '马其顿',
            ML: '马里',
            MM: '缅甸',
            MN: '蒙古',
            MO: '<b style="color: gold; font-size: 16px;">澳门</b>',
            MP: '北马里亚纳群岛',
            MQ: '马提尼克',
            MR: '毛里塔尼亚',
            MS: '蒙塞拉特',
            MT: '马耳他',
            MU: '毛里求斯',
            MV: '马尔代夫',
            MW: '马拉维',
            MX: '墨西哥',
            MY: '马来西亚',
            MZ: '莫桑比克',
            NA: '纳米比亚',
            NC: '新喀里多尼亚',
            NE: '尼日尔',
            NF: '诺福克岛',
            NG: '尼日利',
            NI: '尼加拉瓜',
            NL: '荷兰',
            NO: '挪威',
            NP: '尼泊尔',
            NR: '瑙鲁',
            NU: '纽埃',
            NZ: '新西兰',
            OM: '阿曼',
            PA: '巴拿马',
            PE: '秘鲁',
            PF: '法属波利尼西亚a',
            PG: '巴布亚新几内亚',
            PH: '菲律宾',
            PK: '巴基斯坦',
            PL: '波兰',
            PM: '圣皮埃尔和密克隆',
            PN: '皮特凯恩群岛',
            PR: '波多黎各',
            PS: '巴勒斯坦',
            PT: '葡萄牙',
            PW: '帕劳',
            PY: '巴拉圭',
            QA: '卡塔尔',
            RE: '留尼旺島',
            RO: '罗马尼亚',
            RS: '塞尔维亚',
            RU: '俄罗斯',
            RW: '卢旺达',
            SA: '沙特阿拉伯',
            SB: '所罗门群岛',
            SC: '塞舌尔',
            SD: '苏丹',
            SE: '瑞典',
            SG: '新加坡',
            SH: '圣赫勒拿、阿森松与特斯坦达库尼亚',
            SI: '斯洛文尼',
            SJ: '斯瓦尔巴群岛和扬马延岛',
            SK: '斯洛伐克',
            SL: '塞拉利昂',
            SM: '圣马力诺',
            SN: '塞内加尔',
            SO: '索马里',
            SR: '苏里南',
            SS: '南苏丹',
            ST: '圣多美和普林西比',
            SV: '萨尔瓦多',
            SX: '荷属圣马丁',
            SY: '叙利亚',
            SZ: '斯威士兰',
            TC: '特克斯和凯科斯群岛',
            TD: '乍得',
            TF: '法属南部领土',
            TG: '多哥',
            TH: '泰国',
            TJ: '塔吉克斯坦',
            TK: '托克劳',
            TL: '东帝汶',
            TM: '土库曼斯坦',
            TN: '突尼斯',
            TO: '汤加',
            TR: '土耳其',
            TT: '特立尼达和多巴哥',
            TV: '图瓦卢',
            TW: '<b style="color: gold; font-size: 16px;">台湾</b>',
            TZ: '坦桑尼亚',
            UA: '乌克兰',
            UG: '乌干达',
            UM: '美国本土外小岛屿',
            US: '美国',
            UY: '乌拉圭',
            UZ: '乌兹别克斯坦',
            VA: '圣座',
            VC: '圣文森特和格林纳丁斯',
            VE: '委内瑞拉',
            VG: '英属维尔京群岛',
            VI: '美属维尔京群岛',
            VN: '越南',
            VU: '瓦努阿图',
            WF: '瓦利斯和富图纳群岛',
            WS: '萨摩亚',
            XK: '科索沃',
            YE: '也门',
            YT: '马约特',
            ZA: '南非',
            ZM: '赞比亚',
            ZW: '津巴布韦',
        };
        common.getCountryByCode = function (code) { return code.map(attr => common.countryMap[attr]).reduce((a, b) => `${a}、${b}`); };
        return common;
    })();
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
                if (data.content) {
                    this.setElement({node: node, content: data.content});
                }
                if (data.html) {
                    node.innerHTML = data.html;
                }
            }
            return node;
        };
        util.setElement = function (data) {
            if (data.node) {
                for (let name in data.content) {
                    data.node.setAttribute(name, data.content[name]);
                }
                if (data.html!=undefined) {
                    data.node.innerHTML = data.html;
                }
            }
        };
        return util;
    })();
    var hckt = (function () {
        function hckt() {};
        hckt.prototype.getKey = async function (textarea, title, data) {
            var result = await util.xhr({ url: 'https://www.humblebundle.com/humbler/redeemkey', method: 'post', data: data, xhr: true });
            var res = JSON.parse(result.body);
            if (res.success) { textarea.value += `${title}    ${res.key}\n`; }
        };
        hckt.prototype.getCSRFToken = function (htmlstr) {
            return (new DOMParser()).parseFromString(htmlstr, 'text/html').querySelector('.csrftoken').getAttribute('value');
        };
        hckt.prototype.showInfo = function (info) {
            var __this = this;
            var csrfToken = __this.getCSRFToken(info.csrfTokenInput);
            info = info.contentChoiceOptions;
            var choosed = [];
            var subname = '';
            if (info.contentChoicesMade) {
                for (var sName in info.contentChoicesMade) {
                    if (sName.indexOf('initial')>-1 && sName != 'initial-without-order') {
                        subname = sName;
                        break;
                    }
                }
                choosed = info.contentChoicesMade[subname].choices_made;
            }
            var gameKey = info.gamekey;
            for (sName in info.contentChoiceData) {
                if (sName.indexOf('initial')>-1 && sName != 'initial-without-order') {
                    subname = sName;
                    break;
                }
            }
            if (subname == '') {
                console.log('Error fetching subscribe type.');
            }
            info = info.contentChoiceData[subname];
            var order = info.display_order;
            var content = [];
            for (var i=0;i<order.length;i++) {
                var rInfo = info.content_choices[order[i]];
                var tpkds;
                var multikey = false;
                if ('tpkds' in rInfo) {
                    tpkds = rInfo.tpkds[0];
                }
                else if ('nested_choice_tpkds' in rInfo) {
                    multikey = true;
                    for (var platform in rInfo.nested_choice_tpkds) {
                        if (platform.indexOf('_steam') > -1) {
                            tpkds = rInfo.nested_choice_tpkds[platform][0];
                            multikey = platform;
                            break;
                        }
                    }
                }
                else {
                    tpkds = false;
                }
                if (tpkds) {
                    content.push({
                        title: rInfo.title,
                        exclusive: tpkds.exclusive_countries,
                        disallow: tpkds.disallowed_countries,
                        rawName: tpkds.machine_name,
                        appid: tpkds.steam_app_id,
                        revealed: 'is_gift' in tpkds,
                        selName: order[i],
                        multi: multikey
                    });
                }
                else {
                    console.log('Error fetching info of ' + rInfo.title);
                }
            }
            var out;
            var outputHTML = `<h3 class="content-choices-title">刮 Key 区<a style="padding-left: 20px; font-weight: initial; font-size: 16px; float: right; color: #169fe3;" href="" id="hckt_revealAll" onclick="return false;">刮开已选</a></h3><textarea id="hckt_revealArea" style="padding: 10px; width: calc(100% - 20px); min-height: 310px; background-color: #363c49; border: none; border-radius: 5px;">`;
            outputHTML += `点击右上角「刮开已选」会一键刮开所有已选择的游戏 Key，并在此显示。\n以下为已经选择的游戏（将会被刮开）：\n`;
            var selected = {'name': [], 'id': []};
            var revealed = {'name': [], 'id': []};
            for (var k=0;k<content.length;k++) {
                if (choosed.indexOf(content[k].selName) >= 0) {
                    if (content[k].revealed) {
                        revealed.name.push(content[k].title);
                        revealed.id.push(content[k].selName);
                    }
                    else {
                        selected.name.push(content[k].title);
                        selected.id.push(content[k].selName);
                    }
                }
            }
            outputHTML += selected.name.join('\n');
            outputHTML += `\n以下为已经刮开的游戏：\n`;
            outputHTML += revealed.name.join('\n');
            outputHTML += `</textarea>`;
            outputHTML += `<h3 class="content-choices-title">锁区信息<a id="hckt_showhide" style="padding-left: 20px; font-weight: initial; font-size: 16px; float: right; color: #169fe3;" href="" onclick="return false;">展开/折叠</a><a style="font-weight: initial; font-size: 16px; float: right; color: #169fe3;" href="https://www.humblebundle.com/downloads?key=${gameKey}">进入 download 页</a></h3><div id="hckt_keyInfo" class="hckt_show">`;
            for (var j=0;j<content.length;j++) {
                out = `<span style="color: #169fe3;">${content[j].title}</span>`;
                if (choosed.indexOf(content[j].selName) < 0) {
                    var postdata = `gamekey=${gameKey}&parent_identifier=${subname}&chosen_identifiers%5B%5D=${content[j].selName}`;
                    var multi = '', selClass = 'class="hckt_select"', selDes = '只选不刮', color = '#169fe3';
                    if (content[j].multi) {
                        if (content[j].multi === true) { selClass = ''; color = 'grey'; postdata = ''; selDes = '手动选择'; }
                        else { multi = `gamekey=${gameKey}&parent_identifier=${content[j].selName}&chosen_identifiers%5B%5D=${content[j].multi}`; }
                    }
                    else { postdata += '&is_multikey_and_from_choice_modal=false'; }
                    out += `<a ${selClass} style="float: right; color: ${color}; margin-left: 20px;" href="javascript:;" data="${postdata}" multi="${multi}">${selDes}</a>`
                }
                else {
                    out += `<a style="float: right; color: #f18d22; margin-left: 20px;" href="javascript:;">已选择过</a>`;
                }
                if (content[j].appid != null) {
                    out += `<a style="float: right; color: #169fe3;" href="https://store.steampowered.com/app/${content[j].appid}" target="_blank">商店页面</a>`;
                }
                out += `<br /><span style="color: #ccc; font-size: 14px;">Machine Name: ${content[j].rawName}</span><br />`;
                if (content[j].exclusive.length === 0 && content[j].disallow.length === 0) {
                    out += `<span style="color: #97B147; font-size: 14px;">无激活限制</span><br />`;
                }
                else {
                    if (content[j].exclusive.length > 0) {
                        out += `<span style="color: #f18d22; font-size: 14px;">只能在以下地区激活：${common.getCountryByCode(content[j].exclusive)}</span><br />`;
                    }
                    if (content[j].disallow.length > 0) {
                        out += `<span style="color: #f18d22; font-size: 14px;">不能在以下地区激活：${common.getCountryByCode(content[j].disallow)}</span><br />`;
                    }
                }
                out += `<br />`;
                outputHTML += out;
            }
            outputHTML += `</div>`;
            var targetNode = document.querySelector('.content-choices-view');
            var targetPos = document.querySelector('.content-choices-header');
            var insertInfo = util.createElement({node: "div", content: {style: "background-color: #454c5e; padding: 0.25em 1.5em;"}, html: outputHTML});
            targetNode.insertBefore(insertInfo, targetPos);
            document.querySelectorAll('.hckt_select').forEach(function (node) {
                node.onclick = async function () {
                    var _node = this;
                    _node.onclick = function () {return false;}
                    _node.innerHTML = '请稍等…';
                    var result = await util.xhr({ url: `https://www.humblebundle.com/humbler/choosecontent`, method: 'post', data: _node.getAttribute('data'), headers: {'CSRF-Prevention-Token': csrfToken}, xhr: true });
                    result = JSON.parse(result.body);
                    if (result.success) {
                        if (_node.getAttribute('multi')) {
                            var resultSec = await util.xhr({ url: 'https://www.humblebundle.com/humbler/choosecontent', method: 'post', data: _node.getAttribute('multi'), headers: {'CSRF-Prevention-Token': csrfToken}, xhr: true });
                            resultSec = JSON.parse(resultSec.body);
                            if (resultSec.success) {
                                _node.innerHTML = '已选择过';
                                _node.setAttribute('style', 'float: right; color: #f18d22; margin-left: 20px;');
                            }
                            else {
                                _node.innerHTML = '请求失败';
                                _node.setAttribute('style', 'float: right; color: #red; margin-left: 20px;');
                            }
                        }
                        else {
                            _node.innerHTML = '已选择过';
                            _node.setAttribute('style', 'float: right; color: #f18d22; margin-left: 20px;');
                        }
                    }
                    else {
                        _node.innerHTML = '请求失败';
                    }
                    return false;
                }
            });
            document.querySelector('#hckt_showhide').onclick = function () {
                var keyInfo = document.querySelector('#hckt_keyInfo');
                var show = keyInfo.classList.contains('hckt_show');
                if (show) {
                    keyInfo.setAttribute('class', 'hckt_hide');
                    keyInfo.setAttribute('style', 'display: none;');
                }
                else {
                    keyInfo.setAttribute('class', 'hckt_show');
                    keyInfo.setAttribute('style', 'display: block;');
                }
                return false;
            };
            document.querySelector('#hckt_revealAll').onclick = function () {
                this.onclick = function () {return false;}
                var textarea = document.querySelector('#hckt_revealArea');
                textarea.value = "";
                for (var l=0;l<content.length;l++) {
                    if (choosed.indexOf(content[l].selName) >= 0) {
                        var data = new FormData();
                        data.append("keytype", content[l].rawName);
                        data.append("key", gameKey);
                        data.append("keyindex", 0);
                        __this.getKey(textarea, content[l].title, data);
                    }
                }
                return false;
            }
        };
        hckt.prototype.run = async function () {
            var _this = this;
            var result = await util.xhr({ url: location.href, xhr: true });
            var rInfo = (new DOMParser()).parseFromString(result.body, "text/html");
            rInfo = rInfo.querySelector('#webpack-subscriber-hub-data') || rInfo.querySelector('#webpack-monthly-product-data');
            if (!rInfo) {return;}
            rInfo = JSON.parse(rInfo.innerHTML);
            _this.showInfo(rInfo);
        };
        return hckt;
    })();
    var program = new hckt();
    program.run();
})();
