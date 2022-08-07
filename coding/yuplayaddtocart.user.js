// ==UserScript==
// @name         Yuplay AddToCart
// @namespace    https://coding.net/u/sffxzzp
// @version      0.05
// @description  Add items that needs russian ip to cart without proxy.
// @author       sffxzzp
// @match        *://yuplay.ru/product/*
// @icon         https://yuplay.ru/img/img/favicon.ico
// @connect      steamdb.info
// @updateURL    https://github.com/sffxzzp/userscripts/raw/master/coding/yuplayaddtocart.user.js
// ==/UserScript==

(function() {
    function main() {
        var gametitle = document.querySelector(".good-title");
        var couldBuy = gametitle.querySelector('button[type="submit"]');
        if (couldBuy!=null) {
            var buy = document.createElement("button");
            buy.setAttribute("class", "btn btn-success");
            buy.innerHTML = "免俄区IP购买（点击跳转到新方法地址）";
            buy.onclick = function () {
                location.href = "https://steamcn.com/t436834-1-1"
            };
            gametitle.appendChild(buy);
        }
    }
    main();
})();