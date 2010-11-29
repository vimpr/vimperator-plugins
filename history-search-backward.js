var PLUGIN_INFO =
<VimperatorPlugin>
<name>{NAME}</name>
<description>History search backward like UNIX shell.</description>
<description lang="ja">UNIX シェルのような、C-rで履歴検索を行うプラグイン</description>
<minVersion>2.0</minVersion>
<maxVersion>2.0</maxVersion>
<updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/history-search-backward.js</updateURL>
<author mail="hotchpotch@gmail.com" homepage="http://d.hatena.ne.jp/secondlife/">Yuichi Tateno</author>
<license>MIT</license>
<version>0.2</version>
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

    let showCompletions = function() {
        if (!options.get('wildoptions').has('auto')) {
            evalWithContext(function() {
                completions.complete(true, false);
                completions.itemList.show();
            }, commandline.input);
        }
    }

    let next = function() {
        evalWithContext(function() completions.tab(false), commandline.input);
    }

    let prev = function() {
        evalWithContext(function() completions.tab(true), commandline.input);
    }

    const commandlineWidget = document.getElementById("liberator-commandline");

    mappings.addUserMap([modes.COMMAND_LINE], 
        liberator.globalVariables.history_search_backward_map || ['<C-r>'], 
        'History incremental search backward.', 
        function() 
        {
            if (evalWithContext(function() completions.itemList.visible(), commandline.input)) {
                next();
                return;
            }

            let command = commandline.command || '';
            let completionsList = [[key, i] for ([i, key] in storage['history-command'])].
                                      filter(function([key, i]) key).reverse();

            commandline.input('bck-i-search: ', function(str) {
                try {
                    liberator.execute(str);
                } catch(e) {};
                modes.pop();
                return;
            }, {
                completer: function(context) {
                    context.title = ['CommandLine History', 'INDEX'];
                    context.completions = completionsList;
                },
                onChange: function() {
                    showCompletions();
                },
                default: command,
            });
            showCompletions();
        }
    );
})();


