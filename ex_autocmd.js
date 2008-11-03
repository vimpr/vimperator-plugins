// Vimperator plugin: 'Ex Autocmd'
// Last Change: 21-Oct-2008. Jan 2008
// License: Creative Commons
// Maintainer: Trapezoid <trapezoid.g@gmail.com> - http://unsigned.g.hatena.ne.jp/Trapezoid
//
// extends autocmd for Vimperator
// Ex Events:
//      TabSelect
//      TabLeave
//      CurrentPageLoad

var recentTabURI = null;
function tabSelect(e){
    liberator.modules.autocommands.trigger("TabLeave",recentTabURI || "");
    liberator.modules.autocommands.trigger("TabSelect",gBrowser.selectedTab.linkedBrowser.contentWindow.location.href);
    recentTabURI = gBrowser.selectedTab.linkedBrowser.contentWindow.location.href;
}
gBrowser.tabContainer.addEventListener("TabSelect",tabSelect,false);


function currentPageLoad(e){
    var doc = e.originalTarget;
    if (doc instanceof HTMLDocument && doc == gBrowser.contentDocument){
        liberator.modules.autocommands.trigger("CurrentPageLoad",doc.documentURI);
        recentTabURI = doc.documentURI;
    }
}
gBrowser.addEventListener("load", currentPageLoad, true);

