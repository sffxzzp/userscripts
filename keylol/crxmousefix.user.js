// ==UserScript==
// @name         crxMouse Discuz Fix
// @namespace    https://github.com/sffxzzp
// @version      0.01
// @description  Patch _ajaxpost of discuzx to make shitty crxMouse compatible.
// @author       sffxzzp
// @match        *://keylol.com/*
// @grant        none
// @updateURL    https://github.com/sffxzzp/userscripts/raw/master/keylol/crxmousefix.user.js
// @downloadURL  https://github.com/sffxzzp/userscripts/raw/master/keylol/crxmousefix.user.js
// ==/UserScript==

(function() {
    var loadFunc = function () {
        window._ajaxpost = function (formid, showid, waitid, showidclass, submitbtn, recall) {
            waitid = typeof waitid == 'undefined' || waitid === null ? showid : (waitid !== '' ? waitid : '');
            showidclass = !showidclass ? '' : showidclass;
            var ajaxframeid = 'ajaxframe';
            var ajaxframe = window.$(ajaxframeid);
            var curform = window.$(formid);
            var formtarget = curform.target;
            var handleResult = function() {
                var s = '';
                var evaled = false;
                window.showloading('none');
                try {
                    s = window.$(ajaxframeid).contentWindow.document.XMLDocument.text;
                } catch (e) {
                    var nodes = window.$(ajaxframeid).contentWindow.document.documentElement.childNodes;
                    for (var i = 0; i < nodes.length; i++) {
                        var n = nodes[i];
                        if (n.nodeType === 4) {
                            s = n.nodeValue || n.textContent || '';
                            break;
                        }
                    }
                    if (!s) {
                        try {
                            s = window.$(ajaxframeid).contentWindow.document.documentElement.firstChild.wholeText;
                        } catch (e) {
                            try {
                                s = window.$(ajaxframeid).contentWindow.document.documentElement.firstChild.nodeValue;
                            } catch (e) {
                                s = '内部错误，无法显示此内容';
                            }
                        }
                    }
                }
                if (s != '' && s.indexOf('ajaxerror') != -1) {
                    window.evalscript(s);
                    evaled = true;
                }
                if (showidclass) {
                    if (showidclass != 'onerror') {
                        window.$(showid).className = showidclass;
                    } else {
                        window.showError(s);
                        window.ajaxerror = true;
                    }
                }
                if (submitbtn) {
                    submitbtn.disabled = false;
                }
                if (!evaled && (typeof window.ajaxerror == 'undefined' || !window.ajaxerror)) {
                    window.ajaxinnerhtml(window.$(showid), s);
                }
                window.ajaxerror = null;
                if (curform) {
                    curform.target = formtarget;
                }
                if (typeof recall == 'function') {
                    recall();
                } else {
                    eval(recall);
                }
                if (!evaled) {
                    window.evalscript(s);
                }
                ajaxframe.loading = 0;
                if (!window.BROWSER.firefox || window.BROWSER.safari) {
                    window.$('append_parent').removeChild(ajaxframe.parentNode);
                } else {
                    setTimeout(function() {
                        window.$('append_parent').removeChild(ajaxframe.parentNode);
                    }, 100);
                }
            };
            if (!ajaxframe) {
                var div = document.createElement('div');
                div.style.display = 'none';
                div.innerHTML = '<iframe name="' + ajaxframeid + '" id="' + ajaxframeid + '" loading="1"></iframe>';
                window.$('append_parent').appendChild(div);
                ajaxframe = window.$(ajaxframeid);
            } else if (ajaxframe.loading) {
                return false;
            }
            window._attachEvent(ajaxframe, 'load', handleResult);
            window.showloading();
            curform.target = ajaxframeid;
            var action = curform.getAttribute('action');
            action = window.hostconvert(action);
            curform.action = action.replace(/\&inajax\=1/g, '') + '&inajax=1';
            curform.submit();
            if (submitbtn) {
                submitbtn.disabled = true;
            }
            window.doane();
            return false;
        }
    };
    var checkFunc = function () {
        if (window._ajaxpost === undefined) {
            setTimeout(function () {checkFunc()}, 1000);
        } else {
            loadFunc();
        }
    };
    checkFunc();
})();
