var PLUGIN_INFO =
<VimperatorPlugin>
<name>{NAME}</name>
<description>Manage Vimperator Plugin</description>
<description lang="ja">Vimpeatorプラグインの管理</description>
<author mail="teramako@gmail.com" homepage="http://d.hatena.ne.jp/teramako/">teramako</author>
<version>0.2</version>
<minVersion>2.0pre</minVersion>
<maxVersion>2.0pre</maxVersion>
<detail lang="ja"><![CDATA[
これはVimperatorプラグインの詳細情報orヘルプを表示するためのプラグインです。
== Command ==

:plugin[help] [pluginName] [-v]:
    {pluginName}を入れるとそのプラグインの詳細を表示します。
    省略すると全てのプラグインの詳細を表示します。
    オプション -v はより細かなデータを表示します

== For plugin Developer ==
プラグインの先頭に
>||
    var PLUGIN_INFO = ...
||<
とE4X形式でXMLを記述してください
各要素は下記参照

=== 要素 ===
name:
    プラグイン名
description:
    簡易説明
    属性langに"ja"などと言語を指定するとFirefoxのlocaleに合わせたものになります。
author:
    製作者名
    属性mailにe-mail、homepageにURLを付けるとリンクされます
license:
    ライセンスについて
    属性documentにURLを付けるとリンクされます
version:
    プラグインのバージョン
maxVersion:
    プラグインが使用できるVimperatorの最大バージョン
minVersion:
    プラグインが使用できるVimperatorの最小バージョン
detail:
    ここにコマンドやマップ、プラグインの説明
    CDATAセクションにwiki的に記述可能

== Wiki書式 ==
見出し:
    - == heading1 == で第一見出し(h1)
    - === heading2 === で第二見出し(h2)
    - ==== heading3 ==== で第三見出し(h3)

リスト:
    - "- "を先頭につけると箇条書きリスト(ul)になります。
      - 改行が可能
        >||
            - 改行
              可能
        ||<
        の場合

        - 改行
          可能

        となります。
      - ネスト可能

    - "+ "を先頭につけると番号付きリスト(ol)になります。
      仕様は箇条書きリストと同じです。

定義リスト:
    - 末尾が":"で終わる行は定義リスト(dl,dt)になります。
    - 次行をネストして始めるとdd要素になります。
    - これもネスト可能です。

整形式テキスト:
    >|| と ||< で囲むと整形式テキスト(pre)になります。
    コードなどを書きたい場合に使用できるでしょう。

インライン:
    - mailtoとhttp、httpsスキームのURLはリンクになります

== ToDo ==
- 更新通知とアップデート機能
- スタイルの追加(これはすべき？)

]]></detail>
</VimperatorPlugin>;

