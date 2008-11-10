/**
 * ==VimperatorPlugin==
 * @name           migemo_completion.js
 * @description    replace completion function with using Migemo
 * @description-ja 補完関数をMigemoを使用したものに取り替える
 * @author         Trapezoid
 * @version        0.2
 * ==/VimperatorPlugin==
 *
 * Support commands:
 *  - :buffer
 *  - :sidebar
 *  - :emenu
 *  - :dialog
 *  - :help
 *  - :macros
 *  - :play
 *  and more
 **/
var XMigemoCore;
try{
    XMigemoCore = Components.classes['@piro.sakura.ne.jp/xmigemo/factory;1']
                            .getService(Components.interfaces.pIXMigemoFactory)
                            .getService("ja");
}
catch(ex if ex instanceof TypeError){}

function replaceFunction(target,symbol,f,originalArguments){
    var oldFunction = target[symbol];
    target[symbol] = function() f.apply(target,[oldFunction.apply(target,originalArguments || arguments), arguments]);
}

replaceFunction(liberator.completion,"buffer",function(oldResult,args){
    var filter = args[0];
    var migemoPattern = new RegExp(XMigemoCore.getRegExp(filter));
    return [0, oldResult[1].filter(function([value,label]){
        return migemoPattern.test(value) || migemoPattern.test(label)
        })];
},[""]);
liberator.completion.filter = function(array,filter,matchFromBeginning){
    if(!filter) return array;

    var migemoString = XMigemoCore.getRegExp(filter);
    if(matchFromBeginning)
        migemoString ="^(" + migemoString + ")";
    var migemoPattern = new RegExp(migemoString);

    return array.filter(function([value,label]){
            return migemoPattern.test(value) || migemoPattern.test(label)
        });
}
