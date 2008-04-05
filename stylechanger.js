/**
 * stylesheet changer
 * @author teramako teramako@gmail.com
 * @license MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * Usage:
 * 
 * :hi[ghlight]                  -> enable stylesheet
 * :hi[ghlight] [on|clear|off]   -> enbale/disable stylesheet
 * :hi[ghlight] {alt style name} -> switch to the alternative stylesheet
 *
 * :colo[rschema]                -> list available user stylesheets
 * :colo[rschema] {styleName}    -> enable the style
 * :colo[rschema]! {styleName}   -> disable the style
 *
 *     {styleName}               -> the name taked away from a CSS-file-name '.css' suffix
 *      CSS-file are put in "~/vimperator/colors" directory
 *
 * `colors[chema]' command is similar to Stylish
 * 
 * Example:
 *
 * auto load settings
 *    let g:styles = "style,name"
 *
 */

(function(){
commands.addUserCommand(['hi[ghlight]'],
	'basic style changer',
	function(arg){
		if (!arg || arg == 'on') {
			setStyleDisabled(false);
		} else if (arg == 'clear' || arg == 'off'){
			setStyleDisabled(true);
		} else if ((getStylesheetList()).indexOf(arg) != -1) {
			stylesheetSwitchAll(window.content, arg);
			setStyleDisabled(false);
		}
	},{
		completer: function(aFilter){
			var list = [
				['on','enable stylesheet'],
				['clear','disable stylesheet']
				['off','disable stylesheet'],
			];
			var styles = list.concat( getStylesheetList().filter(
					function(elm){ return [elm,'alternative style']; }
			));
			if (!aFilter) return [0,styles];
			var candidates = styles.filter(function(elm){return elm[0].indexOf(aFilter) == 0;});
			return [ 0, candidates];
		}
	}
);
function getStylesheetList(){
	var list = [];
	var stylesheets = getAllStyleSheets(window.content);
	stylesheets.forEach(function(style){
		var media = style.media.mediaText.toLowerCase();
		if (media && media.indexOf('screen') == -1 && media.indexOf('all') == -1) return;
		if (style.title) list.push(style.title);
	});
	return list;
}

if (!liberator.plugins) liberator.plugins = {};
liberator.plugins['styleSheetsManger@teramako.jp'] = (function(){
	var sss = Components.classes['@mozilla.org/content/style-sheet-service;1'].getService(Components.interfaces.nsIStyleSheetService);
	var ios = Components.classes['@mozilla.org/network/io-service;1'].getService(Components.interfaces.nsIIOService);
	function init(){
		if (!globalVariables.styles) return;
		var list = globalVariables.styles.split(/\s*,\s*/);
		for each(var item in list){
			manager.load(item);
		}
	}
	function getCSSFiles(){
		var colorDir = io.getSpecialDirectory('colors');
		var cssFiles = [];
		if (colorDir){
			cssFiles = io.readDirectory(colorDir).filter(function(file){
				return /\.css$/.test(file.leafName) && !file.isDirectory() ;
			});
		}
		return cssFiles;
	}
	function getURIFromName(aName){
		var file = io.getSpecialDirectory('colors');
		file.append(aName + '.css');
		if (file.exists()) return ios.newFileURI(file);
		
		return null;
	}
	var manager = {
		load: function(aName){
			if(!aName) return false;
			var uri = getURIFromName(aName);
			if (!uri) return false;

			if(sss.sheetRegistered(uri, sss.USER_SHEET))
				sss.unregisterSheet(uri, sss.USER_SHEET);

			sss.loadAndRegisterSheet(uri, sss.USER_SHEET);
			if (options.verbose > 8)
				log('Resisted colorschema '+aName);

			return true;
		},
		unload: function(aName){
			if(!aName) return false;
			var uri = getURIFromName(aName);
			if (!uri) return false;

			if(sss.sheetRegistered(uri, sss.USER_SHEET))
				sss.unregisterSheet(uri, sss.USER_SHEET);

			if (options.verbose > 8)
				log('Unresisted colorschema '+aName);

			return true;
		},
		list: function(){
			var str = ['<span class="hl-Title">User StyleSheet List</span>'];
			var files = getCSSFiles().map(function(file){return file.leafName.replace(/\.css$/,'');});
			for (var i=0; i<files.length; i++){
				var buf = ' ' + (i+1) + ' ';
				if (sss.sheetRegistered(getURIFromName(files[i]), sss.USER_SHEET)){
					buf += '<span style="color:blue">*</span>';
				} else {
					buf += ' ';
				}
				str.push(buf +' ' + files[i]);
			}
			echo( str.join('\n'), true);
		}
	};
	commands.addUserCommand(['colo[rschema]'], 'set user stylesheet',
		function(arg, special){
			if (!arg) {
				manager.list();
				return;
			}
			if (special){
				manager.unload(arg) && echo('Unredisted '+arg);
			} else {
				manager.load(arg) && echo('Redisted '+arg);
			}
		},{
			completer: function(filter, special){
				var list = getCSSFiles().map(function(file){
					var name = file.leafName.replace(/\.css$/,'');
					return [name,sss.sheetRegistered(getURIFromName(name),sss.USER_SHEET) ? '*' : ''];
				});
				if (!filter) return [0,list];
				var candidates = [];
				list.forEach(function(item){
					if(item[0].toLowerCase().indexOf(filter) == 0){
						candidates.push(item);
					}
				});
				return [0,candidates];
			}
		}
	);
	init();
	return manager;
})();

})();

// vim: set sw=4 ts=4 sts=0 fdm=marker:
