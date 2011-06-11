var PLUGIN_INFO =
<VimperatorPlugin>
<name>{NAME}</name>
<description>Hatena Bookmark UserSearch</description>
<description lang="ja">はてなブックマークユーザ検索</description>
<minVersion>2.0pre</minVersion>
<maxVersion>2.0pre</maxVersion>
<updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/hatena-bookmark-search.js</updateURL>
<author mail="hotchpotch@gmail.com" homepage="http://d.hatena.ne.jp/secondlife/">Yuichi Tateno</author>
<license>MPL 1.1/GPL 2.0/LGPL 2.1</license>
<version>1.0.2</version>
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
let g:hatena_bookmark_no_migemo='true';
||<

また
>||
let g:hatena_bookmark_suffix_array='true';
||<
とすることで、SuffixArray での検索を有効にします。現在は SuffixArray の構築に時間がかかるため、10000件ぐらいまでのブックマークでないと実用的ではありません。SuffixArray を利用すると、検索のコストが10000件ぐらいでは 1,2ms ぐらいになるとおもいます。また migemo 検索はできません。


 :bs word では、選択している URL を開きます。:bs! word では、選択している URL のはてなブックマークエントリーページを開きます。:bs と単語を入力しないと、http://b.hatena.ne.jp/my を開きます。:bs! では http://b.hatena.ne.jp/ トップページを開きます。

初回検索時にデータを構築しますが、強制的にデータをロードし直したい時などは

>||
 :bs -reload
||<
としてください。
(invalid options エラーが出る場合は、適当な文字を後ろに付加するか、最新(Nightly)の Vimperator を使ってください)

また、:open, :tabopen の補完で、completeオプションに "H"
を追加することではてなブックマークの検索が可能です。
>||
 :set complete+=H
||<
.vimperatorrcに書く場合は
>||
 autocmd VimperatorEnter .* :set complete+=H
||<
としてください。

== ChangeLog ==

- 1.0.2
-- ヌル文字を消す
- 1.0.1
-- ドキュメントの追加
- 1.0.0
-- キャッシュの追加, SuffixArray 検索の追加

]]></detail>
</VimperatorPlugin>;

liberator.plugins.HatenaBookmark = (function(){

let p = function(arg) {
    Application.console.log(''+arg);
    // liberator.log(arg);
}

p.b = function(func, name) {
    let now = (new Date() * 1);
    func();
    let t = (new Date() * 1) - now;
    // p('sary: ' + name + ': ' + t);
}

const HatenaBookmark = {};
HatenaBookmark.Data = new Struct('data');
/*
 * title
 * comment
 * url 
 */
HatenaBookmark.Data.prototype.__defineGetter__('title', function() this.data.split("\n")[0].replace("\0", ''));
HatenaBookmark.Data.prototype.__defineGetter__('comment', function() this.data.split("\n")[1]);
HatenaBookmark.Data.prototype.__defineGetter__('url', function() this.data.split("\n")[2]);
HatenaBookmark.Data.prototype.__defineGetter__('icon', function() bookmarks.getFavicon(this.url));
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

HatenaBookmark.useSuffixArray = !!(liberator.globalVariables.hatena_bookmark_suffix_array);
HatenaBookmark.useMigemo = !!(!liberator.globalVariables.hatena_bookmark_no_migemo && XMigemoCore);
HatenaBookmark.reload = function() {
    if (HatenaBookmark.useSuffixArray) {
        HatenaBookmark.SuffixArray.reload();
    } else {
        HatenaBookmark.UserData.reload();
    }
}

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
            return migemo.test(item.data);
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
            HatenaBookmark.reload();
            liberator.echo('HatenaBookmark data reloaded.');
            return;
        }
        var url = HatenaBookmark.Command.genURL(args);
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
    createCompleter: function(titles) {
    return function(context) {
            context.format = {
                anchored: true,
                title: titles,
                keys: { text: "url", description: "url", icon: "icon", extra: "extra"},
                process: [
                  HatenaBookmark.Command.templateTitleIcon,
                  HatenaBookmark.Command.templateDescription,
                ],
            }
            context.ignoreCase = true;
            if (HatenaBookmark.useSuffixArray) {
                context.filters = [];
                context.completions = HatenaBookmark.SuffixArray.search(context.filter);
            } else {
                if (context.migemo) delete context.migemo;
                context.filters = [HatenaBookmark.Command.filter];
                context.completions = HatenaBookmark.UserData.bookmarks;
            }
        }
    }
}

