/* A plugin to integrate firefox Pocket with vimperator.
 *
 * Christopher Grossack 2016
 *
 * NOTE: This requires the pocket icon be visible, either
 * in one of the toolbars, or in the menu.
 *
 * This plugin exports one functions and one hint mode
 * to better integrate firefox pocket and vimperator.
 *
 *   - po[cket] adds the current tab to pocket.
 *   
 *   - The new hintmode 'p' will save the selected link to pocket.
 *
 * version 0.2
 *
 * == CHANGELOG ==
 * version 0.2:
 *   Removed the INFO section, as it caused an unfixable bug.
 *
 * website: https://github.com/HallaSurvivor
 * email: HallaSurvivor@gmail.com
 */

function pocket_integration()
{
  var gB = window.gBrowser;

  hints.addMode(
    'p',
    "Save a link to pocket.",
    function(elem, loc){ window.Pocket.savePage(gB, loc);}
  );

  commands.add(
    ["po[cket]"],
    "Add the current tab to pocket.",
    function(){ window.Pocket.savePage(gB, window.gLastValidURLStr); }
  );
}

pocket_integration();
