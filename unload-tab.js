/*
 * タブを削除せずに、セッションを残しつつコンテンツをアンロードさせるエコなコマンド
 * unload[tab] num
 */

/* 
   Thu, 11 Jul 2013 01:55:46 +0800
   unload[tab] negative_number 
   for unload all tab without seleted tab 
   set tab title opacity when unload or restore
*/

var INFO = xml`
<plugin name="unloadTab"
        version="0.3"
        summary="Unload tab contents like (BarTab)"
        xmlns="http://vimperator.org/namespaces/liberator">
  <author email="teramako@gmail.com">teramako</author>
  <license>MPL 1.1/GPL 2.0/LGPL 2.1</license>
  <project name="Vimperator" minVersion="3.1"/>
  <item>
    <tags>:unloadtab :unload</tags>
    <spec>:unload<oa>tab</oa> <a>tabNumber</a></spec>
    <description>
      <p>Unload the tab contents.</p>
    </description>
  </item>
</plugin>`;

if (!("SS" in this)) {
  XPCOMUtils.defineLazyServiceGetter(this, "SS", "@mozilla.org/browser/sessionstore;1", "nsISessionStore");
}

function unloadTab (aTab) {
  var browser = aTab.linkedBrowser,
      state = SS.getTabState(aTab),
      shistory = browser.sessionHistory,
      icon = aTab.getAttribute("image");

  browser.addEventListener("load", function onload(){
    this.removeEventListener("load", onload, true);
    if (shistory.count > 1)
      shistory.PurgeHistory(shistory.count -1);

    aTab.ownerDocument.defaultView.setTimeout(function(){
      aTab.setAttribute("image", icon);
    }, 0);
    SS.setTabState(aTab, state);
  }, true);
  browser.loadURI("about:blank");
}

commands.addUserCommand(["unload[tab]"], "Unload Tabs",
  function action (args) {
    var str = args[0]; 
    var m = str.match(/^(-?\d+):?/); 

    if (!m)
      return;
    var tab = gBrowser.tabs[m[1]];
	if (tab && !tab.selected && !tab.linkedBrowser.__SS_restoreState)
		unloadTab(tab), tab.style.opacity = 0.5 ;

	// unload other tabs 
	if (m[1] < 0) 
	    for each(tab in Array.slice(gBrowser.tabs))
			if(tab && !tab.selected){
				if(!tab.linkedBrowser.__SS_restoreState) unloadTab(tab);
				tab.style.opacity = 0.5 ; 
			}

  }, {
    literal: 0,
    completer: function (context, args) {
      context.anchored = false;
      context.completions = [
        for (tab of Array.slice(gBrowser.tabs))
        if (!tab.selected && !tab.linkedBrowser.__SS_restoreState)
        [tab._tPos + ": " +  tab.label, tab.linkedBrowser.currentURI.spec]
      ];
    }
  }, true);
// the listener for recovering opacity
gBrowser.tabContainer.addEventListener('SSTabRestored', 
	function tabRestored(event){
		var tab = event.originalTarget ;
		tab.style.opacity = 1 ;
	}
, true);
