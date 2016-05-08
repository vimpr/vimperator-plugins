// INFO {{{
let PLUGIN_INFO = xml`
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
		// urlを取得
		const url = window.content.window.location;
		// google検索か判定
		if (url.host !== 'www.google.co.jp') {
			return original.action.apply(this, arguments);
		}

		// クエリ部の抜き出し
		const q = url.href.match(/[?&]q=(.*?)&/);
		// コマンドの引数
		// foo+bar+hogeの形で取得されるので'+'を' 'で置き換え
		const commandPram = decodeURIComponent(q[1]).replace(/\+/g, ' ');

		// コマンドの生成
		const command = 'open ' + commandPram;
		commandline.open('', commands.commandToString({command: command}), modes.EX);
	});
})();
