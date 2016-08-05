/*
 * A plugin to mute a tab
 *
 * Christopher Grossack, 2016
 *
 * website: https://github.com/HallaSurvivor
 * email: HallaSurvivor@gmail.com
 *
 * version 0.2
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
 */

var INFO =
<plugin name="mute" version="0.2"
        href="https://github.com/HallaSurvivor/vimperatorPlugins"
        summary="Command to mute tabs"
        lalng="en-US"
        xmlns="http://vimperator.org/namespaces/liberator">
  <author email="HallaSurvivor@gmail.com">Christopher Grossack</author>
  <license href="http://opensource.org/licenses/mit-license.php">MIT</license>
  <project name="Vimperator"/>
  <p>This plugin provides a bind to mute a tab in the group.</p>
  <item>
    <tags>mute</tags>
    <spec>mute <oa>n</oa><spec>
    <description><p>
      Mute tab number n. 
      (default: current tab)
    </p></description>
  </item>
</plugin>

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
      config.tabbrowser.visibleTabs[n - 1].toggleMuteAudio();
    }
  }
);
