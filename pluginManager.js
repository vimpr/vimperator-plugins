var PLUGIN_INFO =
<VimperatorPlugin>
<name>{NAME}</name>
<description>Manage Vimperator Plugins</description>
<description lang="ja">Vimpeatorプラグインの管理</description>
<author mail="teramako@gmail.com" homepage="http://d.hatena.ne.jp/teramako/">teramako</author>
<version>0.6.7</version>
<minVersion>2.3</minVersion>
<maxVersion>2.4</maxVersion>
<updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/pluginManager.js</updateURL>
<detail lang="ja"><![CDATA[
これはVimperatorプラグインの詳細情報orヘルプを表示するためのプラグインです。
== Command ==

:plugin[help] [pluginName] [-v]:
    {pluginName}を入れるとそのプラグインの詳細を表示します。
    省略すると全てのプラグインの詳細を表示します。
    オプション -v はより細かなデータを表示します

== For plugin Developers ==
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
updateURL:
    プラグインの最新リソースURL
require:
    プラグインが必要とする拡張機能や他のプラグイン
    拡張機能の場合、
    + type属性を"extension"
    + id属性をその拡張機能のid (xxxx@example.com または UUID)
    + 拡張機能名
    プラグインの場合
    + type属性を"plugin"
    + プラグインファイル名
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
- 更新通知
- スタイルの追加(これはすべき？)

]]></detail>
</VimperatorPlugin>;

