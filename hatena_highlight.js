var PLUGIN_INFO =
<VimperatorPlugin>
<name>{NAME}</name>
<description>Clear highlight or highlight keywords in Hatena Services.</description>
<description lang="ja">はてなダイアリーやグループでハイライトを消したり付けたりできます．</description>
<minVersion>2.1a1pre</minVersion>
<maxVersion>2.1a1pre</maxVersion>
<updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/hatena_highlight.js</updateURL>
<author mail="masa138@gmail.com" homepage="http://www.hatena.ne.jp/masa138/">Masayuki KIMURA</author>
<version>0.1</version>
<detail><![CDATA[

== Commands ==
:nohatenahighlight
    ハイライトを無効にします．

:hatenahighlight
    ハイライトを有効にします．

== Examples ==
Google で検索してはてなにアクセスしたときにハイライトを非表示にしたい場合は
.vimperatrrc に以下のような記述をすると非表示になります．
>||
:autocmd PageLoad 'd\.hatena\.ne\.jp' :nohatenahighlight
:autocmd PageLoad 'g\.hatena\.ne\.jp' :nohatenahighlight
||<

]]></detail>
</VimperatorPlugin>;
(function(){
    function toggleHighlight(isClear) {
        var elements = window.content.document.getElementsByTagName('span');
        var highlight = 'highlight';
        var clear     = '_no_highlight_';
        for (var i = 0, length = elements.length; i < length; i++) {
            var element = elements[i];
            if (isClear) {
                if (element.className == highlight) {
                    element.className =  clear;
                }
            } else {
                if (element.className == clear) {
                    element.className =  highlight;
                }
            }
        }
    }

    commands.addUserCommand(["nohatenahighlight"], "Clear Highlight",
        function() {
            toggleHighlight(true);
        }
    );

    commands.addUserCommand(["hatenahighlight"], "Highlight",
        function() {
            toggleHighlight(false);
        }
    );
})();
// vim:sw=4 ts=4 et:
