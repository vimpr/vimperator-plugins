var INFO =
<plugin name="TabHistory"
        version="0.1"
        summary="Go back/forward the tab selection history"
        xmlns="http://vimperator.org/namespaces/liberator">
  <author email="teramako@gmail.com">teramako</author>
  <license>MPL 1.1/GPL 2.0/LGPL 2.1</license>
  <project name="Vimperator" minVerion="3.1"/>
  <item>
    <tags>:tabhistory :tabh</tags>
    <spec>:tabh<oa>istory</oa></spec>
    <description>
      <p>Show the selection history</p>
    </description>
  </item>
  <item>
    <spec>:tabh<oa>istory</oa> back</spec>
    <description>
      <p>Go back the history</p>
    </description>
  </item>
  <item>
    <spec>:tabh<oa>istory</oa> forward</spec>
    <description>
      <p>Go forward the history</p>
    </description>
  </item>
</plugin>;

var tabHistory = (function(){
  const gBrowser = window.gBrowser,
        mTabContainer = gBrowser.mTabContainer,
        DISCONNECTED = Element.prototype.DOCUMENT_POSITION_DISCONNECTED;

  var history = [mTabContainer.selectedItem],
      index = 0,
      maxItems = -1,
      dontHandle = false;

  function isDisconnected (aTab) {
    return !!(mTabContainer.compareDocumentPosition(aTab) & DISCONNECTED);
  }

  function handler (aEvent) {
    var tab = aEvent.target;
    switch (aEvent.type) {
    case "TabSelect":
      onTabSelect(tab);
      break
    case "TabClose":
      onTabClose(tab);
    }
  }

  function onTabSelect (aTab) {
    if (dontHandle)
      dontHandle = false;
    else
      addHistory(aTab);
  }

  function onTabClose (aTab) {
    let i;
    while ((i = history.indexOf(aTab)) !== -1) {
      history.splice(i, 1);
      if (i <= index)
        --index;
    }

    for (let i = 1; i < history.length; ++i) {
      let prevTab = history[i - 1],
          currentTab = history[i];

      if (prevTab === currentTab) {
        history.splice(i--, 1);
        if (i <= index)
          --index;
      }
    }
  }

  function addHistory (aTab) {
    if (aTab === history[index])
      return;

    var i = index + 1;

    history.splice(i, history.length - i, aTab);
    if (maxItems > 0 && history.length > maxItems)
      history.splice(0, history.length - maxItems);

    index = history.length - 1;
  }

  function select (aTab) {
    if (aTab === mTabContainer.selectedItem)
      return;

    dontHandle = true;
    mTabContainer.selectedItem = aTab;
  }
  
  var TH = {
    get canGoBack() index > 0,
    get canGoForward() index < history.length - 1,
    goBack: function TH_goBack() {
      if (!this.canGoBack)
        return;

      var tab = history[--index];
      if (isDisconnected(tab)) {
        history.splice(index, 1);
        this.goBack();
      } else
        select(tab);
    },
    goForward: function TH_goForward() {
      if (!this.canGoForward)
        return;

      var tab = history[++index];
      if (isDisconnected(tab)) {
        history.splice(index, 1);
        this.goForward();
      } else
        select(tab);
    },
    clear: function TH_clear () {
      history = [mTabContainer.selectedItem];
      index = 1;
    },
    set maxItemCount (val) {
      val = Number(val);
      if (isNaN(val))
        throw TypeError("must be Number");

      if (val > 0)
        return maxItems = val;
      else
        return maxItems = -1;
    },
    get maxItemCount () {
      return maxItems;
    }
  };

  mTabContainer.addEventListener("TabSelect", handler, false);
  mTabContainer.addEventListener("TabClose", handler, false);

  commands.addUserCommand(["tabh[istory]"], "Tab Selection History",
    function tabSelectionHistoryAction (args) {
      var arg = args[0];
      switch (arg) {
      case "back":
        TH.goBack();
        break;
      case "forward":
        TH.goForward();
        break;
      default:
        let xml = template.table("TabHistory", [
          [i - index, tab.label] for ([i, tab] in Iterator(history))
        ]);
        liberator.echo(xml);
      }
    }, {
      completer: function TH_completer (context, args) {
        var list = [];
        if (TH.canGoBack)
          list.push(["back", "Back to `" + history[index - 1].label + "'"]);

        if (TH.canGoForward)
          list.push(["forward", "Forward to `" + history[index + 1].label + "'"]);

        context.title = ["TabSelectionHistory", "SubCmd"];
        context.completions = list;
      },
    }, true);


  __context__.onUnload = function onUnload () {
    mTabContainer.removeEventListener("TabSelect", handler, false);
    mTabContainer.removeEventListener("TabClose", handler, false);
  };

  return TH;
})();