liberator.plugins.pluginManager = (function(){

function id(value) value;
var lang = window.navigator.language;
var tags = { // {{{
    name: function(info) fromUTF8Octets(info.toString()),
    author: function(info){
        var name = fromUTF8Octets(info.toString());
        var xml = <>{name}</>;
        if (info.@mail.toString() != '')
            xml += <><span> </span>&lt;<a href={'mailto:'+name+' <'+info.@mail+'>'} highlight="URL">{info.@mail}</a>&gt;</>;
        if (info.@homepage.toString() != '')
            xml += <><span> </span>({makeLink(info.@homepage.toString())})</>;
        return xml;
    },
    description: function(info) makeLink(fromUTF8Octets(info.toString())),
    license: function(info){
        var xml = <>{fromUTF8Octets(info.toString())}</>;
        if (info.@document.toString() != '')
            xml += <><span> </span>{makeLink(info.@document.toString())}</>;
        return xml;
    },
    require: function(infos){
        let xml = <></>;
        for (let i=0; i<infos.length(); i++){
            let info = infos[i];
            let name = info.toString();
            xml += <div>{name}</div>;
            if (info.@type){
                let type = info.@type.toString();
                if (type == "extension"){
                    let id = info.@id.toString();
                    xml[i].* += <span highlight="Preview">{id}</span>;
                    if (Application.extensions.has(id)){
                        if (!Application.extensions.get(id).enabled){
                            xml[i].* += <span highlight="ErrorMsg">disabled</span>;
                        }
                    } else {
                        xml[i].* += <span highlight="ErrorMsg">not installed</span>;
                    }
                } else if (type == "plugin"){
                    xml[i].* += <span highlight="Preview">(plugin)</span>;
                    if(!io.getRuntimeDirectories("plugin").some(function(file){
                        file.append(name);
                        return liberator.pluginFiles[file.path];
                    })){
                        xml[i].* += <span highlight="ErrorMsg">not installed</span>;
                    }
                }
            }
        }
        return xml;
    },
    version: id,
    maxVersion: id,
    minVersion: id,
    updateURL: function(info) makeLink(info.toString(), true),
    detail: function(info){
        if (info.* && info.*[0] && info.*[0].nodeKind() == 'element')
            return info.*;

        var text = fromUTF8Octets(info.*.toString());
        var xml = WikiParser.parse(text);
        return xml;
    }
}; // }}}

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
function makeLink(str, withLink){
    let s = str;
    let result = XMLList();
    while (s.length > 0) {
        let m = s.match(/(?:https?:\/\/|mailto:)\S+/);
        if (m) {
            result += <>{s.slice(0, m.index)}<a href={withLink ? m[0] : '#'} highlight="URL">{m[0]}</a></>;
            s = s.slice(m.index + m[0].length);
        } else {
            result += <>{s}</>;
            break;
        }
    }
    return result;
}
function fromUTF8Octets(octets){
    return decodeURIComponent(octets.replace(/[%\x80-\xFF]/g, function(c){
        return '%' + c.charCodeAt(0).toString(16);
    }));
}
// --------------------------------------------------------
// Plugin
// -----------------------------------------------------{{{
var plugins = [];
function getPlugins(reload){
    if (plugins.length > 0 && !reload){
        return plugins;
    }
    plugins = [];
    var contexts = liberator.plugins.contexts;
    for (let path in contexts){
        let context = contexts[path];
        plugins.push(new Plugin(path, context));
    }
    return plugins;
}
function Plugin() { this.initialize.apply(this, arguments); }
Plugin.prototype = { // {{{
    initialize: function(path, context){
        this.path = path;
        this.name = context.NAME;
        this.info = context.PLUGIN_INFO || <></>;
        this.getItems();
    },
    getItems: function(){
        if (this.items) return this.items;
        this.items = {};
        for (let tag in tags){
            if (tag == "detail") continue;
            let xml = this.info[tag];
            let value = tags[tag](this.info);
            if (value && value.toString().length > 0)
                this.items[tag] = value;
        }
        return this.items;
    },
    getDetail: function(){
        if (this.detail)
            return this.detail;
        if (!this.info || !this.info.detail)
            return null;

        return this.detail = tags['detail'](this.info);
    },
    itemFormatter: function(showDetail){
        let data = [
            ["path", this.path]
        ];
        let items = this.getItems();
        for (let name in items){
            data.push([name, items[name]]);
        }
        if (showDetail && this.getDetail())
            data.push(["detail", this.getDetail()]);

        return template.table(this.name, data);
    },
    checkVersion: function(){
        return this.updatePlugin(true);
    },
    updatePlugin: function(checkOnly){ //{{{
        var [localResource, serverResource, store] = this.getResourceInfo();
        var localDate = Date.parse(localResource['Last-Modified']) || 0;
        var serverDate = Date.parse(serverResource.headers['Last-Modified']) || 0;

        var data = {
            'Local Version': this.info.version || 'unknown',
            'Local Last-Modified': localResource['Last-Modified'] || 'unkonwn',
            'Local Path': this.path || 'unknown',
            'Server Latest Version': serverResource.version || 'unknown',
            'Server Last-Modified': serverResource.headers['Last-Modified'] || 'unknown',
            'Update URL': this.info.updateURL || '-'
        };

        if (checkOnly) return template.table(this.name, data);

        if (!this.info.version || !serverResource.version){
            data.Information = '<span style="font-weight: bold;">unknown version.</span>';
        } else if (this.info.version == serverResource.version &&
                   localResource['Last-Modified'] == serverResource.headers['Last-Modified']){
            data.Information = 'up to date.';
        } else if (this.compVersion(this.info.version, serverResource.version) > 0 ||
                   localDate > serverDate){
            data.Information = '<span highlight="WarningMsg">local version is newest.</span>';
        } else {
            data.Information = this.overwritePlugin(serverResource);
            localResource = {}; // cleanup pref.
            localResource['Last-Modified'] = serverResource.headers['Last-Modified'];
            store.set(this.name, localResource);
            store.save();
        }
        return template.table(this.name, data);
    }, // }}}
    getResourceInfo: function(){
        var store = storage.newMap('plugins-pluginManager', {store: true});
        var url = this.info.updateURL;
        var localResource = store.get(this.name) || {};
        var serverResource = {
                version: '',
                source: '',
                headers: {}
            };

        if (url && /^(https?|ftp):\/\//.test(url)){
            let xhr = util.httpGet(url);
            let version = '';
            let source = xhr.responseText || '';
            let headers = {};
            try {
                xhr.getAllResponseHeaders().split(/\r?\n/).forEach(function(h){
                    var pair = h.split(': ');
                    if (pair && pair.length > 1) {
                        headers[pair.shift()] = pair.join('');
                    }
                });
            } catch (e){}
            let m = /\bPLUGIN_INFO[ \t\r\n]*=[ \t\r\n]*<VimperatorPlugin(?:[ \t\r\n][^>]*)?>([\s\S]+?)<\/VimperatorPlugin[ \t\r\n]*>/.exec(source);
            if (m){
                m = m[1].replace(/(?:<!(?:\[CDATA\[(?:[^\]]|\](?!\]>))*\]\]|--(?:[^-]|-(?!-))*--)>)+/g, '');
                m = /^[\w\W]*?<version(?:[ \t\r\n][^>]*)?>([^<]+)<\/version[ \t\r\n]*>/.exec(m);
                if (m){
                    version = m[1];
                }
            }
            serverResource = {version: version, source: source, headers: headers};
        }

        if (!localResource['Last-Modified']){
            localResource['Last-Modified'] = serverResource.headers['Last-Modified'];
            store.set(this.name, localResource);
        }
        return [localResource, serverResource, store];
    },
    overwritePlugin: function(serverResource){
        /*
        if (!plugin[0] || plugin[0][0] != 'path')
            return '<span highlight="WarningMsg">plugin localpath was not found.</span>';

        var localpath = plugin[0][1];
        */
        var source = serverResource.source;
        var file = io.File(this.path);

        if (!source)
            return '<span highlight="WarningMsg">source is null.</span>';

        try {
            file.write(source);
        } catch (e){
            liberator.log('Could not write to ' + file.path + ': ' + e.message);
            return 'E190: Cannot open ' + file.path.quote() + ' for writing';
        }

        try {
            io.source(this.path);
        } catch (e){
            return e.message;
        }

        return '<span style="font-weight: bold; color: blue;">update complete.</span>';
    },
    compVersion: function(a, b){
        const comparator = Cc["@mozilla.org/xpcom/version-comparator;1"].getService(Ci.nsIVersionComparator);
        return comparator.compare(a, b);
    }
}; // }}}
// }}}

