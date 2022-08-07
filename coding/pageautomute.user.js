// ==UserScript==
// @name         Page Auto Mute
// @namespace    https://coding.net/u/sffxzzp
// @version      0.02
// @description  Mute all audio and video elements when page lost focus, and unmute when get focus again.
// @author       sffxzzp
// @include      *
// @updateURL    https://github.com/sffxzzp/userscripts/raw/master/coding/pageautomute.user.js
// ==/UserScript==

(function() {
    function mute(focus) {
        document.querySelectorAll("video, audio").forEach(function (elem) {
            if (focus) {elem.muted = false;}
            else {elem.muted = true;}
        });
    }
    window.onblur = function () {mute(false);}
    window.onfocus = function () {mute(true);}
})();