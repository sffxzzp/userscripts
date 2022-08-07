// ==UserScript==
// @name         VIP Video
// @namespace    https://coding.net/u/sffxzzp
// @version      0.3
// @description  No description.
// @author       sffxzzp
// @match        http://www.le.com/ptv/vplay/*
// @match        https://v.qq.com/x/*/*
// @match        http://www.iqiyi.com/v_*
// @match        http://v.youku.com/v_show/*
// @match        http://www.tudou.com/albumplay/*
// @match        http://www.mgtv.com/b/*
// @match        http://tv.sohu.com/*/*
// @match        http://www.acfun.cn/v/*
// @match        http://www.bilibili.com/video/*
// @match        http://www.fun.tv/vplay/*
// @match        http://www.wasu.cn/Play/show/id/*
// @match        http://www.1905.com/video/play/*
// @match        http://v.pptv.com/show/*
// @match        http://v.yinyuetai.com/video/*
// @match        http://www.tangdou.com/v89/*
// @match        http://v.ifeng.com/*/*/*/*
// @match        http://v.huya.com/play/*
// @match        http://v.pptv.com/show/*
// @icon         https://api.47ks.com/favicon.ico
// @updateURL    https://sffxzzp.coding.net/p/userscripts/d/userscripts/git/raw/master/vipvideo.user.js
// ==/UserScript==

(function() {
    var button = document.createElement("div");
    button.setAttribute("style", "z-index: 1000000; position: fixed; right: 50px; bottom: 50px; width: 50px; height: 50px; -moz-border-radius: 50px; -webkit-border-radius: 50px; border-radius: 50px;");
    button.setAttribute("class", "no");
    button.innerHTML = "<img src=\"https://api.47ks.com/favicon.ico\" style=\"padding:9px;\" onclick=\"javascript:void(0);\"/>";
    button.onclick = function () {
        if (button.className == "yes") {
            var vipVideo = document.getElementById("vipVideo");
            vipVideo.parentNode.removeChild(vipVideo);
            button.setAttribute("class", "no");
            return True;
        }
        var video = document.createElement("iframe");
        video.setAttribute("id", "vipVideo");
        video.setAttribute("style", "position: fixed; width: 100%; height: 100%; top: 0px; left: 0px; z-index: 999999");
        video.setAttribute("allowtransparency", "true");
        video.setAttribute("frameborder", "0");
        video.setAttribute("scrolling", "no");
        video.setAttribute("src", "https://api.47ks.com/webcloud/?v="+location.href);
        button.setAttribute("class", "yes");
        document.body.appendChild(video);
    };
    document.body.appendChild(button);
})();