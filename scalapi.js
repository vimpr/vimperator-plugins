var PLUGIN_INFO =
<VimperatorPlugin>
<name>{NAME}</name>
<description>Scala API document</description>
<description lang="ja">Scala API を検索し、補完します。</description>
<minVersion>2.0pre</minVersion>
<maxVersion>2.0pre</maxVersion>
<updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/scalapi.js</updateURL>
<author mail="hotchpotch@gmail.com" homepage="http://tako3.net/http://d.hatena.ne.jp/secondlife/">Yuichi Tateno</author>
<license>MPL 1.1/GPL 2.0/LGPL 2.1</license>
<version>0.1</version>
<detail><![CDATA[
Scala の API を検索し、保管し、該当のページを開きます。

:sc[alapi][!] List[tab]

引数には正規表現も利用できます。
]]></detail>
</VimperatorPlugin>;

(function() {
var p = function(arg) {
    Application.console.log(arg);
    // liberator.log(arg);
};

var scalaApiURL = liberator.globalVariables.scalaApiURL || 'http://www.scala-lang.org/docu/files/api/';
if (!liberator.globalVariables.scalaApiCache) {
    let xhr = new XMLHttpRequest();
    let regex = new RegExp('<a href="scala/([^.]+).html" target="contentFrame">([^.]+)</a></li>', 'g');
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                let text = xhr.responseText;
                let res = [];
                res.hashMap = {};
                text.replace(regex, function(m) {
                    let path = RegExp.$1;
                    let name = path.replace('$object', '');
                    name = name.replace(/\//g, '.');
                    res.push([name, path]);
                    res.hashMap[name] = path;
                });
                liberator.globalVariables.scalaApiCache = res;
            } else {
                liberator.echoerr('Scala API : XHR Error: ' + xhr.statusText);
                // throw new Error(xhr.statusText);
            }
        }
    };
    xhr.open('GET', scalaApiURL + 'all-classes.html', true);
    xhr.send(null);
}

commands.addUserCommand(
    liberator.globalVariables.scalaApiCommands || ['scalapi', 'sc'],
    'Scala API Search',
    function(args) {
        var name = (args.string || '');
        var url = (name && liberator.globalVariables.scalaApiCache.hashMap[name]) ? scalaApiURL + 'scala/' + liberator.globalVariables.scalaApiCache.hashMap[name] + '.html' : scalaApiURL + 'index.html';
        liberator.open(url, args.bang ? liberator.NEW_TAB : null);
    }, {
        completer: function(context) {
            context.title = ['API Name', 'API'];
            var word = context.filter;// .toUpperCase();
            /*
            if (word.indexOf('.') >= 0) {
                let regex = word.split(/\.+/).map(function(i) i + '[^.]*').join('.');
                p(regex);
                regex = new RegExp('^' + regex.replace(/\[\^\.\]\*$/, ''));
                p(regex);
                context.filters = [function(item) regex.test(item.item[0])];
            } else {
                context.filters = [function(item) item.item[0].toUpperCase().indexOf(word) != -1];
            }
            */
            try {
                var regex = new RegExp(word, 'i');
                context.filters = [function(item) regex.test(item.item[0])];
            } catch(e) {
                var word = context.filter.toUpperCase();
                context.filters = [function(item) item.item[0].toUpperCase().indexOf(word) != -1];
            }
            context.completions = liberator.globalVariables.scalaApiCache || [];
        },
        argCount: '*',
        bang: true
    },
    true
);

})();

