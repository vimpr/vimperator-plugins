// Vimperator plugin: 'Char Hints Mod'
// Last Change: 06-Apr-2008. Jan 2008
// License: GPL
// Version: 0.3
// Maintainer: Trapezoid <trapezoid.g@gmail.com>

// This file is a tweak based on char-hints.js by:
// (c) 2008: marco candrian <mac@calmar.ws>
// This file is a tweak based on hints.js by:
// (c) 2006-2008: Martin Stubenschrott <stubenschrott@gmx.net>

// Tested with vimperator 0.6pre from 2008-03-07
// (won't work with older versions)

// INSTALL: put this file into ~/.vimperator/plugin/  (create folders if necessary)
// and restart firefox or :source that file

// plugin-setup
liberator.plugins.charhints = {};
var chh = liberator.plugins.charhints;

//<<<<<<<<<<<<<<<< EDIT USER SETTINGS HERE

//chh.hintchars = "asdfjkl";      // chars to use for generating hints
chh.hintchars = "hjklasdfgyuiopqwertnmzxcvb";      // chars to use for generating hints

chh.showcapitals = true;        // show capital letters, even with lowercase hintchars
chh.timeout = 500;              // in 1/000sec; when set to 0, press <RET> to follow

chh.fgcolor = "black";          // hints foreground color
chh.bgcolor = "yellow";         // hints background color
chh.selcolor = "#99FF00";       // selected/active hints background color

chh.mapNormal = "f";            // trigger normal mode with...
chh.mapNormalNewTab = "F";      // trigger and open in new tab
chh.mapExtended = ";";          // open in extended mode (see notes below)

chh.hinttags = "//*[@onclick or @onmouseover or @onmousedown or @onmouseup or @oncommand or @class='lk' or @class='s'] | " +
"//input[not(@type='hidden')] | //a | //area | //iframe | //textarea | //button | //select | " +
"//xhtml:*[@onclick or @onmouseover or @onmousedown or @onmouseup or @oncommand or @class='lk' or @class='s'] | " +
"//xhtml:input[not(@type='hidden')] | //xhtml:a | //xhtml:area | //xhtml:iframe | //xhtml:textarea | " +
"//xhtml:button | //xhtml:select";

//========================================
//  extended hints mode arguments
//
// ; to focus a link and hover it with the mouse
// a to save its destination (prompting for save location)
// s to save its destination
// o to open its location in the current tab
// t to open its location in a new tab
// O to open its location in an :open query
// T to open its location in a :tabopen query
// v to view its destination source
// w to open its destination in a new window
// W to open its location in a :winopen query
// y to yank its location
// Y to yank its text description

// variables etc//{{{


// ignorecase when showcapitals = true
// (input keys on onEvent gets lowercased too

if (chh.showcapitals)
    chh.hintchars = chh.hintchars.toLowerCase();


chh.submode    = ""; // used for extended mode, can be "o", "t", "y", etc.
chh.hintString = ""; // the typed string part of the hint is in this string
chh.hintNumber = 0;  // only the numerical part of the hint
chh.usedTabKey = false; // when we used <Tab> to select an element

chh.hints = [];
chh.validHints = []; // store the indices of the "hints" array with valid elements

chh.activeTimeout = null;  // needed for hinttimeout > 0
chh.canUpdate = false;

// used in number2hintchars
chh.transval = {"0":0,  "1":1, "2":2,  "3":3,  "4":4,  "5":5,  "6":6,  "7":7,  "8":8,  "9":9,  "a":10, "b":11,
                "c":12, "d":13,"e":14, "f":15, "g":16, "h":17, "i":18, "j":19, "k":20, "l":21, "m":22, "n":23,
                "o":24, "p":25,"q":26, "r":27, "s":28, "t":29, "u":30, "v":31, "w":32, "x":33, "y":34, "z":35};

