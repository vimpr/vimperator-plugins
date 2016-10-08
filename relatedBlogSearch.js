var PLUGIN_INFO = xml`
<VimperatorPlugin>
<name>{NAME}</name>
<description>Show/Open related blog</description>
<description lang="ja">現在ページへリンクしているブログを表示または開くプラグイン</description>
<author email="teramako@gmail.com" homepage="http://vimperator.g.hatena.ne.jp/teramako/">teramako</author>
<version>1.0</version>
<license>MPL 1.1/GPL 2.0/LGPL 2.1</license>
<minVersion>2.0pre</minVersion>
<maxVersion>2.0</maxVersion>
<updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/relatedBlogSearch.js</updateURL>
<detail lang="ja"><![CDATA[
現在開いているページへリンクしているブログを探しだし、表示または開くことを目的とするプラグイン

== Command ==

:relatedblog:
  現在ページにリンクしているブログをリストします。
:relatedblog -q[uery] {searchTerm}:
  {searchTerm} で検索してブログをりすとします。
:relatedblog {URL}:
  {URL} を開きます。
  補完から取ってくると良いと思います。

>||
tab relatedblog {URL}
||<
とすることで新規タブに開けます。
また、リストを表示した後、";o" などのヒントからも開けるでしょう。(historyコマンドに似ている)

== 変数 ==
let コマンドで設定してください(しない場合はデフォルト値が使用されます)

:g:blogSearchHeaderTemplate:
  リストを表示する時のヘッダとなるXML文字列
  省略時は以下が使用されます。
  >||
  '<table><tr><th>Title</th><th>Author</th><th>Content</th></tr></table>';
  ||<
:g:blogSearchBodyTemplate:
  リストを表示する時のコンテンツとなるXML文字列
  省略時は以下が使用されます。
  >||
  '<tr><td><a highlight="URL" href="%link%">%title%</a></td><td>%author%</td><td>%content%</td></tr>';
  ||<

また、%で囲まれた特定の文字列が変数として使用されます。
%link%:
  対象ページのURL
%title%:
  対象ページのタイトル
%author%:
  対象ページの著者
%content%:
  対象ページの内容(一部)
%rootURI%:
  対象ページのトップページのURL
%id%:
  不明（ドメイン、日付、パスが含まれる）
%published%:
  投稿された日時(%Y-%m-%dT%H:%M:%SZ)
%updated%:
  更新された日時(%Y-%m-%dT%H:%M:%SZ)
]]></detail>
</VimperatorPlugin>`;

