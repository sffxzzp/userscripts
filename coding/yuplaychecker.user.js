// ==UserScript==
// @name         Yuplay ACRTAG Checker
// @namespace    https://coding.net/u/sffxzzp
// @version      0.06
// @description  Add ACRTAG info on yuplay.ru product pages which has SUB_ID.
// @author       sffxzzp
// @match        *://yuplay.ru/product/*
// @icon         https://yuplay.ru/img/img/favicon.ico
// @grant        GM_xmlhttpRequest
// @connect      steamdb.info
// @updateURL    https://sffxzzp.coding.net/p/userscripts/d/userscripts/git/raw/master/yuplaychecker.user.js
// ==/UserScript==

(function() {
    function resInfo(subid) {
        var attention = document.createElement("p");
        attention.setAttribute("id", "attention");
        attention.setAttribute("style", "color: black;")
        attention.innerHTML = "Checking ACRTAG Info...";
        document.querySelector(".list-character").children[0].appendChild(attention);
        GM_xmlhttpRequest({
            url: "https://steamdb.info/sub/"+subid+"/",
            method: "get",
            onload: function (res) {
                addInfo(subid, res.response);
            },
            onerror: resError,
            ontimeout: resError
        });
    }
    function resError(cont) {
        cont = cont==undefined?"SteamDB Connect Error!":cont;
        var attention = document.getElementById("attention");
        attention.setAttribute("style", "color: red;");
        attention.innerHTML = cont;
    }
    function addInfo(subid, res) {
        var cfCheck = /(cf-browser-verification|complete_sec_check)/.exec(res);
        if (cfCheck) {
            resError("Browser verification detected. Please open SteamDB manually for once...");
            return false;
        }
        var attention = document.getElementById("attention");
        attention.parentNode.removeChild(attention);
        var gameinfo = document.querySelector(".list-character").children[0];
        res = res.split("id=\"info\"")[1].split("id=\"app\"")[0];
        var prCountries = /PurchaseRestrictedCountries<\/td>[\s\S].*country-list">(.*?)<\/td>/ig.exec(res);
        var orCountries = /onlyallowrunincountries<\/td>[\s\S].*country-list">(.*?)<\/td>/ig.exec(res);
        if (prCountries) {
            prCountries = prCountries[1].split(" ");
            var pr = document.createElement("p");
            pr.setAttribute("style", "color: orange;");
            pr.innerHTML = "Purchase Only: ";
            for (var i=0;i<prCountries.length;i++) {
                var prs = document.createElement("span");
                prs.innerHTML = prCountries[i]+" ";
                pr.appendChild(prs);
            }
            gameinfo.appendChild(pr);
        }
        if (orCountries) {
            console.log("Run Only: "+orCountries[1]);
            orCountries = orCountries[1].split(" ");
            var or = document.createElement("p");
            or.setAttribute("style", "color: red;");
            or.innerHTML = "Run Only: ";
            for (var j=0;j<orCountries.length;j++) {
                var ors = document.createElement("span");
                ors.innerHTML = orCountries[j]+" ";
                or.appendChild(ors);
            }
            gameinfo.appendChild(or);
        }
    };
    function main() {
        var gameinfo = document.querySelector(".list-character").children[0].children;
        for (var i=gameinfo.length-1;i>-1;i--) {
            if (gameinfo[i].innerText.indexOf("SUB_ID")>0) {
                var subid = gameinfo[i].children[0];
                subid.innerHTML = "<a href=\"https://steamdb.info/sub/"+subid.innerText+"/\" target=\"_blank\">"+subid.innerText+"</a>";
                resInfo(subid.innerText);
                break;
            }
        }
    }
    main();
})();