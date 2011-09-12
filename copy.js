var INFO =
<plugin name="copy" version="0.7.6"
        href="http://github.com/vimpr/vimperator-plugins/blob/master/copy.js"
        summary="copy strings from the template (like CopyURL+)"
        xmlns="http://vimperator.org/namespaces/liberator">
    <author email="teramako@gmail.com">teramako</author>
    <license>MPL 1.1/GPL 2.0/LGPL 2.1</license>
    <project name="Vimperator" minVersion="2.3"/>
    <item>
    <tags>:copy</tags>
    <spec>:copy <a>label</a></spec>
    <description>
        <p>copy the argument replaced some certain string.</p>
    </description>
    </item>
    <item>
    <tags>:copy!</tags>
    <spec>:copy! <a>expr</a></spec>
    <description>
        <p>evaluate the argument(javascript code) and copy the result.</p>
    </description>
    </item>
    <item>
    <tags>copy-keyword</tags>
    <spec>copy-keyword</spec>
    <description>
        <p>replaces following keywords</p>
        <dl>
            <dt>%TITLE%</dt>
            <dd>to the title of the current page</dd>
            <dt>%URL%</dt>
            <dd>to the currenet URL</dd>
            <dt>%SEL</dt>
            <dd>to the string of selection</dd>
            <dt>%HTMLSEL</dt>
            <dd>to the html string of selection</dd>
            <dt>%HOSTNAME%</dt>
            <dd>to the hostname of the current location</dd>
            <dt>%PATHNAME%</dt>
            <dd>to the pathname of the current location</dd>
            <dt>%HOST%</dt>
            <dd>to the host of the current location</dd>
            <dt>%PORT%</dt>
            <dd>to the port of the current location</dd>
            <dt>%PROTOCOL%</dt>
            <dd>to the protocol of the current location</dd>
            <dt>%SERCH%</dt>
            <dd>to the search(?...) of the curernt location</dd>
            <dt>%HASH%</dt>
            <dd>to the hash(anchor #..) of the current location</dd>
        </dl>
    </description>
    </item>
    <item>
        <tags>copy-template</tags>
        <spec>copy-template</spec>
        <description>
            <p>you can set your own template using inline JavaScript</p>
            <code><![CDATA[
javascript <<EOM
liberator.globalVariables.copy_templates = [
  { label: 'titleAndURL',    value: '%TITLE%\n%URL%' },
  { label: 'title',          value: '%TITLE%', map: ',y' },
  { label: 'anchor',         value: '<a href="%URL%">%TITLE%</a>' },
  { label: 'selanchor',      value: '<a href="%URL%" title="%TITLE%">%SEL%</a>' },
  { label: 'htmlblockquote', value: '<blockquote cite="%URL%" title="%TITLE%">%HTMLSEL%</blockquote>' }
  { label: 'ASIN',   value: 'copy ASIN code from Amazon', custom: function(){return content.document.getElementById('ASIN').value;} },
];
EOM
            ]]></code>
            <dl>
                <dt>label</dt>
                <dd>template name which is command argument</dd>
                <dt>value</dt>
                <dd>copy string. <a>copy-keyword</a> is replaced</dd>
                <dt>map</dt>
                <dd>key map <a>lhs</a> (optional)</dd>
                <dt>custom</dt>
                <dd>
                    <a>function</a> or <a>Array</a> (optional)
                    <dl>
                        <dt><a>function</a></dt>
                        <dd>execute the function and copy return value, if specified</dd>
                        <dt><a>Array</a></dt>
                        <dd>
                            replace to the <a>value</a> by normal way at first.
                            then replace words matched <a>Array</a>[0] in the repalced string to <a>Array</a>[1].
                            <dl>
                            <dt><a>Array</a>[0]</dt>
                            <dd>String or RegExp</dd>
                            <dt><a>Array</a>[1]</dt>
                            <dd>String or Function</dd>
                            </dl>
                            see: <link topic="http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Global_Objects:String:replace">http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Global_Objects:String:replace</link>
                        </dd>
                    </dl>
                </dd>
            </dl>
        </description>
    </item>
    <item>
        <tags>copy-option</tags>
        <spec>copy-option</spec>
        <description>
            <code><ex>liberator.globalVariables.copy_use_wedata = false; // false by default</ex></code>
            <p>true に設定すると wedata からテンプレートを読込みます。</p>
            <code><ex>liberator.globalVariables.copy_wedata_include_custom = true; // false by default</ex></code>
            <p>custom が設定された wedata を読込みます。
            SandBox でなく、window.eval を利用してオブジェクトする為、
            セキュリティ上の理由で初期設定は false になっています。
            true に設定する場合は、動作を理解したうえ自己責任でご利用ください。</p>
            <code><ex>liberator.globalVariables.copy_wedata_exclude_labels = ['pathtraqnormalize', ];</ex></code>
            <p>wedata から読込まない label のリストを定義します。</p>
        </description>
    </item>
</plugin>;
var PLUGIN_INFO =
<VimperatorPlugin>
<name>{NAME}</name>
<description>enable to copy strings from a template (like CopyURL+)</description>
<description lang="ja">テンプレートから文字列のコピーを可能にします（CopyURL+みたいなもの）</description>
<minVersion>2.0pre</minVersion>
<maxVersion>2.0pre</maxVersion>
<updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/copy.js</updateURL>
<author mail="teramako@gmail.com" homepage="http://vimperator.g.hatena.ne.jp/teramako/">teramako</author>
<license>MPL 1.1/GPL 2.0/LGPL 2.1</license>
<version>0.7.5</version>
</VimperatorPlugin>;

liberator.plugins.exCopy = (function(){
var excludeLabelsMap = {};
var copy_templates = [];
if (!liberator.globalVariables.copy_templates){
    liberator.globalVariables.copy_templates = [
        { label: 'titleAndURL',    value: '%TITLE%\n%URL%' },
        { label: 'title',          value: '%TITLE%' },
        { label: 'anchor',         value: '<a href="%URL%">%TITLE%</a>' },
        { label: 'selanchor',      value: '<a href="%URL%" title="%TITLE%">%SEL%</a>' },
        { label: 'htmlblockquote', value: '<blockquote cite="%URL%" title="%TITLE%">%HTMLSEL%</blockquote>' }
    ];
}

copy_templates = liberator.globalVariables.copy_templates.map(function(t){
    return { label: t.label, value: t.value, custom: t.custom, map: t.map }
});

copy_templates.forEach(function(template){
    if (typeof template.map == 'string')
        addUserMap(template.label, [template.map]);
    else if (template.map instanceof Array)
        addUserMap(template.label, template.map);
});

const REPLACE_TABLE = {
    get TITLE () buffer.title,
    get URL () buffer.URL,
    get SEL () {
        var sel = '';
        var win = new XPCNativeWrapper(window.content.window);
        var selection =  win.getSelection();
        if (selection.rangeCount < 1)
            return '';

        for (var i=0, c=selection.rangeCount; i<c; i++){
            sel += selection.getRangeAt(i).toString();
        }
        return sel;
    },
    get HTMLSEL () {
        var htmlsel = '';
        var win = new XPCNativeWrapper(window.content.window);
        var selection =  win.getSelection();
        if (selection.rangeCount < 1)
            return '';

        var serializer = new XMLSerializer();
        for (var i=0, c=selection.rangeCount; i<c; i++){
            htmlsel += serializer.serializeToString(selection.getRangeAt(i).cloneContents());
        }
        return htmlsel.replace(/<(\/)?(\w+)([\s\S]*?)>/g, function(all, close, tag, attr){
            return "<" + close + tag.toLowerCase() + attr + ">";
        });
    },
    get CLIP () {
        return util.readFromClipboard();
    }
};
'hostname pathname host port protocol search hash'.split(' ').forEach(function (name){
    REPLACE_TABLE[name.toUpperCase()] = function () content.location && content.location[name];
});

// used when argument is none
//const defaultValue = templates[0].label;
commands.addUserCommand(['copy'],'Copy to clipboard',
    function(args){
        liberator.plugins.exCopy.copy(args.literalArg, args.bang, !!args["-append"]);
    },{
        completer: function(context, args){
            if (args.bang){
                completion.javascript(context);
                return;
            }
            context.title = ['Template','Value'];
            var templates = copy_templates.map(function(template)
                [template.label, liberator.modules.util.escapeString(template.value, '"')]
            );
            if (!context.filter){ context.completions = templates; return; }
            var candidates = [];
            var filter = context.filter.toLowerCase();
            context.completions = templates.filter(function(template) template[0].toLowerCase().indexOf(filter) == 0);
        },
        literal: 0,
        bang: true,
        options: [
            [["-append","-a"], commands.OPTION_NOARG]
        ]
    },
    true
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
    copy_templates.some(function(template)
        template.label == label ? (ret = template) && true : false);
    return ret;
}
function replaceVariable(str){
    if (!str) return '';
    function replacer(orig, name){ //{{{
        if (name == '')
            return '%';
        if (!REPLACE_TABLE.hasOwnProperty(name))
            return orig;
        let value = REPLACE_TABLE[name];
        if (typeof value == 'function')
            return value();
        else
            return value.toString();
        return orig;
    } //}}}
    return str.replace(/%([A-Z]*)%/g, replacer);
}

function wedataRegister(item){
    var libly = liberator.plugins.libly;
    var logger = libly.$U.getLogger("copy");
    item = item.data;
    if (excludeLabelsMap[item.label]) return;

    if (item.custom && item.custom.toLowerCase().indexOf('function') != -1) {
        if (!liberator.globalVariables.copy_wedata_include_custom ||
             item.label == 'test') {
            logger.log('skip: ' + item.label);
            return;
        }

        let custom = (function(item){

            return function(value, value2){
                var STORE_KEY = 'plugins-copy-ok-func';
                var store = storage.newMap(STORE_KEY, {store: true});
                var check = store.get(item.label);
                var ans;

                if (!check){
                    ans = window.confirm(
                        'warning!!!: execute "' + item.label + '" ok ?\n' +
                        '(this function is working with unsafe sandbox.)\n\n' +
                        '----- execute code -----\n\n' +
                        'value: ' + item.value + '\n' +
                        'function: ' +
                        item.custom
                    );
                } else {
                    if (item.value == check.value &&
                        item.custom == check.custom &&
                        item.map == check.map){
                        ans = true;
                    } else {
                        ans = window.confirm(
                            'warning!!!: "' + item.label + '" was changed when you registered the function.\n' +
                            '(this function is working with unsafe sandbox.)\n\n' +
                            '----- execute code -----\n\n' +
                            'value: ' + item.value + '\n' +
                            'function: ' +
                            item.custom
                        );
                    }
                }

                if (!ans) return;
                store.set(item.label, item);
                store.save();

                var func;
                try{
                    func = window.eval('(' + item.custom + ')');
                } catch (e){
                    logger.echoerr(e);
                    logger.log(item.custom);
                    return;
                }
                return func(value, value2);
            };
        })(item);

        exCopyManager.add(item.label, item.value, custom, item.map);
    } else {
        exCopyManager.add(item.label, item.value, null, item.map);
    }
}
var exCopyManager = {
    add: function(label, value, custom, map){
        var template = {label: label, value: value, custom: custom, map: map};
        copy_templates.unshift(template);
        if (map) addUserMap(label, map);

        return template;
    },
    get: function(label){
        return getCopyTemplate(label);
    },
    copy: function(arg, special, appendMode){
        var copyString = '';
        var isError = false;
        if (special && arg){
            try {
                copyString = liberator.eval(arg);
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
            if (!arg) arg = copy_templates[0].label;

            var template = getCopyTemplate(arg) || {value: arg};
            if (typeof template.custom == 'function'){
                copyString = template.custom.call(this, template.value, replaceVariable(template.value));
            } else if (template.custom instanceof Array){
                copyString = replaceVariable(template.value).replace(template.custom[0], template.custom[1]);
            } else {
                copyString = replaceVariable(template.value);
            }
        }

        if (appendMode){
            copyString = util.readFromClipboard() + copyString;
        }

        if (copyString)
            util.copyToClipboard(copyString);
        if (isError){
            liberator.echoerr('CopiedErrorString: `' + copyString + "'");
        } else {
            liberator.echo('CopiedString: `' + util.escapeHTML(copyString || '') + "'");
        }
    }
};

if (liberator.globalVariables.copy_use_wedata){
    function loadWedata(){
        if (!liberator.plugins.libly){
            liberator.echomsg("need a _libly.js when use wedata.");
            return;
        }

        var libly = liberator.plugins.libly;
        copy_templates.forEach(function(item) excludeLabelsMap[item.label] = item.value);
        if (liberator.globalVariables.copy_wedata_exclude_labels)
            liberator.globalVariables.copy_wedata_exclude_labels.forEach(function(item) excludeLabelsMap[item] = 1);
        var wedata = new libly.Wedata("vimp copy");
        wedata.getItems(24 * 60 * 60 * 1000, wedataRegister);
    }
    loadWedata();
}

return exCopyManager;
})();

// vim: set fdm=marker sw=4 ts=4 et:

