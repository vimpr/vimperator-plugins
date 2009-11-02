/**
 * ==VimperatorPlugin==
 * @name           bufferecho.js
 * @description    Display results of JavaScript to a buffer(browser) instead of commandline-buffer
 * @description-ja JavaScript実行結果をコマンドライン・バッファではなくバッファ(ブラウザ)に表示
 * @version        0.1
 * ==/VimperatorPlugin==
 */ 
liberator.plugins.buffer_echo = (function(){
var title = "bufferecho results";
var prefix = 'data:text/html,';
function execute(str){
    var result;
    try {
        result = (function(){ return window.eval("with(liberator) {" + str + "}") })();
    } catch (e) {
        result = e.name + ":\n" + e.message;
    }
    return result;
}

commands.addUserCommand(['bufferecho','becho'],'Display results of JavaScript to a buffer(browser)',
    function(args){
        liberator.plugins.buffer_echo.open(args.string, args.bang);
    },{
        completer: function(context) completion.javascript(context)
    },true
);
var manager = {
    append: function(htmlString){
        var body = util.evaluateXPath('/html/body').snapshotItem(0);
        body.innerHTML += htmlString;
    },
    open: function(str, forceNewTab) {
        var result = execute(str);
        if (typeof(result) == "object") result = util.objectToString(result,true);
        var data = '<div><h1>' + util.escapeHTML(str) + '</h1><pre>' + result + '</pre></div>';
        if (buffer.title == title && !forceNewTab){
            this.append(data);
            return;
        }
        var where = buffer.URL == "about:blank" ? liberator.CURRENT_TAB : liberator.NEW_TAB;
        liberator.open([prefix + '<title>'+title+'</title>' + data], where);
    }
};
return manager;
})();
// vim:sw=4 ts=4 et:
