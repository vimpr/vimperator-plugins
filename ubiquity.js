/**
 * ==VimperatorPlugin==
 * @name         Ubiquity Glue
 * @description  Vimperator-plugin for Ubiquity
 * @depend       Ubiquity (ubiquity@labs.mozilla.com)
 * @version      0.1.1a
 * ==/VimperatorPlugin==
 * 
 * USAGE:
 *
 * :ubi[quity] {ubiquityCommand}
 *  {ubiquityCommand}をUbiquityに渡して実行
 *
 * :ubi[quity]
 *  ランチャを起動
 *
 *  - ランチャ起動キーでコマンドラインに":ubiquity "がでます(ランチャはポップアップしない)
 *    気に入らない場合は、XXX:の辺りのコードをコメントアウトしてください
 *  - Ubiquityコマンド名の補完が効きます。
 *  - Ubiquityコマンド入力後、引数を入力してのタブ補完をするとUbiquityのプレビューがでる(はず)
 *
 * FIXME:
 *  - プレビュー時の選択範囲の取得がイマイチ出来てない
 *  - プレビュー後の操作はマウス必須になってしまう(これはどうしようもない？)
 *
 */

liberator.plugins.ubiquity = (function(){

var ubiquityID = 'ubiquity@labs.mozilla.com';
if (!Application.extensions.has(ubiquityID) || !Application.extensions.get(ubiquityID).enabled){
    Components.utils.reportError('Vimperator: UbiquityGlue: Ubiquity is not installed');
    return null;
}
function preExec(target, name, func){
    var original = target[name];
    target[name] = function(){
        var result = func.apply(this, arguments);
        var tmp = null;
        if (result != false) tmp = original.apply(target, arguments);
        return tmp;
    };
}

preExec(events, 'onEscape', function(){
    if (ubiquityManager.panel.state == 'open') gUbiquity.closeWindow();
});
var focusedWindow = null;
var focusedElement = null;
preExec(commandline, 'open', function(){
    focusedWindow = document.commandDispatcher.focusedWindow;
    focusedElement = document.commandDispatcher.focusedElement;
});

// XXX:選択範囲が必要な操作が現状上手く動かない.不便であればコメントアウトしてください.
preExec(gUbiquity, 'openWindow', function(anchor, flag){
    if(!flag) {
        commandline.open(':', 'ubiquity ', modes.EX);
        return false;
    }
});

// -------------------------------------------------
// Command
// -------------------------------------------------
commands.addUserCommand(['ubi[quity]'], 'Vimperator Ubiquity Glue',
    function(args){
        if (!args){
            gUbiquity.openWindow(getBrowser(), true);
            return;
        }
        ubiquityManager.execute(args);
    }, {
        completer: function(context, arg){
            ubiquityManager.completer(context, arg.string)
        }
    },
    true
);

// -------------------------------------------------
// Public Section
// -------------------------------------------------
var ubiquityManager = {
    get panel(){
        return gUbiquity.__msgPanel;
    },
    get cmdManager(){
        return gUbiquity.__cmdManager;
    },
    get nlParser(){
        return this.cmdManager.__nlParser;
    },
    get commands(){
        return this.cmdManager.__cmdSource.getAllCommands();
    },
    execute: function(cmds){
        var context = this.getContext();
        this.nlParser.updateSuggestionList(cmds, context);
        if (this.nlParser.getNumSuggestions() == 0){
            liberator.echoerr('No such command');
            return false;
        }
        var parsedSentence = this.nlParser.getSentence(0);
        try {
            parsedSentence.execute(context);
        } catch (e) {
            liberator.echoerr(e);
        }
    },
    completer: function(context, args){
        var matches = args.match(/(\S+)(?:\s+(.+)$)?/);
        var suggestions = [];
        for (let cmd in this.commands){
            suggestions.push([cmd, this.commands[cmd].description]);
        }
        context.title = ['Command','Description'];
        if (!matches){
            context.completions = suggestions;
            return;
        }
        var [cmd, arg] = [matches[1], matches[2]];
        if (arg || (cmd && cmd in this.commands) ){
            if ( (cmd in this.commands) && this.commands[cmd].preview){
                this.getContext();
                gUbiquity.__textBox.value = args;
                if (this.panel.state == 'closed') {
                    gUbiquity.openWindow(getBrowser(), true);
                }
                gUbiquity.__updatePreview();
            }
        } else if (cmd){
            context.completions = suggestions.filter(function(command){return command[0].indexOf(cmd) == 0;});
            return;
        }
        return [0, []];
    },
    getContext: function(){
        gUbiquity.__focusedWindow  = focusedWindow;
        gUbiquity.__focusedElement = focusedElement;
        return gUbiquity.__makeContext();
    }
};

return ubiquityManager;
})();
// vim:ts=4 sw=4 et:
