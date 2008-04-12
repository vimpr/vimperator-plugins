/**
 * For Vimperator 0.6.0
 * @author mattn mattn.jp@gmail.com
 */

(function(){

liberator.commands.addUserCommand(['hatenastar', 'hatenas'], 'add Hatena Star',
	function (arg, special) {
		try {
			var result = liberator.buffer.evaluateXPath('.//img[contains(concat(" ", normalize-space(@class), " "), " hatena-star-add-button ")]');
			for (var i = 0, l = result.snapshotLength; i < l; i++) {
				if (arg == '' || arg == 'all' || arg == (i+1)) {
					var s = result.snapshotItem(i);
					var e = document.createEvent('MouseEvents');
					e.initMouseEvent('click', true, true, window, 1, 10, 50, 10, 50, 0, 0, 0, 0, 1, s);
					s.dispatchEvent(e);
				}
			}
		} catch (e) { liberator.echoerr('hatenaStar: ' + e); }
	}
);

liberator.mappings.addUserMap([liberator.modes.NORMAL], [',?s'], 'add Hatena Star',
	function (count) {
		try {
			for (var n = 0; n++ < count; liberator.commands.get('hatenastar').execute("all", false, count));
		} catch (e) { liberator.echoerr('hatenaStar: ' + e); }
	}, {
		noremap: true,
		flags: liberator.Mappings.flags.COUNT
	}
);

})();
