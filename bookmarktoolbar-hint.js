// ==VimperatorPlugin==
// @name           BookmarksToolbar-Hint
// @description    Feature the BookmarksToolbar-Hint
// @description-ja ブックマークツールバーのヒント機能を提供
// @version        0.2a
// ==/VimperatorPlugin==
//
// Usage:
// 
// <Leader>f   -> open current tab
// <Leader>F   -> open new tab
//
// Note: <Leader>はデフォルトでは`\'になっています

liberator.plugins.bookmarkToolbarHints = (function(){
	function $(id){
		return document.getElementById(id);
	}
	function createTooltip(){
		var tooltip = document.createElement('tooltip');
		tooltip.setAttribute('style','padding:0');
		var label = document.createElement('label');
		label.setAttribute('value',tooltipbox.childNodes.length+1);
		tooltip.appendChild(label);
		tooltipbox.appendChild(tooltip);
		return tooltip;
	}
	function clearTooltips(){
		while(tooltipbox.hasChildNodes()){
			tooltipbox.firstChild.hidePopup();
			tooltipbox.removeChild(tooltipbox.firstChild);
		}
	}
	function getToolbar(){
		if (toolbar)
			return toolbar;
		else
			toolbar = $('bookmarksBarContent');

		return toolbar;
	}
	function onKeyPress(event){
		manager.onEvent(event);
	}
	function allHidePopup(node){
		if (node.hidePopup) node.hidePopup();
		if (node.parentNode) allHidePopup(node.parentNode);
	}
	function toolbarOpen(target){
		if (target.getAttribute('container') == 'true'){
			target.firstChild.showPopup();
			liberator.plugins.bookmarkToolbarHints.hide();
			liberator.plugins.bookmarkToolbarHints.show(target.firstChild);
			return true;
		} else {
			liberator.open(target.node.uri, where);
		}
		return false;
	}
	var hints = [];
	var toolbar;
	var current;
	var currentNum = 0;
	var focusNum = 0;
	var where = liberator.CURERNT_TAB;
	var manager = {
		get toolbar(){
			return getToolbar();
		},
		go : null,
		get where(){ return where; },
		set where(value){ where = value; },
		show:function(node){
			liberator.modes.set(liberator.modes.CUSTOM, liberator.modes.QUICK_HINT);
			hints = [];
			window.addEventListener('keypress',onKeyPress,true);
			current = node || getToolbar();
			for (var i=0; i<current.childNodes.length; i++){
				var button = current.childNodes[i];
				if (button.localName == "menuseparator") continue;
				hints.push(button);
				var tooltip = createTooltip();
				//tooltip.showPopup(button, button.boxObject.screenX, button.boxObject.screenY);
				tooltip.showPopup(button, -1, -1,"tooltip","topright");
			}
		},
		onEvent: function(event){
			var key = liberator.events.toString(event);
			var num;
			switch(key){
				case "<Esc>":
				case "<C-[>":
					allHidePopup(current);
					liberator.options.guioptions= liberator.plugins.bookmarkToolbarHints.go;
					break;
				case "<Return>":
					//if (toolbarOpen(current.childNodes[focusNum])) return;
					if (toolbarOpen(hints[focusNum])) return;
					break;
				case "<Tab>":
				case "<S-Tab>":
					break;
				default:
					if (/^[0-9]$/.test(key)){
						num = parseInt(key,10);
						if (currentNum) num += currentNum * 10;

						//if (current.childNodes.length >= num*10){
						if (hints.length >= num*10){
							currentNum = num;
							forcusNum = num;
							return;
						}
						//if (current.childNodes[num-1]){
						if (hints[num-1]){
							//if (toolbarOpen(current.childNodes[num-1])) return;
							if (toolbarOpen(hints[num-1])) return;
						}
					}
			}
			liberator.plugins.bookmarkToolbarHints.hide();

		},
		hide: function(){
			currentNum = 0;
			focusNum = 0;
			window.removeEventListener('keypress',onKeyPress,true);
			liberator.modes.reset(true);
			var tooltipbox = document.getElementById('liberator-tooltip-container');
			while(tooltipbox.hasChildNodes()){
				tooltipbox.firstChild.hidePopup();
				tooltipbox.removeChild(tooltipbox.firstChild);
			}
			//clearTooltips();
		}
	};
	var tooltipbox = document.createElement('box');
	tooltipbox.setAttribute('id','liberator-tooltip-container');
	$('liberator-container').appendChild(tooltipbox);
	return manager;
})();

liberator.modes.setCustomMode('BookmarksToolbar-Hint', plugins.bookmarkToolbarHints.onEvent, plugins.bookmarkToolbarHints.hide);
liberator.mappings.addUserMap([liberator.modes.NORMAL], ['<Leader>f'],
	'Start Toolbar-HINTS (open current tab)',
	function(){
		plugins.bookmarkToolbarHints.go = options.guioptions;
		options.guioptions += "b";
		plugins.bookmarkToolbarHints.where = liberator.CURRENT_TAB;
		plugins.bookmarkToolbarHints.show();
	}
);
liberator.mappings.addUserMap([liberator.modes.NORMAL], ['<Leader>F'],
	'Start Toolbar-HINTS (open new tab)',
	function(){
		plugins.bookmarkToolbarHints.go = options.guioptions;
		options.guioptions += "b";
		plugins.bookmarkToolbarHints.where = liberator.NEW_TAB;
		plugins.bookmarkToolbarHints.show();
	}
);
//$("liberator-container").* += <tooltip id="liberator-tooltip"><label id="liberator-tooltip-text" value=""/></tooltip>;

