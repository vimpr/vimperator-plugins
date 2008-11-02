/**
 * ==VimperatorPlugin==
 * @name           copy.js
 * @description    enable to copy strings from a template (like CopyURL+)
 * @description-ja テンプレートから文字列のコピーを可能にします（CopyURL+みたなもの）
 * @minVersion     1.1
 * @author         teramako teramako@gmail.com
 * @version        0.5a
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
 * label: template name which is command argument
 * value:  copy string
 *    the certian string is replace to ...
 *        %TITTLE%  -> to the title of the current page
 *        %URL%     -> to the URL of the current page
 *        %SEL%     -> to the string of selection
 *        %HTMLSEL% -> to the html string of selection
 *
 * map: key map (optional)
 *
 * custom: {function} or {Array} (optional)
 *   {function}:
 *    execute the function and copy return value, if specified.
 *
 *   {Array}:
 *    replaced to the {value} by normal way at first.
 *    and replace words matched {Array}[0] in the replaced string to {Array}[1].
 *    {Array}[0] is string or regexp
 *    {Array}[1] is string or function
 *    see http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Global_Objects:String:replace
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
 *   { label: 'title',          value: '%TITLE%', map: ',y' },
 *   { label: 'anchor',         value: '<a href="%URL%">%TITLE%</a>' },
 *   { label: 'selanchor',      value: '<a href="%URL%" title="%TITLE%">%SEL%</a>' },
 *   { label: 'htmlblockquote', value: '<blockquote cite="%URL%" title="%TITLE%">%HTMLSEL%</blockquote>' }
 *   { label: 'ASIN',   value: 'copy ASIN code from Amazon', custom: function(){return content.document.getElementById('ASIN').value;} },
 * ];
 * EOM
 */
liberator.plugins.exCopy = (function(){
if (!liberator.globalVariables.copy_templates){
    liberator.globalVariables.copy_templates = [
        { label: 'titleAndURL',    value: '%TITLE%\n%URL%' },
        { label: 'title',          value: '%TITLE%' },
        { label: 'anchor',         value: '<a href="%URL%">%TITLE%</a>' },
        { label: 'selanchor',      value: '<a href="%URL%" title="%TITLE%">%SEL%</a>' },
        { label: 'htmlblockquote', value: '<blockquote cite="%URL%" title="%TITLE%">%HTMLSEL%</blockquote>' }
    ];
}

liberator.globalVariables.copy_templates.forEach(function(template){
    if (typeof template.map == 'string')
        addUserMap(template.label, [template.map]);
    else if (template.map instanceof Array)
        addUserMap(template.label, template.map);
});

// used when argument is none
//const defaultValue = templates[0].label;
commands.addUserCommand(['copy'],'Copy to clipboard',
    function(args, special){
        liberator.plugins.exCopy.copy(args, special);
    },{
        completer: function(filter, special){
            if (special){
                return completion.javascript(filter);
            }
            var templates = liberator.globalVariables.copy_templates.map(function(template)
                [template.label, liberator.modules.util.escapeString(template.value, '"')]
            );
            if (!filter){ return [0,templates]; }
            var candidates = [];
            templates.forEach(function(template){
                if (template[0].toLowerCase().indexOf(filter.toLowerCase()) == 0){
                    candidates.push(template);
                }
            });
            return [0, candidates];
        },
        bang: true
    }
);

function addUserMap(label, map){
    mappings.addUserMap([modes.NORMAL,modes.VISUAL], map,
        label,
        function(){ liberator.plugins.exCopy.copy(label); },
        { rhs: label }
    );
}
function getCopyTemplate(label){
    var ret = null;
    liberator.globalVariables.copy_templates.some(function(template)
        template.label == label ? (ret = template) && true : false);
    return ret;
}
function replaceVariable(str){
    if (!str) return '';
    var win = new XPCNativeWrapper(window.content.window);
    var sel = '',htmlsel = '';
    if (str.indexOf('%SEL%') >= 0 || str.indexOf('%HTMLSEL%') >= 0){
        sel = win.getSelection().rangeCount()>0? win.getSelection().getRangeAt(0): '';
    }
    if (str.indexOf('%HTMLSEL%') >= 0){
        var serializer = new XMLSerializer();
        htmlsel = serializer.serializeToString(sel.cloneContents());
    }
    return str.replace(/%TITLE%/g,buffer.title)
              .replace(/%URL%/g,buffer.URL)
              .replace(/%SEL%/g,sel.toString())
              .replace(/%HTMLSEL%/g,htmlsel);
}

var exCopyManager = {
    add: function(label, value, custom, map){
        var template = {label: label, value: value, custom: custom, map: map};
        liberator.globalVariables.copy_templates.unshift(template);
        if (map) addUserMap(label, map);

        return template;
    },
    get: function(label){
        return getCopyTemplate(label);
    },
    copy: function(args, special){
        var arg = args.string == undefined ? args: args.string;
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
            if (!arg) arg = liberator.globalVariables.copy_templates[0];
            var template = getCopyTemplate(arg) || arg;
            if (typeof template.custom == 'function'){
                copyString = template.custom.call(this, template.value);
            } else if (template.custom instanceof Array){
                copyString = replaceVariable(template.value).replace(tempalte.custom[0], template.custom[1]);
            } else {
                copyString = replaceVariable(template.value);
            }
        }
        util.copyToClipboard(copyString);
        if (isError){
            liberator.echoerr('CopiedErrorString: `' + copyString + "'");
        } else {
            liberator.echo('CopiedString: `' + util.escapeHTML(copyString) + "'");
        }
    }
};
return exCopyManager;
})();

// vim: set fdm=marker sw=4 ts=4 et:
