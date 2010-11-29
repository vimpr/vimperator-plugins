/*** BEGIN LICENSE BLOCK {{{
  Copyright (c) 2009 hogelog<konbu.komuro@gmail.com>

  Released under the GPL license
  http://www.gnu.org/copyleft/gpl.html
}}}  END LICENSE BLOCK ***/
// PLUGIN_INFO//{{{
var PLUGIN_INFO =
<VimperatorPlugin>
    <name>{NAME}</name>
    <description>marker PageDown/PageUp.</description>
    <author mail="konbu.komuro@gmail.com" homepage="http://d.hatena.ne.jp/hogelog/">hogelog</author>
    <version>0.0.15</version>
    <license>GPL</license>
    <minVersion>2.2pre</minVersion>
    <maxVersion>2.2pre</maxVersion>
    <updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/marker_reader.js</updateURL>
<detail><![CDATA[
    
== OPTION ==
>||
let g:marker_reader_scroll_ratio = "0.7"
||<
mnext, mprev scroll 0.7 * <screen height>.

>||
let g:marker_reader_onload = 0
||<
prevent PageLoad insert markers action.

>||
javascript <<EOM
liberator.globalVariables.marker_reader_ignore = [
    /^https?:\/\/mail\.google\.com\//,
    /^http:\/\/(?:reader\.livedoor|fastladder)\.com\/(?:reader|public)\//,
];
EOM
||<
prevent PageLoad insert markers action on these pages;

>||
let g:marker_reader_mapping = "J,K"
||<
adds mapping J = mnext, K = mprev.

]]></detail>
</VimperatorPlugin>;
//}}}
plugins.marker_reader = (function() {

const HTML_NAMESPACE = "http://www.w3.org/1999/xhtml";

var libly = liberator.plugins.libly;
var $U = libly.$U;
var logger = $U.getLogger("marker");

let ignorePages = liberator.globalVariables.marker_reader_ignore ||
[/^https?:\/\/mail\.google\.com\//,
/^http:\/\/(?:reader\.livedoor|fastladder)\.com\/(?:reader|public)\//];

function near(p1, p2, e) p1-e <= p2 && p2 <= p1+e;
function focusDocument(win)
{
    let frames = win.frames;
    if (!frames) return win.document;
    for (let i=0,len=win.frames.length;i<len;++i) {
        let doc = win.frames[i].document;
        if (doc.hasFocus()) return doc;
    }
    return win.document;
}
function autoInsert(win)
{
    let uri = win.location.href;
    if (ignorePages.some(function(r) r.test(uri))) return;
    let doc = win.document;
    if (!(doc instanceof HTMLDocument)) return;
    if (doc.contentType != "text/html") return;

    reader.removeMarkers(doc);
    reader.insertMarkers(doc);

    let frames = win.frames; for (let i=0,len=frames.length;i<len;++i) autoInsert(frames[i]);
}
function onResize(event)
{
    let win = event.target;
    autoInsert(win);
}
function onLoad(event)
{
    let win = (event.target.contentDocument||event.target).defaultView;
    autoInsert(win);
}

var reader = {
    pageNaviCss:
    <style type="text/css"><![CDATA[
        .vimperator-marker_reader-marker {
            background-color: #faa;
            opacity: 0.30;
            margin: 0px;
            height: 1.5em;
            width: 100%;
            text-align: left;
            position: absolute;
            z-index = 6000;
            -moz-border-radius: 5px;
        }
        ]]></style>,
    // insertMarkers have to act synchronized function
    insertMarkers: function(doc)
    {
        // this operation have to atomic {
        if (doc.markers) return false;
        doc.markers = [];
        // }

        let win = doc.defaultView;

        if (win.scrollMaxY == 0) return false;
        if (win.innerHeight == 0) return false;
        if (!win.scrollbars.visible) return false;

        let css = $U.xmlToDom(reader.pageNaviCss, doc);
        let node = doc.importNode(css, true);
        doc.body.insertBefore(node, doc.body.firstChild);

        let scroll_ratio = parseFloat(liberator.globalVariables.marker_reader_scroll_ratio) || 0.9;
        let scroll = win.innerHeight * scroll_ratio;
        let count = Math.ceil(win.scrollMaxY / scroll);

        let div = doc.createElementNS(HTML_NAMESPACE, "div");
        div.id = "vimperator-marker_reader-markers";
        for (let pageNum=2;pageNum<=count+1;++pageNum)
        {
            let p = doc.createElementNS(HTML_NAMESPACE, "p");
            let id = "vimperator-marker_reader-" + pageNum;
            p.id = id;
            if (liberator.globalVariables.marker_reader_pagelink) {
                p.innerHTML = '<a href="#' + id + '">' + pageNum + "</a>";
            } else {
                p.setAttribute("mousethrough", "always");
                //p.innerHTML = "";
            }
            p.className = "vimperator-marker_reader-marker";

            p.style.left = "0px";
            p.style.top = Math.ceil((pageNum-1)*scroll)+"px";
            div.appendChild(p);
            doc.markers.push(p);
        }
        doc.body.appendChild(div);
        return doc.markers;
    },
    // removeMarkers have to act synchronized function
    removeMarkers: function(doc)
    {
        // this operation have to atomic {
        if (!doc.markers) return false;
        doc.markers = null;
        // }

        doc.body.removeChild(doc.getElementById("vimperator-marker_reader-markers"));
        let win = doc.defaultView;
        let frames = win.frames;
        if (frames) {
            for (let i=0,len=frames.length;i<len;++i)
                if (!reader.removeMarkers(frames[i].document)) return false;
        }
        return true;
    },
    currentPage: function(doc)
    {
        let win = doc.defaultView;
        if (win.scrollMaxY == 0) return 1.0;
        if (!win.scrollbars.visible) return 1.0;

        let markers = doc.markers;
        if(!markers) markers = reader.insertMarkers(doc);
        if(!markers && markers.length==0) return 1.0;

        let curPos = win.scrollY;

        // top of page
        if (curPos <= 0) return 1.0;

        // bottom of page
        if (curPos >= win.scrollMaxY) {
            if (markers.length > 0) {
                let lastMarker = markers[markers.length-1].offsetTop;
                if (curPos <= lastMarker) return markers.length;
            }
            return markers.length + 0.5;
        }

        // return n.5 if between n and n+1
        let page = 2.0;
        for (let i=0,len=markers.length;i<len;++i)
        {
            let pos = parseInt(markers[i].offsetTop);
            if (near(curPos, pos, 1)) return page;
            if (curPos < pos) return page - 0.5;
            ++page;
        }
        return page - 0.5;
    },
    focusNavi: function(doc, count)
    {
        function navi(win, page)
        {
            let elem = doc.getElementById("vimperator-marker_reader-" + page);
            if (elem) {
                win.scrollTo(win.scrollX, elem.offsetTop);
                return true;
            }
            return false;
        }
        let win = doc.defaultView;
        let curPage = reader.currentPage(doc);
        let page = (count < 0 ? Math.round : Math.floor)(curPage + count);
        if (page <= 1) {
            win.scrollTo(win.scrollX, 0);
            return true;
        } else if (navi(win, page)) {
            return true;
        }

        reader.removeMarkers(doc);
        reader.insertMarkers(doc);
        curPage = reader.currentPage(doc);
        page = (count < 0 ? Math.round : Math.floor)(curPage + count);
        if (navi(win, page)) return true;

        win.scrollTo(win.scrollX, win.scrollMaxY);
        return true;
    },
    setAutoInsert: function(set)
    {
        if (!set) {
            window.removeEventListener("resize", onResize, true);
            gBrowser.removeEventListener("load", onLoad, true);
        } else {
            window.addEventListener("resize", onResize, true);
            gBrowser.addEventListener("load", onLoad, true);
        }
    },
};

if (liberator.globalVariables.marker_reader_mapping) {
    let [down, up] = liberator.globalVariables.marker_reader_mapping.split(/,/);
    mappings.addUserMap([config.browserModes],
        [down], "marker PageDown",
        function (count)
        {
            reader.focusNavi(focusDocument(content), count>1 ? count : 1);
        },
        {count: true});
    mappings.addUserMap([config.browserModes],
        [up], "marker PageUp",
        function (count)
        {
            reader.focusNavi(focusDocument(content), -(count>1 ? count : 1));
        },
        {count: true});
}
commands.addUserCommand(["markersinsert", "minsert"], "insert markers",
    function ()
    {
        reader.insertMarkers(focusDocument(content));
    });
commands.addUserCommand(["markersremove", "mremove"], "remove markers",
    function ()
    {
        reader.removeMarkers(focusDocument(content));
    });
commands.addUserCommand(["markernext", "mnext"], "marker PageDown",
    function ()
    {
        reader.focusNavi(focusDocument(content), 1);
    });
commands.addUserCommand(["markerprev", "mprev"], "marker PageUp",
    function ()
    {
        reader.focusNavi(focusDocument(content), -1);
    });

if (liberator.globalVariables.marker_reader_onload) {
    reader.setAutoInsert(true);
}

return reader;
})();
// vim: fdm=marker sw=4 ts=4 et:
