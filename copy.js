/**
 * ==VimperatorPlugin==
 * @name           copy.js
 * @description    enable to copy strings from a template (like CopyURL+)
 * @description-ja テンプレートから文字列のコピーを可能にします（CopyURL+みたなもの）
 * @minVersion     0.6pre
 * @author         teramako teramako@gmail.com
 * @version        0.3
 * ==/VimperatorPlugin==
 *
 * Usage:
 * :copy {copyString}         -> copy the argument replaced some certain string
 * :copy! {expr}              -> evaluate the argument and copy the result
 *
 * e.g.)
 * :copy %TITLE%              -> copied the title of the current page
 * :copy title                -> same as `:copy %TITLE%' by default
 * :copy! liberator.version   -> copy the value of liberator.version
 *
 * If non-argument, used `default'
 *
 * Change the value by `set' command. (only the current session)
 * :set copy_{label}=....
 *  or
 * :set {label}=...
 *
 * label: template name which is command argument
 * copy:  copy string
 *    the certian string is replace to ...
 *        %TITTLE%  -> to the title of the current page
 *        %URL%     -> to the URL of the current page
 *        %SEL%     -> to the string of selection
 *        %HTMLSEL% -> to the html string of selection
 *
 * The copy_templates is a string variable which can set on
 * vimperatorrc as following.
 *
 * let copy_templates = "[{ label: 'titleAndURL', value: '%TITLE%\n%URL%' }, { label: 'title', value: '%TITLE%' }]"
 *
 * or your can set it using inline JavaScript.
 *
 * javascript <<EOM
 * liberator.globalVariables.copy_templates = [
 *   { label: 'titleAndURL',    value: '%TITLE%\n%URL%' },
 *   { label: 'title',          value: '%TITLE%' },
 *   { label: 'anchor',         value: '<a href="%URL%">%TITLE%</a>' },
 *   { label: 'selanchor',      value: '<a href="%URL%" title="%TITLE%">%SEL%</a>' },
 *   { label: 'htmlblockquote', value: '<blockquote cite="%URL%" title="%TITLE%">%HTMLSEL%</blockquote>' }
 * ];
 * EOM
 */
(function(){
if (!liberator.globalVariables.copy_templates){
    liberator.globalVariables.copy_templates = [
        { label: 'titleAndURL',    value: '%TITLE%\n%URL%' },
        { label: 'title',          value: '%TITLE%' },
        { label: 'anchor',         value: '<a href="%URL%">%TITLE%</a>' },
        { label: 'selanchor',      value: '<a href="%URL%" title="%TITLE%">%SEL%</a>' },
        { label: 'htmlblockquote', value: '<blockquote cite="%URL%" title="%TITLE%">%HTMLSEL%</blockquote>' }
    ];
}
// used when argument is none
//const defaultValue = templates[0].label;
liberator.commands.addUserCommand(['copy'],'Copy to clipboard',
    function(arg, special){
        var copyString = '';
        var isError = false;
        if (special && arg){
            try {
                copyString = window.eval('with(liberator){' + arg + '}');
                switch (typeof copyString){
                    case 'object':
                        copyString = copyString === null ? 'null' : copyString.toSource();
                        break;
                    case 'function':
                        copyString = copyString.toString();
                        break;
                    case 'number':
                    case 'boolean':
                        copyString = '' + copyString;
                        break;
                    case 'undefined':
                        copyString = 'undefined';
                        break;
                }
            } catch (e){
                isError = true;
                copyString = e.toString();
            }
        } else {
            if (!arg){ arg = liberator.globalVariables.copy_templates[0].label; }
            var str = getCopyTemplate(arg) || arg;
            copyString = replaceVariable(str);
        }
        liberator.util.copyToClipboard(copyString);
        if (isError){
            liberator.echoerr('CopiedErrorString: `' + copyString + "'");
        } else {
            liberator.echo('CopiedString: `' + liberator.util.escapeHTML(copyString) + "'");
        }
    },{
        completer: function(filter, special){
            if (special){
                return liberator.completion.javascript(filter);
            }
            var templates = liberator.globalVariables.copy_templates.map(function(template)
                [template.label, template.value]
            );
            if (!filter){ return [0,templates]; }
            var candidates = [];
            templates.forEach(function(template){
                if (template[0].toLowerCase().indexOf(filter.toLowerCase()) == 0){
                    candidates.push(template);
                }
            });
            return [0, candidates];
        }
    }
);
function getCopyTemplate(label){
    var ret = null;
    liberator.globalVariables.copy_templates.some(function(template)
        template.label == label ? (ret = template.value) && true : false);
    return ret;
}
function replaceVariable(str){
    if (!str) return;
    var win = new XPCNativeWrapper(window.content.window);
    var sel = '',htmlsel = '';
    if (str.indexOf('%SEL%') >= 0 || str.indexOf('%HTMLSEL%') >= 0){
        sel = win.getSelection().getRangeAt(0);
    }
    if (str.indexOf('%HTMLSEL%') >= 0){
        var serializer = new XMLSerializer();
        htmlsel = serializer.serializeToString(sel.cloneContents());
    }
    return str.replace(/%TITLE%/g,liberator.buffer.title)
              .replace(/%URL%/g,liberator.buffer.URL)
              .replace(/%SEL%/g,sel.toString())
              .replace(/%HTMLSEL%/g,htmlsel);
}

})();

// vim: set fdm=marker sw=4 ts=4 et:
