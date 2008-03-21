/**
 * Vimperator Plugin For "Split Browser"
 * For vimperator 0.5.3
 * @author teramako
 */

(function(){

vimperator.commands.add(new vimperator.Command(['sp[lit]'],
	function(args){
		var position = null;
		if (args) {
			args = args.split(/ -/);
			switch (args[args.length-1].toLowerCase()) {
				case 'l':
				case 'left': position = SplitBrowser.POSITION_LEFT; break;
				case 'r':
				case 'right': position = SplitBrowser.POSITION_RIGHT; break;
				case 't':
				case 'top': position = SplitBrowser.POSITION_TOP; break;
				case 'bottom':
				case 'b': position = SplitBrowser.POSITION_BOTTOM; break;
			}
			if (position) {
				args.pop();
			}
			var urls = args.join(' -');
			if (urls){
				urls = vimperator.util.stringToURLArray(urls);
				var url = typeof urls[0] == 'string' ? urls[0] : urls[0][0];
				openSubBrowser(url, position);
				return;
			}
		}
		vimperator.echo('Split and load current URL.');
		openSubBrowser(vimperator.buffer.URL, position);
	},{
		usage: ['sp[lit] [URL] [-POSITION]'],
		shortHelp: 'split browser',
		help: 'Split browser and load the <code class="argument">[URL]</code>.<br/>' +
			  'If you don\'t specify the <code class="argument">[URL]</code> argument, browser loads the current URL.<br/>' +
			  '<br/>You need install <a href="https://addons.mozilla.org/en-US/firefox/addon/4287">Split Browser</a>.',
		completer:function(filter){ return vimperator.completion.get_url_completions(filter); }
	}
));
vimperator.commands.add(new vimperator.Command(['on[ly]'],
	function(){
		if (SplitBrowser.browsers.length > 0) {
			SplitBrowser.removeAllSubBrowsers(); // 分割したブラウザをすべて閉じる
			// 好みで↑↓選ぼう
			// SplitBrowser.gatherSubBrowsers(); // すべての分割したブラウザをタブに集める
		} else {
			vimperator.echoerr('SubBrowser is none');
		}
	},{
		usage: ['on[ly]'],
		shortHelp: 'close split browsers',
		help: 'Close all split browsers'
	}
));

/**
 * Close active browser
 */
vimperator.mappings.add(new vimperator.Map(vimperator.modes.NORMAL, ['sd'], //{{{
	function(){
		var b = SplitBrowser.activeBrowser;
		if (b.mTabs.length > 1){
			b.removeTab(b.mCurrentTab);
		} else {
			if (b === gBrowser){
				vimperator.open('about:blank', vimperator.NEW_BACKGROUND_TAB);
				gBrowser.removeTab(gBrowser.mCurrentTab);
			} else {
				SplitBrowser.activeBrowserCloseWindow();
			}
		}
	},{
		shortHelp: 'Close active browser'
	}
)); //}}}
/**
 * Switch browser focus
 */
vimperator.mappings.add(new vimperator.Map(vimperator.modes.NORMAL, ['<C-w><C-w>'], //{{{
	function(){
		var browsers = SplitBrowser.browsers;
		if (SplitBrowser.activeBrowser === gBrowser) {
			SplitBrowser.getSubBrowserById(browsers[0].id).browser.contentWindow.focus();
		} else {
			var id = SplitBrowser.activeSubBrowser.id;
			for (var i=0; i<browsers.length; i++){
				if (browsers[i].id == id) {
					if (browsers[i+1]){
						SplitBrowser.getSubBrowserById(browsers[i+1].id).browser.contentWindow.focus();
					} else {
						gBrowser.contentWindow.focus();
					}
					return true;
				}
			}
		}
	},{
		shortHelp: 'Switch focus',
		help: 'Switch focus to splitted browser'
	}
)); //}}}

/**
 * Overwrite save hint `s' to `S'
 */
vimperator.mappings.add(new vimperator.Map(vimperator.modes.HINTS, ['S'], //{{{
	function(){ vimperator.hints.saveHints(true); },
	{
		cancelMode: true,
		alwaysActive: false
	}
)); //}}}
/**
 * ExtendedHint mode key mapping `s'
 * This key mapping is prefix for open the urls to split browser
 */
vimperator.mappings.add(new vimperator.Map(vimperator.modes.HINTS, ['s'], //{{{
	function(){
		vimperator.input.buffer += 's';
		vimperator.echo("-- HINTS (extended) -- Split: `t': TOP, `b': BOTTOM, `l':LEFT, `r':RIGHT");
	},{
		cancelMode:false,
		alwaysActive:true
	}
)); // }}}
/**
 * ExtendedHint mode key mapping `t'
 * Split to TOP
 */
vimperator.mappings.add(new vimperator.Map(vimperator.modes.HINTS, ['t'], //{{{
	function(){
		var input = vimperator.input.buffer;
		if (input.charAt(input.length-1) == 's'){
			openSubBrowserExtendedMode(SplitBrowser.POSITION_TOP);
		} else {
			vimperator.hints.openHints(true, false);
		}
		vimperator.hints.disableHahMode(null,true);
	},{
		cancelMode:true,
		alwaysActive:false
	}
)); //}}}
/**
 * ExtendedHint mode key mapping `b'
 * Split to BOTTOM
 */
vimperator.mappings.add(new vimperator.Map(vimperator.modes.HINTS, ['b'], //{{{
	function(){
		var input = vimperator.input.buffer;
		if (input.charAt(input.length-1) == 's'){
			openSubBrowserExtendedMode(SplitBrowser.POSITION_BOTTOM);
		}
		vimperator.hints.disableHahMode(null,true);
	},{
		cancelMode:true,
		alwaysActive:false
	}
)); //}}}
/**
 * ExtendedHint mode key mapping `l'
 * Split to LEFT
 */
vimperator.mappings.add(new vimperator.Map(vimperator.modes.HINTS, ['l'], //{{{
	function(){
		var input = vimperator.input.buffer;
		if (input.charAt(input.length-1) == 's'){
			openSubBrowserExtendedMode(SplitBrowser.POSITION_LEFT);
		}
		vimperator.hints.disableHahMode(null,true);
	},{
		cancelMode:true,
		alwaysActive:false
	}
)); //}}}
/**
 * ExtendedHint mode key mapping `r'
 * Split to RIGHT
 */
vimperator.mappings.add(new vimperator.Map(vimperator.modes.HINTS, ['r'], //{{{
	function(){
		var input = vimperator.input.buffer;
		if (input.charAt(input.length-1) == 's'){
			openSubBrowserExtendedMode(SplitBrowser.POSITION_RIGHT);
		}
		vimperator.hints.disableHahMode(null,true);
	},{
		cancelMode:true,
		alwaysActive:false
	}
)); //}}}
/**
 * openSubBrowser at ExtendedHint mode
 * @param {Number} aPosition split direction
 */
function openSubBrowserExtendedMode(aPosition){ //{{{
	var elms = vimperator.hints.hintedElements();
	var urls = [];
	for (var i=0; i<elms.length; i++){
		var url = elms[i].refElem.href;
		if (typeof(url) == 'undefined' || !url.length){
			continue;
		}
		urls.push(url);
	}
	if (urls.length == 0) { return; }
	var subBrowser = openSubBrowser(urls[0], aPosition);
	if (urls.length > 1){
		for (var i=1, l=urls.length; i < l; subBrowser.browser.addTab(urls[i++],null,null,null))
			;
	}
} //}}}
/**
 * create new subBrowser and load url
 * @param {String} url
 * @param {Number} aPosition split direction
 */
function openSubBrowser(url, aPosition){ // {{{
	var subBrowser = SplitBrowser.addSubBrowser(url, null, aPosition || SplitBrowser.POSITION_TOP);
	subBrowser.addEventListener('load',function(){
		subBrowser.removeEventListener('load',arguments.callee,true);
		subBrowser.browser.contentWindow.focus();
	},true);
	return subBrowser;
} //}}}

/**
 * Overwrite vimperator.open for SplitBrowser
 * @see vimperator.js::vimperaotr.open
 */
vimperator.open = function(urls, where, callback){ //{{{
	if (typeof urls == 'string') { urls = vimperator.util.stringToURLArray(urls); }
	if (urls.length == 0) { return false; }
	if (!where) { where = vimperator.CURRENT_TAB; }

	var url = typeof urls[0] == 'string' ? urls[0] : urls[0][0];
	var postdata = typeof urls[0] == 'string' ? null : urls[0][1];
	var whichwindow = window;
	var activeBrowser = SplitBrowser.activeBrowser;

	switch (where) {
		case vimperator.CURRENT_TAB:
			activeBrowser.loadURI(url, null, postdata);
			break;
		case vimperator.NEW_TAB:
			var firsttab = activeBrowser.addTab(url, null, null, postdata);
			activeBrowser.selectedTab = firsttab;
			break;
		case vimperator.NEW_BACKGROUND_TAB:
			activeBrowser.addTab(url, null, null, postdata);
			break;
		case vimperator.NEW_WINDOW:
			window.open();
			var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
			                   .getService(Components.interfaces.nsIWindowMediator);
			whichwindow = vm.getMostRecentWindow('navigator:browser');
			whichwindow.loadURI(url, null, postdata);
			break;
		default:
			vimperator.echoerr("Exxx: Invalid 'where' directive in vimperator.open(...)");
			return false;
	}
	for (var i=1, l=urls.length; i < l; i++){
		url = typeof urls[i] == 'string' ? urls[i] : urls[i][0];
		postdata = typeof urls[i] == 'string' ? null : urls[i][1];
		whichwindow.SplitBrowser.activeBrowser.addTab(url, null, null, postdata);
	}
}; //}}}
})();

// vim: set fdm=marker sw=4 ts=4 et:
