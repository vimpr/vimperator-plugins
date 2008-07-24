// Vimperator plugin: uaSwitch
// Maintainer: mattn <mattn.jp@gmail.com> - http://mattn.kaoriya.net
// Require: User Agent Switcher - https://addons.mozilla.org/firefox/addon/59
// Usage:
//   :ua MyUserAgent     - set user agent named MyUserAgent.
//   :ua Default         - reset user agent to default.
//   :ua!                - open user agent switcher setting dialog.
//   :ua                 - show current user agent.

(function() {
	if (typeof useragentswitcher_reset != 'function') return;

	// activate user agent siwtcher
	useragentswitcher_displayUserAgentSwitcherMenu(document.getElementById("useragentswitcher-popup-menu"), 'menu');

	// return user agent list
	function getItems() {
		return Array.map(
			document.getElementById("useragentswitcher-menu")
				.getElementsByAttribute("type", "radio"),
				function(n) {
					return {
						label : n.getAttribute('label'),
						oncommand : n.getAttribute('oncommand'),
						checked : n.getAttribute('checked')
					}
				}
		);
	}

	// regist vimperator command
	liberator.commands.addUserCommand(['ua'],'Switch User Agent',
		function(arg, special){
			if (special) useragentswitcher_options();
			else if (!arg) liberator.echo("UserAgent: " + getItems().filter(function(n) {return n.checked})[0].label);
			else window.eval(getItems().filter(function(n) {return n.label == arg})[0].oncommand);
		},{
        	completer: function(filter, special){
				return [0, getItems().map(function(n) { return [n.label, n.label] })];
			}
		}
	);
})();
