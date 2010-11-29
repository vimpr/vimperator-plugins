var PLUGIN_INFO =
<VimperatorPlugin>
<name>{NAME}</name>
<description>Google Search, and AutoComplete.</description>
<description lang="ja">Google 検索し、候補をよしなに補完します</description>
<minVersion>2.0</minVersion>
<maxVersion>2.0pre</maxVersion>
<updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/google-search.js</updateURL>
<author mail="hotchpotch@gmail.com" homepage="http://tako3.net/http://d.hatena.ne.jp/secondlife/">Yuichi Tateno</author>
<license>MPL 1.1/GPL 2.0/LGPL 2.1</license>
<version>0.1</version>
<detail><![CDATA[
>||
:gsearch[!] のと[tab]
||<

google suggest での飛び先はあくまで google ですが、このプラグインは google の検索結果先に飛びます。
この plugin を作ってから multi_requester.js の存在をしってあっちを使えば・・・、と思いました。いちおう favicon が表示されたりします。
]]></detail>
</VimperatorPlugin>;

(function() {

var p = function (arg) {
    Application.console.log(arg);
    // liberator.log(arg);
}

// Simple $X. os0x version
function $X (exp, context, resolver) {
    context || (context = document);
    var Doc = context.ownerDocument || context;
    var result = Doc.evaluate(exp, context, resolver, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    for (var i = 0, len = result.snapshotLength, res = []; i < len; i++) {
        res.push(result.snapshotItem(i));
    }
    return res;
}

function getGoogleElements (word) {
     var [lang] = Cc['@mozilla.org/network/protocol;1?name=http']
                            .getService(Ci.nsIHttpProtocolHandler)
                            .language.split('-', 1);
     var xhr = new XMLHttpRequest();
     var endpoint = 'http://www.google.co.jp/search';
     var reqURL = endpoint + '?hl=' + lang + '&q=' + encodeURIComponent(word);
     xhr.open('GET', reqURL, false);
     xhr.send(null);

     var div = window.content.document.createElement('div');
     div.innerHTML = xhr.responseText;

     return $X('//div/ol/li/h3/a', div);
}

commands.addUserCommand(['gsearch'],
    'GoogleSearch, and AutoComplete',
    function (args) {
        var url = args.string;
        if (url.indexOf('http') != 0) {
            url = 'http://www.google.co.jp/search?q=' + encodeURIComponent(args.string);
        }
        liberator.open(url, args.bang? liberator.NEW_TAB : null);
    }, {
        completer: function (context) {
            context.filters = [function() true];
            context.keys = {text: "url", description: "title", icon: "icon"};
            context.title = ['URL', 'TITLE'];

            var regex = new RegExp('/url\\?q=([^&]+)');
            context.completions = getGoogleElements(context.filter).map(function(e) {
                var url = e.href.match(regex) ? decodeURIComponent(RegExp.$1) : e.href;
                return {
                    url:   url, 
                    icon:  bookmarks.getFavicon(url), 
                    title: e.textContent
                };
            });
        },
        argCount: '*',
        bang: true,
    },
    true
);

})();
