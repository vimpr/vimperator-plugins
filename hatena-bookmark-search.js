var PLUGIN_INFO =
<VimperatorPlugin>
<name>{NAME}</name>
<description>Hatena Bookmark UserSearch</description>
<description lang="ja">はてなブックマークユーザ検索</description>
<minVersion>2.0</minVersion>
<maxVersion>2.0pre</maxVersion>
<updateURL>http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/hatena-bookmark-search.js</updateURL>
<author mail="hotchpotch@gmail.com" homepage="http://d.hatena.ne.jp/secondlife/">Yuichi Tateno</author>
<license>MPL 1.1/GPL 2.0/LGPL 2.1</license>
<version>0.1</version>
<detail><![CDATA[
>||
:bs[earch][!] word
:tabbs[earch][!] word
||<
ログインしているユーザのブックマークを、URL, コメント, タイトル から検索します。
はてなブックマークユーザページの右上の検索のローカル版のようなイメージです。

XUL/Migemo が入っている場合は Migemo を使い正規表現検索します。
Migemo を利用した検索語の絞り込みはスペース区切りの 2単語までとなります。

Migemo を利用すると検索が重くなるので、遅いマシンやインクリメンタル検索環境下では、以下の設定をすることで migemo 検索をしなくなります。
>||
liberator.globalVariables.hatena_bookmark_no_migemo = true;
||<

 :bs word では、選択している URL を開きます。:bs! word では、選択している URL のはてなブックマークエントリーページを開きます。:bs と単語を入力しないと、http://b.hatena.ne.jp/my を開きます。:bs! では http://b.hatena.ne.jp/ トップページを開きます。

初回検索時にデータを構築しますが、強制的にデータをロードし直したい時などは

>||
 :bs -reload x
||<
としてください。最後に x をつけてるのは :bs -reload が invalid options でエラーになってしまうためです(何でだろう…);

]]></detail>
</VimperatorPlugin>;

