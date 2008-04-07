/**
 * For vimperator 0.6.0
 * @author mattn mattn.jp@gmail.com
 */

(function(){

liberator.commands.addUserCommand(['hatenastar','hatenas'], 'add hatena star',
	function (arg, special) {
		try {
			var result = liberator.buffer.evaluateXPath('.//img[@class="hatena-star-add-button"]');
			for (var i = 0; i < result.snapshotLength; i++){
				if (arg == 'all' || arg == (i+1)) {
					var s = result.snapshotItem(i);
					var e = document.createEvent('MouseEvents');
					e.initMouseEvent('click', true, true, window, 1, 10, 50, 10, 50, 0, 0, 0, 0, 1, s);
					s.dispatchEvent(e);
				}
			}
		} catch (e) { liberator.echoerr('hatenastar: ' + e); }
	}
);

liberator.mappings.addUserMap([liberator.modes.NORMAL], [',?s'], 'add hatena star',
	function(count){
		try {
			for (var n = 0; n < count; n++) liberator.commands.get('hatenastar').execute("all", false, count);
		} catch (e) { liberator.echoerr('hatenastar: ' + e); }
	}, {
		noremap: true,
		flags: liberator.Mappings.flags.COUNT 
	}
);

})();
