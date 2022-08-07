// ==UserScript==
// @name         IG_Gift_AutoDiscoverer
// @namespace    https://coding.net/u/sffxzzp
// @version      0.04
// @description  Indiegala Gift Page Key Auto Discoverer
// @icon         http://www.indiegala.com/favicon.ico
// @author       sffxzzp
// @match        https://www.indiegala.com/gift*
// @updateURL    https://sffxzzp.coding.net/p/userscripts/d/userscripts/git/raw/master/IG_Gift_AutoDiscoverer.user.js
// ==/UserScript==

var func1 = (
    function getKey() {
        $('#resultbox').show();
        $('#buttonbox button').attr('disabled', 'disabled');
        var i = 0;
        var gameHTML = $('.game-steam-url');
        var gameCount = gameHTML.length;
        var gameName = new Array(gameCount);
        for (i=0;i<gameCount;i++) {
            gameName[i] = gameHTML[i].innerText;
        }
        var keyButtons = $('div.span-key.steam-btn');
        var keyCount = keyButtons.length;
        var keyVerify = new Array(keyCount);
        for (i=0;i<keyCount;i++)
        {
            keyVerify[i] = keyButtons[i].lastElementChild.id.slice(7);
            fetchPage(gameName[i], keyVerify[i]);
        }
    }
);

var func2 = (
    function fetchPage(gameName, keyVerify) {
        $.ajax({
            url: 'https://www.indiegala.com/myserials/syncget?code=' + keyVerify,
            dataType: 'json',
            timeout: 15000,
            success: function(result) {
                $('#result').append(gameName + '        ' + result.serial_number + '\r\n');
            },
            error: function(XMLHttpRequest,status) {
                $('#result').append(gameName + '        timeout.\r\n');
            }
        });
    }
);

function loadScript() {
    if (document.getElementById('this_your_gift')!=null) {
        $('.giftprof_key').before('<div id="buttonbox" style="margin-top: 10px; margin-left: 30px;"></div><div id="resultbox" style="margin-top: 10px; margin-left: 30px; margin-right: 30px;" hidden="hidden"><textarea style="width: 100%; height: 200px;" id="result"></textarea></div>');
        $( '#buttonbox' ).append('<button onclick="getKey()" class="order-button-profile">GetKey</button>');

        var script = document.createElement('script');
        script.setAttribute("type", "text/javascript");
        script.textContent = func1;
        document.body.appendChild(script);

        var script = document.createElement('script');
        script.setAttribute("type", "text/javascript");
        script.textContent = func2;
        document.body.appendChild(script);
    }
    else {
        setTimeout(loadScript, 1000);
    }
}

loadScript();