HatenaBookmark.Command.options = {
   completer: HatenaBookmark.Command.createCompleter(['TITLE', 'Info']),
   literal: 0,
   argCount: '*',
   bang: true,
   options: [
      [['-reload'], commands.OPTION_NOARG]
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

completion.addUrlCompleter("H", "Hatena Bookmarks", HatenaBookmark.Command.createCompleter(["Hatena Bookmarks"]));

HatenaBookmark.Cache = {
    get store() {
        if (!this._store) {
            let key = 'plugins-hatena-bookmark-search-data';
            this._store = storage.newMap(key, {store: true});
        }
        return this._store;
    },
    get now() {
        return (new Date * 1);
    },
    clear : function () {
        let store = this.store;
        store.remove('expire');
        store.remove('data');
        store.remove('saryindexes');
    },
    get data () {
        let store = this.store;
        let expire = store.get('expire');
        if (expire && expire > this.now) {
            return store.get('data');
        } else {
            return this.loadByRemote();
        }
    },
    get expire() {
        // 24 hours;
        return this.now + (liberator.globalVariables.hatena_bookmark_cache_expire || 1000 * 60 * 24); 
    },
    loadByRemote: function() {
        let r = util.httpGet('http://b.hatena.ne.jp/my.name');
        let check = eval('(' + r.responseText + ')');
        if (!check.login) {
            liberator.echo('please login hatena bookmark && :bsearch -reload ');
            this.store.set('expire', this.expire);
            this.store.set('data', '');
            return '';
        } else {
            let url = 'http://b.hatena.ne.jp/my/search.data';
            let res = util.httpGet(url);
            this.store.set('expire', this.expire);
            this.store.set('data', res.responseText);
            return res.responseText;
        }
    },
    get sary() {
        let data = this.data;
        if (data[0] != "\0") {
            data = data.substr(0, data.length * 3/4).split("\n").map(function(s, i) 
                (i % 3 == 0) ? ("\0" + s) : s
            ).join("\n");
            this.store.set('expire', this.expire);
            this.store.set('data', data);
        }
        let sary = new SuffixArray(data);
        let saryindexes = this.store.get('saryindexes');
        if (saryindexes) {
            sary.sary = saryindexes.split(',');
        } else {
            sary.make();
            this.store.set('saryindexes', sary.sary.join(','));
        }
        return sary;
    },
}

HatenaBookmark.SuffixArray = {
    get cache() HatenaBookmark.Cache,
    reload: function() {
        this.cache.clear();
        this.sary = null;
    },
    search: function(word) {
        if (word.length < 2) return [];
        if (!this.sary) {
            this.sary = this.cache.sary;
        }
        let sary = this.sary;
        let indexes;
        p.b(function() {
            indexes = sary.search(word);
        }, 'search/' + word);
        /*
         * title
         * comment
         * url 
         */
        var str = this.sary.string;
        let tmp = [];
        let res = [];
        for (let i = 0, len = indexes.length; i < len; i++) {
            let sIndex = str.lastIndexOf("\0", indexes[i]);
            if (tmp.indexOf(sIndex) == -1) {
                tmp.push(sIndex);
                let eIndex = str.indexOf("\0", indexes[i]);
                if (sIndex != -1 && eIndex != -1) {
                    res.push(new HatenaBookmark.Data(str.substring(sIndex, eIndex-1)));
                }
            }
        }
        return res;
    },
}

HatenaBookmark.UserData = {
    get bookmarks() {
        this.init();
        return this._bookmarks;
    },
    get cache() HatenaBookmark.Cache,
    reload: function() {
        this._inited = false;
        this.cache.clear();
        this.init();
    },
    init: function() {
        if (!this._inited) {
            let cache = HatenaBookmark.Cache.data;
            if (this._bookmarks)
               delete this._bookmarks;
            this._inited = true;
            this.createDataStructure(cache);
        }
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
            /*
             * title
             * comment
             * URL
             */
            ary.push(new HatenaBookmark.Data(tmp[i] + "\n" + tmp[i+1] + "\n" + tmp[i+2]));
        }
    }
};

let SuffixArray = function (string) {
    this.string = string;
    this.lowerString = string.toLowerCase();
    this.defaultLength = 255;
}

SuffixArray.prototype = {
    make: function SuffixArray_createSuffixArray() {
        let string = this.lowerString;
        let sary = [];
        let saryIndex = 0;
        let str;
        let index;
        let dLen = this.defaultLength;
        p.b(function() {
        for (let i = 0, len = string.length; i < len; i++) {
            str = string.substr(i, dLen);
            index = str.indexOf("\n");
            if (index != 0) {
                if (index != -1)
                    str = str.substr(0, index);
                sary[saryIndex++] = [str, i];
            }
        }
        }, 'create');
        p.b(function() {
        sary.sort(function(a, b) {
            if (a[0] > b[0]) {
                return 1;
            } else if (a[0] < b[0]) {
                return -1;
            }
            return 0;
        });
        }, 'sort');
        this.sary = sary.map(function([_,i]) i);
    },
    set sary (sary) { this._sary = sary; this._len = sary.length },
    get sary () this._sary,
    get length () this._len,
    search: function SuffixArray_search(word) {
        let wLen = word.length;
        if (wLen == 0) return [];
        if (!this.sary) this.make();

        word = word.toLowerCase();
        let string = this.lowerString;
        let sary = this.sary;
        let len = this.length;
        let lastIndex = -1;
        let index = parseInt(len / 2);

        let floor = Math.floor;
        let ceil = Math.ceil;

        let str;
        let range = index;

        while (lastIndex != index) {
            lastIndex = index;
            str = string.substr(sary[index], wLen);
            if (word < str) {
                range = floor(range / 2);
                index = index - range;
            } else if (word > str) {
                range = ceil(range / 2);
                index = index + range;
            } else {
                let res = [sary[index]];
                let start = index;
                while (string.substr(sary[--start], wLen) == word)
                    res.unshift(sary[start]);
                let end = index;
                while (string.substr(sary[++end], wLen) == word)
                    res.push(sary[end]);
                res.sort(function(a, b) a - b);
                return res;
            }
        }

        return [];
    }
}

return HatenaBookmark;
})();