liberator.plugins.relatedBlogSearch = (function(){
const LANG = window.navigator.language;
const BLOGSEARCH_URL = 'http://blogsearch.google.com/blogsearch_feeds?output=atom&hl=' + LANG + '&q=';

/**
 * Serach with Google blogsearch and get entries
 * @param {String} name query string
 */
function BlogSearch() { this._init.apply(this, arguments); }
BlogSearch.prototype = {
  _init: function(name){
    if (!name)
      throw Components.results.NS_ERROR_XPC_NOT_ENOUGH_ARGS;

    this.date = new Date();
    this.name = name;
    this.query = BLOGSEARCH_URL + this.name;
    let self = this;
    this.items = Array.map(
      util.httpGet(this.query).responseXML.getElementsByTagName("entry"),
      function(entry) self._parse(entry)
    );
  },
  /**
   * @param {Element} entryElm Atom entry element
   * @return {Object}
   */
  _parse: function(entryElm){
    let entry = {};
    Array.forEach(entryElm.childNodes, function(elm){
      let tagName = elm.localName;
      switch(tagName){
        case 'link':
          entry.link = elm.getAttribute('href'); break;
        case 'author':
          entry.author = elm.childNodes[0].textContent;
          entry.rootURI = elm.childNodes[1].textContent;
          break;
        default:
          entry[tagName] = elm.textContent;
      }
    });
    return entry;
  },
  /**
   * @param {RegExp} reg
   * @param {String[]} itemNames item's property names
   * @return {Object[]} item list
   */
  search: function(reg, itemNames){
    if (!itemNames) itemNames = [name for (name in this.items[0])];
    return this.items.filter(function(item) itemNames.some(function(name) reg.test(item[name])));
  },
  /**
   * @param {String} template
   * @param {XMLList} xml header XML
   * @param {Object[]} items if omitted, used all items
   * template e.g.)
   *  '<tr><td><a href="link">%title%</a></td><td>%author%</td><td>%content%</td></tr>'
   */
  toXMLByTemplate: function(template, xml, items){
    if (!items) items = this.items;

    function entryToXML(item){
      function replacer(all, name) name in item ? item[name] : all;
      return new XMLList(template.replace(/%(\w+?)%/g, replacer).replace(/&/g,"&amp;"));
    }
    items.forEach(function(item){xml.* += entryToXML(item);});
    return xml;
  },
};

/**
 * -query option completion list
 * e.g.)
 * return [
 *  ["link:https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Global_Objects", "-"],
 *  ["link:https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference", "-"],
 *  ["link:https://developer.mozilla.org/en", "-"],
 *  ["link:https://developer.mozilla.org", "-"],
 * ]
 * when current url is "https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Global_Objects"
 * @return {String[][]}
 */
function getQueryList(){
  return buffer.URL.split(/\/(?!\/)/).reduce(function(p,c){
    p.length == 0 ? p.push(c) : p.push(p[p.length-1]+"/"+c);
    return p;
  },[]).splice(1).map(function(url) ["link:" + url, "-"]).reverse();
}

// ----------------------------------------------
// command
// ----------------------------------------------
commands.addUserCommand(["relatedblog"], "search linked blog from google blogsearch",
function(args){
  let query = args["-query"] ? args["-query"] : "link:" + buffer.URL;
  let entry = manager.getCache(query);
  let header = new XMLList(manager.headerTemplate);
  if (args.length == 0){
    let xml  = entry.toXMLByTemplate(manager.bodyTemplate, header);
    liberator.echo(xml, true);
  } else {
    let reg = new RegExp(args[0], "i");
    let items = entry.search(reg);
    if (items.length > 1){
      liberator.echo(entry.toXMLByTemplate(manager.bodyTemplate, header, items),true);
    } else if (items.length == 1){
      let url = items[0].link;
      liberator.open(url);
    } else {
      liberator.echomsg("related blog is none",5);
    }
  }
},{
  options: [
    [["-query", "-q"], commands.OPTION_STRING, null, getQueryList]
  ],
  argCount: "?",
  completer: function(context, args){
    manager.completer(context, args);
  },
},true);

// ----------------------------------------------
// public
// ----------------------------------------------
var manager = {
  get bodyTemplate(){
    return liberator.globalVariables.blogSearchBodyTemplate ?
      liberator.globalVariables.blogSearchBodyTemplate :
      '<tr><td><a highlight="URL" href="%link%">%title%</a></td><td>%author%</td><td>%content%</td></tr>';
  },
  get headerTemplate(){
    return liberator.globalVariables.blogSearchHeaderTemplate ?
      liberator.globalVariables.blogSearchHeaderTemplate :
      '<table><tr><th>Title</th><th>Author</th><th>Content</th></tr></table>';
  },
  /**
   * @type {BlogSerach[]}
   */
  cache: [],
  /**
   * キャッシュからエントリを取得
   * キャッシュがないまたは期限切れの場合は新たに取得
   * キャッシュのリストは10個まで XXX: 外だししたほうが良いかもしれない
   * XXX: 有効期限を変数に持たせた方が良いかもしれない
   * @param {String} name query string
   * @return {BlogSearch}
   */
  getCache: function(name){
    let cache = this.cache.filter(function(entry) entry.name == name);
    if (cache.length == 0){
      let entry = new BlogSearch(name);
      if(this.cache.push(entry) > 10)
        this.cache.shift();

      return entry;
    } else if (cache[0].date < Date.now() - 5*60*1000){
      cache[0]._init(name);
    }
    return cache[0];
  },
  /**
   * relatedblog コマンド用の補完関数
   * @param {CompletionContext} context
   * @param {String[]} args
   */
  completer: function(context, args){
    let query = args["-query"] ? args["-query"] : "link:" + buffer.URL;
    let entry = this.getCache(query)
    context.title = ["URL", "Title"];
    if (args.length == 0){
      context.completions = entry.items.map(function(item) [item.link, item.title]);
    } else {
      let reg = new RegExp(context.filter, "i");
      context.completions = entry.search(reg).map(function(item) [item.link, item.title]);
    }
  },
};
return manager;
})();
// vim: sw=2 ts=2 et:
