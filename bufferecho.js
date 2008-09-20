/**
 * ==VimperatorPlugin==
 * @name           bufferecho.js
 * @description    Display results of JavaScript to a buffer(browser) instead of commandline-buffer
 * @description-ja JavaScript実行結果をコマンドライン・バッファではなくバッファ(ブラウザ)に表示
 * @version        0.1a
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

liberator.commands.addUserCommand(['bufferecho','becho'],'Display results of JavaScript to a buffer(browser)',
	function(args, special){
        liberator.plugins.buffer_echo.open(args, special);
	},{
		completer: function(filter) liberator.completion.javascript(filter)
	},true
);
var manager = {
    append: function(htmlString){
        var body = liberator.buffer.evaluateXPath('/html/body').snapshotItem(0);
        body.innerHTML += htmlString;
    },
	open: function(str, forceNewTab) {
		var result = execute(str);
        if (typeof(result) == "object") result = liberator.util.objectToString(result,true);
		var data = '<div><h1>' + str + '</h1><pre>' + result + '</pre></div>';
        if (liberator.buffer.title == title && !forceNewTab){
            this.append(data);
            return;
        }
        var where = liberator.buffer.URL == "about:blank" ? liberator.CURRENT_TAB : liberator.NEW_TAB;
        liberator.open([prefix + '<title>'+title+'</title>' + data], where);
	}
};
return manager;
})();
// vim:sw=4 ts=4 et:
