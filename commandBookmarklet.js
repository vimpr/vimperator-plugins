/**
 * bookmarklet wo command ni suru plugin 
 *
 * @author halt feits <halt.feits@gmail.com>
 * @version 0.6.0
 */

(function(){
  var filter = "javascript:";
  var items = liberator.bookmarks.get(filter);

  if (items.length == 0) {
    if (filter.length > 0) {
      liberator.echoerr("E283: No bookmarks matching \"" + filter + "\"");
    } else {
      liberator.echoerr("No bookmarks set");
    }
  }
 
  for (var i = 0; i < items.length; i++) {
    var title = liberator.util.escapeHTML(items[i][1]);
    if (title.length > 50) {
      title = title.substr(0, 47) + "...";
    }

    var url = liberator.util.escapeHTML(items[i][0]);
    var command = new Function('', 'liberator.open("' + url + '");');
    liberator.commands.addUserCommand(
        [title],
        'bookmarklet',
        command,
        {
            shortHelp: 'bookmarklet',
        }
    );
  }
})();
