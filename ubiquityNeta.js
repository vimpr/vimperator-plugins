// Vimperator plugin: Ubiquity
// Maintainer: mattn <mattn.jp@gmail.com> - http://mattn.kaoriya.net
// Require: Ubiquity - https://wiki.mozilla.org/Labs/Ubiquity
// Usage:
//   :ubiquity command...  - show Ubiquity's command dialog.
//   :ubiquity! command... - run Ubiquity's command.

(function() {
	if (typeof gUbiquity === 'undefined') return;
	liberator.commands.addUserCommand(["ubiquity"], "Ubiquity",
	function(arg){
		var anchor = document.getElementById("content");
		if (window.location == "chrome://browser/content/browser.xul")
			anchor = anchor.selectedBrowser;
		gUbiquity.openWindow(anchor);
		gUbiquity.__textBox.value = arg||'';
		var context = gUbiquity.__makeContext();
		var previewBlock = document.getElementById("cmd-preview").contentDocument.getElementById("preview");
		gUbiquity.__cmdManager.updateInput(arg||'', context, previewBlock);
		if (arg.special) {
			gUbiquity.__cmdManager.execute(context);
			gUbiquity.closeWindow();
		}
	},
	{ });
})();
