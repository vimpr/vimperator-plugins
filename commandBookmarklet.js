/**
 * bookmarklet wo command ni suru plugin
 *
 * @author halt feits <halt.feits@gmail.com>
 * @version 0.6.0
 */

(function(){
  var filter = "javascript:";
  var items  = liberator.bookmarks.get(filter);

  if (items.length == 0) {
    if (filter.length > 0) {
      liberator.echoerr('E283: No bookmarks matching "' + filter + '"');
    } else {
      liberator.echoerr("No bookmarks set");
    }
  }

  items.forEach(function(item) {
    var [url, title] = item;
    if (width(title) > 50) {
      while (width(title) > 47) {
        title = title.slice(0, -2);
      }
      title += "...";
    }
    title = liberator.util.escapeHTML(title);

    var command = function () { liberator.open(url); };
    liberator.commands.addUserCommand(
      [title],
      "bookmarklet",
      command,
      {
        shortHelp: "Bookmarklet",
      }
    );
  });

  function width(str) str.replace(/[^\x20-\xFF]/g, "  ").length;
})();
// vim:sw=2 ts=2 et:
