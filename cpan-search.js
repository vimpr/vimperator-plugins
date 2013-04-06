var PLUGIN_INFO = xml`
<VimperatorPlugin>
<name>{NAME}</name>
<description>CPAN search</description>
<description lang="ja">CPAN モジュールを検索し、補完します。</description>
<minVersion>2.0pre</minVersion>
<maxVersion>2.0pre</maxVersion>
<updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/cpan-search.js</updateURL>
<author mail="hotchpotch@gmail.com" homepage="http://tako3.net/http://d.hatena.ne.jp/secondlife/">Yuichi Tateno</author>
<license>MPL 1.1/GPL 2.0/LGPL 2.1</license>
<version>0.1</version>
<detail><![CDATA[
:cpan[!] Moo::Me[tab]:
  CPAN モジュールリストは http://cpan.ma.la/list から vimp 起動時に初回ロードされます。(thx: mala!)
  検索は1単語なら indexOf 探索ですが、: を含む言葉(Foo::Bar など)なら RegExp 検索になるので、重いかもしれません。
  WebService::Hatena をマッチさせたいなら Web::Ha[tab] などで補完できると思います。
  :cpan! で bang をつけると別のタブで開きます。
]]></detail>
</VimperatorPlugin>`;

(function() {
var p = function(arg) {
    Application.console.log(arg);
    // liberator.log(arg);
};

// preload CPAN list
var cpanListURL = liberator.globalVariables.cpanSearchListURL || 'http://cpan.ma.la/list';
if (!liberator.globalVariables.cpanListCache) {
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                liberator.globalVariables.cpanListCache =
                    xhr.responseText.split(/\r\n|[\r\n]/).map(function(i) [i, '', i.toUpperCase()]);
            } else {
                liberator.echoerr('CPAN search: XHR Error: ' + xhr.statusText);
                // throw new Error(xhr.statusText);
            }
        }
    };
    xhr.open('GET', cpanListURL, true);
    xhr.send(null);
}

commands.addUserCommand(
    ['cpan'],
    'CPAN Search',
    function(args) {
        var name = (args.string || '').replace(/^\^|\s+/g, '');
        var url = 'http://search.cpan.org/perldoc?' + name;
        liberator.open(url, args.bang ? liberator.NEW_TAB : null);
    }, {
        completer: function(context) {
            context.title = ['MODULE NAME', ''];
            var word = context.filter.toUpperCase();
            if (word.indexOf(':') >= 0) {
                let regex = word.split(/:+/).map(function(i) i + '[^:]*').join('::');
                regex = new RegExp('^' + regex.replace(/\[\^:\]\*$/, ''));
                context.filters = [function(item) regex.test(item.item[2])];
            } else {
                context.filters = [function(item) item.item[2].indexOf(word) != -1];
            }
            context.completions = liberator.globalVariables.cpanListCache || [];
        },
        argCount: '1',
        bang: true
    },
    true
);

})();

