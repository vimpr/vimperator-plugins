
liberator.plugins.bookmarkToolbarHints = (function(){
	function $(id){
		return document.getElementById(id);
	}
	function createTooltip(){
		var tooltip = document.createElement('tooltip');
		//tooltip.setAttribute('id','liberator-tooltip');
		var label = document.createElement('label');
		//label.setAttribute('id','liberator-tooltip-text');
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
	var hints = [];
	var toolbar;
	var current;
	var manager = {
		get toolbar(){
			return getToolbar();
		},
		go : null,
		show:function(node){
			liberator.modes.set(liberator.modes.CUSTOM, liberator.modes.QUICK_HINT);
			window.addEventListener('keypress',onKeyPress,true);
			current = node || getToolbar();
			for (var i=0; i<current.childNodes.length; i++){
				var button = current.childNodes[i];
				var tooltip = createTooltip();
				//tooltip.showPopup(button, button.boxObject.screenX, button.boxObject.screenY);
				tooltip.showPopup(button, -1, -1,"tooltip","topright");
			}
		},
		onEvent: function(event){
			var key = liberator.events.toString(event);
			if (key == "<Esc>" || key == "<C-[>"){
				allHidePopup(current);
				liberator.options.guioptions= liberator.plugins.bookmarkToolbarHints.go;
			}
			key = parseInt(key,10)
			if (!isNaN(key) && key-1 in current.childNodes){
				key -= 1;
				if(current.childNodes[key].getAttribute('container') == 'true'){
					current.childNodes[key].firstChild.showPopup();
					liberator.plugins.bookmarkToolbarHints.hide();
					liberator.plugins.bookmarkToolbarHints.show(current.childNodes[key].firstChild);
					return;
				} else {
					current.childNodes[key].click();
				}
			}
			liberator.plugins.bookmarkToolbarHints.hide();
		},
		hide: function(){
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

liberator.modes.setCustomMode('Toolbar-HINTS', plugins.bookmarkToolbarHints.onEvent, plugins.bookmarkToolbarHints.hide);
liberator.mappings.addUserMap([liberator.modes.NORMAL], ['\\'],
	'Start Toolbar-HINTS',
	function(){
		plugins.bookmarkToolbarHints.go = options.guioptions;
		options.guioptions += "b";
		plugins.bookmarkToolbarHints.show();
	}
);
//$("liberator-container").* += <tooltip id="liberator-tooltip"><label id="liberator-tooltip-text" value=""/></tooltip>;

