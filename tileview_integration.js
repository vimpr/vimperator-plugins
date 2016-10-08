/*
Integration plugin for the tileview extension

tileview: https://addons.mozilla.org/en-US/firefox/addon/tile-view/

This plugin was written by Christopher Grossack, 2016
(tileview, however, was NOT written by Christopher Grossack)

website: https://github.com/HallaSurvivor
email: HallaSurvivor@gmail.com

version 0.9

== CHANGELOG ==
version 0.2:
  * Removed the extra aliases, i.e. tileAdd vs ta.
    People can include custom binds in their .vimperatorrc,
    and this way we don't clutter vimperator's namespace.

version 0.3:
  * Added info section

version 0.4:
  * Removed info section as it caused an unfixable bug.

version 0.5:
  * Added tf alias for tileFocus

version 0.6:
  * Added q[uit] function that overrides the default q[uit] behavior.
    It will remove a tile if a tile exists, but will function
    as default if no tile exists. This mimics vim's :q to close
    a split.

  * Fixed a bug where a list was populating wrong on startup

version 0.7:
  * Made q[uit] actually override the default implementation

version 0.8:
  * Updated tileRemove to take input and remove a pane that isn't selected

version 0.9:
  * Actually made q[uit] override the default implementation this time.
*/

function TileviewIntegration()
{
  // Check tileView is installed
  var TV = window.tileView;
  if (!TV)
  {
    return null;
  }
  else
  {
    // The easy commands to implement. 
    // Call the commands in the menu as they are.
    commands.addUserCommand(
      ["tileC[lose]"],
      "Close the current layout.",
      function() { TV.menuActions("close"); }
    );

    commands.addUserCommand(
      ["tileA[dd]"],
      "Add a tiling in a direction (u[p] | d[own] | l[eft] | r[ight]).",
      function(direction)
      {
        if (direction == 'up')    TV.menuActions("add-above");
        if (direction == 'u')     TV.menuActions("add-above");

        if (direction == 'down')  TV.menuActions("add-below");
        if (direction == 'd')     TV.menuActions("add-below");

        if (direction == 'left')  TV.menuActions("add-left" );
        if (direction == 'l')     TV.menuActions("add-left" );
        
        if (direction == 'right') TV.menuActions("add-right");
        if (direction == 'right') TV.menuActions("add-right");
      }
    );

    commands.addUserCommand(
      ["vsplit"],
      "Split vertically. (new pane goes on right, unlike vim)",
      function() { TV.menuActions("add-right"); }
    );

    commands.addUserCommand(
      ["split"],
      "Split horizontally. (new pane goes below, unlike vim)",
      function() { TV.menuActions("add-below"); }
    );

    commands.addUserCommand(
      ["tileEx[pand]"],
      "Expand a tile to fill the window.", 
      function() { TV.menuActions("expand"); }
    );

    // Nasty implementation breach to override q[uit]
    commands._exCommands = commands._exCommands.filter(function (cmd) !cmd.hasName("quit"));

    commands.addUserCommand(
      ["q[uit]"],
      "Remove open pane if tiled, close tab otherwise (just like vim)",
      function(args) 
      { 
        if (TV.panelCount) TV.menuActions("remove");
        else tabs.remove(config.browser.mCurrentTab, 1, false, 1);
      }
    );
    
    commands.addUserCommand(
      ["tileEq[ualize]"],
      "Equalize the sizes of the panes in the tiling",
      function() { TV.menuActions("equalize"); }
    );

    commands.addUserCommand(
      ["tileV[iew]"],
      "Toggle the view mode of the window between tiled and untiled.",
      function() { TV.menuActions("view"); }
    );

    commands.addUserCommand(
      ["tileS[ync]"],
      "Toggle the sync scroll mode of the window",
      function() { TV.menuActions("sync"); }
    );

    commands.addUserCommand(
      ["tileO[ptions]"],
      "Open the tile options menu",
      function() { TV.menuActions("options"); }
    );

    commands.addUserCommand(
      ["tileDefaultLayoutOpen"],
      "Open the default layout.",
      function() { TV.menuActions("new-default"); }
    );


    // A function to autocomplete the list of
    // preinstalled layouts.
    function _preinstalledCommands(context)
    {
      var names = ["2vert",       "3vert", 
                   "2horiz",      "3horiz", 
                   "4vertgrid",   "4horizgrid", 
                   "allvertgrid", "allhorizgrid"];

      var completions = [];
      for (var i=0; i < names.length; i++)
      {
        completions.push([names[i], '']);
      }

      context.completions = completions;
    };

    commands.addUserCommand(
      ["tilePr[eLayoutOpen]"],
      "Open a preinstalled layout.",
      function(layoutName)
      {
        if (layoutName == "2vert")        TV.menuActions("new-2vert");
        if (layoutName == "3vert")        TV.menuActions("new-3vert");
        if (layoutName == "2horiz")       TV.menuActions("new-2horiz");
        if (layoutName == "3horiz")       TV.menuActions("new-3horiz");
        if (layoutName == "4vertgrid")    TV.menuActions("new-4vertgrid");
        if (layoutName == "4horizgrid")   TV.menuActions("new-4horizgrid");
        if (layoutName == "allvertgrid")  TV.menuActions("new-allvertgrid");
        if (layoutName == "allhorizgrid") TV.menuActions("new-allhorizgrid");
      },
      { argCount: '1', completer: _preinstalledCommands }
    );


    // The harder commands to implement.
    // We have to use tileView's internal
    // implementation to sidestep the 
    // graphical menus.
    commands.addUserCommand(
      ["tileNamedLayoutSave"],
      "Save the current layout. saving tabs defaults to 0. usage: <name> [0 | 1]",
      function(name, saveTabs)
      {
        if (!name) 
        {
          liberator.echoerr('Include a name to save layout as');
          return;
        }
        if (!saveTabs) TV.saveNamedLayout(name, 0);
        else           TV.saveNamedLayout(name, 1);
      },
      { argCount: '2' }
    );


    // A function that returns the list of named layouts
    // to be used in autocompletion.
    function _namedLayoutsCompleter(context)
    {
      var names = [];

      var stored_names = TV.prefs.getChildList("layout-string-",{});
      stored_names.sort();
      
      for (var i=0; i < stored_names.length; i++)
      {
        names.push([stored_names[i].substr(14), '']);
      }

      context.completions = names;
    };

    commands.addUserCommand(
      ["tileNamedLayoutOpen"],
      "Open a named layout. usage: <name>",
      function(name)
      {
        if (!name) 
        {
          liberator.echoerr('Include a name to open');
          return;
        }

        TV.openNamedLayout(name);
        
        TV.lastSelectedTab = TV.lastSelectedTiledTab;
        gBrowser.selectedTab = TV.lastSelectedTab;
        TV.saveRestoreLayout();
        
        TV.viewTiled = true;
        
        TV.hideOtherPanels(true);
        TV.drawTiledLayout();
        TV.highlightPanel();
        
        TV.stateButton();
      },
      { argCount: '1', completer: _namedLayoutsCompleter }
    );

    commands.addUserCommand(
      ["tileNamedLayoutDelete"],
      "Delete a named layout. usage: <name>",
      function(name)
      {
        if (!name)
        {
          liberator.echoerr('Include a name to delete');
          return;
        }

        TV.deleteNamedLayout(name);
      },
      { argCount: '1', completer: _namedLayoutsCompleter }
    );

    commands.addUserCommand(
      ["tileDefaultLayoutSave"],
      "Save the current layout as default. saving tabs defaults to 0. usage: [0 | 1]",
      function(saveTabs)
      {
        if (!saveTabs) TV.saveDefaultLayout(0);
        else           TV.saveDefaultLayout(1);
      }
    );

    // A function to autocomplete the tabs
    // that are open in panels, alongside
    // their URLs for ease of use.
    function _openPanelsCompleter(context)
    {
      // A list of tabs that are open in the group.
      var allTabs = gBrowser.visibleTabs;

      // A list of the tabs that are open in panes.
      var openPanelTabs = allTabs.filter(
        function(tab){return tab.hasAttribute("tileview-assigned");}
      );

      // A list of the indices of the tabs open in panes.
      // This is what we need to pass to tileFocus.
      // Further, remember that vimperator indexes from 1, not 0.
      var openPanelIndices = openPanelTabs.map(
        function(tab) {return allTabs.indexOf(tab) + 1;}
      );

      // A list of labels for the tabs open in panes.
      // This will help the user decide which index is appropriate.
      var openPanelLabels = openPanelTabs.map(function(tab){return tab.label;});

      // A zipped list of the form [[index, label]] that
      // will be shown to the user as completions with hints.
      indicesAndHints = openPanelIndices.map(
        function(e, i){ return [openPanelIndices[i], openPanelLabels[i]] }
      );

      context.completions = indicesAndHints;
    };

    function _focusOnTab(n)
    {
      if (!n || n <= 0 || n > config.tabbrowser.visibleTabs.length)
      {
        return;
      }

      tab = config.tabbrowser.visibleTabs[n - 1];

      if (!tab.hasAttribute("tileview-assigned")) return;
      if (document.getElementById("print-preview-toolbar") != null) return;

      TV.lastSelectedTab = tab;
      gBrowser.selectedTab = TV.lastSelectedTab;

      tileView.hideActivate();
    };

    commands.addUserCommand(
      ["tileR[emove]"],
      "Remove a pane from the tiling (current pane by default)",
      function(n) 
      { 
        if (!n || n <= 0 || n > config.tabbrowser.visibleTabs.length)
        {
          TV.menuActions("remove"); 
        }
        else
        {
          currentTab = gBrowser.selectedTab;
          currentTabIndex = config.tabbrowser.visibleTabs.indexOf(currentTab);
          _focusOnTab(n);
          TV.menuActions("remove");
          _focusOnTab(currentTabIndex + 1); //vimperator indexes from 1
        }
      },
      { argCount: '1', completer: _openPanelsCompleter }
    );

    commands.addUserCommand(
      ["tileF[ocus]"],
      "Focus on the panel with the tab in tabnumber n open. usage: tabNumber",
      _focusOnTab,
      { argCount: '1', completer: _openPanelsCompleter }
    );
  }
}

TileviewIntegration();
