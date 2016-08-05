/*
Integration plugin for the tileview extension

tileview: https://addons.mozilla.org/en-US/firefox/addon/tile-view/

This plugin was written by Christopher Grossack, 2016
(tileview, however, was NOT written by Christopher Grossack)

website: https://github.com/HallaSurvivor
email: HallaSurvivor@gmail.com

version 0.3

== CHANGELOG ==
version 0.2:
  * Removed the extra aliases, i.e. tileAdd vs ta.
    People can include custom binds in their .vimperatorrc,
    and this way we don't clutter vimperator's namespace.

version 0.3:
  * Added info section
*/

var INFO =
<plugin name="tileview integration" version="0.3"
        href="https://github.com/HallaSurvivor/vimperatorPlugins"
        summary="vimperator integration with the tileview plugin"
        lang="en-US"
        xmlns="http://vimperator.org/namespaces/liberator">
  <author email="HallaSurvivor@gmail.com">Christopher Grossack</author>
  <license href="http://opensource.org/licenses/mit-license.php">MIT</license>
  <project name="Vimperator"/>
  <p>
    This plugin provides integration with the tileView plugin written by DW-dev.
    (tileView is available for download at www.addons.mozilla.org/en-US/firefox/addon/tile-view/)
  </p>
  <item>
    <tags>tileAdd</tags>
    <spec>tileAdd <a>(up | down | left | right)</a></spec>
    <description><p>
      Add a tile in the specified direction.
    </p></description>
  </item>

  <item>
    <tags>split</tags>
    <spec>split</spec>
    <description><p>
      create a horizontal split, just like vim.

      NOTE: this command is simply an alias for <code>tileAdd down</code>

      NOTE: vim defaults to putting the new panel above the current one.
      This plugin places the new panel below the current one.
    </p></description>
  </item>

  <item>
    <tags>vsplit</tags>
    <spec>vsplit<spec>
    <description><p>
      create a vertical split, just like vim.

      NOTE: this command is simply and alias for <code>tileAdd right</code>

      NOTE: vim defaults to putting the new panel left the current one.
      This plugin places the new panel to the right of the current one
    </p></description>
  </item>

  <item>
    <tags>tileExpand</tags>
    <spec>tileExpand</spec>
    <description><p>
      Expand the current pane to fill the screen
    </p></description>
  </item>

  <item>
    <tags>tileRemove</tags>
    <spec>tileRemove</spec>
    <description><p>
      remove a pane from the tiling.

      NOTE: this functions the way :q does by default in vim.
      Unfortunately, I was unable to use this binding, as it caused
      buggy behavior in vimperator and tileview_integration due to 
      conflicts with a preexisting vimperator binding.
    </p></description>
  </item>

  <item>
    <tags>tileEqualize</tags>
    <spec>tileEqualize</spec>
    <description><p>
      Equalize the size of all the panes.
    </p></description>
  </item>

  <item>
    <tags>tileView</tags>
    <spec>tileView</spec>
    <description><p>
      Toggle tileView on and off.
    </p></description>
  </item>

  <item>
    <tags>tileSync</tags>
    <spec>tileSync</spec>
    <description><p>
      Toggle sync scroll.

      While sync scroll is on, all panes will scroll at the same time.
    </p></description>
  </item>

  <item>
    <tags>tileOptions</tags>
    <spec>tileOptions</spec>
    <description><p>
      Show the tileView options menu.
    </p></description>
  </item>

  <item>
    <tags>tileDefaultLayoutOpen</tags>
    <spec>tileDefaultLayoutOpen</spec>
    <description><p>
      Open the default layout.
    </p></description>
  </item>

  <item>
    <tags>tileDefaultLayoutSave</tags>
    <spec>tileDefaultLayoutSave <oa>[0 | 1]</oa><spec>
    <description><p>
      save the current layout as the default.

      The argument tells tileView whether or not to save tabs as well as 
      the layout of the panes. (default: 0)
    </p></description>
  </item>

  <item>
    <tags>tileNamedLayoutOpen</tags>
    <spec>tileNamedLayoutOpen <a>name</a></spec>
    <description><p>
      opens a saved layout.
    </p></description>
  </item>

  <item>
    <tags>tileNamedLayoutSave</tags>
    <spec>tileNamedLayoutSave <a>name</a> <oa>[0 | 1]</oa></spec>
    <description><p>
      Save the current layout under a certain name.

      the second argument tells tileView whether or not to save tabs as well
      as the layout of the panes (default: 0)
    </p></description>
  </item>

  <item>
    <tags>tileNamedLayoutDelete</tags>
    <spec>tileNamedLayoutDelete <a>name</a><spec>
    <description><p>
      Delete a previously saved layout.
    </p></description>
  </item>

  <item>
    <tags>tilePrelayoutOpen</tags>
    <spec>tilePrelayoutOpen <a>name</a><spec>
    <description><p>
      Open one of the predefined tile layouts.
    </p></description>
  </item>

  <item>
    <tags>tileClose</tags>
    <spec>tileClose</spec>
    <description><p>
      Close the open layout.
    </p></description>
  </item>

  <item>
    <tags>tileFocus</tags>
    <spec>tileFocus <a>tabNumber</a></spec>
    <description><p>
      Change the active pane to the pane with the specified tab open in it.
    </p></description>
  </item>

  <item>
    <tags>tf</tags>
    <spec>tf <a>tabNumber</a></spec>
    <description><p>
      Change the active pane to the pane with the specified tab open in it.

      NOTE: this is an alias for tileFocus
    </p></description>
  </item>
</plugin>



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

    commands.addUserCommand(
      ["tileR[emove]"], // :q is already used by vimperator
      "Remove a pane from the tiling",
      function() { TV.menuActions("remove"); }
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

      context.completions = [[n, ''] for each (n in names)];
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

    commands.addUserCommand(
      ["tileF[ocus]"],
      "Focus on the panel with the tab in tabnumber n open. usage: tabNumber",
      //TODO - make this work with panels with tabs from other tabgroups.
      function(n)
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
      },
      { argCount: '1', completer: _openPanelsCompleter }
    );
  }
}

TileviewIntegration();