// --------------------------------------------------------
// WikiParser
// -----------------------------------------------------{{{
var WikiParser = (function () {
  function State (lines, result, indents) {
    if (!(this instanceof arguments.callee))
        return new arguments.callee(lines, result, indents);

    this.lines = lines;
    this.result = result || <></>;
    this.indents = indents || [];
  }
  State.prototype = {
    get end () !(this.lines.length && let (i = this.indents[this.indents.length - 1])
                                             /^\s*$/.test(this.head) || !i || i.test(this.head)),
    get realEnd () !this.lines.length,
    get head () this.lines[0],
    set head (value) this.lines[0] = value,
    get clone () State(cloneArray(this.lines), this.result, cloneArray(this.indents)),
    get next () {
      let result = this.clone;
      result.lines = this.lines.slice(1);
      return result;
    },
    indent: function (indent, more) {
      let result = this.clone;
      let re = RegExp('^' + indent.replace(/\S/g, ' ') + (more ? '\\s+' : '') + '(.*)$');
      result.indents.push(re);
      return result;
    },
    indentBack: function () {
      let result = this.clone;
      result.indents.pop();
      return result;
    },
    wrap: function (name) {
      let result = this.clone;
      result.result = <{name}>{this.result}</{name}>;
      return result;
    },
    set: function (v) {
      let result = this.clone;
      result.result = v instanceof State ? v.result : v;
      return result;
    },
  };

  function Error (name, state) {
    if (!(this instanceof arguments.callee))
        return new arguments.callee(name, state);

    this.name = name;
    this.state = state;
  }

  function ok (v)
    v instanceof State;

  function cloneArray (ary)
    Array.concat(ary);

  function xmlJoin (xs, init) {
    let result = init || <></>;
    for (let i = 0, l = xs.length; i < l; i++)
      result += xs[i];
    return result;
  }

  function strip (s)
    s.replace(/^\s+|\s+$/g, '');

  function trimAll (lines) {
    let min = null;
    lines.forEach(function (line) {
      let s = line.match(/^\s*/).toString();
      if (min) {
        if (min.indexOf(s) == 0)
          min = s;
      } else {
        min = s;
      }
    });
    if (min) {
      let spre = RegExp('^' + min);
      liberator.log(min.length)
      return lines.map(function (line) line.replace(spre, ''));
    }
    return lines;
  }

  // FIXME
  function link (s) {
    let m;
    let result = <></>;
    while (s && (m = s.match(/(?:https?:\/\/|mailto:)\S+/))) {
      result += <>{RegExp.leftContext || ''}<a href={m[0]}>{m[0]}</a></>;
      s = RegExp.rightContext;
    }
    if (s)
      result += <>{s}</>;
    return result;
  }

  function stripAndLink (s)
    link(strip(s));

  function isEmptyLine (s)
    /^\s*$/.test(s);


  ////////////////////////////////////////////////////////////////////////////////

  let C = {
    // [Parser a] -> Parser b
    or: function or () {
      let as = [];
      for (let i = 0, l = arguments.length; i < l; i++)
        as.push(arguments[i]);
      return function (st) {
        for each (let a in as) {
          let r = a(st);
          if (ok(r))
            return r;
        }
        return Error('or-end', st);
      };
    },

    // Parser a -> Parser a
    many: function many (p) {
      return function (st) {
        let result = [];
        let cnt = 0;
        while (!st.end) {
          let r = p(st);
          if (ok(r))
            result.push(r.result);
          else
            break;
          st = r;
          if (cnt++ > 100) { liberator.log('force break: many-while'); break; }
        }
        if (ok(st))
          return st.set(result);
        return Error('many', st);
      }
    },

    // Parser a -> Parser a
    many1: function many1 (p) {
      return function (st) {
        let result = [];
        let cnt = 0;
        while (!st.end) {
          let r = p(st);
          if (ok(r))
            result.push(r.result);
          else
            break;
          st = r;
          if (cnt++ > 100) { liberator.log('force break: many1-while'); break; }
        }
        if (result.length) {
          return st.set(result);
        }
        return Error('many1', st);
      };
    },

    // Parser a -> Parser a
    indent: function indent (p) {
      return function (st) {
        if (st.end)
          return Error('EOL', 'st');
        return p(st);
      };
    }
  };

  ////////////////////////////////////////////////////////////////////////////////

  let P = (function () {
    // Int -> Parser XML
    function hn (n) {
      let re = RegExp('^\\s*=={' + n + '}\\s+(.*)\\s*=={' + n + '}\\s*$');
      return function (st) {
        let m = st.head.match(re);
        if (m) {
          let hn = 'h' + n;
          return st.next.set(<{hn} style={'font-size:'+(0.75+1/n)+'em'}>{stripAndLink(m[1])}</{hn}>)
        }
        return Error('not head1', st);
      };
    }

    // String -> Parser XML
    function list (name) {
      return function (st) {
        let lis = C.many1(self[name + 'i'])(st);
        if (ok(lis)) {
          return lis.set(xmlJoin(lis.result)).wrap(name);
        }
        return Error(name, st);
      };
    }

    // String -> Parser XML
    function listItem (c) {
      let re = RegExp('^(\\s*\\' + c + ' )(.*)$');
      return function li (st) {
        let m = st.head.match(re);
        if (m) {
          let h = m[2];
          let next = C.many(self.wikiLine)(st.next.indent(m[1]));
          return next.indentBack().set(xmlJoin([<>{h}<br/></>].concat(next.result))).wrap('li');
        }
        return Error(c, st);
      };
    }

    let self = {
      // St -> St
      debug: function debug (st) {
        //liberator.log({ head: st.head, indent: st.indents[st.indents.length - 1] });
        return Error('debug', st);
      },

      emptyLine: function emptyLine (st) {
        if (/^\s*$/.test(st.head)) {
          return st.next.set(<></>);
        }
        return Error('spaces', st);
      },

      // St -> St XML
      plain: function plain (st) {
        let text = st.head;
        return st.next.set(<>{stripAndLink(text)}<br/></>);
      },

      // St -> St XML
      h1: hn(1),
      h2: hn(2),
      h3: hn(3),
      h4: hn(4),

      // St -> St XML
      pre: function pre (st) {
        let m = st.head.match(/^(\s*)>\|\|\s*$/);
        if (m) {
          let result = [];
          let cnt = 0;
          while (!st.realEnd) {
            st = st.next;
            if (/^(\s*)\|\|<\s*$/.test(st.head)){
              st = st.next;
              break;
            }
            result.push(st.head);
            if (cnt++ > 100) { liberator.log('force break: pre-while'); break; }
          }
          return st.set(<pre>{trimAll(result).join('\n')}</pre>);
        }
        return Error('pre', st);
      },

      // St -> St XML
      ul: list('ul'),

      // St -> St XML
      uli: listItem('-'),

      // St -> St XML
      ol: list('ol'),

      // St -> St XML
      oli: listItem('+'),

      // St -> St XML
      dl: function dl (st) {
        let r = C.many1(self.dtdd)(st);
        if (ok(r)) {
          let body = xmlJoin(r.result);
          return r.set(body).wrap('dl');
        }
        return Error('dl', st);
      },

      // St -> St XML
      dtdd: function dtdd (st) {
        let r = self.dt(st);
        if (ok(r)) {
          let [indent, dt] = r.result;
          let dd = C.many(self.wikiLine)(r.indent(indent, true));
          return dd.indentBack().set(dt + <dd>{xmlJoin(dd.result)}</dd>);
        }
        return r;
      },

      // St -> St (lv, XML)
      dt: function dt (st) {
        let m = st.head.match(/^(\s*)(.+):\s*$/);
        if (m) {
          return st.next.set([m[1], <dt style="font-weight:bold;">{m[2]}</dt>]);
        }
        return Error('not dt', st);
      },
    };

    // St -> St XML
    with (self) {
      self.wikiLine = C.or(debug, emptyLine, h1, h2, h3, h4, dl, ol, ul, pre, plain);

      // St -> St [XML]
      self.wikiLines = C.many(wikiLine);

      self.wiki = function (st) {
        let r = wikiLines(st);
        if (ok(r)) {
          let xs = r.result;
          return r.set(xmlJoin(xs)).wrap('div');
        }
        return Error('wiki', st);
      }
    }

    for (let [name, p] in Iterator(self)) {
      self[name] = C.indent(p);
    }

    return self;
  })();


  return liberator.plugins.PMWikiParser = {
    parsers: P,
    combs: C,
    classes: {
      State: State,
    },
    parse: function (src) {
      let r = P.wiki(State(src.split(/\r\n|[\r\n]/)));
      if (ok(r))
        return r.result;
      else
        liberator.echoerr(r.name);
    }
  };

})();
// End WikiParser }}}

