var PLUGIN_INFO =
<VimperatorPlugin>
<name>{NAME}</name>
<description>Replace default search to migemo.</description>
<description lang="ja">標準の検索を XUL/Migemo に置き換えます</description>
<minVersion>2.0pre</minVersion>
<maxVersion>2.0</maxVersion>
<updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/migemo-find.js</updateURL>
<author mail="hotchpotch@gmail.com" homepage="http://d.hatena.ne.jp/secondlife/">Yuichi Tateno</author>
<license>MIT</license>
<version>0.1.0</version>
<detail lang="ja"><![CDATA[
標準の / などの検索を XUL/Migemo 検索に置き換えます。
同等の機能を持つプラグインとして migemize_find がありますが、
migemo-find.js は pIXMigemoFind が提供している XUL/Migemo のインターフェイスを直接利用しています。

== ToDo ==

- migemo 正規表現でマッチしたパターンすべてにきちんとハイライト
-- 現状は最初にマッチした文字列のみハイライトされる

== ChangeLog ==

- 0.1.0
-- 検索開始文字の先頭が \ なら、通常の検索を行う。migemo りたくない時など用に

]]></detail>
</VimperatorPlugin>;

liberator.plugins.migemoFind = (function() {
    let p = function(m) Application.console.log(m);

    let evalWithContext = function(func, context) {
        let str;
        let fstr = func.toString();
        if (fstr.indexOf('function () {') == 0) {
            str = fstr.replace(/.*?{([\s\S]+)}.*?/m, "$1");
        } else {
            str = '(' + fstr + ')()';
        }
        return liberator.eval(str, context);
    }

    var XMigemoFind;
    try {
        XMigemoFind = Cc['@piro.sakura.ne.jp/xmigemo/find;1']
                                .getService(Ci.pIXMigemoFind);
    } catch(ex if ex instanceof TypeError){}

    if (!XMigemoFind) {
        liberator.echoerr("XUL/Migemo not found. You should be install XUL/Migemo.");
        return;
    }

    // for 2.1pre
    if (typeof search == "undefined") {
	search = finder;
    }
    search.migemo = XMigemoFind.wrappedJSObject;
    search.migemo.target = window.gBrowser;

    if (!search._find)
        search._find = search.find;
    if (!search._findAgain)
        search._findAgain = search.findAgain;

    let setFound = function(f) {
        liberator.eval('found = ' + f.toString(), search._find);
    }

    if (!search.migemoFindEvnetListener) {
        search.migemoFindEvnetListener = search.migemo.document.addEventListener('XMigemoFindProgress', function(ev) {
            if (!ev.foundTerm) {
                liberator.echoerr("E486: Pattern not found: " + ev.findTerm, commandline.FORCE_SINGLELINE);
                setFound(false);
            } else {
                setFound(true);
            }
        }, false);
    }

    evalWithContext(function () {
       search.find = function (str) {
           if (str.indexOf('\\') == 0) {
               search.migemo.disable = true;
               search._find(str.substr(1));
           } else {
               search.migemo.disable = false;
               search.migemo.target = window.gBrowser;
               search.migemo.find(false, str, options["linksearch"]);
               searchString = searchPattern = search.migemo.lastFoundWord;
           }
       }
    }, search._find);

    evalWithContext(function () {
       search.findAgain = function (reverse) {
           let migemo = search.migemo;
           if (migemo.disable) {
               search._findAgain(reverse);
           } else {
               (!reverse) ? migemo.findNext(options["linksearch"]) : migemo.findPrevious(options["linksearch"]);
           }
       }
    }, search._findAgain);
    return this;
})();


