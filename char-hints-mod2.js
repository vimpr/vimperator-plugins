// PLUGIN_INFO//{{{
var PLUGIN_INFO =
<VimperatorPlugin>
    <name>{NAME}</name>
    <description>character hint mode.</description>
    <author mail="konbu.komuro@gmail.com" homepage="http://d.hatena.ne.jp/hogelog/">hogelog</author>
    <version>0.0.1</version>
    <minVersion>2.0pre 2008/12/12</minVersion>
    <maxVersion>2.0pre</maxVersion>
    <detail><![CDATA[

== Usage ==
LowerCase => input hint command line.
UpperCase => select char-hint label.

== OPTIONS ==
set histchars="hjkl" => show char-hint use h, j, k, l.

== TODO ==
 * support hinttimeout.
     ]]></detail>
    <detail lang="ja"><![CDATA[

== Usage ==
小文字は候補を絞るためのテキスト入力に使います。
大文字は文字ラベルの選択に使います。

== OPTIONS ==
set histchars="hjkl" => show char-hint use h, j, k, l.

== TODO ==
 * support hinttimeout.
     ]]></detail>
</VimperatorPlugin>;
//}}}

(function () {

    const DEFAULT_HINTCHARS = "HJKLASDFGYUIOPQWERTNMZXCVB";

    options.add(["hintchars", "hchar"],
        "Hint characters",
        "string", DEFAULT_HINTCHARS);

    function chars2num(chars) //{{{
    {
        var num = 0;
        var hintchars = options.hintchars.toUpperCase();
        var base = hintchars.length;
        for(let i=0,l=chars.length;i<l;++i) {
            num = base*num + hintchars.indexOf(chars[i]);
        }
        return num;
    } //}}}
    function num2chars(num) //{{{
    {
        var chars = "";
        var hintchars = options.hintchars.toUpperCase();
        var base = hintchars.length;
        do {
            chars = hintchars[((num % base))] + chars;
            num = Math.floor(num/base);
        } while(num>0);

        return chars;
    } //}}}
    function showCharHints(win) //{{{
    {
        if(!win)
            win = window.content;

        for(let elem in buffer.evaluateXPath("//*[@liberator:highlight and @number]", win.document))
        {
            let num = elem.getAttribute("number");
            let hintchar = num2chars(parseInt(num, 10));
            elem.setAttribute("hintchar", hintchar);
        }
        Array.forEach(win.frames, showCharHints);
    } //}}}

    var hintContext = hints.addMode;
    var hintChars = [];
    var charhints = plugins.charhints = {
        show: function (minor, filter, win) //{{{
        {
            charhints.original.show(minor, filter, win);
            hintChars = [];
            showCharHints();
        }, //}}}
        onInput: function (event) //{{{
        {
            let eventkey = events.toString(event);
            if(/^\d$/.test(eventkey)) {
                commandline.command += eventkey;
            }
            let hintString = commandline.command;
            commandline.command = hintString.replace(/[A-Z]+/g, "");
            charhints.original.onInput(event);
            showCharHints();
            for(let i=0,l=hintString.length;i<l;++i) {
                if(/^[A-Z]$/.test(hintString[i])) {
                    hintChars.push(hintString[i]);
                }
            }
            if(hintChars.length>0) {
                let numstr = String(chars2num(hintChars.join("")));
                // no setTimeout, don't run nice
                setTimeout(function () {
                    for(let i=0,l=numstr.length;i<l;++i) {
                        let num = numstr[i];
                        let alt = new Object;
                        alt.liberatorString = num;
                        charhints.original.onEvent(alt);
                    }
                }, 10);
            }
        }, //}}}
        onEvent: function (event) //{{{
        {
            if(/^\d$/.test(events.toString(event))) {
                charhints.onInput(event);
            } else {
                charhints.original.onEvent(event);
            }
        }, //}}}
    };

    if(!charhints.original) {
        charhints.original = {
            show: hints.show,
            onInput: liberator.eval("onInput", hintContext),
            onEvent: hints.onEvent,
        };

        charhints.install = function () //{{{
        {
            hints.show = charhints.show;
            hints.onEvent = charhints.onEvent;
            liberator.eval("onInput = plugins.charhints.onInput", hintContext);

            highlight.CSS = highlight.CSS.replace(
                    "Hint::after,,*  content: attr(number);",
                    "Hint::after,,*  content: attr(hintchar);");
            highlight.reload();
        }; //}}}
        charhints.uninstall = function () //{{{
        {
            hints.show = charhints.original.show;
            hints.onEvent = charhints.original.onEvent;
            liberator.eval("onInput = plugins.charhints.original.onInput", hintContext);

            highlight.CSS = highlight.CSS.replace(
                    "Hint::after,,*  content: attr(hintchar);",
                    "Hint::after,,*  content: attr(number);");
            highlight.reload();
        }; //}}}
    }
    charhints.install();
})();

// vim: set fdm=marker sw=4 ts=4 et fenc=utf-8:
