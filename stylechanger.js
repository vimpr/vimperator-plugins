/**
 * ==VimperatorPlugin==
 * @name           stylesheet changer
 * @description    enable to apply user stylesheets like Stylish
 * @description-ja Stylishの様にユーザスタイルシートの適用を可能にします
 * @author         teramako teramako@gmail.com
 * @url            http://coderepos.org/share/wiki/VimperatorPlugin/stylechanger.js
 * @license        MPL 1.1/GPL 2.0/LGPL 2.1
 * @version        0.3c
 * ==/VimperatorPlugin==
 *
 * Usage:
 *
 * :hi[ghlight] [groupName]             -> list all or specified group temporary-style(s)
 * :hi[ghlight] clear [groupName}       -> clear all or specified group temporary-styles
 * :hi[ghlight] {groupName} {style...}  -> define style as {groupName}
 *
 * :altcolo[rschema]                -> list available site alternative styles (`*'-marked is current style)
 * :altcolo[rschema] {altStyleName} -> switch to the style
 *
 * :colo[rschema]                -> list available user stylesheets (`*'-marked are loaded styles)
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

liberator.plugins.styleSheetsManger = (function(){
	var sss = Components.classes['@mozilla.org/content/style-sheet-service;1'].getService(Components.interfaces.nsIStyleSheetService);
	var ios = Components.classes['@mozilla.org/network/io-service;1'].getService(Components.interfaces.nsIIOService);
	var CSSDataPrefix = 'data:text/css,';
	function init(){
		if (!globalVariables.styles) return;
		var list = globalVariables.styles.split(/\s*,\s*/);
		for each(var item in list){
			manager.load(item);
		}
	}
	function getCSSFiles(){
		var cssFiles = [];
		var colorDirs = io.getRuntimeDirectories('colors');
		for each(var colorDir in colorDirs){
			if (colorDir){
				cssFiles.concat(io.readDirectory(colorDir).filter(function(file){
					return /\.css$/.test(file.leafName.toLowerCase()) && !file.isDirectory() ;
				}));
			}
		}
		
		return cssFiles;
	}
	function getURIFromName(aName){
		var colorDirs = io.getRuntimeDirectories('colors');
		for each(var file in colorDirs){
			file.append(aName + '.css');
			if (file.exists()) return ios.newFileURI(file);
		}

		return null;
	}
	function getURIFromCSS(aString){
		return ios.newURI('data:text/css,' + aString, null, null);
	}
	function getStylesheetList(){
		var list = [];
		var stylesheets = getAllStyleSheets(window.content);
		stylesheets.forEach(function(style){
			var media = style.media.mediaText.toLowerCase();
			if (media && media.indexOf('screen') == -1 && media.indexOf('all') == -1) return;
			if (style.title) list.push([style.title, style.disabled === true ? false : true]);
		});
		return list;
	}
	var manager = {
		load: function(css){
			if(!css) return false;
			var uri = null;
			if (typeof css == 'string') {
				uri = getURIFromName(css);
			} else if (css instanceof Components.interfaces.nsIURI) {
				uri = css;
			}
			if (!uri) return false;

			if(sss.sheetRegistered(uri, sss.USER_SHEET))
				sss.unregisterSheet(uri, sss.USER_SHEET);

			sss.loadAndRegisterSheet(uri, sss.USER_SHEET);
			if (options.verbose > 8)
				log('Resisted colorschema '+css);

			return true;
		},
		unload: function(css){
			if(!css) return false;
			var uri = null;
			if (typeof css == 'string'){
				uri = getURIFromName(css);
			} else if (css instanceof Components.interfaces.nsIURI){
				uri = css;
			}
			if (!uri) return false;

			if(sss.sheetRegistered(uri, sss.USER_SHEET))
				sss.unregisterSheet(uri, sss.USER_SHEET);

			if (options.verbose > 8)
				log('Unresisted colorschema '+css);

			return true;
		},
		list: function(isAltanative){
			var str = [];
			if (isAltanative){
				str.push('<span class="hl-Title">Alternative StyleSheet List</span>');
				getStylesheetList().forEach(function(elm,i){
					var buf = ' ' + (i+1) + ' ';
					if (elm[1]){
						buf += '<span style="color:blue">*</span>';
					} else {
						buf += ' ';
					}
					str.push(buf + ' ' + elm[0]);
				});;
				if (str.length == 1) str = ['Alternative StyleSheet is none.'];
			} else {
				str.push('<span class="hl-Title">User StyleSheet List</span>');
				var files = getCSSFiles().map(function(file){return file.leafName.replace(/\.css$/i,'');});
				files.forEach(function(file,i){
					var buf = ' ' + (i+1) + ' ';
					if (sss.sheetRegistered(getURIFromName(file), sss.USER_SHEET)){
						buf += '<span style="color:blue">*</span>';
					} else {
						buf += ' ';
					}
					str.push(buf +' ' + file);
				});
			}
			echo(str.join('\n'), true);
		},
		get highlightList(){
			return CSSData;
		}
	};
	commands.addUserCommand(['altcolo[rschema]'], 'set alternativeStyleSheet',
		function(arg){
			if (!arg){
				manager.list(true);
				return;
			} else if (getStylesheetList().some(function(elm){return elm[0] == arg;})){
				stylesheetSwitchAll(window.content, arg);
				setStyleDisabled(false);
			}
		},{
			completer: function(aFilter){
				var styles = getStylesheetList().map(
					function(elm){ return [elm[0], elm[1] ? '* ' : '  ' + 'alternative style']; }
				);
				if (!aFilter) return [0,styles];
				var candidates = styles.filter(function(elm){return elm[0].indexOf(aFilter) == 0;});
				return [0, candidates];
			}
		}
	);
	commands.addUserCommand(['colo[rschema]'], 'set user stylesheet',
		function(arg, special){
			if (!arg){
				manager.list(false);
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
					var name = file.leafName.replace(/\.css$/i,'');
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
	var CSSData = {};
	commands.addUserCommand(['hi[ghlight]'], 'temporary style changer',
		function(args){
			if (args.arguments.length == 0){
				var str = ['show highlight list'];
				for (var name in CSSData){
					str.push('<span class="hl-Title">' + name + '</span>');
					str.push(CSSData[name]);
				}
				echo(str.join('\n'),true);
			} else if (args.arguments.length == 1){
				var arg = args.arguments[0];
				if (arg == 'clear'){
					for (var name in CSSData){
						manager.unload(getURIFromCSS(CSSData[name]));
						delete CSSData[name];
					}
				} else if (arg in CSSData){
					echo('<span class="hl-Title">' + rel.args[0] + '</span>\n' + CSSData[rel.args[0]], true);
				}
			} else if (args.arguments.length > 1){
				var groupName = args.arguments.shift();
				if (groupName == 'clear'){
					args.arguments.forEach(function(name){
						if (name in CSSData){
							manager.unload(getURIFromCSS(CSSData[name]));
							delete CSSData[name];
						}
					});
				} else {
					if (groupName in CSSData) manager.unload(getURIFromCSS(CSSData[groupName]));
					CSSData[groupName] = args.arguments.join(' ');
					manager.load(getURIFromCSS(CSSData[groupName]));
				}
			}
		},{
			completer: function(aFilter){
				var rel = commands.parseArgs(aFilter,null,"*");
				var list1 = [ ['clear', 'clear all or specified group'] ];
				var list2 = [];
				if (!rel){
					for (var name in CSSData){
						list2.push([name, CSSData[name]]);
					}
					return [0,list1.concat(list2)];
				}
				if (rel.arguments.length == 2 && rel.arguments[0] == 'clear'){
					for (var name in CSSData){
						if (name.indexOf(rel.arguments[1]) == 0) list2.push([name, CSSData[name]]);
					}
					return [6, list2];
				} else if (rel.args.length == 1){
					for (var name in CSSData){
						if (name.indexOf(rel.arguments[0]) == 0) list2.push([name, CSSData[name]]);
					}
					if ('clear'.indexOf(rel.arguments[0]) == 0)
						return [0, list1.concat(list2)];
					else
						return [0, list2];
				}
			},
			argCount: '*'
		}
	);
	init();
	return manager;
})();

})();

// vim: sw=4 ts=4 sts=0 fdm=marker:
