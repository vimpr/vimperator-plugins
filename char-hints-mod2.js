// PLUGIN_INFO//{{{
var PLUGIN_INFO =
<VimperatorPlugin>
    <name>{NAME}</name>
    <description>character hint mode.</description>
    <author mail="konbu.komuro@gmail.com" homepage="http://d.hatena.ne.jp/hogelog/">hogelog</author>
    <version>0.1.1</version>
    <minVersion>2.0pre 2008/12/12</minVersion>
    <maxVersion>2.0a1</maxVersion>
    <date>2008/12/22 14:57:34</date>
    <updateURL>http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/char-hints-mod2.js</updateURL>
    <detail><![CDATA[
== Usage ==
In default setting,
input quickhint in lowercase
and
select charhint label in uppercase.

== SETTING ==
let g:hinstchars:
    set character used by char-hint.
    ex)
      let g:hinstchars="hjkl"
let g:hintsio:
    - "i" setting char-hint input lowercase.
    - "I" setting char-hint input uppercase.
    - "o" setting char-hint show lowercase.
    - "O" setting char-hint show uppercase.
    Default setting is "IO".
    ex)
      let g:histsio="i"

== TODO ==
     ]]></detail>
    <detail lang="ja"><![CDATA[
== Usage ==
デフォルトの設定では
小文字は候補を絞るためのテキスト入力に、
大文字は文字ラベルの選択に使います。

== SETTING ==
let g:hinstchars:
    set character used by char-hint.
    ex)
      let g:hinstchars="hjkl"
let g:hintsio:
    - "i" setting char-hint input lowercase.
    - "I" setting char-hint input uppercase.
    - "o" setting char-hint show lowercase.
    - "O" setting char-hint show uppercase.
    Default setting is "IO".
    ex)
      let g:histsio="i"

== TODO ==
     ]]></detail>
</VimperatorPlugin>;
//}}}

(function () {

    const DEFAULT_HINTCHARS = "HJKLASDFGYUIOPQWERTNMZXCVB";
    const hintContext = hints.addMode;

    let hintchars = DEFAULT_HINTCHARS;
    let inputCase = function(str) str.toUpperCase();
    let inputRegex = /[A-Z]/;
    let showCase = function(str) str.toUpperCase();

    function chars2num(chars) //{{{
    {
        let num = 0;
        hintchars = inputCase(hintchars);
        let base = hintchars.length;
        for(let i=0,l=chars.length;i<l;++i) {
            num = base*num + hintchars.indexOf(chars[i]);
        }
        return num;
    } //}}}
    function num2chars(num) //{{{
    {
        let chars = "";
        hintchars = inputCase(hintchars);
        let base = hintchars.length;
        do {
            chars = hintchars[((num % base))] + chars;
            num = Math.floor(num/base);
        } while(num>0);

        return chars;
    } //}}}
    function showCharHints() //{{{
    {
        function showHints(win)
        {
            for(let elem in buffer.evaluateXPath("//*[@liberator:highlight and @number]", win.document))
            {
                let num = elem.getAttribute("number");
                let hintchar = num2chars(parseInt(num, 10));
                elem.setAttribute("hintchar", showCase(hintchar));
                if(isValidHint(hintchar))
                    validHints.push(elem);
            }
            Array.forEach(win.frames, showHints);
        }

        validHints = [];
        showHints(window.content);
    } //}}}
    function isValidHint(hint) //{{{
    {
        if(hintInput.length == 0 ) return false;
        return inputCase(hint).indexOf(hintInput) == 0;
    } //}}}
    function setIOType(type) //{{{
    {
        switch (type)
        {
            case "I":
                inputCase = function(str) str.toUpperCase();
                inputRegex = /[A-Z]/;
                break;
            case "i":
                inputCase = function(str) str.toLowerCase();
                inputRegex = /[a-z]/;
                break;
            case "O":
                showCase = function(str) str.toUpperCase();
                break;
            case "o":
                showCase = function(str) str.toLowerCase();
                break;
        }
    } //}}}

    var hintInput = "";
    var validHints = [];
    var charhints = plugins.charhints = {
        show: function (minor, filter, win) //{{{
        {
            charhints.original.show(minor, filter, win);
            hintInput = "";
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
            for(let i=0,l=hintString.length;i<l;++i) {
                if(inputRegex.test(hintString[i])) {
                    hintInput += hintString[i];
                }
            }
            showCharHints();
            if(hintInput.length>0) {
                let numstr = String(chars2num(hintInput));
                // no setTimeout, don't run nice
                setTimeout(function () {
                    for(let i=0,l=numstr.length;i<l;++i) {
                        let num = numstr[i];
                        let alt = new Object;
                        alt.liberatorString = num;
                        charhints.original.onEvent(alt);
                    }
                    statusline.updateInputBuffer(hintInput);
                    if(validHints.length == 1) {
                        charhints.original.processHints(true);
                        return true;
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
                statusline.updateInputBuffer(hintInput);
            }
        }, //}}}
    };

    if(!charhints.original) {
        charhints.original = {
            show: hints.show,
            onInput: liberator.eval("onInput", hintContext),
            onEvent: hints.onEvent,
            processHints: liberator.eval("processHints", hintContext),
        };

        charhints.install = function () //{{{
        {
            hints.show = charhints.show;
            hints.onEvent = charhints.onEvent;
            liberator.eval("onInput = plugins.charhints.onInput", hintContext);

            liberator.execute(":hi Hint::after content: attr(hintchar)");
            if(liberator.globalVariables.hintsio) {
                let hintsio = liberator.globalVariables.hintsio;
                for(let i=0,l=hintsio.length;i<l;++i) {
                    setIOType(hintsio[i]);
                }
            }
            if(liberator.globalVariables.hintchars) {
                hintchars = liberator.globalVariables.hintchars;
            }
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
