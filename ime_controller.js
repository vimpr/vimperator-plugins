/**
 * ==VimperatorPlugin==
 * @name              IME Controller Lite
 * @description       controll ime at into commandline-mode
 * @description-ja    コマンドラインモード移行時にIMEの制御を行う
 * @author            teramako teramako@gmail.com
 * @namespace         http://d.hatena.ne.jp/teramako/
 * @maxVersion        0.6pre
 * @minVersion        0.6pre
 * ==/VimperatorPlugin==
 *
 *  Please set g:ex_ime_mode value.
 *  ex).
 *  :let g:ex_ime_mode = "inactive"
 *
 *  available value is
 *      "auto"     : No change
 *      "active"   : Initially IME on
 *      "inactive" : Initially IME off
 *      "disabled" : Disable IME
 * 
 *  more detail: see http://developer.mozilla.org/en/docs/CSS:ime-mode
 *
 *  default value is "inactive"
 *
 * TODO: 将来的にTEXTAREAモード時にもIMEのON/OFF切り替え機能をつける
 */

if(!liberator.plugins) vimperator.plugins = {};
liberator.plugins.imeController = (function(){
    var inputElement = document.getAnonymousElementByAttribute(
        document.getElementById('liberator-commandline-command'),'anonid','input'
    );
    function preExec(target,name,func){
        var original = target[name];
        target[name] = function(){
            func.apply(this,arguments);
            return original.apply(target,arguments);
        }
    }
    if (!globalVariables.ex_ime_mode){
        globalVariables.ex_ime_mode = 'inactive';
    }
    preExec(commandline,'open',function(){
        liberator.plugins.imeController.set();
    });
    return {
        set: function(mode){
            if(!mode) mode = globalVariables.ex_ime_mode ? globalVariables.ex_ime_mode : 'inactive';
            inputElement.style.imeMode = mode;
        },
        reset: function(){
            keyElement.setAttribute('oncommand', original);
            inputElement.style.imeMode = 'auto';
        }
    };
})();
// vim: sw=4 ts=4 et:
