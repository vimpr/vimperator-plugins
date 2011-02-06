// PLUGIN_INFO//{{{
var PLUGIN_INFO =
<VimperatorPlugin>
  <name>{NAME}</name>
  <description>controls autopagerize</description>
  <author mail="konbu.komuro@gmail.com" homepage="http://d.hatena.ne.jp/hogelog/">hogelog</author>
  <version>0.0.1</version>
  <maxVersion>2.0pre</maxVersion>
  <updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/autopagerize_controll.js</updateURL>
  <detail><![CDATA[
== Options ==
enable mapping key like
>||
  let g:autopagerize_prevmap = "J"
  let g:autopagerize_nextmap = "K"
||<

== Commands ==
nextpage:
    paging next page
prevpage:
    paging prev page

== TODO ==

  ]]></detail>
</VimperatorPlugin>;
//}}}
(function() {

var libly = liberator.plugins.libly;
var $U = libly.$U;
var prevMap = liberator.globalVariables.autopagerize_prevmap;
var nextMap = liberator.globalVariables.autopagerize_nextmap;

var pager = {
    modes: [modes.NORMAL, modes.VISUAL],
    next: function(doc, count) {
        var curPage = pager.getCurrentPage(doc);
        liberator.reportError(curPage);
        pager.paging(doc, Math.floor(curPage+count));
    },
    prev: function(doc, count) {
        var curPage = pager.getCurrentPage(doc);
        liberator.reportError(curPage);
        pager.paging(doc, Math.round(curPage-count));
    },
    paging: function(doc, page) {
        liberator.reportError(page);
        var win = doc.defaultView;
        if (page <= 1) {
            win.scrollTo(0, 0);
        } else if (!pager.focusPageNav(doc, page)) {
            win.scrollTo(0, win.scrollMaxY);
        }
    },
    focusPageNav: function(doc, page) {
        var xpath = '//*[@class="autopagerize_page_info" and child::a[contains(text(), "'+page+'")]]';
        var [ elem ] = $U.getNodesFromXPath(xpath, doc);
        var win = doc.defaultView;
        if (elem) {
            let p = $U.getElementPosition(elem);
            win.scrollTo(0, p.top);
            return true;
        }
        return false;
    },
    getCurrentPage: function(doc) {
        var xpath = '//*[@class="autopagerize_page_info"]';
        var markers = $U.getNodesFromXPath(xpath, doc);
        var win = doc.defaultView;
        var curPos = win.scrollY;

        // top of page
        if (curPos <= 0) return 1.0;

        // bottom of page
        if (curPos >= win.scrollMaxY) return 1.0 + markers.length;

        // return n.5 if between n and n+1
        var page = 1.0;
        for (let i = 0, len = markers.length; i < len; i++) {
            let p = $U.getElementPosition(markers[i]);
            if (curPos == p.top) return page+1;
            if (curPos < p.top) return page+0.5;
            ++page;
        }
        return page+0.5;
    },
};
commands.addUserCommand(["nextpage"], "Autopagerize next page",
    function(args)
        pager.next(window.content.document, args.length>0 ? args[0] : 1));
commands.addUserCommand(["prevpage"], "Autopagerize prev page",
    function(args)
        pager.prev(window.content.document, args.length>0 ? args[0] : 1));

if (nextMap) {
    mappings.addUserMap(pager.modes, [nextMap], "Autopagerize next page",
            function(count)
                pager.next(window.content.document, count>0 ? count : 1),
            {flags: Mappings.flags.COUNT});
}
if (prevMap) {
    mappings.addUserMap(pager.modes, [prevMap], "Autopagerize prev page",
            function(count)
                pager.prev(window.content.document, count>0 ? count : 1),
            {flags: Mappings.flags.COUNT});
}

})();
// vim: set fdm=marker sw=4 ts=4 et:
