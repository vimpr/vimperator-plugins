// PLUGIN_INFO//{{{
var PLUGIN_INFO =
<VimperatorPlugin>
    <name>{NAME}</name>
    <description>character hint mode.</description>
    <author mail="konbu.komuro@gmail.com" homepage="http://d.hatena.ne.jp/hogelog/">hogelog</author>
    <version>0.0.2</version>
    <minVersion>2.0pre 2008/12/12</minVersion>
    <maxVersion>2.0a1</maxVersion>
    <detail><![CDATA[

== Usage ==
In default setting,
input quickhint in lowercase
and
select charhint label in uppercase.

== OPTIONS ==
set histchars="hjkl":
    show char-hint use h, j, k, l.
set charhintinput=uppercase|lowercase:
    charhint input in uppercase|lowercase
set charhintshow=uppercase|lowercase:
    charhint show in uppercase|lowercase

== TODO ==
     ]]></detail>
    <detail lang="ja"><![CDATA[

== Usage ==
デフォルトの設定では
小文字は候補を絞るためのテキスト入力に、
大文字は文字ラベルの選択に使います。

== OPTIONS ==
set histchars="hjkl":
    show char-hint use h, j, k, l.
set charhintinput=uppercase|lowercase:
    charhint input in uppercase|lowercase
set charhintshow=uppercase|lowercase:
    charhint show in uppercase|lowercase

== TODO ==
     ]]></detail>
</VimperatorPlugin>;
//}}}

(function () {

    const DEFAULT_HINTCHARS = "HJKLASDFGYUIOPQWERTNMZXCVB";

    let inputCase = function(str) str.toUpperCase();
    let inputRegex = /[A-Z]/;
    let showCase = function(str) str.toUpperCase();

    options.add(["hintchars", "hchar"], //{{{
        "Hint characters",
        "string", DEFAULT_HINTCHARS); //}}}
    options.add(["charhintinput", "chinput"], //{{{
        "Character Hint Input",
        "string", "uppercase",
        {
            setter: function (value)
            {
                switch (value)
                {
                    default:
                    case "uppercase":
                        inputCase = function(str) str.toUpperCase();
                        inputRegex = /[A-Z]/;
                        break;
                    case "lowercase":
                        inputCase = function(str) str.toLowerCase();
                        inputRegex = /[a-z]/;
                        break;
                }
            },
            completer: function () [
                ["uppercase", "Input charhint UpperCase"],
                ["lowercase", "Input charhint LowerCase"],
            ],
        }); //}}}
    options.add(["charhintshow", "chshow"], //{{{
        "Character Hint Show",
        "string", "uppercase",
        {
            setter: function (value)
            {
                switch (value)
                {
                    default:
                    case "uppercase":
                        showCase = function(str) str.toUpperCase();
                        break;
                    case "lowercase":
                        showCase = function(str) str.toLowerCase();
                        break;
                }
            },
            completer: function () [
                ["uppercase", "show charhint UpperCase"],
                ["lowercase", "show charhint LowerCase"],
            ],
        }); //}}}
        

    function chars2num(chars) //{{{
    {
        let num = 0;
        //let hintchars = options.hintchars.toUpperCase();
        let hintchars = inputCase(options.hintchars);
        let base = hintchars.length;
        for(let i=0,l=chars.length;i<l;++i) {
            num = base*num + hintchars.indexOf(chars[i]);
        }
        return num;
    } //}}}
    function num2chars(num) //{{{
    {
        let chars = "";
        //let hintchars = options.hintchars.toUpperCase();
        let hintchars = inputCase(options.hintchars);
        let base = hintchars.length;
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
            //elem.setAttribute("hintchar", hintchar);
            elem.setAttribute("hintchar", showCase(hintchar));
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
            commandline.command = hintString.replace(inputRegex, "");
            charhints.original.onInput(event);
            showCharHints();
            for(let i=0,l=hintString.length;i<l;++i) {
                if(inputRegex.test(hintString[i])) {
                    hintChars.push(hintString[i]);
                }
            }
            if(hintChars.length>0) {
                let hintinput = hintChars.join("");
                let numstr = String(chars2num(hintinput));
                // no setTimeout, don't run nice
                setTimeout(function () {
                    for(let i=0,l=numstr.length;i<l;++i) {
                        let num = numstr[i];
                        let alt = new Object;
                        alt.liberatorString = num;
                        charhints.original.onEvent(alt);
                    }
                    statusline.updateInputBuffer(hintinput);
                }, 10);
            }
        }, //}}}
        onEvent: function (event) //{{{
        {
            if(/^\d$/.test(events.toString(event))) {
                charhints.onInput(event);
            } else {
                charhints.original.onEvent(event);
                statusline.updateInputBuffer(hintinput);
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

            liberator.execute(":hi Hint::after content: attr(hintchar)");
        }; //}}}
        charhints.uninstall = function () //{{{
        {
            hints.show = charhints.original.show;
            hints.onEvent = charhints.original.onEvent;
            liberator.eval("onInput = plugins.charhints.original.onInput", hintContext);

            liberator.execute(":hi Hint::after content: attr(number)");
        }; //}}}
    }
    charhints.install();
})();

// vim: set fdm=marker sw=4 ts=4 et fenc=utf-8:
