// Vimperator plugin: 'Ex Autocmd'
// Last Change: 21-Mar-2008. Jan 2008
// License: Creative Commons
// Maintainer: Trapezoid <trapezoid.g@gmail.com> - http://unsigned.g.hatena.ne.jp/Trapezoid
//
// extends autocmd for vimperator0.6.*
// Ex Events:
//      TabSelect
//      TabLeave

var recentTab = null;
function tabSelect(e){
    liberator.autocommands.trigger("TabSelect",gBrowser.selectedTab.linkedBrowser.contentWindow.location.href);
    liberator.autocommands.trigger("TabLeave",recentTab?recentTab:"");
    recentTab = gBrowser.selectedTab.linkedBrowser.contentWindow.location.href;
}
gBrowser.tabContainer.addEventListener("TabSelect",tabSelect,false);
