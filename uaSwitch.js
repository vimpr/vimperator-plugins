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
	useragentswitcher_displayUserAgentSwitcherMenu(document.getElementById('useragentswitcher-popup-menu'), 'menu');

	// return user agent list
	function getItems()
		Array.map(document.getElementById('useragentswitcher-menu')
		                  .getElementsByAttribute('type', 'radio'),
		          function(n) {
			return {
				label : n.getAttribute('label'),
				oncommand : n.getAttribute('oncommand'),
				checked : n.getAttribute('checked')
			}
		});

	// register Vimperator command
	liberator.modules.commands.addUserCommand(['ua'], 'Switch User Agent', function(args){
    if (args.bang) useragentswitcher_options();
		else if (!arg.string) liberator.echo('UserAgent: ' + getItems().filter(function(n) n.checked)[0].label);
		else window.eval(getItems().filter(function(n) n.label == arg.string)[0].oncommand);
	}, {
        bang: true,
		completer: function(filter)
			[0, getItems().map(function(n) [n.label, n.label])]
	});
})();