liberator.plugins.pluginManager = (function(){

function id(value) value;
var lang = window.navigator.language;
var tags = {
    name: function(info) fromUTF8Octets(info.toString()),
    author: function(info){
        var xml = <>{fromUTF8Octets(info.toString())}</>;
        if (info.@homepage.toString() != '')
            xml += <><span> </span>{makeLink(info.@homepage.toString())}</>;
        if (info.@mail.toString() != '')
            xml += <><span> </span>({makeLink("mailto:"+info.@mail)})</>;
        return xml;
    },
    description: function(info) makeLink(fromUTF8Octets(info.toString())),
    license: function(info){
        var xml = <>{fromUTF8Octets(info.toString())}</>;
        if (info.@document.toString() != '')
            xml += <><span> </span>{makeLink(info.@document.toString())}</>;
        return xml;
    },
    version: id,
    maxVersion: id,
    minVersion: id,
    detail: function(info){
        if (info.* && info.*[0] && info.*[0].nodeKind() == 'element')
            return info.*;

        var text = fromUTF8Octets(info.*.toString());
        var parser = new WikiParser(text);
        var xml = parser.parse();
        return xml;
    }
};
function chooseByLang(elems){
    if (!elems)
        return null;
    function get(lang){
        var i = elems.length();
        while (i-->0){
            if (elems[i].@lang.toString() == lang)
                return elems[i];
        }
    }
    return get(lang) || get(lang.split('-', 2).shift()) || get('') ||
           get('en-US') || get('en') || elems[0] || elems;
}
for (let it in Iterator(tags)){
    let [name, value] = it;
    tags[name] = function(info){
        if (!info[name])
            return null;
        return value.call(tags, chooseByLang(info[name]));
    };
}
function makeLink(str){
    return XMLList(str.replace(/(?:https?:\/\/|mailto:)\S+/g, '<a href="#" highlight="URL">$&</a>'));
}
function fromUTF8Octets(octets){
    return decodeURIComponent(octets.replace(/[%\x80-\xFF]/g, function(c){
        return '%' + c.charCodeAt(0).toString(16);
    }));
}
function getPlugins(){
    var list = [];
    var contexts = liberator.plugins.contexts;
    for (let path in contexts){
        let context = contexts[path];
        let info = context.PLUGIN_INFO || null;
        let plugin = [
            ['path', path]
        ];
        plugin['name'] = context.NAME;
        if (info){
            for (let tag in tags){
                let value = tags[tag](info);
                if (value && value.toString().length > 0)
                    plugin.push([tag, value]);
            }
        }
        list.push(plugin);
    }
    return list;
}
function itemFormater(plugin, showDetails){
    if (showDetails)
        return template.table(plugin.name, plugin);

    var data = plugin.filter(function($_) $_[0] != 'detail');
    return template.table(plugin.name, data);
}
function WikiParser(text){
    this.mode = '';
    this.lines = text.split(/\n\r|[\r\n]/);
    this.preCount = 0;
    this.pendingMode = '';
    this.xmlstack = new HTMLStack();
}
WikiParser.prototype = {
    inlineParse: function(str){
        function replacer(str){
            switch(str){
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '&': return '&amp;';
                default:
                    return '<a href="#" highlight="URL">'+str+'</a>';
            }
        }
        return XMLList(str.replace(/>|<|&|(?:https?:\/\/|mailto:)\S+/g, replacer));
    },
    wikiReg: { // {{{
        hn: /^(={2,4})\s*(.*?)\s*(\1)$/,
        dt: /^(.*)\s*:$/,
        ul: /^\-\s+(.*)$/,
        ol: /^\+\s+(.*)$/,
        preStart: /^>\|\|$/,
        preEnd: /^\|\|<$/,
    }, // }}}
    blockParse: function(line, prevMode){ // {{{
        if (prevMode == 'pre'){
            if (this.wikiReg.preEnd.test(line)){
                if (this.preCount > 0){
                    this.preCount--;
                    return <>{line}</>;
                } else {
                    this.mode = '';
                    return <></>;
                }
                return <>{line}</>;
            } else if (this.wikiReg.preStart.test(line)){
                this.preCount++;
            }
            return <>{line}</>;
        } else if (this.wikiReg.preStart.test(line)){
            this.mode = 'pre';
            this.pendingMode = prevMode;
            return <pre/>;
        } else if (this.wikiReg.hn.test(line)){
            var hn = RegExp.$1.length - 1;
            this.mode = '';
            return <h{hn} highlight="Title" style={"font-size:"+(0.75+1/hn)+"em"}>{this.inlineParse(RegExp.$2)}</h{hn}>;
        } else if (this.wikiReg.ul.test(line)){
            this.mode = 'ul';
            return <ul><li>{this.inlineParse(RegExp.$1)}</li></ul>;
        } else if (this.wikiReg.ol.test(line)){
            this.mode = 'ol';
            return <ol><li>{this.inlineParse(RegExp.$1)}</li></ol>;
        } else if (this.wikiReg.dt.test(line)){
            this.mode = 'dl';
            return <dl><dt style="font-weight:bold;">{this.inlineParse(RegExp.$1)}</dt></dl>;
        } else if (prevMode == 'dl'){
            return <>{this.inlineParse(line)}</>;
        }
        this.mode = '';
        return <>{this.inlineParse(line)}</>;
    }, // }}}
    parse: function(){
        var ite = Iterator(this.lines);
        var num, line, indent;
        var currentIndent = 0, indentList = [0], nest=0;
        var prevMode = "";
        var stack = [];
        var nest;
        var isNest = false;
        var bufXML;
        //try {
        for ([num, line] in ite){
            [,indent, line] = line.match(/^(\s*)(.*)\s*$/);
            currentIndent = indent.length;
            var prevIndent = indentList[indentList.length -1];
            bufXML = this.blockParse(line, prevMode);
            if (prevMode == 'pre'){
                if (this.mode){
                    this.xmlstack.appendLastChild(indent.substr(prevIndent) + line + "\n");
                } else {
                    this.xmlstack.reorg(-2);
                    this.mode = this.pendingMode;
                    indentList.pop();
                    if (indentList.length == 0) indentList = [0];
                }
                prevMode = this.mode;
                continue;
            }
            if (!line) {
                //this.xmlstack.append(<>{"\n"}</>);
                continue;
            }

            if (currentIndent > prevIndent){
                if (this.mode){
                    if (prevMode == 'dl'){
                        this.xmlstack.appendChild(<dd/>);
                    }
                    this.xmlstack.push(bufXML);
                    indentList.push(currentIndent);
                } else {
                    if (prevMode && this.xmlstack.length > 0){
                        this.xmlstack.appendLastChild(bufXML);
                    } else {
                        this.xmlstack.append(bufXML);
                    }
                    this.mode = prevMode;
                }
            } else if (currentIndent < prevIndent){
                for (var i in indentList){
                    if (currentIndent == indentList[i] || currentIndent < indentList[i+1]){ nest = i; break; }
                }
                indentList.splice(nest);
                indentList.push(currentIndent);
                this.xmlstack.reorg(nest);
                this.xmlstack.append(bufXML);
            } else {
                this.xmlstack.append(bufXML);
            }
            prevMode = this.mode;
        }
        //} catch (e){ alert(num + ":"+ e); }
        this.xmlstack.reorg();
        return this.xmlstack.last;
    }
};
function HTMLStack(){
    this.stack = [];
}
HTMLStack.prototype = {
    get length() this.stack.length,
    get last() this.stack[this.length-1],
    get lastLocalName() this.last[this.last.length()-1].localName(),
    get inlineElements() ['a','b','i','code','samp','dfn','kbd','br','em','strong','sub','sup','img','span'],
    isInline: function(xml){
        return (xml.length() > 1 || xml.nodeKind() == 'text' || this.inlineElements.indexOf(xml.localName()) >= 0) ?  true : false;
    },
    push: function(xml) this.stack.push(xml),
    append: function(xml){
        if (this.length == 0){
            this.push(xml);
            return xml;
        }
        var buf = this.last[this.last.length()-1];
        if (buf.nodeKind() == 'text'){
            this.last[this.last.length()-1] += this.isInline(xml) ? <><br/>{xml}</> : xml;
        } else {
            if(this.isInline(xml)){
                this.stack[this.length-1] += xml;
            } else if (buf.localName() == xml.localName()){
                buf.* += xml.*;
            } else {
                this.stack[this.length-1] += xml;
            }
        }
        return this.last;
    },
    appendChild: function(xml) {
        var buf = this.stack[this.length-1];
        buf[buf.length()-1].* += xml;
        return this.last;
    },
    appendLastChild: function(xml){
        var buf = this.last[this.last.length()-1].*;
        if (buf.length() > 0 && buf[buf.length()-1].nodeKind() == 'element'){
            var tmp = buf[buf.length()-1].*;
            if (tmp[tmp.length()-1].nodeKind() == 'element'){
                buf[buf.length()-1].* += xml;
            } else {
                buf[buf.length()-1].* += <><br/>{xml}</>;
            }
        } else {
            this.last[this.last.length()-1].* += xml;
        }
        return this.last;
    },
    reorg: function(from){
        if (this.length == 0) return;
        if (!from) from = 0;
        var xmllist = this.stack.splice(from);
        var xml;
        if (xmllist.length > 1){
            xml = xmllist.reduceRight(function(p, c){
                var buf = c[c.length()-1].*;
                if (buf.length() > 0){
                    if (buf[buf.length()-1].nodeKind() == 'text'){
                        c += p;
                    } else {
                        buf[buf.length()-1].* += p;
                    }
                } else {
                    c += p;
                }
                return c;
            });
        } else if (xmllist.length > 0){
            xml = xmllist[0];
        }
        this.push(xml);
        return this.last;
    },
};
commands.addUserCommand(['plugin[help]'], 'list Vimperator plugins',
    function(args){
        liberator.plugins.pluginManager.list(args[0], args['-verbose']);
    }, {
        argCount: '*',
        options: [
            [['-verbose', '-v'], commands.OPTION_NOARG],
        ],
        completer: function(context){
            var all = getPlugins().map(function(plugin){
                let desc = '-';
                for (let i=plugin.length; i-->0;){
                    if (plugin[i][0] == 'description'){
                        desc = plugin[i][1];
                        break;
                    }
                }
                return [plugin.name, desc];
            });
            context.title = ['PluginName', 'Description'];
            context.completions = all.filter(function(row) row[0].toLowerCase().indexOf(context.filter.toLowerCase()) >= 0);
        }
    }, true);
var public = {
    list: function(name, showDetails){
        var xml = <></>;
        var plugins = getPlugins();
        if (name){
            let plugin = plugins.filter(function(plugin) plugin.name == name)[0];
            if (plugin){
                xml = itemFormater(plugin, showDetails);
            }
        } else {
            plugins.forEach(function(plugin) xml += itemFormater(plugin, showDetails));
        }
        liberator.echo(xml, true);
    }
};
return public;
})();
// vim: sw=4 ts=4 et fdm=marker:
