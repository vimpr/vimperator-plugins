/*
 * A plugin to mute a tab
 *
 * Christopher Grossack, 2016
 *
 * website: https://github.com/HallaSurvivor
 * email: HallaSurvivor@gmail.com
 *
 * version 0.3
 *
 * Commands:
 *
 * mute [n]
 *  mute tab n (current tab by default)
 *
 * == CHANGELOG ==
 * version 0.2
 *   Added INFO section.
 *
 * version 0.3
 *   Made the code more intuitive in tab selection
 *
 *   Added completion with tab labels
 *
 *   Removed INFO section, as it introduced an unfixable bug
 *
 */

function _completer(context)
{
  var allTabs = gBrowser.visibleTabs;

  // Remember, vimperator indexes from 1.
  var indices = allTabs.map(function(tab) { return allTabs.indexOf(tab) + 1 });

  var labels  = allTabs.map(function(tab) { return tab.label });

  var indicesAndHints = indices.map(function(e, i) { return [indices[i], labels[i]] });

  context.completions = indicesAndHints;
}

commands.add(
  ["mute"],
  "Mute a tab. (Mutes current tab by default)",
  function(n) 
  {
    if(!n || n <= 0 || n > config.tabbrowser.visibleTabs.length)
    {
      window.gBrowser.mCurrentTab.toggleMuteAudio();
    }
    else
    {
      // JS indexes from 0, vimperator indexes from 1
      window.gBrowser.visibleTabs[n - 1].toggleMuteAudio();
    }
  },
  { argCount: '1', completer: _completer }
);
