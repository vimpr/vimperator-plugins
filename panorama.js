/**
 * Use at your OWN RISK.
 */
let INFO = <>
<plugin name="panorama" version="0.6.6"
        href="https://github.com/vimpr/vimperator-plugins/blob/master/panorama.js"
        summary="Add supports for Panorama"
        lang="en-US"
        xmlns="http://vimperator.org/namespaces/liberator">
  <author email="teramako@gmail.com">teramako</author>
  <license>MPL 1.1/GPL 2.0/LGPL 2.1</license>
  <project name="Vimperator" minVersion="3.0pre"/>
  <p>
    For adding Panorama supports.
    This plugin makes the default feature to not switch to the other group suddenly.
    And add some mappings and commands for Parnorama.
  </p>
  <p>
    Use at your OWN RISK.
    This pluin overwrite many mappings, some commands, and some completions.
  </p>
  <h3 tag="panorama-new">New Mappings and Commands</h3>
  <item>
    <tags>g@</tags>
    <spec><oa>count</oa>g@</spec>
    <description>
      <p>Switch to AppTab.</p>
      <p>If the current tab is already AppTab, switch to the next AppTab.</p>
    </description>
  </item>
  <item>
    <tags><![CDATA[<C-S-n>]]></tags>
    <spec><oa>count</oa>&lt;C-S-n></spec>
    <description>
      <p>Switch to next group.</p>
      <p>Caution: cannot switch to empty group.</p>
    </description>
  </item>
  <item>
    <tags><![CDATA[<C-S-p>]]></tags>
    <spec><oa>count</oa>&lt;C-S-p></spec>
    <description>
      <p>Switch to previous group.</p>
    </description>
  </item>
  <h3 tag="panorama-command">Main Command</h3>
  <item>
    <tags>:panorama :tabview :tabcandy</tags>
    <spec>:panorama <a>SubCommand</a></spec>
    <spec>:tabview <a>SubCommand</a></spec>
    <spec>:tabcandy <a>SubCommand</a></spec>
    <description>
      <p>See the following SubCommands.</p>
    </description>
  </item>
  <h3 tag="panorama-sub-command">SubCommands</h3>
  <item>
    <tags>mkgroup mkg</tags>
    <spec>mkg<oa>roup</oa><oa>!</oa> <oa>GroupName</oa></spec>
    <description>
      <p>Create new tab group named <a>GroupName</a>. And then, switch to the group.</p>
      <p>If specified <a>!</a>, move the current tab to the group.</p>
    </description>
  </item>
  <item>
    <tags>stashtogroup stash</tags>
    <spec>stash<oa>togroup</oa><oa>!</oa> <a>GroupName</a></spec>
    <description>
      <p>Stash the current tab to <a>GroupName</a>.</p>
      <p>Caution: connnot stash AppTab (pinned tab)</p>
    </description>
  </item>
  <item>
    <tags>switchgroup swg g</tags>
    <spec>switchgroup  <a>GroupName</a></spec>
    <spec>swg <a>GroupName</a></spec>
    <spec>g <a>GroupName</a></spec>
    <spec><oa>count</oa>switchgroup</spec>
    <spec><oa>count</oa>swg</spec>
    <spec><oa>count</oa>g</spec>
    <description>
      <p>Switch group to <a>GroupName</a></p>
    </description>
  </item>
  <item>
    <tags>rmgroup rmg</tags>
    <spec>rmg<oa>group</oa><oa>!</oa> <oa>GroupName</oa></spec>
    <description>
      <p>remove group. The current group is used if ommited <oa>GroupName</oa></p>
    </description>
  </item>
  <item>
    <tags>pulltab pull</tags>
    <spec>pull<oa>tab</oa> <oa>buffer</oa></spec>
    <description>
      <p>pull a tab from the other group</p>
    </description>
  </item>
  <item>
    <tags>pintab pin</tags>
    <spec>pin<oa>tab</oa></spec>
    <description>
      <p>pin the current tab, if already pinned, unpin.</p>
    </description>
  </item>
  <item>
    <tags>title</tags>
    <spec>t<oa>itle</oa> <a>title</a> <oa>GroupName</oa></spec>
    <description>
      <p>update <a>GroupName</a>'s title to <a>title</a>.</p>
      <p>if omitted <a>GroupName</a>, update the current group.</p>
    </description>
  </item>
</plugin>
</>;

/**
 * @method selectVisible {{{
 * 現在表示されているタブでの絶対/相対位置によるタブ選択を行う
 * （tabs.select() だと全タブが対象となる）
 * @param {String} spec
 * @param {Boolean} wrap
 */
function selectVisible (spec, wrap) {
  if (spec === void(0) || spec === "")
    return;

  let tabs = gBrowser.visibleTabs;
  let index;
  if (typeof spec === "number" || /^\d+$/.test(spec)) {
    index = parseInt(spec, 10);
  } else if (spec === "$") {
    index = tabs.length - 1;
  } else if (/^[+-]\d+$/.test(spec)) {
    index = tabs.indexOf(gBrowser.mCurrentTab) + parseInt(spec, 10);
  } else {
    return;
  }
  let length = tabs.length;
  if (index > length - 1)
    index = wrap ? index % length : length - 1;
  else if (index < 0)
    index = wrap ? index % length + length : 0;

  gBrowser.mTabContainer.selectedItem = tabs[index];
} // }}}

/**
 * @method switchTo {{{
 * tabs.switchTo 相当の関数
 * @param {String} buffer
 * @param {Boolean} allowNonUnique
 * @param {Number} count
 * @param {Boolean} reverse
 */
function switchTo (buffer, allowNonUnique, count, reverse) {
  if (buffer == "")
    return null;
  if (buffer != null) {
    tabs._lastBufferSwitchArgs = buffer;
    tabs._lastBufferSwitchSpecial = allowNonUnique;
  } else {
    buffer = this._lastBufferSwitchArgs;
    if (allowNonUnique === void(0) || allowNonUnique === null)
      allowNonUnique = tabs._lastBufferSwitchSpecial;
  }

  if (buffer == "#") {
    tabs.selectAlternateTab();
    return;
  }

  let tab = searchTab(buffer);
  if (tab) {
    tabs.select(tab._tPos, false);
    return;
  }

  if (!count || count < 1)
    count = 1;
  reverse = !!reverse;

  let m = [];
  let lowerBuffer = buffer.toLowerCase();
  let first = tabs.index() + (reverse ? 0 : 1);
  let length = config.tabbrowser.browsers.length;
  for (let [i, ] in tabs.browsers) {
    let index = (i + first) % length;
    let browser = config.tabbrowser.browsers[index];
    let url, title;
    if ("__SS_restoreState" in browser) {
      let entry = browser.__SS_data.entries.slice(-1)[0];
      url = entry.url;
      title = entry.title || url;
    } else {
      url = browser.contentDocument.location.href;
      title = browser.contentDocument.title;
    }
    title = title.toLowerCase();
    if (url == buffer) {
      tabs.select(index, false);
      return;
    }
    if (url.indexOf(buffer) >= 0 || title.indexOf(lowerBuffer) >= 0)
      m.push(index);
  }
  if (m.length == 0)
    liberator.echoerr("E94: No matching buffer for " + buffer);
  else if (m.length > 1 && !allowNonUnique)
    liberator.echoerr("E93: More than one match for " + buffer);
  else {
    if (reverse) {
      index = m.length - count;
      while (index < 0)
        index + m.length;
    } else {
      index = (count - 1) % m.length;
    }
    tabs.select(m[index], false);
  }
} // }}}


/**
 * @method searchTab {{{
 * @param {String} buffer
 *   - "{Number}:"
 *   - "{GroupName} {Number}:"
 * @return {Element|null}
 */
