// ==UserScript==
// @name         STDB Ref Remover
// @namespace    https://github.com/sffxzzp
// @version      0.01
// @description  remove extra params in steam store link.
// @author       sffxzzp
// @match        *://steamdb.info/*
// @icon         https://steamdb.info/favicon.ico
// ==/UserScript==

(function() {
    document.querySelectorAll('.app-links>a').forEach(function (node) {
        node.href = node.href.replace(/&beta=1/gi, '');
    });
})();