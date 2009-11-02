var PLUGIN_INFO =
<VimperatorPlugin>
	<name>{NAME}</name>
	<description>Add Hatena Star.</description>
	<description lang="ja">はてなスターをつける。</description>
	<author mail="mattn.jp@gmail.com">mattn</author>
	<version>0.1.3</version>
	<minVersion>2.3pre</minVersion>
	<maxVersion>2.3pre</maxVersion>
	<updateURL>http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/hatenaStar.js</updateURL>
</VimperatorPlugin>;
(function() {

const Cc = Components.classes;
const Ci = Components.interfaces;
const StarXPath = './/img[contains(concat(" ", @class, " "), " hatena-star-add-button ")]';
var flasher = null;

var nmap = (liberator.globalVariables.hatena_star_mappings || ',?s').split(/\s+/);
var hmap = liberator.globalVariables.hatena_star_hint_mapping || 'h';
var hmax = function () parseInt(liberator.globalVariables.hatena_star_hint_max || '10', 10);
var hinterval = function () parseInt(liberator.globalVariables.hatena_star_interval || '100', 10);

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
		liberator.echoerr('Hatena Star not found');
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
	var e = document.createEvent('MouseEvents');
	// "Hatena.Star.AddButton.selectedText" is initialized on mouseover.
	e.initMouseEvent('mouseover', true, true, window, 1, 10, 50, 10, 50, 0, 0, 0, 0, 1, elem);
	elem.dispatchEvent(e);
	e.initMouseEvent('click', true, true, window, 1, 10, 50, 10, 50, 0, 0, 0, 0, 1, elem);
	elem.dispatchEvent(e);
}

liberator.modules.commands.addUserCommand(['hatenastar', 'hatenas'], 'add Hatena Star',
	function (args) {
		try {
			var arg = args.string;
			let result = util.evaluateXPath(StarXPath);
			let m      = arg.match(/^(\d+)\?$/);
			if (m) {
				blink(result.snapshotItem(Number(m[1])-1));
				return;
			}
			for (let i = 0, l = result.snapshotLength; i < l; i++) {
				if (arg == '' || arg == 'all' || arg == (i+1)) {
					addHatenaStar(result.snapshotItem(i));
				}
			}
		} catch (e) { liberator.echoerr('hatenaStar: ' + e); }
	}
);

liberator.modules.mappings.addUserMap([liberator.modules.modes.NORMAL], nmap, 'add Hatena Star',
	function (count) {
		try {
			for (let n = 0; n++ < count; liberator.modules.commands.get('hatenastar').execute("all", false, count));
		} catch (e) { liberator.echoerr('hatenaStar: ' + e); }
	}, {
		noremap: true,
		count: true
	}
);

liberator.modules.hints.addMode(hmap, 'Add Hatena star',
	function (elem, _, count) {
		count = Math.min(hmax(), Math.max(count, 1)) - 1;
		addHatenaStar(elem);
		let handle = setInterval(function () {
			if (count-- > 0)
				addHatenaStar(elem);
			else
				clearInterval(handle);
		}, hinterval());
	},
	function () StarXPath
);

})();

// vim: set noet :