function searchTab (buffer) {
  if (buffer == "#") {
    if (tabs.alternate != null && tabs.getTab() != tabs.alternate)
      return tabs.alternate;
    return null;
  }
  let m = buffer.match(/^(\d+):?/);
  if (m)
    return tabs.getTab(parseInt(m[1], 10) -1);
  m = buffer.match(/^(.+?)\s+(\d+):?/);
  if (m) {
    let [, groupName, tabNum] = m;
    tabNum = parseInt(tabNum, 10);
    let group = getGroupByName(groupName)[0];
    if (!group)
      return null;
    let tabItem = group.getChild(tabNum -1);
    if (!tabItem)
      return null;
    return tabItem.tab;
  }
  return null;
} // }}}

let TV = window.TabView;
/**
 * @type {Window} TabView._window {{{
 */
this.__defineGetter__("tabView", function() {
  if (TV && TV._window && TV._window.GroupItems) {
    delete this.tabView;
    this.tabView = TV._window;
    return TV._window;
  } else {
    let wating = true;
    TV._initFrame(function(){ wating = false; })
    while (wating)
      liberator.threadYield(false, true);
    return this.tabView;
  }
}); // }}}

/**
 * @type {Array} Array of AppTabs
 */
this.__defineGetter__("appTabs", function() gBrowser.visibleTabs.filter(function(t) t.pinned));

/**
 * @method createGroup {{{
 * @param {String} name GroupName
 * @return {GroupItem}
 */
function createGroup (name) {
  let pageBounds = tabView.Items.getPageBounds();
  pageBounds.inset(20, 20);
  let box = new tabView.Rect(pageBounds);
  box.width = 50;
  box.height = 50;
  let group = new tabView.GroupItem([], { bounds: box, title: name });
  if (name && group.$title.hasClass("defaultName"))
    group.$title.removeClass("defaultName");
  return group;
} // }}}

/**
 * @param {String|Number} name GroupName or GroupId
 * @return {GroupItem[]}
 */
function getGroupByName (name) {
  if (typeof name === "number")
    return tabView.GroupItems.groupItems.filter(function(g) g.id == name);
  return tabView.GroupItems.groupItems.filter(function(g) g.getTitle() == name);
}
/**
 * @param {Element} tab
 * @param {GroupItem|Number} group GroupItem object or group id
 */
function tabMoveToGroup (tab, group) {
  let id = (typeof group == "object") ? group.id : group;
  tabView.GroupItems.moveTabToGroupItem(tab, id);
}

/**
 * @method switchToGroup {{{
 * @param {String|Number} spec
 * @param {Boolean} wrap
 */
function switchToGroup (spec, wrap) {
  const GI = tabView.GroupItems
  let current = GI.getActiveGroupItem() || GI.getActiveOrphanTab();
  let groupsAndOrphans = GI.groupItems.concat(GI.getOrphanedTabs());
  let offset = 1, relative = false, index;
  if (typeof spec === "number")
    index = parseInt(spec, 10);
  else if (/^[+-]\d+$/.test(spec)) {
    let buf = parseInt(spec, 10);
    index = groupsAndOrphans.indexOf(current) + buf;
    offset = buf >= 0 ? 1 : -1;
    relative = true;
  } else if (spec != "") {
    if (/^\d+$/.test(spec))
      spec = parseInt(spec, 10);
    let targetGroup = getGroupByName(spec)[0];
    if (targetGroup)
      index = groupsAndOrphans.indexOf(targetGroup);
    else {
      liberator.echoerr("No such group: " + spec);
      return;
    }
  } else {
    return;
  }
  let length = groupsAndOrphans.length;
  let apps = appTabs;
  function groupSwitch (index, wrap) {
    if (index > length - 1)
      index = wrap ? index % length : length - 1;
    else if (index < 0)
      index = wrap ? index % length + length : 0;

    let target = groupsAndOrphans[index],
        group = null;
    if (target instanceof tabView.GroupItem) {
      group = target;
      target = target.getActiveTab() || target.getChild(0);
    }

    if (target) {
      gBrowser.mTabContainer.selectedItem = target.tab;
    } else if (group && apps.length != 0) {
      GI.setActiveGroupItem(group);
      tabView.UI.goToTab(tabs.getTab(0));
    } else if (relative) {
      groupSwitch(index + offset, true);
    } else {
      liberator.echoerr("Cannot switch to " + spec);
      return;
    }
  }
  groupSwitch(index, wrap);
} // }}}

/**
 * removeTab {{{
 * @param {Element} tab
 * @param {Number}  count
 * @param {Boolean} focusLeftTab
 * @param {Number} quitOnLastTab
 * @see tabs.remove
 */
function removeTab (tab, count, focusLeftTab, quitOnLastTab) {
  const gb = gBrowser;
  function remove (tab) {
    if (vTabs.length > 1) {
      gb.removeTab(tab);
    } else if (buffer.URL != "about:blank" || gb.webNavigation.sessionHistory.count > 0) {
      gb.loadURI("about:blank");
    } else {
      liberator.beep();
    }
  }
  let vTabs = gb.visibleTabs;

  if (typeof count != "number" || count < 1)
    count = 1;

  if (quitOnLastTab >= 1 && gb.tabs.length <= count) {
    if (liberator.windows.length > 1)
      window.close();
    else
      liberator.quit(quitOnLastTab == 2);

    return;
  }

  // delegate selecting a tab to Firefox after the tab removed
  if (count === 1 && !focusLeftTab && tab.owner) {
    remove(tab);
    return;
  }

  let index = vTabs.indexOf(tab);
  liberator.assert(index >= 0, "No such tab(s) in the current tabs");

  let start, end, selIndex;
  if (focusLeftTab) {
    end = index;
    start = Math.max(0, index - count + 1);
    selIndex = Math.max(0, start - 1);
  } else {
    start = index;
    end = Math.min(index + count, vTabs.length) - 1;
    selIndex = end + 1;
    if (selIndex >= vTabs.length)
      selIndex = start > 0 ? start - 1 : 0;
  }
  gb.mTabContainer.selectedItem = vTabs[selIndex];
  for (let i = end; i >= start; i--) {
    remove(vTabs[i]);
  }
} // }}}

/**
 * setGroupTitile {{{
 * @param {String} title
 * @param {GroupItem} group
 */
function setGroupTitle (title, group) {
  let activeGroup = tabView.GroupItems.getActiveGroupItem();
  if (!group)
    group = activeGroup;
  liberator.assert(group, "Missing group");
  group.setTitle(title);
  if (title && group.$title.hasClass("defaultName"))
    group.$title.removeClass("defaultName");
  if (group === activeGroup)
    gBrowser.updateTitlebar();
} // }}}

// ============================================================================
// Mappings {{{
// ============================================================================

/**
 * {count}g@ select {count} of AppTab
 * g@ select AppTab,
 * if already selected, select the next AppTab
 */
mappings.add([modes.NORMAL], ["g@"],
  "Go to AppTab",
  function (count) {
    let apps = appTabs;
    let i = 0;
    if (count != null)
      i = count - 1;
    else {
      let currentTab = tabs.getTab();
      if (currentTab.pinned)
        i = apps.indexOf(currentTab) + 1;
      i %= apps.length;
    }
    if (apps[i])
      selectVisible(i);
  }, { count: true });

/**
 * Switch to next group
 */
mappings.add([modes.NORMAL], ["<C-S-n>"],
  "switch to next group",
  function (count) { switchToGroup("+" + (count || 1), true); },
  { count: true });

/**
 * Switch to previous group
 */
mappings.add([modes.NORMAL], ["<C-S-p>"],
  "switch to previous group",
  function (count) { switchToGroup("-" + (count || 1), true); },
  { count: true });

// overwrite 'd'
mappings.getDefault(modes.NORMAL, "d").action = function(count) {
  removeTab(tabs.getTab(), count, false, 0);
};
// overwrite 'D'
mappings.getDefault(modes.NORMAL, "D").action = function(count) {
  removeTab(tabs.getTab(), count, true, 0);
};
// overwrite 'g0", 'g^'
mappings.getDefault(modes.NORMAL, "g0").action = function (count) { selectVisible(0); };
// overwrite 'g$'
mappings.getDefault(modes.NORMAL, "g$").action = function (count) { selectVisible("$"); };
// overwrite 'gt'
mappings.getDefault(modes.NORMAL, "gt").action = function (count) {
  if (count != null)
    selectVisible(count - 1, false);
  else
    selectVisible("+1", true);
};
// overwrite 'C-n', 'C-Tab', 'C-PageDown'
mappings.getDefault(modes.NORMAL, "<C-n>").action = function (count) {
  selectVisible("+" + (count || 1), true);
};
// overwrite 'gT'
mappings.getDefault(modes.NORMAL, "gT").action = function (count) {
  selectVisible("-" + (count || 1), true);
}
// overwrite 'b'
mappings.getDefault(modes.NORMAL, "b").action = function (count) {
  if (count != null)
    selectVisible(count - 1);
  else
    commandline.open("", "buffer! ", modes.EX);
}

// }}}

// ============================================================================
// Command {{{
// ============================================================================
/**
 * overwrite :ls :buffers
 */
let (cmd = commands.get("buffers")) {
  cmd.action = function (args) {
    completion.listCompleter("buffer", args.literalArg, null,
      args.bang ? completion.buffer.ALL : completion.buffer.VISIBLE);
  };
  cmd.bang = true;
}

/**
 * overwrite :buffer
 */
let (cmd = commands.get("buffer")) {
  cmd.action = function (args) {
    let arg = args.literalArg;
    if (arg && args.count > 0)
      switchTo(arg, args.bang);
    else if (args.count > 0)
      switchTo(args.count.toString(), args.bang);
    else
      switchTo(arg, args.bang);
  };
  cmd.completer = function (context) completion.buffer(context, completion.buffer.ALL);
}

let subCmds = [
  /**
   * SubCommand help {{{
   */
  new Command(["help"], "Show Help",
    function (args) {
      let list = template.genericOutput("Panorama Help",
        <dl>{ template.map(subCmds, function(cmd) <><dt>{cmd.names.join(", ")}</dt><dd>{cmd.description}</dd></>) }</dl>
      );
      commandline.echo(list, commandline.HL_NORMAL);
    }, {}, true) // }}}
  ,
  /**
   * SubCommad mkgroup {{{
   * make a group and switch to the group
   * if bang(!) exists, take up the current tab to the group
   */
  new Command(["mkg[roup]"], "create Group",
    function (args) {
      let groupName = args.literalArg;
      let group = createGroup(groupName);
      let currentTab = tabs.getTab();
      if (args.bang) {
        if (!currentTab.pinned)
          TV.moveTabTo(currentTab, group.id);
      }
      let apps = appTabs,
          child = group.getChild(0);
      if (child) {
        tabView.GroupItems.setActiveGroupItem(group);
        tabView.UI.goToTab(child.tab);
      } else if (apps.length == 0) {
        group.newTab();
      } else {
        tabView.GroupItems.setActiveGroupItem(group);
        tabView.UI.goToTab(currentTab.pinned ? currentTab : apps[apps.length - 1]);
      }
    }, {
      bang: true,
      literal: 0,
    }, true) /// }}}
  ,
  /**
   * SubCommand switchgroup {{{
   * swtich to the {group}
   * if {count} exists, switch to relative {count}
   */
  new Command(["switchgroup", "swg", "g"], "Switch Group",
    function (args) {
      if (args.count > 0) {
        switchToGroup("+" + args.count, true);
      } else {
        switchToGroup(args.literalArg);
      }
    }, {
      count: true,
      literal: 0,
      completer: function (context) completion.tabgroup(context, true),
    }, true) // }}}
  ,
  /**
   * SubCommand stashgroup {{{
   * stash the current tab to other {group}
   * if bang(!) exists and {group} doesn't exists,
   *  create {group} and stash
   */
  new Command(["stash[togroup]"], "Stash the current tab to other group",
    function (args) {
      let currentTab = tabs.getTab();
      if (currentTab.pinned) {
        liberator.echoerr("Connot stash an AppTab");
        return;
      }
      let groupName = args.literalArg;
      let group = getGroupByName(groupName)[0];
      if (!group) {
        if (args.bang) {
          group = createGroup(groupName);
        } else {
          liberator.echoerr("No such group: " + groupName.quote() + ". if want create, add \"!\"");
          return;
        }
      }
      TV.moveTabTo(currentTab, group.id);
    } ,{
      bang: true,
      literal: 0,
      completer: function (context) completion.tabgroup(context, true),
    }, true) // }}}
  ,
  /**
   * SubCommand rmgroup {{{
   * remove {group}
   * if {group} is ommited, remove the current group
   */
  new Command(["rmg[roup]"], "close all tabs in the group",
    function (args) {
      let groupName = args.literalArg;
      const GI = tabView.GroupItems;
      let activeGroup = GI.getActiveGroupItem();
      let group = groupName ? getGroupByName(groupName)[0] : activeGroup;
      liberator.assert(group, "No such group: " + groupName);

      if (group === activeGroup) {
        if (gBrowser.visibleTabs.length < gBrowser.tabs.length) {
          switchToGroup("+1", true);
        } else {
          let apps = appTabs;
          let gb = gBrowser;
          let vtabs = gb.visibleTabs;
          if (apps.length == 0) {
            // 最後尾にabout:blankなタブをフォアグランドに開く
            gb.loadOneTab("about:blank", { inBackground: false, relatedToCurrent: false });
          } else {
            // AppTabがあればそれをとりあえず選択しておく
            gb.mTabContainer.selectedIndex = apps.length -1;
          }
          for (let i = vtabs.length -1, tab; (tab = vtabs[i]) && !tab.pinned; i--) {
            gb.removeTab(tab);
          }
          return;
        }
      }
      group.closeAll();
    }, {
      literal: 0,
      completer: function (context) completion.tabgroup(context, false),
    }, true) // }}}
  ,
  /**
   * SubCommand pulltab {{{
   * pull a tab from the other group
   */
  new Command(["pull[tab]"], "pull a tab from the other group",
    function (args) {
      const GI = tabView.GroupItems;
      let activeGroup = GI.getActiveGroupItem();
      liberator.assert(activeGroup, "Cannot move to the current");
      let arg = args.literalArg;
      if (!arg)
        return;
      let tab = searchTab(arg);
      liberator.assert(tab, "No such tab: " + arg);
      TV.moveTabTo(tab, activeGroup.id);
      gBrowser.mTabContainer.selectedItem = tab;
    }, {
      literal: 0,
      completer: function (context) completion.buffer(context, completion.buffer.GROUPS | completion.buffer.ORPHANS),
    }, true) // }}}
  ,
  /**
   * SubCommand pinTab {{{
   */
  new Command(["pin[tab]"], "toggle AppTab the current tab",
    function (args) {
      let currentTab = tabs.getTab();
      if (currentTab.pinned)
        gBrowser.unpinTab(currentTab);
      else
        gBrowser.pinTab(currentTab);
    }, {
    }, true) // }}}
  ,
  /**
   * SubCommand title {{{
   */
  new Command(["t[itle]"], "set group title",
    function (args) {
      let title = args[0],
          groupName = args.literalArg;
      let group = getGroupByName(groupName)[0];
      setGroupTitle(title, group);
    }, {
      literal: 1,
      completer: function (context, args) {
        if (args.length > 1) {
          completion.tabgroup(context, false);
        }
      },
    }, true) // }}}
];

/**
 * MainCommand panorama {{{
 */
commands.addUserCommand(["panorama"], "Parnorama",
  function (args) {
    // show help, call SubCommand help
    if (args.length < 1 || args["-help"]) {
      subCmds[0].execute("");
      return;
    }
    // delegate subcommand
    let [count, subCmdName, bang, subArgs] = commands.parseCommand(args.literalArg);
    let cmd = subCmds.filter(function(c) c.hasName(subCmdName))[0];
    liberator.assert(cmd, "No such sub-command: " + subCmdName);
    cmd.execute(subArgs, bang, count, {});
  }, {
    bang: true,
    literal: 0,
    options: [
      [["-help", "-h"], commands.OPTION_NOARG],
    ],
    completer: function (context) {
      let [count, subCmdName, bang, args] = commands.parseCommand(context.filter);
      let [, prefix, junk] = context.filter.match(/^(:*\d*)\w*(.?)/) || [];
      context.advance(prefix.length);
      if (!junk) {
        context.title = ["Panorama SubCommands"];
        context.keys = { text: "longNames", description: "description" };
        context.completions = [k for ([, k] in Iterator(subCmds))];
        return;
      }

      let cmd = subCmds.filter(function(c) c.hasName(subCmdName))[0];
      if (!cmd) {
        context.highlight(0, subCmdName.length, "SPELLCHECK");
        return;
      }
      [prefix] = context.filter.match(/^(?:\w*[\s!]|!)\s*/);
      let cmdContext = context.fork(subCmdName, prefix.length);
      let argContext = context.fork("args", prefix.length);
      args = cmd.parseArgs(cmdContext.filter, argContext, { count: count, bang: bang });
      if (args) {
        args.count = count;
        args.bang = bang;
        if (!args.completeOpt && cmd.completer) {
          cmdContext.advance(args.completeStart);
          cmdContext.quote = args.quote;
          cmdContext.filter = args.completeFilter;
          cmd.completer.call(cmd, cmdContext, args);
        }
      }
    },
  }, true);
// }}}

// }}}

// ============================================================================
// Completion {{{
// ============================================================================
completion.tabgroup = function TabGroupCompleter (context, excludeActiveGroup) {
  const GI = tabView.GroupItems;
  let groupItems = GI.groupItems;
  if (excludeActiveGroup) {
    let activeGroup = GI.getActiveGroupItem();
    groupItems = groupItems.filter(function(group) group.id != activeGroup.id);
  }
  context.title = ["TabGroup"];
  context.completions = groupItems.map(function(group) {
    let title = group.getTitle();
    let desc = [
      "Title:", title || "(Untitled)",
      "TabNum:", group.getChildren().length,
    ].join(" ");
    if (!title)
      title = group.id;
    return [title, desc];
  });
};

/**
 * overwite completion.buffer
 */
(function(TV, gBrowser) {
  const UNTITLE_LABEL = "(Untitled)";

  function getIndicator (tab) {
    if (tab == gBrowser.mCurrentTab)
      return "%";
    else if (tab == tabs.alternate)
      return "#";
    return " ";
  }
  function getURLFromTab (tab)
    ("__SS_restoreState" in tab.linkedBrowser && "__SS_data" in tab.linkedBrowser) ?
      tab.linkedBrowser.__SS_data.entries.slice(-1)[0].url :
      tab.linkedBrowser.contentDocument.location.href;

  function createItem (prefix, label, url, indicator, icon)
    ({ text: [prefix + label, prefix + url], url: template.highlightURL(url), indicator: indicator, icon: icon || DEFAULT_FAVICON })

  function generateVisibleTabs () {
    for (let [i, tab] in Iterator(gBrowser.visibleTabs)) {
      let indicator = getIndicator(tab) + (tab.pinned ? "@" : " "),
          label = tab.label || UNTITLE_LABEL,
          url = getURLFromTab(tab),
          index = (tab._tPos + 1) + ": ";
      let item = createItem(index, label, url, indicator, tab.image);
      if (!tab.pinned && tab._tabViewTabItem && tab._tabViewTabItem.parent) {
        let groupName = tab._tabViewTabItem.parent.getTitle();
        if (groupName) {
          let prefix = groupName + " " + (i + 1) + ": ";
          item.text.push(prefix + label);
          item.text.push(prefix + url);
        }
      }
      yield item;
    }
  }
  function generateGroupList (group, groupName) {
    let hasName = !!groupName;
    for (let [i, tabItem] in Iterator(group.getChildren())) {
      let index = (tabItem.tab._tPos + 1) + ": ",
          label = tabItem.tab.label || UNTITLE_LABEL,
          url = getURLFromTab(tabItem.tab);
      let item = createItem(index, label, url, getIndicator(tabItem.tab), tabItem.tab.image);
      if (hasName) {
        let gIndex = groupName + " " + (i + 1) + ": ";
        item.text.push(gIndex + label, gIndex + url);
      }
      yield item;
    }
  }
  function generateOrphanedList (tabItems) {
    for (let [i, tabItem] in Iterator(tabItems)) {
      let indicator = getIndicator(tabItem.tab),
          index = (tabItem.tab._tPos + 1) + ": ",
          label = tabItem.tab.label || UNTITLE_LABEL,
          url = getURLFromTab(tabItem.tab);
      yield createItem(index, label, url, getIndicator(tabItem.tab), tabItem.tab.image);
    }
  }

  completion.buffer = function bufferCompletion (context, flag) {
    if (!flag)
      flag = this.buffer.VISIBLE;

    context.anchored = false;
    context.keys = { text: "text", description: "url", icon: "icon" };
    context.compare = CompletionContext.Sort.number;
    let process = context.process[0];
    context.process = [
      function (item, text) <>
        <span highlight="Indicator" style="display: inline-block; width: 2em; text-align: center">{item.item.indicator}</span>
        { process.call(this, item, text) }
      </>
    ];
    if (flag & this.buffer.VISIBLE) {
      context.title = ["Buffers"];
      context.completions = [item for (item in generateVisibleTabs())];
    }
    if (!(flag & this.buffer.GROUPS | flag & this.buffer.ORPHANS))
      return;
    let self = this;
    TV._initFrame(function() {
      let groups = TV._window.GroupItems;
      if (flag & self.buffer.GROUPS) {
        let activeGroup = groups.getActiveGroupItem();
        let activeGroupId = activeGroup === null ? null : activeGroup.id;
        for (let [i, group] in Iterator(groups.groupItems)) {
          if (group.id != activeGroupId) {
            let groupName = group.getTitle();
            context.fork("GROUP_" + group.id, 0, self, function (context) {
              context.title = [groupName || UNTITLE_LABEL];
              context.completions = [item for (item in generateGroupList(group, groupName))];
            });
          }
        }
      }
      if (flag & self.buffer.ORPHANS) {
        let orphanedTabs = [tabItem for ([, tabItem] in Iterator(groups.getOrphanedTabs())) if (tabItem.tab.hidden)];
        if (orphanedTabs.length == 0)
          return;
        context.fork("__ORPHANED__", 0, self, function (context) {
          context.title = ["Orphaned"];
          context.completions = [item for (item in generateOrphanedList(orphanedTabs))];
        });
      }
    });
  };
  completion.buffer.ALL = 1 | 2 | 4;
  completion.buffer.VISIBLE = 1 << 0;
  completion.buffer.GROUPS  = 1 << 1;
  completion.buffer.ORPHANS = 1 << 2;

})(window.TabView, window.gBrowser);

// }}}

// vim: sw=2 ts=2 et fdm=marker:
