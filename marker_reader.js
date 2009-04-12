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
    <version>0.0.1</version>
    <license>GPL</license>
    <minVersion>2.1pre</minVersion>
    <maxVersion>2.1pre</maxVersion>
    <updateURL>http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/marker_reader.js</updateURL>
<detail><![CDATA[
== TODO ==
enable setting:
]]></detail>
</VimperatorPlugin>;
//}}}
(function() {

    const HTML_NAMESPACE = "http://www.w3.org/1999/xhtml";

    let libly = liberator.plugins.libly;
    let $U = libly.$U;

    let pageNaviCss =
        <style type="text/css"><![CDATA[
          .vimperator-marker_reader-marker {
            background-color: #faa;
            opacity: 0.30;
            margin: 0px;
            /*padding: 10px;*/
            height: 1.5em;
            width: 100%;
            font-weight: bold;
            text-align: left;
            position: absolute;
            -moz-border-radius: 5px;
          }
          ]]></style>;

    function insertMarkers(doc)
    {
        let win = doc.defaultView;
        doc.naviMarker = true;

        let css = $U.xmlToDom(pageNaviCss, doc);
        let node = doc.importNode(css, true);
        doc.body.insertBefore(node, doc.body.firstChild);

        let scroll_ratio = parseFloat(liberator.globalVariables.marker_reader_scroll_ratio) || 0.7;
        let scroll = win.innerHeight * scroll_ratio;
        let count = Math.ceil(win.scrollMaxY / scroll);

        for (let pageNum=1;pageNum<=count+1;++pageNum)
        {
            let p = doc.createElementNS(HTML_NAMESPACE, "p");
            let id = "vimperator-marker_reader-" + pageNum;
            p.id = id;
            p.innerHTML = '<a href="#' + id + '">' + pageNum + "</a>";
            p.className = "vimperator-marker_reader-marker";

            p.style.left = 0;
            p.style.top = (pageNum-1)*scroll;
            p.style.zIndex = 1000;
            doc.body.appendChild(p);
        }
    }
    function removeMarkers(doc)
    {
        let xpath = '//*[@class="vimperator-marker_reader-marker"]';
        let markers = $U.getNodesFromXPath(xpath, doc);
        for (let i=0,len=markers.length;i<len;++i)
        {
            doc.body.removeChild(markers[i]);
        }
    }
    function currentPage(doc)
    {
        let xpath = '//*[@class="vimperator-marker_reader-marker"]';
        let markers = $U.getNodesFromXPath(xpath, doc);
        let win = doc.defaultView;

        var curPos = win.scrollY;

        // top of page
        if (curPos <= 0) return 1.0;

        // bottom of page
        if (curPos >= win.scrollMaxY) {
            if (markers.length > 0) {
                let lastMarker = Math.round(parseFloat(markers[markers.length-1].style.top));
                if (curPos <= lastMarker) return markers.length;
            }
            return markers.length + 0.5;
        }

        // return n.5 if between n and n+1
        var page = 1.0;
        for (let i=0,len=markers.length;i<len;++i)
        {
            let pos = Math.round(parseFloat(markers[i].style.top));
            if (curPos == pos) return page;
            if (curPos < pos) return page - 0.5;
            ++page;
        }
        return page - 0.5;
    }
    function focusNavi(doc, count)
    {
        if (!doc.naviMarker) {
            insertMarkers(doc);
        }

        let win = doc.defaultView;
        let curPage = currentPage(doc);
        let page = (count < 0 ? Math.round : Math.floor)(curPage + count);
        if (page <= 1) {
            win.scrollTo(0, 0);
            return true;
        }
        let id_xpath = '//*[@id="vimperator-marker_reader-' + page + '"]';
        let [elem] = $U.getNodesFromXPath(id_xpath, doc);
        if (elem) {
            let p = $U.getElementPosition(elem);
            win.scrollTo(0, p.top);
            return true;
        }

        // reload markers
        removeMarkers(doc);
        insertMarkers(doc);
        [elem] = $U.getNodesFromXPath(id_xpath, doc);
        if (elem) {
            let p = $U.getElementPosition(elem);
            win.scrollTo(0, p.top);
            return true;
        }

        win.scrollTo(0, win.scrollMaxY);
        return true;
    }
    commands.addUserCommand(["markernext", "mnext"], "marker PageDown",
        function ()
        {
            focusNavi(content.document, 1);
        });
    commands.addUserCommand(["markerprev", "mprev"], "marker PageUp",
        function ()
        {
            focusNavi(content.document, -1);
        });


})();
// vim: fdm=marker sw=4 ts=4 et:
