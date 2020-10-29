// ==UserScript==
// @name         Keylol Usergroup Icon Recover
// @namespace    https://github.com/sffxzzp
// @version      0.01
// @description  recover old usergroup icons for keylol
// @author       sffxzzp
// @match        *://keylol.com/t*
// @match        *://keylol.com/forum.php?mod=viewthread&tid=*
// @icon         https://keylol.com/favicon.ico
// @grant        none
// @updateURL    https://github.com/sffxzzp/userscripts/raw/master/keylol/stcnusergroup.user.js
// ==/UserScript==

(function() {
    var oicons = {
        30: '34/common_30_usergroup_icon.jpg',
        31: 'c1/common_31_usergroup_icon.jpg',
        32: '63/common_32_usergroup_icon.jpg',
        33: '18/common_33_usergroup_icon.jpg',
        34: 'e3/common_34_usergroup_icon.jpg',
        35: '1c/common_35_usergroup_icon.jpg',
        36: '19/common_36_usergroup_icon.jpg',
        37: 'a5/common_37_usergroup_icon.jpg',
        51: '28/common_51_usergroup_icon.png',
        46: 'd9/common_46_usergroup_icon.png',
        49: 'f4/common_49_usergroup_icon.png',
        47: '67/common_47_usergroup_icon.png',
        16: 'c7/common_16_usergroup_icon.png',
        24: '1f/common_24_usergroup_icon.png',
        3: 'ec/common_3_usergroup_icon.jpg',
        2: 'c8/common_2_usergroup_icon.png',
        25: '8e/common_25_usergroup_icon.jpg',
        50: 'c0/common_50_usergroup_icon.png',
        1: 'c4/common_1_usergroup_icon.jpg',
        7: '8f/common_7_usergroup_icon.png',
        8: 'c9/common_8_usergroup_icon.png',
        4: 'a8/common_4_usergroup_icon.jpg',
        52: '9a/common_52_usergroup_icon.png'
    };
    var uicon = document.querySelectorAll('.usergroup') || null;
    if (uicon) {
        uicon.forEach(function (node) {
            var ugid = node.id.split('_');
            ugid = ugid[ugid.length-1];
            node.querySelector('img').src = 'https://keylol.com/data/attachment/common/' + oicons[ugid];
        });
    }
})();