// used in hintchars2number
chh.conversion = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// keep track of the documents which we generated the hints for
// docs = { doc: document, start: start_index in hints[], end: end_index in hints[] }
chh.docs = [];
//}}}
// reset all important variables
chh.reset = function ()//{{{
{
    liberator.statusline.updateInputBuffer("");
    chh.hintString = "";
    chh.hintNumber = 0;
    chh.usedTabKey = false;
    chh.hints = [];
    chh.validHints = [];
    chh.canUpdate = false;
    chh.docs = [];

    if (chh.activeTimeout)
        clearTimeout(chh.activeTimeout);
    chh.activeTimeout = null;
}
//}}}
chh.updateStatusline = function ()//{{{
{
    liberator.statusline.updateInputBuffer(("") +
            (chh.hintString ? "\"" + chh.hintString + "\"" : "") +
            (chh.hintNumber > 0 ? " <" + chh.hintNumber + ">" : ""));
}
//}}}
// this function 'click' an element, which also works
// for javascript links
chh.hintchars2number = function (hintstr)//{{{
{
    // convert into 'normal number then make it decimal-based

    var converted = "";

    // translate users hintchars into a number (chh.conversion) 0 -> 0, 1 -> 1, ...
    for (var i = 0, l = hintstr.length; i < l; i++)
        converted += "" + chh.conversion[chh.hintchars.indexOf(hintstr[i])];

    // add one, since hints begin with 0;

    return parseInt(converted, chh.hintchars.length); // hintchars.length is the base/radix
}
//}}}
chh.number2hintchars = function (nr)//{{{
{
    var oldnr = nr;
    var converted = "";
    var tmp = "";

    tmp = nr.toString(chh.hintchars.length); // hintchars.length is the base/radix)

    // translate numbers into users hintchars
    // tmp might be 2e -> (chh.transval) 2 and 14 -> (chh.hintchars) according hintchars

    for (var i = 0, l = tmp.length; i < l; i++)
        converted += "" + chh.hintchars[chh.transval[tmp[i]]];

    return converted;
}
//}}}
chh.openHint = function (where)//{{{
{
    if (chh.validHints.length < 1)
        return false;

    var x = 1, y = 1;
    var elem = chh.validHints[chh.hintNumber - 1] || chh.validHints[0];
    var elemTagName = elem.localName.toLowerCase();
    elem.focus();

    liberator.buffer.followLink(elem, where);
    return true;
}
//}}}
chh.focusHint = function ()//{{{
{
    if (chh.validHints.length < 1)
        return false;

    var elem = chh.validHints[chh.hintNumber - 1] || chh.validHints[0];
    var doc = window.content.document;
    var elemTagName = elem.localName.toLowerCase();
    if (elemTagName == "frame" || elemTagName == "iframe")
    {
        elem.contentWindow.focus();
        return false;
    }
    else
    {
        elem.focus();
    }

    var evt = doc.createEvent("MouseEvents");
    var x = 0;
    var y = 0;
    // for imagemap
    if (elemTagName == "area")
    {
        [x, y] = elem.getAttribute("coords").split(",");
        x = Number(x);
        y = Number(y);
    }

    evt.initMouseEvent("mouseover", true, true, doc.defaultView, 1, x, y, 0, 0, 0, 0, 0, 0, 0, null);
    elem.dispatchEvent(evt);
}
//}}}
chh.yankHint = function (text)//{{{
{
    if (chh.validHints.length < 1)
        return false;

    var elem = chh.validHints[chh.hintNumber - 1] || chh.validHints[0];
    if (text)
        var loc = elem.textContent;
    else
        var loc = elem.href;

    liberator.copyToClipboard(loc);
    liberator.echo("Yanked " + loc, liberator.commandline.FORCE_SINGLELINE);
}
//}}}
chh.saveHint = function (skipPrompt)//{{{
{
    if (chh.validHints.length < 1)
        return false;

    var elem = chh.validHints[chh.hintNumber - 1] || chh.validHints[0];

    try
    {
        liberator.buffer.saveLink(elem,skipPrompt);
    }
    catch (e)
    {
        liberator.echoerr(e);
    }
}
//}}}
chh.generate = function (win)//{{{
{
    var startDate = Date.now();

    if (!win)
        win = window.content;

    var doc = win.document;
    var height = win.innerHeight;
    var width  = win.innerWidth;
    var scrollX = doc.defaultView.scrollX;
    var scrollY = doc.defaultView.scrollY;

    var baseNodeAbsolute = doc.createElementNS("http://www.w3.org/1999/xhtml", "span");
    baseNodeAbsolute.style.backgroundColor = "red";
    baseNodeAbsolute.style.color = "white";
    baseNodeAbsolute.style.position = "absolute";
    baseNodeAbsolute.style.fontSize = "10px";
    baseNodeAbsolute.style.fontWeight = "bold";
    baseNodeAbsolute.style.lineHeight = "10px";
    baseNodeAbsolute.style.padding = "0px 1px 0px 0px";
    baseNodeAbsolute.style.zIndex = "10000001";
    baseNodeAbsolute.style.display = "none";
    baseNodeAbsolute.className = "vimperator-hint";

    var elem, tagname, text, span, rect;
    var res = liberator.buffer.evaluateXPath(chh.hinttags, doc, null, true);
    liberator.log("shints: evaluated XPath after: " + (Date.now() - startDate) + "ms");

    var fragment = doc.createDocumentFragment();
    var start = chh.hints.length;
    while ((elem = res.iterateNext()) != null)
    {
        // TODO: for frames, this calculation is wrong
        rect = elem.getBoundingClientRect();
        if (!rect || rect.top > height || rect.bottom < 0 || rect.left > width || rect.right < 0)
            continue;

        rect = elem.getClientRects()[0];
        if (!rect)
            continue;

        // TODO: mozilla docs recommend localName instead of tagName
        tagname = elem.tagName.toLowerCase();
        text = "";
        span = baseNodeAbsolute.cloneNode(true);
        span.style.left = (rect.left + scrollX) + "px";
        span.style.top = (rect.top + scrollY) + "px";
        fragment.appendChild(span);

        chh.hints.push([elem, text, span, null, elem.style.backgroundColor, elem.style.color]);
    }

    doc.body.appendChild(fragment);
    chh.docs.push({ doc: doc, start: start, end: chh.hints.length - 1 });

    // also generate hints for frames
    for (var i = 0; i < win.frames.length; i++)
        chh.generate(win.frames[i]);

    liberator.log("shints: generate() completed after: " + (Date.now() - startDate) + "ms");
    return true;
}
//}}}
// TODO: make it aware of imgspans
chh.showActiveHint = function (newID, oldID)//{{{
{
    var oldElem = chh.validHints[oldID - 1];
    if (oldElem)
        oldElem.style.backgroundColor = chh.bgcolor;

    var newElem = chh.validHints[newID - 1];
    if (newElem)
        newElem.style.backgroundColor = chh.selcolor;
}
//}}}
chh.showHints = function ()//{{{
{
    var startDate = Date.now();
    var win = window.content;
    var height = win.innerHeight;
    var width  = win.innerWidth;


    var elem, tagname, text, rect, span, imgspan;
    var hintnum = 1;
    //var findTokens = chh.hintString.split(/ +/);
    var activeHint = chh.hintNumber || 1;
    chh.validHints = [];

    for (var j = 0; j < chh.docs.length; j++)
    {
        var doc = chh.docs[j].doc;
        var start = chh.docs[j].start;
        var end = chh.docs[j].end;
        var scrollX = doc.defaultView.scrollX;
        var scrollY = doc.defaultView.scrollY;

outer:
        for (let i = start; i <= end; i++)
        {
            [elem, , span, imgspan] = chh.hints[i];
            text = "";

            if (elem.firstChild && elem.firstChild.tagName == "IMG")
            {
                if (!imgspan)
                {
                    rect = elem.firstChild.getBoundingClientRect();
                    if (!rect)
                        continue;

                    imgspan = doc.createElementNS("http://www.w3.org/1999/xhtml", "span");
                    imgspan.style.position = "absolute";
                    imgspan.style.opacity = 0.5;
                    imgspan.style.zIndex = "10000000";
                    imgspan.style.left = (rect.left + scrollX) + "px";
                    imgspan.style.top = (rect.top + scrollY) + "px";
                    imgspan.style.width = (rect.right - rect.left) + "px";
                    imgspan.style.height = (rect.bottom - rect.top) + "px";
                    imgspan.className = "vimperator-hint";
                    chh.hints[i][3] = imgspan;
                    doc.body.appendChild(imgspan);
                }
                imgspan.style.backgroundColor = (activeHint == hintnum) ? chh.selcolor : chh.bgcolor;
                imgspan.style.display = "inline";
            }

            if (!imgspan)
                elem.style.backgroundColor = (activeHint == hintnum) ? chh.selcolor : chh.bgcolor;
            elem.style.color = chh.fgcolor;
            if (chh.showcapitals)
                span.textContent = chh.number2hintchars(hintnum++).toUpperCase();
            else
                span.textContent = chh.number2hintchars(hintnum++);

            span.style.display = "inline";
            chh.validHints.push(elem);
        }
    }

    liberator.log("shints: showHints() completed after: " + (Date.now() - startDate) + "ms");
    return true;
}
//}}}
chh.removeHints = function (timeout)//{{{
{
    var firstElem = chh.validHints[0] || null;
    var firstElemselcolor = "";
    var firstElemColor = "";

    for (var j = 0; j < chh.docs.length; j++)
    {
        var doc = chh.docs[j].doc;
        var start = chh.docs[j].start;
        var end = chh.docs[j].end;

        for (let i = start; i <= end; i++)
        {
            // remove the span for the numeric display part
            doc.body.removeChild(chh.hints[i][2]);
            if (chh.hints[i][3]) // a transparent span for images
                doc.body.removeChild(chh.hints[i][3]);

            if (timeout && firstElem == chh.hints[i][0])
            {
                firstElemselcolor = chh.hints[i][4];
                firstElemColor = chh.hints[i][5];
            }
            else
            {
                // restore colors
                var elem = chh.hints[i][0];
                elem.style.backgroundColor = chh.hints[i][4];
                elem.style.color = chh.hints[i][5];
            }
        }

        // animate the disappearance of the first hint
        if (timeout && firstElem)
        {
            setTimeout(function () {
                    firstElem.style.backgroundColor = firstElemselcolor;
                    firstElem.style.color = firstElemColor;
                    }, timeout);
        }
    }

    liberator.log("shints: removeHints() done");
    chh.reset();
}
//}}}
chh.processHints = function (followFirst)//{{{
{
    if (chh.validHints.length == 0)
    {
        liberator.beep();
        return false;
    }

    if (!followFirst)
    {
        var firstHref = chh.validHints[0].getAttribute("href") || null;
        if (firstHref)
        {
            if (chh.validHints.some(function (e) { return e.getAttribute("href") != firstHref; }))
                return false;
        }
        else if (chh.validHints.length > 1)
            return false;
    }

    var activeNum = chh.hintNumber || 1;
    var loc = chh.validHints[activeNum - 1].href || "";
    switch (chh.submode)
    {
        case ";": chh.focusHint(); break;
        case "a": chh.saveHint(false); break;
        case "s": chh.saveHint(true); break;
        case "o": chh.openHint(liberator.CURRENT_TAB); break;
        case "O": liberator.commandline.open(":", "open " + loc, liberator.modes.EX); break;
        case "t": chh.openHint(liberator.NEW_TAB); break;
        case "T": liberator.commandline.open(":", "tabopen " + loc, liberator.modes.EX); break;
        case "w": chh.openHint(liberator.NEW_WINDOW);  break;
        case "W": liberator.commandline.open(":", "winopen " + loc, liberator.modes.EX); break;
        case "y": chh.yankHint(false); break;
        case "Y": chh.yankHint(true); break;
        default:
        liberator.echoerr("INTERNAL ERROR: unknown submode: " + chh.submode);
    }

    var timeout = followFirst ? 0 : 500;
    chh.removeHints(timeout);

    if (liberator.modes.extended & liberator.modes.ALWAYS_HINT)
    {
        setTimeout(function () {
                chh.canUpdate = true;
                chh.hintString = "";
                chh.hintNumber = 0;
                liberator.statusline.updateInputBuffer("");
                }, timeout);
    }
    else
    {
        if (timeout == 0 || liberator.modes.isReplaying)
        {
            // force a possible mode change, based on wheter an input field has focus
            liberator.events.onFocusChange();
            if (liberator.mode == liberator.modes.HINTS)
                liberator.modes.reset(false);
        }
        else
        {
            liberator.modes.add(liberator.modes.INACTIVE_HINT);
            setTimeout(function () {
                    if (liberator.mode == liberator.modes.HINTS)
                        liberator.modes.reset(false);
                    }, timeout);
        }
    }

    return true;
}
//}}}
// TODO: implement framesets
chh.show = function (mode, minor, filter)//{{{
{
    if (mode == liberator.modes.EXTENDED_HINT && !/^[;asoOtTwWyY]$/.test(minor))
    {
        liberator.beep();
        return;
    }

    liberator.modes.set(liberator.modes.HINTS, mode);
    chh.submode = minor || "o"; // open is the default mode
    chh.hintString = filter || "";
    chh.hintNumber = 0;
    chh.canUpdate = false;

    chh.generate();

    // get all keys from the input queue
    var mt = Components.classes["@mozilla.org/thread-manager;1"].getService().mainThread;
    while (mt.hasPendingEvents())
        mt.processNextEvent(true);

    chh.canUpdate = true;
    chh.showHints();

    if (chh.validHints.length == 0)
    {
        liberator.beep();
        liberator.modes.reset();
        return false;
    }
    else if (chh.validHints.length == 1)
    {
        chh.processHints(true);
        return false;
    }
    else // still hints visible
        return true;
}
//}}}
chh.hide = function ()//{{{
{
    chh.removeHints(0);
}
//}}}
chh.onEvent = function (event)//{{{
{
    var key = liberator.events.toString(event);

    if (chh.showcapitals && key.length == 1)
        key = key.toLowerCase();

    // clear any timeout which might be active after pressing a number
    if (chh.activeTimeout)
    {
        clearTimeout(chh.activeTimeout);
        chh.activeTimeout = null;
    }

    switch (key)
    {
        case "<Return>":
            chh.processHints(true);
            break;

        case "<Tab>":
        case "<S-Tab>":
            chh.usedTabKey = true;
            if (chh.hintNumber == 0)
                chh.hintNumber = 1;

            var oldID = chh.hintNumber;
            if (key == "<Tab>")
            {
                if (++chh.hintNumber > chh.validHints.length)
                    chh.hintNumber = 1;
            }
            else
            {
                if (--chh.hintNumber < 1)
                    chh.hintNumber = chh.validHints.length;
            }
            chh.showActiveHint(chh.hintNumber, oldID);
            return;

        case "<BS>": //TODO: may tweak orig hints.js too (adding 2 lines ...)
            var oldID = chh.hintNumber;
            if (chh.hintNumber > 0)
            {
                chh.hintNumber = Math.floor(chh.hintNumber / chh.hintchars.length);
                chh.hintString = chh.hintString.substr(0, chh.hintString.length - 1);
                chh.usedTabKey = false;
            }
            else
            {
                chh.usedTabKey = false;
                chh.hintNumber = 0;
                liberator.beep();
                return;
            }
            chh.showActiveHint(chh.hintNumber, oldID);
            break;

        case "<C-w>":
        case "<C-u>":
            chh.hintString = "";
            chh.hintNumber = 0;
            break;

        default:
        // pass any special or ctrl- etc. prefixed key back to the main vimperator loop
            if (/^<./.test(key) || key == ":")
            {
                //FIXME: won't work probably
                var map = null;
                if ((map = liberator.mappings.get(liberator.modes.NORMAL, key)) ||
                     (map = liberator.mappings.get(liberator.modes.HINTS, key))) //TODO
                {
                    map.execute(null, -1);
                    return;
                }

                liberator.beep();
                return;
            }

            if (chh.hintchars.indexOf(key) >= 0) // TODO: check if in hintchars
            {
                chh.hintString += key;
                var oldHintNumber = chh.hintNumber;
                if (chh.hintNumber == 0 || chh.usedTabKey)
                {
                    chh.usedTabKey = false;
                }

                chh.hintNumber = chh.hintchars2number(chh.hintString);

                chh.updateStatusline();

                if (!chh.canUpdate)
                    return;

                if (chh.docs.length == 0)
                {
                    chh.generate();
                    chh.showHints();
                }
                chh.showActiveHint(chh.hintNumber, oldHintNumber || 1);

                if (chh.hintNumber == 0 || chh.hintNumber > chh.validHints.length)
                {
                    liberator.beep();
                    return;
                }

                // orig hints.js comment: if we write a numeric part like 3, but we have 45 hints, only follow
                // the hint after a timeout, as the user might have wanted to follow link 34
                if (chh.hintNumber > 0 && chh.hintNumber * chh.hintchars.length <= chh.validHints.length)
                {
                    if (chh.timeout > 0)
                        chh.activeTimeout = setTimeout(function () { chh.processHints(true); }, chh.timeout);

                    return false;
                }
                // we have a unique hint
                chh.processHints(true);
                return;
            }

            if (chh.usedTabKey)
            {
                chh.usedTabKey = false;
                chh.showActiveHint(1, chh.hintNumber);
            }
    }

    chh.updateStatusline();
}//}}}


