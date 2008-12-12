// PLUGIN_INFO//{{{
var PLUGIN_INFO =
<VimperatorPlugin>
    <name>{NAME}</name>
    <description>character hint mode.</description>
    <author mail="konbu.komuro@gmail.com" homepage="http://d.hatena.ne.jp/hogelog/">hogelog</author>
    <version>0.0.1</version>
    <minVersion>2.0pre</minVersion>
    <maxVersion>2.0pre</maxVersion>
    <detail><![CDATA[

== Usage ==
lowercase => select hint-matcher.
UpperCase => select char-hint.

== OPTIONS ==
set histchars="hjkl" => show char-hint use h, j, k, l.
let g:multi_requester_use_wedata = "false"             // true by default

     ]]></detail>
</VimperatorPlugin>;
//}}}

(function (){

    const DEFAULT_HINTCHARS = "HJKLASDFGYUIOPQWERTNMZXCVB";

    options.add(["hintchars", "hchar"],
        "Hint characters",
        "string", DEFAULT_HINTCHARS);

    function chars2num(chars) //{{{
    {
        var num = 0;
        var hintchars = options.hintchars.toUpperCase();
        var base = hintchars.length;
        for(let i=0;i<chars.length;++i) {
            num = base*num + hintchars.indexOf(chars[i]);
        }
        return num;
    } //}}}
    function num2chars(num) //{{{
    {
        var chars = "";
        var hintchars = options.hintchars;
        var base = hintchars.length;
        do {
            chars = hintchars[((num % base))] + chars;
            num = Math.floor(num/base);
        } while(num>0);
        
        return chars;
    } //}}}
    function showCharHints() //{{{
    {
        for (let elem in buffer.evaluateXPath("//*[@liberator:highlight and @number]", window.content.document))
        {
            let num = elem.getAttribute("number");
            let hintchar = num2chars(parseInt(num, 10));
            elem.setAttribute("hintchar", hintchar);
        }
    } //}}}

    let hintContext = hints.addMode;
    let charhints = plugins.charhints = {
        show: function(minor, filter, win) //{{{
        {
            charhints.original.show(minor, filter, win);
            showCharHints();
        }, //}}}
        onInput: function(event) //{{{
        {
            let hintString = commandline.command;
            commandline.command = hintString.replace(/[A-Z]/g, "");
            for(let i=0;i<hintString.length;++i) {
                if (/^[A-Z]$/.test(hintString[i])) {
                    let numstr = String(chars2num(hintString[i]));
                    for(let j=0;j<numstr.length;++j) {
                        let num = numstr[j];
                        let alt = new Object;
                        alt.liberatorString = num;
                        hints.onEvent(alt);
                    }
                }
            }
            charhints.original.onInput(event);
            showCharHints();
        }, //}}}
    };

    if(!charhints.original){
        charhints.original = {
            show: hints.show,
            onInput: liberator.eval("onInput", hintContext),
        };

        charhints.install = function () //{{{
        {
            hints.show = charhints.show;
            liberator.eval('onInput = plugins.charhints.onInput', hintContext);

            highlight.CSS = highlight.CSS.replace(
                    'Hint::after,,*  content: attr(number);',
                    'Hint::after,,*  content: attr(hintchar);');
            highlight.reload();
        }; //}}}
        charhints.uninstall = function () //{{{
        {
            hints.show = charhints.original.show;
            liberator.eval('onInput = plugins.charhints.original.onInput', hintContext);

            highlight.CSS = highlight.CSS.replace(
                    'Hint::after,,*  content: attr(hintchar);',
                    'Hint::after,,*  content: attr(number);');
            highlight.reload();
        }; //}}}
    }
    charhints.install();
})();

// vim: set fdm=marker sw=4 ts=4 et:
