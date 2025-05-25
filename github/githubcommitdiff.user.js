// ==UserScript==
// @name         GitHub Commit Diff
// @namespace    https://github.com/sffxzzp
// @version      0.01
// @description  A shortcut to compare old commit with newest commit
// @author       sffxzzp
// @match        *://github.com/*/*/commits/*
// @icon         https://github.com/favicon.ico
// @grant        none
// @updateURL    https://github.com/sffxzzp/userscripts/raw/master/github/githubcommitdiff.user.js
// @downloadURL  https://github.com/sffxzzp/userscripts/raw/master/github/githubcommitdiff.user.js
// ==/UserScript==

(function() {
    let curBranch = 'master';
    let curRepo = '';
    let urlSplit = location.pathname.split('/');
    if (urlSplit.length == 5 || urlSplit.length == 6) {
        curBranch = urlSplit[4];
        curRepo = urlSplit[1] + "/" + urlSplit[2];
    }
    document.querySelectorAll('li[class*=CommitRow-module__ListItem_]').forEach(function (node) {
        let target = node.querySelector('div[class^=MetadataContainer-module__container] > div[class*=Metadata-module__primary]');
        let ref = target.querySelector('span > a').href.replace('/commit', '/compare') + "..." + curBranch;
        let span = document.createElement('span');
        span.role = 'tooltip';
        span.className = 'Tooltip__TooltipBase-sc-17tf59c-0 hWlpPn tooltipped-sw';
        span.setAttribute('aria-label', "Compare with the newest commit");
        span.innerHTML = `<a href="${ref}" class="Button Button--iconOnly Button--invisible Button--small" tabindex="-1"><svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-git-pull-request UnderlineNav-octicon d-none d-sm-inline"><path d="M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm5.677-.177L9.573.677A.25.25 0 0 1 10 .854V2.5h1A2.5 2.5 0 0 1 13.5 5v5.628a2.251 2.251 0 1 1-1.5 0V5a1 1 0 0 0-1-1h-1v1.646a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354ZM3.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm0 9.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm8.25.75a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Z"></path></svg></a>`;
        target.appendChild(span);
    });
})();
