// ==UserScript==
// @name         KeyLOL Via Header Fix
// @namespace    https://github.com/sffxzzp
// @version      0.01
// @description  Fix env(safe-area-inset-top) calc
// @author       sffxzzp
// @match        https://keylol.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    const style = document.createElement('style');
    style.innerHTML = `.dzlab_header {height: 50px !important; padding-top: 10px !important;} .dzlab_main {padding-top: 50px !important;}`;
    document.documentElement.appendChild(style);
})();