liberator.plugins.HatenaBookmark = (function(){

var p = function(arg) {
    Application.console.log(arg);
    // liberator.log(arg);
}

const HatenaBookmark = {};
HatenaBookmark.Data = new Struct('url', 'title', 'comment', 'icon');
HatenaBookmark.Data.defaultValue('icon', function() bookmarks.getFavicon(this.url));
HatenaBookmark.Data.prototype.__defineGetter__('stext', function() {
    if (typeof this._stext == 'undefined') {
         this._stext = this.comment + "\0" + this.title + "\0" + this.url;
    }
    return this._stext;
});
HatenaBookmark.Data.prototype.__defineGetter__("extra", function () [
    ["comment", this.comment, "Comment"],
].filter(function (item) item[1]));

var XMigemoCore;
var XMigemoTextUtils;
try {
    XMigemoCore = Cc['@piro.sakura.ne.jp/xmigemo/factory;1']
                            .getService(Ci.pIXMigemoFactory)
                            .getService("ja");
    XMigemoTextUtils = Cc['@piro.sakura.ne.jp/xmigemo/text-utility;1'].getService(Ci.pIXMigemoTextUtils);
} catch (e if e instanceof TypeError) {
}

HatenaBookmark.useMigemo = !!(!liberator.globalVariables.hatena_bookmark_no_migemo && XMigemoCore);

HatenaBookmark.Command = {
   templateDescription: function (item, text) {
       return <>
           {
               !(item.extra && item.extra.length) ? "" :
               <span class="extra-info">
                   {
                       template.map(item.extra, function (e)
                       <><span highlight={e[2]}>{e[1]}</span></>,
                       <>&#xa0;</>/* Non-breaking space */)
                   }
               </span>
           }
       </>
    },
    templateTitleIcon: function (item, text) {
       var simpleURL = text.replace(/^https?:\/\//, '');
       if (simpleURL.indexOf('/') == simpleURL.length-1)
           simpleURL = simpleURL.replace('/', '');
       return <><span highlight="CompIcon">{item.icon ? <img src={item.icon}/> : <></>}</span><span class="td-strut"/>{item.item.title}

       <a href={item.item.url} highlight="simpleURL"><span class="extra-info">{
             simpleURL
       }</span></a>
       </>
    },
    filter: function (_item) {
        var item = _item.item;
        // 'this' is context object.
        if (HatenaBookmark.useMigemo) {
            if (!this.migemo)  {
                this.migemo = HatenaBookmark.Command.compileRegexp(this.filter);
            }
            var migemo = this.migemo;
            return migemo.test(item.stext);
        } else {
            return this.match(item.url) || this.match(item.comment) || this.match(item.title);
        }
    },
    compileRegexp: function(str) {
         let a;
         with (XMigemoTextUtils) {
              a = sanitize(trim(str)).split(/\s+/).join(' ');
         }
         return new RegExp(XMigemoTextUtils.getANDFindRegExpFromTerms(XMigemoCore.getRegExps(a)), 'gim');
    },
    execute: function(args) {
        if (args['-reload']) {
            HatenaBookmark.UserData.reload();
            liberator.echo('HatenaBookmark data reloaded.');
            return;
        } 
        var url = HatenaBookmark.Command.genURL(args.string);
        liberator.open(url);
    },
    executeTab: function(args) {
        var url = HatenaBookmark.Command.genURL(args);
        liberator.open(url, liberator.NEW_TAB);
    },
    genURL: function(args) {
        var url = (args.string || '').replace(/\s/g, '');
        if (url.length) {
            if (args.bang) {
                return 'http://b.hatena.ne.jp/entry/' + url.replace('#', '%23');
            } else {
                return url;
            }
        } else {
            if (args.bang) {
                return 'http://b.hatena.ne.jp/';
            } else {
                return 'http://b.hatena.ne.jp/my';
            }
        }
    },
}

HatenaBookmark.Command.options = {
   completer: function(context) {
       context.format = {
           anchored: true,
           title: ['TITLE', 'Info'],
           keys: { text: "url", description: "url", icon: "icon", extra: "extra"},
           process: [
             HatenaBookmark.Command.templateTitleIcon, 
             HatenaBookmark.Command.templateDescription,
           ],
       }
       context.ignoreCase = true;
       if (context.migemo) delete context.migemo;
       context.filters = [HatenaBookmark.Command.filter];
       context.completions = HatenaBookmark.UserData.bookmarks;
   },
   argCount: '*',
   bang: true,
   options: [
      [['-reload'], commands.OPTION_NOARG] // XXX
   ],
}

commands.addUserCommand(
    ['bs[earch]'],
    'Hatena Bookmark UserSearch',
    HatenaBookmark.Command.execute,
    HatenaBookmark.Command.options,
    true
);

commands.addUserCommand(
    ['tabbs[earch]'],
    'Hatena Bookmark UserSearch',
    HatenaBookmark.Command.executeTab,
    HatenaBookmark.Command.options,
    true
);


HatenaBookmark.UserData = {
    get bookmarks() {
        this.init();
        return this._bookmarks;
    },
    reload: function() {
        this._inited = false;
        this.init();
    },
    init: function() {
        if (!this._inited) {
            if (this._bookmarks) 
               delete this._bookmarks;
            this._inited = true;
            this.preloadLimit = 500;
            this.preload();
        }
    },
    preload: function() {
        this.load({
            offset: 0,
            limit: this.preloadLimit
        });
    },
    load: function(query) {
        var url = 'http://b.hatena.ne.jp/my/search.data';
        var xhr = new XMLHttpRequest();
        var self = this;
        if (query.async) {
           xhr.onreadystatechange = function() {
               if (xhr.readyState == 4) {
                   if (xhr.status == 200) {
                       self.completeHandler(xhr)
                   } else {
                       liberator.echoerr('XHR Error: ' + xhr.statusText);
                       // throw new Error(xhr.statusText);
                   }
               }
           }
        }
        xhr.open('POST', url, query.async);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.send(this.makeQuery(query));
        if (!query.async) {
            if (xhr.status == 200) {
              this.completeHandler(xhr);
            } else {
              liberator.echoerr('XHR Error: ' + xhr.statusText);
              // throw new Error(xhr.statusText);
            }
        }
    },
    makeQuery: function(data) {
        var pairs = [];
        var regexp = /%20/g;
        for (var k in data) {
            if (typeof data[k] == 'undefined') continue;
            var v = data[k].toString();
            var pair = encodeURIComponent(k).replace(regexp,'+') + '=' +
                encodeURIComponent(v).replace(regexp,'+');
            pairs.push(pair);
        }
        return pairs.join('&');
    },
    completeHandler: function(res) {
        if (this._loaded) return;

        if (!this._bookmarks) {
            this.createDataStructure(res.responseText || '');
            if (this._bookmarks.length == this.preloadLimit) {
                this.load({
                    offset: this.preloadLimit,
                    async: true
                });
            } else {
                this._loaded = 1;
            }
        } else {
            this.updateDataStructure(res.responseText || '');
            this._loaded = 1;
        }
    },
    updateDataStructure: function(data) {
        this.pushData(this._bookmarks, data);
    },
    createDataStructure: function(data) {
        this._bookmarks = [];
        this.pushData(this._bookmarks, data);
    },
    pushData: function(ary, data) {
        var infos = data.split("\n");
        var tmp = infos.splice(0, infos.length * 3/4);
        var len = tmp.length;
        for (var i = 0; i < len; i+=3) {
            ary.push(new HatenaBookmark.Data(tmp[i+2]/* url */, tmp[i]/* title */, tmp[i+1]/* comment */));
        }
    },
    mapFunc: function(item) {
        item = item.split("\n");
        return {
            url: item[2],
            comment: item[1],
            title: item[0],
        }
    },
};

return HatenaBookmark;
})();

