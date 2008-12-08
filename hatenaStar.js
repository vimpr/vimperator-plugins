/**
 * For Vimperator 2.0pre
 * @author mattn mattn.jp@gmail.com
 */

(function() {

const Cc = Components.classes;
const Ci = Components.interfaces;
const StarXPath = './/img[contains(concat(" ", @class, " "), " hatena-star-add-button ")]';
var flasher = null;

var nmap = (liberator.globalVariables.hatena_star_mappings || ',?s').split(/\s+/);
var hmap = liberator.globalVariables.hatena_star_hint_mapping || 'h';
var hmax = parseInt(liberator.globalVariables.hatena_star_hint_max || '10', 10);

function getFlasher() {
	if (!flasher) {
		flasher = Cc['@mozilla.org/inspector/flasher;1'].createInstance(Ci.inIFlasher);
		flasher.color = '#FF0000';
		flasher.thickness = 2;
	}
	return flasher;
}

function blink(aNode) {
	if (!aNode) {
		liberator.echoerr('hatenastar not found');
		return;
	}
	if (aNode.nodeType == 3) aNode = aNode.parentNode;
	var toggle = true;
	var flasher = getFlasher();
	for (let i=1; i<7; ++i) {
		setTimeout(function() {
			if (toggle) flasher.drawElementOutline(aNode);
			else        flasher.repaintElement(aNode);
			toggle = !toggle;
		}, i * 100);
	}
}

function addHatenaStar (elem) {
	let e = document.createEvent('MouseEvents');
	e.initMouseEvent('click', true, true, window, 1, 10, 50, 10, 50, 0, 0, 0, 0, 1, elem);
	elem.dispatchEvent(e);
}

liberator.modules.commands.addUserCommand(['hatenastar', 'hatenas'], 'add Hatena Star',
	function (arg, special) {
		try {
			arg = arg.string;
			let result = buffer.evaluateXPath(StarXPath);
			if (arg.match(/^(\d+)\?$/)) {
				blink(result.snapshotItem(Number(RegExp.$1)-1));
				return;
			}
			for (let i = 0, l = result.snapshotLength; i < l; i++) {
				if (arg == '' || arg == 'all' || arg == (i+1)) {
					addHatenaStar(result.snapshotItem(i));
				}
			}
		} catch (e) { liberator.echoerr('hatenaStar: ' + e); }
	}, {
		bang: true,
		count: true
	}
);

liberator.modules.mappings.addUserMap([liberator.modules.modes.NORMAL], nmap, 'add Hatena Star',
	function (count) {
		try {
			for (let n = 0; n++ < count; liberator.modules.commands.get('hatenastar').execute("all", false, count));
		} catch (e) { liberator.echoerr('hatenaStar: ' + e); }
	}, {
		noremap: true,
		flags: liberator.modules.Mappings.flags.COUNT
	}
);

liberator.modules.hints.addMode(hmap, 'Add hatena star',
	function (elem, _, count) {
    for (let i = 0; i < Math.min(hmax, Math.max(count, 1)); i++)
			addHatenaStar(elem);
	},
	function () StarXPath
);

})();

