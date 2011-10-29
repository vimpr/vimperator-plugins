/*
 * タブを削除せずに、セッションを残しつつコンテンツをアンロードさせるエコなコマンド
 * unload[tab] num
 */

var INFO =
<plugin name="unloadTab"
        version="0.2"
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
</plugin>;

if (!("SS" in this)) {
  XPCOMUtils.defineLazyServiceGetter(this, "SS", "@mozilla.org/browser/sessionstore;1", "nsISessionStore");
}

function unloadTab (aTab) {
  var state = SS.getTabState(aTab);
  var tab = gBrowser.addTab(null, { skipAnimation: true });
  SS.setTabState(tab, state);
  if (aTab.pinned) {
    gBrowser.pinTab(tab);
  } else {
    let objState = JSON.parse(state);
    if (objState.hidden) {
      gBrowser.hideTab(tab);
      TabView.moveTabTo(tab, JSON.parse(objState.extData["tabview-tab"]).groupID);
    }
  }
  gBrowser.moveTabTo(tab, aTab._tPos + 1)
  gBrowser.removeTab(aTab);
}

commands.addUserCommand(["unload[tab]"], "Unload Tabs",
  function action (args) {
    var str = args[0];
    var m = str.match(/^(\d+):?/);
    if (!m)
      return;

    var tab = gBrowser.tabs[m[1]];
    if (tab && !tab.selected && !tab.linkedBrowser.__SS_restoreState)
      unloadTab(tab);
  }, {
    literal: 0,
    completer: function (context, args) {
      context.anchored = false;
      context.completions = [
        [tab._tPos + ": " +  tab.label, tab.linkedBrowser.currentURI.spec]
        for each(tab in Array.slice(gBrowser.tabs))
        if (!tab.selected && !tab.linkedBrowser.__SS_restoreState)
      ];
    }
  }, true);


