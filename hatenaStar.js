/**
 * For Vimperator 0.7.0
 * @author mattn mattn.jp@gmail.com
 */

(function(){

const Cc = Components.classes;
const Ci = Components.interfaces;
var flasher = null;

function getFlasher(){
	if (!flasher){
		flasher = Cc['@mozilla.org/inspector/flasher;1'].createInstance(Ci.inIFlasher);
		flasher.color = '#FF0000';
		flasher.thickness = 2;
	}
	return flasher;
}

function blink(aNode){
	if (!aNode) {
		liberator.echoerr('hatenastar not found');
		return;
	}
	if (aNode.nodeType == 3) aNode = aNode.parentNode;
	var toggle = true;
	var flasher = getFlasher();
	for (var i=1; i<7; ++i){
		setTimeout(function() {
			if (toggle) flasher.drawElementOutline(aNode);
			else        flasher.repaintElement(aNode);
			toggle = !toggle;
		}, i * 100);
	}
}

liberator.modules.commands.addUserCommand(['hatenastar', 'hatenas'], 'add Hatena Star',
	function (arg, special) {
		try {
			arg = arg.string;
			var result = buffer.evaluateXPath('.//img[contains(concat(" ", @class, " "), " hatena-star-add-button ")]');
			if (arg.match(/^(\d+)\?$/)) {
				blink(result.snapshotItem(Number(RegExp.$1)-1));
				return;
			}
			for (var i = 0, l = result.snapshotLength; i < l; i++) {
				if (arg == '' || arg == 'all' || arg == (i+1)) {
					var s = result.snapshotItem(i);
					var e = document.createEvent('MouseEvents');
					e.initMouseEvent('click', true, true, window, 1, 10, 50, 10, 50, 0, 0, 0, 0, 1, s);
					s.dispatchEvent(e);
				}
			}
		} catch (e) { liberator.echoerr('hatenaStar: ' + e); }
	}, {
		bang: true,
		count: true
	}
);

liberator.modules.mappings.addUserMap([liberator.modules.modes.NORMAL], [',?s'], 'add Hatena Star',
	function (count) {
		try {
			for (var n = 0; n++ < count; liberator.modules.commands.get('hatenastar').execute("all", false, count));
		} catch (e) { liberator.echoerr('hatenaStar: ' + e); }
	}, {
		noremap: true,
		flags: liberator.modules.Mappings.flags.COUNT
	}
);

})();
