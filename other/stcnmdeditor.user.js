// ==UserScript==
// @name         Keylol Markdown Editor
// @namespace    https://github.com/
// @version      0.01
// @description  Replace keylol.com default editor to a markdown editor which will transform markdown to bbcode.
// @author       sffxzzp
// @include      /https?://(dev\.)?keylol\.com/forum\.php\?mod=post&action=(newthread|edit).*?/
// @icon         https://keylol.com/favicon.ico
// @require      https://cdn.jsdelivr.net/npm/marked/marked.min.js
// @grant        unsafeWindow
// @updateURL    https://github.com/sffxzzp/userscripts/raw/master/other/stcnmdeditor.user.js
// ==/UserScript==

(function() {
    var util = (function () {
        function util() {}
        util.createElement = function (data) {
            var node;
            if (data.node) {
                node = document.createElement(data.node);
                if (data.content) {this.setElement({node: node, content: data.content});}
                if (data.html) {node.innerHTML = data.html;}
            }
            return node;
        };
        util.setElement = function (data) {
            if (data.node) {
                for (let name in data.content) {data.node.setAttribute(name, data.content[name]);}
                if (data.html!=undefined) {data.node.innerHTML = data.html;}
            }
        };
        util.entityToString = function (input) {
            return util.createElement({node: 'div', html: input}).innerText;
        };
        return util;
    })();
    var kme = (function () {
        var kme = function () {
            var _this = this;
            this.oriEditor = document.querySelector('textarea[name=message]');
            this.oriText = unsafeWindow.trim(this.oriEditor.value);
            this.oriEditor.onkeyup = () => {_this.oriText = unsafeWindow.trim(_this.oriEditor.value); document.querySelector('#sff_md_text').value = ''};
            this.renderer = new marked.Renderer();
            this.renderer.code = function (code, info, escaped) {return `[code]language: ${info}\n${code}[/code]`};
            this.renderer.blockquote = function (quote) {return `[quote]${quote}[/quote]`};
            this.renderer.html = function (html) {return ``};
            this.renderer.heading = function (text, level) {return `[sh${level-1}]${text}[/sh${level-1}]\n`};
            this.renderer.hr = function () {return `[img]static/image/hrline/3.gif[/img]`};
            this.renderer.list = function (body, ordered, start) {return `[list${(ordered == true) ? '=1' : ''}]\n${body}[/list]`};
            this.renderer.listitem = function (text, task, checked) {return `[*]${text}\n`};
            this.renderer.checkbox = function (checked) {return `[${checked ? '√' : '×'}] `};
            this.renderer.paragraph = function (text) {return `${util.entityToString(text).replace(/\n/g, '')}\n`};
            this.renderer.table = function (header, body) {return `[table]\n${header}${body}[/table]`};
            this.renderer.tablerow = function (content) {return `[tr]${content}[/tr]\n`};
            this.renderer.tablecell = function (content, flags) {
                if (flags.header) {content = `[b]${content}[/b]`;}
                if (flags.align) {content = `[align=${flags.align}]${content}[/align]`;}
                return `[td]${content}[/td]`;
            };
            this.renderer.strong = function (text) {return `[b]${text}[/b]`};
            this.renderer.em = function (text) {return `[i]${text}[/i]`};
            this.renderer.codespan = function (code) {return `「${text}」`};
            this.renderer.br = function () {return `\n`};
            this.renderer.del = function (text) {return `[s]${text}[/s]`};
            this.renderer.link = function (href, title, text) {return `[url=${href}]${text}[/url]`};
            this.renderer.image = function (href, title, text) {return `[img]${href}[/img]`};
        };
        kme.prototype.onMDEdit = function () {
            let md = document.querySelector('#sff_md_text');
            let output = marked(md.value, {renderer: this.renderer});
            this.oriEditor.value = unsafeWindow.trim(this.oriText + '\n' + output);
        };
        kme.prototype.run = function () {
            let mdEditor = util.createElement({node: 'textarea', content: {id: 'sff_md_text', style: 'font-size: 16px; font-family: "Noto sans CJK SC","Microsoft JhengHei UI","Microsoft YaHei UI",sans-serif; width: calc(100% - 10px); min-height: 150px; border: 1px solid grey;'}});
            mdEditor.onkeyup = () => this.onMDEdit();
            let editorDiv = document.querySelector('#e_body .area');
            editorDiv.insertBefore(mdEditor, document.querySelector('#e_textarea'));
            let check = document.querySelector('#e_switchercheck');
            check.checked = true;
            unsafeWindow.switchEditor(0);
        };
        return kme;
    })();
    (new kme).run();
})();