// --------------------------------------------------------
// HTML Stack
// -----------------------------------------------------{{{
function HTMLStack(){
    this.stack = [];
}
HTMLStack.prototype = { // {{{
    get length() this.stack.length,
    get last() this.stack[this.length-1],
    get lastLocalName() this.last[this.last.length()-1].localName(),
    get inlineElements() 'a abbr acronym b basefont bdo big br button cite code dfn em font i iframe img inout kbd label map object q s samp script select small span strike strong sub sup textarea tt u var'.split(' '),
    isInline: function(xml)
        xml.length() > 1 || xml.nodeKind() == 'text' || this.inlineElements.indexOf(xml.localName()) >= 0,
    push: function(xml) this.stack.push(xml),
    append: function(xml){
        if (this.length == 0){
            this.push(xml);
            return xml;
        }
        var buf = this.last[this.last.length()-1];
        if (buf.nodeKind() == 'text'){
            this.last[this.last.length()-1] += this.isInline(xml) ? <><br/>{xml}</> : xml;
        } else if (this.isInline(xml)){
            this.stack[this.length-1] += xml;
        } else if (buf.localName() == xml.localName()){
            buf.* += xml.*;
        } else {
            this.stack[this.length-1] += xml;
        }
        return this.last;
    },
    appendChild: function(xml){
        if (this.length == 0){
            this.push(xml);
            return xml;
        }
        var buf = this.stack[this.length-1];
        if (buf[buf.length()-1].localName() == xml.localName()){
            if (this.isInline(xml.*[0]))
                buf[buf.length()-1].* += <br/> + xml.*;
            else
                buf[buf.length()-1].* += xml.*;
        } else
            this.stack[this.length-1] += xml;

        return this.last;
    },
    appendLastChild: function(xml){
        var buf = this.last[this.last.length()-1].*;
        if (buf.length() > 0 && buf[buf.length()-1].nodeKind() == 'element'){
            let tmp = buf[buf.length()-1].*;
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
                let buf = c[c.length()-1].*;
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
    }
}; // }}}
// }}}

// --------------------------------------------------------
// CODEREPOS_PLUGINS
// -----------------------------------------------------{{{
var CODEREPOS = (function(){
    const indexURL = 'http://vimperator.kurinton.net/plugins/info.xml';
    var public = {
        plugins: [],
        init: function(){
            this.plugins = [];
            util.httpGet(indexURL, function(xhr){
                let xml = new XMLList(xhr.responseText);
                let plugins = xml.plugin;
                for (let i=0, length = plugins.length(); i < length; i++){
                    public.plugins.push(new CodeReposPlugin(plugins[i]));
                }
            });
        }
    };
    function CodeReposPlugin(xml){
        this.name = tags.name(xml);
        this.URL = tags.updateURL(xml);
        this.description = tags.description(xml);
        this.version = tags.version(xml);
    }
    public.init();
    return public;
})();
// }}}

// --------------------------------------------------------
// Vimperator Command
// -----------------------------------------------------{{{
commands.addUserCommand(['plugin[help]'], 'list Vimperator plugins',
    function(args){
        var xml;
        if (args["-check"])
            xml = liberator.plugins.pluginManager.checkVersion(args);
        else if (args["-update"])
            xml = liberator.plugins.pluginManager.update(args);
        else if (args["-source"]) {
            if (args.length < 1)
                return liberator.echoerr('Argument(plugin name) required');
            return liberator.plugins.pluginManager.source(args);
        } else
            xml = liberator.plugins.pluginManager.list(args, args["-verbose"]);

        liberator.echo(xml, true);
    }, {
        argCount: '*',
        options: [
            [['-verbose', '-v'], commands.OPTION_NOARG],
            [['-check', '-c'], commands.OPTION_NOARG],
            [['-update', '-u'], commands.OPTION_NOARG],
            [['-source', '-s'], commands.OPTION_NOARG],
        ],
        completer: function(context){
            context.title = ['PluginName', '[Version]Description'];
            context.completions = getPlugins().map(function(plugin) [
                plugin.name,
                '[' + (plugin.items.version || 'unknown') + ']' +
                (plugin.items.description || '-')
            ]).filter(function(row)
                row[0].toLowerCase().indexOf(context.filter.toLowerCase()) >= 0);
        }
    }, true);

commands.addUserCommand(['pluginmanager', 'pm'], 'Manage Vimperator plugins',
    function(args){
        if (args.length < 1)
            liberator.echoerr('Not enough arguments. Sub-command required.');

        var xml;
        var sub = args[0];
        var subArgs = args.slice(1);

        function s2b (s, d) (!/^(\d+|false)$/i.test(s)|parseInt(s)|!!d*2)&1<<!s;

        if (sub == 'source') {
            if (subArgs.length < 1)
                return liberator.echoerr('Argument(plugin name) required');
            return liberator.plugins.pluginManager.source(subArgs);
        } else if (sub == 'install') {
            if (s2b(liberator.globalVariables.plugin_manager_installer, false))
                return liberator.plugins.pluginManager.install(subArgs);
            return liberator.echoerr('This function(sub-command) is invalid now.');
        } else {
            if (sub == 'check') {
                xml = liberator.plugins.pluginManager.checkVersion(subArgs);
            } else if (sub == 'update') {
                xml = liberator.plugins.pluginManager.update(subArgs);
            } else if (sub == 'help' ) {
                xml = liberator.plugins.pluginManager.list(subArgs, true);
            } else if (sub == 'list') {
                xml = liberator.plugins.pluginManager.list(subArgs, false);
            }
            return liberator.echo(xml, true);
        }

        liberator.echoerr('Unknown sub-command: ' + sub)
    }, {
        argCount: '*',
        completer: function(context, args){
            context.ignoreCase = true;
            if (args.length <= 1) { // for sub-command
                context.title = ['Sub-command', 'Description'];
                context.completions = [
                    ['check', 'Check the versions of plugins'],
                    ['help', 'Show plugin help'],
                    ['install', 'Install the plugin of (current page or specified URL).'],
                    ['list', 'List plugin information'],
                    ['update', 'Update plugins'],
                    ['source', 'Show the source code'],
                ];
            } else { // for sub-arguments
                if (/^(update|check|help|list|source)$/.test(args[0])) {
                    context.title = ['PluginName', '[Version]Description'];
                    context.completions = getPlugins().map(function(plugin) [
                        plugin.name,
                        '[' + (plugin.items.version || 'unknown') + ']' +
                        (plugin.items.description || '-')
                    ]).filter(function(row)
                        row[0].toLowerCase().indexOf(context.filter.toLowerCase()) >= 0);
                } else if (args[0] == "install"){
                    context.anchored = false;
                    context.title = ["PluginName", "Name: Description"];
                    context.completions = CODEREPOS.plugins.filter(function($_){
                        return !getPlugins().some(function(installed){
                            return installed.items.updateURL ? installed.items.updateURL == $_.URL : false;
                        });
                    }).map(function(plugin) [plugin.URL, plugin.name + ": " + plugin.description]);
                }
            }
        }
    }, true); // }}}

// --------------------------------------------------------
// Public Member (liberator.plugins.pluginManger)
// -----------------------------------------------------{{{
var public = {
    getPlugins: function(names, forceReload){
        let plugins = getPlugins(forceReload);
        if (!names || names.length == 0)
            return plugins;

        return plugins.filter(function(plugin) names.indexOf(plugin.name) >= 0);
    },
    checkVersion: function(names){
        let xml = <></>;
        this.getPlugins(names).forEach(function(plugin){
            xml += plugin.checkVersion();
        });
        return xml;
    },
    update: function(names){
        let xml = <></>;
        this.getPlugins(names).forEach(function(plugin){
            xml += plugin.updatePlugin();
        });
        return xml;
    },
    source: function(names){
        // XXX 一度に開くようにするべき？ (ref: editor.js L849)
        this.getPlugins(names).forEach(function(plugin){
            editor.editFileExternally(plugin.path);
        });
        return;
    },
    list: function(names, verbose){
        let xml = <></>
        this.getPlugins(names).forEach(function(plugin){
            xml += plugin.itemFormatter(verbose);
        });
        return xml;
    },
    install: function(urls){
        function makeURL(s){
            let url = Cc["@mozilla.org/network/standard-url;1"].createInstance(Ci.nsIURL);
            url.spec = s;
            return url;
        }

        function fixURL(url){
            const cr = RegExp('^http://coderepos\\.org/share/browser/lang/javascript/vimperator-plugins/trunk/[^/]+\\.js$');
            const pi = RegExp('^http://vimperator\\.kurinton\\.net/plugins/');
            const npi = /\/(all|index)\.html/;
            const js = /\.js$/i;
            function xe(xpath){
                let ss = util.evaluateXPath(xpath);
                return (ss.snapshotLength > 0) && ss.snapshotItem(0).href;
            }
            if (cr.test(url)) {
                return url.replace(/(?=coderepos\.org\/)/, 'svn.').replace(/browser\//, '');
            }
            if (pi.test(url) && !npi.test(url)) {
                return xe('//a[@id="file-link"]');
            }
            if (js.test(url)) {
                return url;
            }
            throw 'Current URL is not a pluginFile';
        }

        function download(url){
            let wbp = Cc["@mozilla.org/embedding/browser/nsWebBrowserPersist;1"].createInstance(Ci.nsIWebBrowserPersist);

            let progressListener = {
                onStateChange: function (_webProgress, _request, _stateFlags, _status) {
                    if (_stateFlags & Ci.nsIWebProgressListener.STATE_STOP) {
                        if (file.exists()) {
                            io.source(file.path);
                            liberator.echo('Executed: ' + file.path)
                        } else {
                            return liberator.echoerr('Download error!');
                        }
                    }
                },
                onProgressChange: function () undefined,
                onLocationChange: function () undefined,
                onStatusChange: function () undefined,
                onSecurityChange: function () undefined,
            };

            let filename = url.match(/[^\/]+$/).toString();
            let file = io.getRuntimeDirectories('plugin')[0];
            file.append(filename);

            if (file.exists())
                return liberator.echoerr('Already exists: ' + file.path);

            let fileuri = makeFileURI(file);

            wbp.progressListener = progressListener;
            wbp.persistFlags |= wbp.PERSIST_FLAGS_AUTODETECT_APPLY_CONVERSION;
            wbp.saveURI(makeURL(url), null, null, null, null, fileuri);
        }

        var url = urls.length ? urls[0] : buffer.URL;
        var sourceURL = fixURL(url);
        if (sourceURL == url) {
            liberator.log(url);
            download(url);
        } else {
            liberator.open(sourceURL);
            liberator.echoerr('Please check the source code of plugin, and retry ":pluginmanager install"');
        }
    }
};
return public;
// }}}
})();
// vim: sw=4 ts=4 et fdm=marker:

