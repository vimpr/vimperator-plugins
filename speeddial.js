// Vimperator plugin: "SpeedDial"
// Last Change: 22-Oct-2008. Jan 2008
// License: Creative Commons
// Maintainer: mattn <mattn.jp@gmail.com> - http://mattn.kaoriya.net/
//
// Commands:
//  :sd 1
//      open url registered as 1 in current tab.
//  :sd! 1
//      open url registered as 1 in new tab.
// Note:
//  you can able to complete urls with tab key.

(function() {
    const pref = Components.classes["@mozilla.org/preferences;1"].getService(Components.interfaces.nsIPrefBranch);
    var nsISupportsString = Components.interfaces.nsISupportsWString ||
                            Components.interfaces.nsISupportsString;
    liberator.modules.commands.addUserCommand(["sd", "speeddial"], "speeddial",
        function(args){
            var arg = args.string;
            if (arg.match(/^[0-9]+$/))
                arg = pref.getComplexValue("extensions.speeddial.thumbnail-" + arg + "-url", nsISupportsString).data;
            else
            if (arg.length == 0)
                arg = "chrome://speeddial/content/speeddial.xul";
            liberator.open(arg, args.bang ? liberator.NEW_TAB : liberator.CURRENT_TAB);
        }, {
            bang: true,
            completer: function(filter) {
                candidates = [];
                for (var n = 1; n <= 9; n++) {
                    var url = pref.getComplexValue("extensions.speeddial.thumbnail-" + n + "-url", nsISupportsString).data;
                    var label = pref.getComplexValue("extensions.speeddial.thumbnail-" + n + "-label", nsISupportsString).data;
                    if (url && label) candidates.push([url, n + ":" + label]);
                }
                return [0,candidates];
            }
        }
    );
})();
// vim:sw=4 ts=4 et:
