// ==UserScript==
// @name         Steam R18 Ignore
// @namespace    https://coding.net/u/sffxzzp
// @version      0.01
// @description  Remove r18 tags for profiles.
// @author       sffxzzp
// @icon         https://store.steampowered.com/favicon.ico
// @match        *://steamcommunity.com/profiles/*
// @match        *://steamcommunity.com/id/*
// ==/UserScript==

(function() {
    var rClass = ['maybe_inappropriate_sex',
              'has_adult_content',
              'ugc_show_warning_image'];
    rClass.forEach(function (r) {
        var rNode = document.querySelectorAll('.'+r);
        rNode.forEach(function (node) {
            node.classList.remove(r);
        });
    });
})();