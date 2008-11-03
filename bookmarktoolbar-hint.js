// ==VimperatorPlugin==
// @name           BookmarksToolbar-Hint
// @description    Feature the BookmarksToolbar-Hint
// @description-ja ブックマークツールバーのヒント機能を提供
// @version        0.2c
// ==/VimperatorPlugin==
//
// Usage:
// 
// <Leader>f   -> open current tab
// <Leader>F   -> open new tab
//
// Note: <Leader> is `\' by default
//
// duaing BookmarksToolbar-Hint, numbering tooltip is appear.
// the item of matched number will open when type the number
// and <BS> remove pending number or backward to parent (at opening a folder)
//

liberator.plugins.bookmarkToolbarHints = (function(){
	if (typeof plugins == 'undefined') plugins = liberator.plugins; // for 2.0 pre
	function createTooltip(){
		var tooltip = document.createElement('tooltip');
		tooltip.setAttribute('style','padding:0;margin:0;');
		var label = document.createElement('label');
		label.setAttribute('value',tooltipbox.childNodes.length+1);
		label.setAttribute('style','padding:0;margin:0 2px;');
		tooltip.appendChild(label);
		tooltipbox.appendChild(tooltip);
		return tooltip;
	}
	function clearTooltips(){
		while (tooltipbox.hasChildNodes()){
			tooltipbox.firstChild.hidePopup();
			tooltipbox.removeChild(tooltipbox.firstChild);
		}
	}
	function getToolbar() toolbar || (toolbar = document.getElementById('bookmarksBarContent'));
	function onKeyPress(event){
		manager.onEvent(event);
		event.stopPropagation();
		event.preventDefault();
	}
	function updateSelector(){
		for (let i=0; i<tooltipbox.childNodes.length; i++){
			tooltipbox.childNodes[i].style.color = (i+1).toString().indexOf(currentNum+1) == 0 ? "red" : "black";
		}
	}
	function itemOpen(target){
		if (target.hasAttribute('oncommand')){
			let fn = new Function("event", target.getAttribute("oncommand"));
			if (where == liberator.CURRENT_TAB)
				fn.call(target, {button:0, ctrlKey:false});
			else
				fn.call(target, {button:1, ctrlKey:true});
		} else {
			liberator.open(target.node.uri, where);
		}
		closeMenus(target);
		liberator.modules.options.guioptions = manager.go;
	}
	function folderOpen(target){
		target.firstChild.showPopup();
		manager.quit();
		manager.show(target.firstChild);
	}
	function toolbarOpen(target){
		if (target.getAttribute('container') == 'true'){
			folderOpen(target);
			return true;
		} else {
			itemOpen(target);
		}
		return false;
	}
	var hints = [];
	var toolbar;
	var current;
	var currentNum = 0;
	var useShift = false;
	var where = liberator.CURERNT_TAB;
	var manager = {
		get toolbar() getToolbar(),
		go: null,
		get where(){ return where; },
		set where(value){ where = value; },
		startup: function(where){
			this.go = options.guioptions;
			options.guioptions += "b";
			this.where = where;
			liberator.modules.modes.setCustomMode('BookmarksToolbar-Hint', function(){return;}, this.quit);
			this.show();
		},
		show:function(node){
			liberator.modules.modes.set(liberator.modules.modes.CUSTOM,liberator.modules.modes.QUICK_HINT);
			hints = [];
			window.addEventListener('keypress',onKeyPress,true);
			current = node || getToolbar();
			for (let i=0,l=current.childNodes.length; i<l; i++){
				let button = current.childNodes[i];
				if (button.localName == "menuseparator") continue;
				hints.push(button);
				let tooltip = createTooltip();
				tooltip.showPopup(button, -1, -1,"tooltip","topleft","topright");
			}
			updateSelector();
		},
		onEvent: function(event){
			var key = liberator.modules.events.toString(event);
			switch(key){
				case "<Esc>":
				case "<C-[>":
					closeMenus(current);
					liberator.modules.options.guioptions = this.go;
					break;
				case "<Return>":
				case "<Right>":
					if (toolbarOpen(hints[currentNum])) return;
					break;
				case "f":
					this.where = liberator.CURRENT_TAB;
					return;
				case "F":
				case "t":
					this.where = liberator.NEW_TAB;
					return;
				case "<Tab>":
				case "j":
				case "<Down>":
				case "<S-Tab>":
				case "k":
				case "<Up>":
					if (key == "j" || key == "<Tab>" || key == "<Down>"){
						currentNum = hints.length -1 == currentNum ? 0 : currentNum + 1;
					} else {
						currentNum = currentNum == 0 ? hints.length -1 : currentNum - 1;
					}
					useShift = true;
					updateSelector();
					return;
				case "l":
					if (hints[currentNum].getAttribute("container") == "true"){
						folderOpen(hints[currentNum]);
					}
					return;
				case "<BS>":
					if (key == "<BS>" && currentNum > 0){
						currentNum = Math.floor(currentNum / 10);
						updateSelector();
						return;
					}
				case "h":
					if (current == this.toolbar){
						closeMenus(current);
						liberator.modules.options.guioptions = this.go;
						this.quit();
					} else {
						current.hidePopup();
						clearTooltips();
						this.show(current.parentNode.parentNode);
					}
					return;
				default:
					if (/^[0-9]$/.test(key)){
						let num = parseInt(key,10);
						if (!useShift && currentNum) num += currentNum * 10;

						if (hints.length >= num*10){
							currentNum = num - 1;
							updateSelector();
							return;
						}
						if (hints[num-1]){
							if (toolbarOpen(hints[num-1])) return;
						}
					}
			}
			liberator.plugins.bookmarkToolbarHints.quit();

		},
		quit: function(){
			currentNum = 0;
			useShift = false;
			window.removeEventListener('keypress',onKeyPress,true);
			liberator.modules.modes.reset(true);
			while (tooltipbox.hasChildNodes()){
				tooltipbox.firstChild.hidePopup();
				tooltipbox.removeChild(tooltipbox.firstChild);
			}
		}
	};
	var tooltipbox = document.createElement('box');
	tooltipbox.setAttribute('id','liberator-tooltip-container');
	//document.getElementById('liberator-container').appendChild(tooltipbox);
	document.getElementById('browser').appendChild(tooltipbox);
	return manager;
})();

liberator.modules.mappings.addUserMap([liberator.modules.modes.NORMAL], ['<Leader>f'],
	'Start Toolbar-HINTS (open current tab)',
	function(){ liberator.plugins.bookmarkToolbarHints.startup(liberator.CURRENT_TAB); },
	{ rhs: 'Bookmarks Toolbar-HINTS (current-tab)'}
);
liberator.modules.mappings.addUserMap([liberator.modules.modes.NORMAL], ['<Leader>F'],
	'Start Toolbar-HINTS (open new tab)',
	function(){ liberator.plugins.bookmarkToolbarHints.startup(liberator.NEW_TAB); },
	{ rhs: 'Bookmarks Toolbar-HINTS (new-tab)' }
);

