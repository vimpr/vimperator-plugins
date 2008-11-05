/**
 * ==VimperatorPlugin==
 * @name              IME Controller Lite
 * @description       control imput method at into commandline-mode
 * @description-ja    コマンドラインモード移行時にIMEの制御を行う
 * @author            teramako teramako@gmail.com
 * @namespace         http://d.hatena.ne.jp/teramako/
 * @maxVersion        0.6pre
 * @minVersion        0.6pre
 * ==/VimperatorPlugin==
 *
 *  Please set g:ex_ime_mode and g:textarea_ime_mode value.
 *  
 *  g:ex_ime_mode:
 *   used at into EX mode
 *  
 *  g:textarea_ime_mode:
 *   used at into TEXTAREA mode from INSERT mode and "noinsertmode" is set.
 *  
 *  ex).
 *  :let g:ex_ime_mode = "inactive"
 *  :let g:textarea_ime_mode = "inactive"
 *
 *  following values are available:
 *      "auto"     : No change
 *      "active"   : Initially IME on
 *      "inactive" : Initially IME off
 *      "disabled"  : Disable IME
 *
 *  more details: see http://developer.mozilla.org/en/docs/CSS:ime-mode
 *
 *  if these values are null, "inactive" is used
 *
 */

liberator.plugins.imeController = (function(){
    var inputElement = document.getAnonymousElementByAttribute(
        document.getElementById('liberator-commandline-command'),'anonid','input'
    );  
    function getMode(name){
        return liberator.globalVariables[name] ? liberator.globalVariables[name] : 'inactive';
    }   
    function preExec(target,name,func){
        var original = target[name];
        target[name] = function(){
            func.apply(this,arguments);
            return original.apply(target,arguments);
        }   
    }   
    preExec(commandline,'open',function(){
        liberator.plugins.imeController.set(inputElement, getMode('ex_ime_mode'));
    }); 
    preExec(events,'onEscape',function(){
        if (liberator.mode == modes.INSERT && (modes.extended & modes.TEXTAREA) && !options.insertmode){
            var inputField = buffer.lastInputField;
            if (liberator.plugins.imeController.set(inputField, getMode('textarea_ime_mode'))){
                inputField.blur();
                setTimeout(function(){inputField.focus();},0);
            }   
        }   
    }); 
    return {
        set: function(elem, mode){
            if (elem && mode) return elem.style.imeMode = mode;
            return false;
        },  
        reset: function(){
            delete liberator.globalVariables.ex_ime_mode;
            delete liberator.globalVariables.textarea_ime_mode;
        }   
    };  
})();
// vim: sw=4 ts=4 et:
