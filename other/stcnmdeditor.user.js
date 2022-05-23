// ==UserScript==
// @name         Keylol Markdown Editor
// @namespace    https://github.com/
// @version      0.14
// @description  Replace keylol.com default editor to a markdown editor which will transform markdown to bbcode.
// @author       sffxzzp
// @include      /https?://(dev\.)?keylol\.com/forum\.php\?mod=post&action=(newthread|edit|reply).*?/
// @icon         https://keylol.com/favicon.ico
// @require      https://unpkg.com/marked/marked.min.js
// @grant        unsafeWindow
// @updateURL    https://github.com/sffxzzp/userscripts/raw/master/other/stcnmdeditor.user.js
// @downloadURL  https://github.com/sffxzzp/userscripts/raw/master/other/stcnmdeditor.user.js
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
            this.renderer = new marked.Renderer();
            this.renderer.code = function (code, info, escaped) {return `[code]${info?'language: '+info+'\n':''}${code}[/code]\n`};
            this.renderer.blockquote = function (quote) {return `[quote]${quote}[/quote]\n`};
            this.renderer.html = function (html) {return html};
            this.renderer.heading = function (text, level) {return `[k${level-1}]${text}[/k${level-1}]\n`};
            this.renderer.hr = function () {return `[img]static/image/hrline/3.gif[/img]\n`};
            this.renderer.list = function (body, ordered, start) {return `[list${(ordered == true) ? '=1' : ''}]\n${body}[/list]`};
            this.renderer.listitem = function (text, task, checked) {return `[*]${text}\n`};
            this.renderer.checkbox = function (checked) {return `[${checked ? '√' : '×'}] `};
            this.renderer.paragraph = function (text) {return `${util.entityToString(text)}\n\n`};
            this.renderer.table = function (header, body) {return `[table]\n${header}${body}[/table]\n`};
            this.renderer.tablerow = function (content) {return `[tr]${content}[/tr]\n`};
            this.renderer.tablecell = function (content, flags) {
                if (flags.header) {content = `[b]${content}[/b]`;}
                if (flags.align) {content = `[align=${flags.align}]${content}[/align]`;}
                return `[td]${content}[/td]`;
            };
            this.renderer.strong = function (text) {return `[b]${text}[/b]`};
            this.renderer.em = function (text) {return `[i]${text}[/i]`};
            this.renderer.codespan = function (code) {return `「${code}」`};
            this.renderer.del = function (text) {return `[s]${text}[/s]`};
            this.renderer.link = function (href, title, text) {return `[url=${href}]${text}[/url]`};
            this.renderer.image = function (href, title, text) {return `[img]${href}[/img]`};
            marked.use({
                renderer: this.renderer,
                breaks: true
            });
        };
        kme.prototype.remarkedTable = function (text) {
            let table = /\[table\]([\s\S]*?)\[\/table\]/g.exec(text);
            let outtr = [];
            let outal = [];
            let out = '';
            table[1].match(/\[tr\].*?\[\/tr\]/g).forEach(function (tr) {
                let outtd = [];
                outal = [];
                tr.replace(/\[\/tr\]/g, '').match(/\[td\].*?\[\/td\]/g).forEach(function (td) {
                    let align = /\[align=(.*?)\]/g.exec(td);
                    if (align) {
                        if (align[1]=='left') {outal.push(':--');}
                        if (align[1]=='center') {outal.push(':-:');}
                        if (align[1]=='right') {outal.push('--:');}
                    }
                    else {outal.push('---');}
                    outtd.push(td.replace(/\[.*?\]/g, ''));
                });
                outtr.push(outtd.join(' | '));
            });
            for (let i=0;i<outtr.length;i++) {
                out += outtr[i]+'\n';
                if (i==0) {out += outal.join(' | ')+'\n';}
            }
            return '\n'+text.replace(table[0], out);
        };
        kme.prototype.remarkedQuote = function (text) {
            let quote = /\[quote\]([\s\S]*?)\[\/quote\]/g.exec(text);
            let lines = unsafeWindow.trim(quote[1]).split('\n');
            let outl = [];
            lines.forEach(function (line) {outl.push('> '+line);});
            return text.replace(quote[0], outl.join('\n'));
        };
        kme.prototype.strTimes = function (str, num){
            let ret = num > 1 ? str += this.strTimes(str, --num): str;
            return ret;
        }
        kme.prototype.remarkedHeader = function (text) {
            var _this = this;
            let sh = /\[sh(\d)\](.*?)\[\/sh\d\]/g.exec(text);
            if (sh) {text = text.replace(sh[0], `${_this.strTimes('#', parseInt(sh[1])+1)} ${sh[2]}`);};
            let k = /\[k(\d)\](.*?)\[\/k\d\]/g.exec(text);
            if (k) {text = text.replace(k[0], `${_this.strTimes('#', parseInt(k[1])+1)} ${k[2]}`);};
            return '\n'+text+'\n';
        };
        kme.prototype.remarkedList = function (text) {
            let ltype = /\[list=1\]/g.exec(text);
            if (ltype) {ltype = true} else {ltype = false}
            let li = text.match(/\[\*\].*/g);
            let outli = [];
            for (let i=0;i<li.length;i++) {
                let temp = '';
                if (ltype) {temp = li[i].replace('[*]', (i+1)+'. ');}
                else {temp = li[i].replace('[*]', '* ');}
                outli.push(temp.replace('[√]', '[x]').replace('[×]', '[ ]'));
            }
            return '\n'+outli.join('\n')+'\n\n';
        };
        kme.prototype.remarked = function (text) {
            var _this = this;
            text = text.replace(/\[img\]static\/image\/hrline\/\d*.gif\[\/img\]/g, '\n------\n')
                .replace(/\[img\](.*?)\[\/img\]/g, '![]($1)')
                .replace(/\[url=(.*?)\](.*?)\[\/url\]/g, '[$2]($1)')
                .replace(/「(.+?)」/g, '`$1`')
                .replace(/\[code\]([\s\S]*?)\[\/code\]/g, '```\n$1\n```');
            let table = text.match(/\[table\]([\s\S]*?)\[\/table\]/g);
            if (table!=null) {
                table.forEach(function (table) {
                    text = text.replace(table, _this.remarkedTable(table));
                });
            }
            text = text.replace(/\[b\](.*?)\[\/b\]/g, '**$1**').replace(/\[i\](.*?)\[\/i\]/g, '_$1_').replace(/\[s\](.*?)\[\/s\]/g, '~$1~');
            let quote = text.match(/\[quote\]([\s\S]*?)\[\/quote\]/g);
            if (quote!=null) {
                quote.forEach(function (quote) {
                    text = text.replace(quote, _this.remarkedQuote(quote));
                });
            }
            let sh = text.match(/\[sh\d\].*?\[\/sh\d\]/g);
            if (sh!=null) {
                sh.forEach(function (sh) {
                    text = text.replace(sh, _this.remarkedHeader(sh));
                });
            }
            let k = text.match(/\[k\d\].*?\[\/k\d\]/g);
            if (k!=null) {
                k.forEach(function (k) {
                    text = text.replace(k, _this.remarkedHeader(k));
                });
            }
            let list = text.match(/\[list.*?\]([\s\S]*?)\[\/list\]/g);
            if (list!=null) {
                list.forEach(function (list) {
                    text = text.replace(list, _this.remarkedList(list));
                });
            }
            return text;
        };
        kme.prototype.scrollSync = function (mdEditor, oriEditor, oriIframe) {
            oriEditor.scrollTop = mdEditor.scrollTop / ((mdEditor.scrollHeight - mdEditor.clientHeight) / (oriEditor.scrollHeight - oriEditor.clientHeight));
            oriIframe.scrollTop = mdEditor.scrollTop / ((mdEditor.scrollHeight - mdEditor.clientHeight) / (oriIframe.scrollHeight - oriIframe.clientHeight));
        };
        kme.prototype.run = function () {
            var _this = this;
            let mdEditor = util.createElement({node: 'textarea', content: {id: 'sff_md_text', style: 'outline: none; padding: 10px; margin: 0; font-size: 14px; font-family: "Noto sans CJK SC","Microsoft JhengHei UI","Microsoft YaHei UI",sans-serif; width: calc(50% - 22px); height: 400px; border: 0px; border-right: 1px solid grey;'}});
            let editorDiv = document.querySelector('#e_body .area');
            let oriEditor = document.querySelector('#e_textarea');
            oriEditor.style = 'padding: 10px !important; margin: 0; width: calc(50% - 20px); border: none;';
            editorDiv.insertBefore(mdEditor, oriEditor);
            let oriIframe = document.querySelector('#e_iframe');
            oriIframe.style = 'padding: 10px !important; margin: 0; width: calc(50% - 23px); border: none;';
            document.querySelector('#e_switchercheck').checked = true;
            unsafeWindow.switchEditor(0);
            _this.scrollSync(mdEditor, oriEditor, oriIframe);
            mdEditor.onmouseover = function () {
                mdEditor.onscroll = function () {
                    _this.scrollSync(mdEditor, oriEditor, oriIframe);
                };
                oriEditor.onscroll = () => {};
                oriIframe.onscroll = () => {};
            };
            mdEditor.onkeyup = function () {
                let output = marked.parse(mdEditor.value);
                oriEditor.value = unsafeWindow.trim(output);
                _this.scrollSync(mdEditor, oriEditor, oriIframe);
            };
            oriEditor.onkeyup = function () {
                mdEditor.value = unsafeWindow.trim(_this.remarked(oriEditor.value));
            };
            mdEditor.value = unsafeWindow.trim(_this.remarked(oriEditor.value));
        };
        return kme;
    })();
    (new kme).run();
})();