// <<<<<<<<<<<<<<< registering/setting up this plugin

//liberator.modes.setCustomMode ("CHAR-HINTS", liberator.plugins.charhints.onEvent,
//                                liberator.plugins.charhints.hide);
liberator.hints = chh;
liberator.mappings.addUserMap([liberator.modes.NORMAL], [chh.mapNormal],
        "Start Custum-QuickHint mode",
        function () { liberator.plugins.charhints.show(liberator.modes.QUICK_HINT); },
        { noremap: true }
);

liberator.mappings.addUserMap([liberator.modes.NORMAL], [chh.mapNormalNewTab],
        "Start Custum-QuickHint mode, but open link in a new tab",
        function () { liberator.plugins.charhints.show(liberator.modes.QUICK_HINT, "t"); },
        { noremap: true }
);

liberator.mappings.addUserMap([liberator.modes.NORMAL], [chh.mapExtended],
        "Start an extended hint mode",
        function (arg)
        {
            if (arg == "f")
                liberator.plugins.charhints.show(liberator.modes.ALWAYS_HINT, "o");
            else if (arg == "F")
                liberator.plugins.charhints.show(liberator.modes.ALWAYS_HINT, "t");
            else
                liberator.plugins.charhints.show(liberator.modes.EXTENDED_HINT, arg);
        },
        {
            flags: liberator.Mappings.flags.ARGUMENT,
            noremap: true
        }
);

// vim: set fdm=marker sw=4 ts=4 et:
