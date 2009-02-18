var PLUGIN_INFO =
<VimperatorPlugin>
<name>{NAME}</name>
<description>History search backward like UNIX shell.</description>
<description lang="ja">UNIX シェルのような、C-rで履歴検索を行うプラグイン</description>
<minVersion>2.0</minVersion>
<maxVersion>2.0</maxVersion>
<updateURL>http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/history-search-backward.js</updateURL>
<author mail="hotchpotch@gmail.com" homepage="http://d.hatena.ne.jp/secondlife/">Yuichi Tateno</author>
<license>MIT</license>
<version>0.1</version>
<detail><![CDATA[
UNIX シェルのように、コマンドラインで C-r でヒストリ検索を行うプラグインです。map の変更設定は以下のように行えます。
>||
liberator.globalVariables.history_search_backward_map = ['<C-r>'];
||<

]]></detail>
</VimperatorPlugin>;

(function() {
    let p = function(msg) {
        Application.console.log(''+msg);
    }

    const FAKE_TAB_EVENT = {
        type: 'keypress',
        liberatorString: '<Tab>',
        preventDefault: function() true,
        stopPropagation: function() true,
    };

    mappings.addUserMap([modes.COMMAND_LINE], liberator.globalVariables.history_search_backward_map || ['<C-r>'], 'History search backward.', 
    function() 
    {
        let command = commandline.command || '';
        commandline.input(options.get('wildoptions').has('auto') ? 'bck-i-search: ' : 'bck-search: ', function(str) {
            try {
                liberator.echo(liberator.execute(str));
            } catch(e) {};
            this.close();
            return;
        }, {
            completer: function(context) {
                context.title = ['CommandLine History', 'INDEX'];
                context.completions = [[key, i] for ([i, key] in storage['history-command'])].filter(function([key, i]) key).reverse();
            },
            onChange: function() {
                // this.onEvent(FAKE_TAB_EVENT);
            },
            default: command,
        });
    });

})();


