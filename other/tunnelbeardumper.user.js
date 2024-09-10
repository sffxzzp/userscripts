// ==UserScript==
// @name         TunnelBear Dumper
// @namespace    https://github.com/sffxzzp
// @version      1.00
// @description  dump tunnelbear's line into https proxies.
// @author       sffxzzp
// @icon         https://www.tunnelbear.com/favicon-194x194.png
// @match        https://www.tunnelbear.com/account/overview
// @connect      api.polargrizzly.com
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @updateURL    https://github.com/sffxzzp/userscripts/raw/master/other/tunnelbeardumper.user.js
// @downloadURL  https://github.com/sffxzzp/userscripts/raw/master/other/tunnelbeardumper.user.js
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
    var td = (function () {
        var td = function () {};
        td.prototype.run = async function() {
            var firstToken = JSON.parse(await util.xhr({ url: '/v2/cookieToken', method: 'post', headers: { device: 'undefined' }, xhr: true }).then(res => res.body)).access_token;
            var authHeaders = (await util.xhr({ url: 'https://api.polargrizzly.com/auth', method: 'post', data: JSON.stringify({ partner: 'tunnelbear', token: firstToken }), headers: { 'content-type': 'application/json' } }).then(res => res.response.responseHeaders));
            var auth = '';
            for (let header of authHeaders.split('\r\n')) {
                header = header.split(':');
                if (header[0] == 'authorization') {
                    auth = header[1];
                }
            }
            var token = JSON.parse(await util.xhr({ url: 'https://api.polargrizzly.com/user', headers: { authorization: auth } }).then(res => res.body)).vpn_token
            var regions = JSON.parse(await util.xhr({ url: 'https://api.polargrizzly.com/regions', headers: { authorization: auth } }).then(res => res.body));
            this.render(auth, token, regions);
        };
        td.prototype.render = function (auth, token, regions) {
            var target = document.querySelector('div.view-content div.account-content');
            var html = `<h1>Select region:</h1><div class="tunnelbear_dumper_token" style="display: none;">${token}</div>`;
            for (let region of regions) {
                html += `<button class="tunnelbear_dumper_btn" style="margin: 10px;" data-countryiso="${region.country_iso}">${region.region_name}</button>`;
            }
            html += `<div class="tunnelbear_dumper_result"></div>`
            var container = util.createElement({ node: 'div', content: { style: 'margin-top: 20px;' }, html: html })
            target.appendChild(container);
            document.querySelectorAll('button.tunnelbear_dumper_btn').forEach(function (btn) {
                btn.onclick = async function () {
                    var token = document.querySelector('div.tunnelbear_dumper_token').innerHTML;
                    var urls = JSON.parse(await util.xhr({ url: 'https://api.polargrizzly.com/vpns/countries/'+this.dataset.countryiso, headers: { authorization: auth } }).then(res => res.body)).vpns;
                    var html = `token as username and password: ${token}<br>`;
                    for (let url of urls) {
                        html += `https://${url.url}:8080/<br>`;
                    }
                    document.querySelector('div.tunnelbear_dumper_result').innerHTML = html;
                };
            });
        };
        return td;
    })();
    let script = new td();
    script.run();
})();
