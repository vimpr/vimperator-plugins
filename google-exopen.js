// INFO {{{
var PLUGIN_INFO = xml`
<VimperatorPlugin>
<name>google-exopen</name>
<description>useful in google search</description>
<description lang="ja">openを拡張し前回のGoogle検索クエリを入力済みにする</description>
<author>akameco</author>
<license>New BSD License</license>
<version>0.1</version>
</VimperatorPlugin>`;
// }}}

(function () {
	const original = mappings.getDefault(modes.NORMAL, 'o');

	mappings.addUserMap([modes.NORMAL], ['o'], ':open', () => {
		const location = window.content.window.location;

		// google検索か判定
		if (!/www.google/.test(location.host)) {
			return original.action.apply(this, arguments);
		}

		const str = location.hash.length === 0 ? location.search : location.hash;
		const query = str.replace(/^(\?|#|&)/, '');

		let ret = {};
		query.split('&').forEach(param => {
			const parts = param.replace(/\+/g, ' ').split('=');
			const key = parts.shift();
			const val = decodeURIComponent(parts) || '';
			ret[key] = val;
		});

		if (ret.q) {
			commandline.open('', commands.commandToString({command: `open ${ret.q}`}), modes.EX);
		} else {
			original.action.apply(this, arguments);
		}
	});
})();
