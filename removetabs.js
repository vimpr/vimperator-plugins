var PLUGIN_INFO =
<VimperatorPlugin>
<name>removetabs</name>
<description>RemoveTabs</description>
<description lang="ja">タブをまとめて閉じる</description>
<author mail="fifnel@gmail.com" homepage="http://fifnel.com/">fifnel</author>
<version>0.1</version>
<minVersion>2.0pre</minVersion>
<maxVersion>2.0pre</maxVersion>
<updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/removetabs.js</updateURL>
<detail lang="ja"><![CDATA[
これはremovetabsアドオンと似たような処理を行うアドオンです。
現在のタブから左（もしくは右）のタブをすべてクローズすることができます。
https://addons.mozilla.org/ja/firefox/addon/4227

== Command ==

:removetabsleft:
    現在のタブから左にあるタブをすべて閉じます。
    現在のタブは閉じられません。
    
:removetabsright:
    現在のタブから右にあるタブをすべて閉じます。
    現在のタブは閉じられません。

== 設定例 ==
.vimperatorrcに以下のような感じで設定すると良いかもしれません。
>||
    noremap <C-S-p> :removetabsleft<CR>
    noremap <C-S-n> :removetabsright<CR>
||<
]]></detail>
</VimperatorPlugin>;

(function(){
    liberator.modules.commands.addUserCommand(['removetabsleft'], 'remove tabs left',
        function() {
            var ts = getBrowser().tabContainer.childNodes;
            var ct = getBrowser().selectedTab;
            var i;
            for( i=ts.length-1; ts[i]!=ct; i-- ) {}
            for( i--; i>=0; i-- ) {
                getBrowser().removeTab( ts[i] );
            }
        },{}
    );
    liberator.modules.commands.addUserCommand(['removetabsright'], 'remove tabs right',
        function(){
            var ts = getBrowser().tabContainer.childNodes;
            var ct = getBrowser().selectedTab;
            for( var i=ts.length-1; ts[i]!=ct; i-- ) {
                getBrowser().removeTab( ts[i] );
            }
        },{}
    );
})();
