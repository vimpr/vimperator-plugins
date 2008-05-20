// Vimperator plugin: 'Ex Autocmd'
// Last Change: 20-May-2008. Jan 2008
// License: Creative Commons
// Maintainer: Trapezoid <trapezoid.g@gmail.com> - http://unsigned.g.hatena.ne.jp/Trapezoid
//
// extends autocmd for vimperator0.6.*
// Ex Events:
//      TabSelect
//      TabLeave
//      CurrentPageLoad

var recentTabURI = null;
function tabSelect(e){
    liberator.autocommands.trigger("TabLeave",recentTabURI ? recentTabURI : "");
    liberator.autocommands.trigger("TabSelect",gBrowser.selectedTab.linkedBrowser.contentWindow.location.href);
    recentTabURI = gBrowser.selectedTab.linkedBrowser.contentWindow.location.href;
}
gBrowser.tabContainer.addEventListener("TabSelect",tabSelect,false);


function currentPageLoad(e){
    var doc = e.originalTarget;
    if (doc instanceof HTMLDocument &&  doc == gBrowser.contentDocument){
        liberator.autocommands.trigger("CurrentPageLoad",doc.documentURI);
        recentTabURI = doc.documentURI;
    }
}
gBrowser.addEventListener("load", currentPageLoad, true);

