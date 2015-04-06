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
    mappings.addUserMap(
      [modes.NORMAL],['o'],':open',
      function() { 
        // urlを取得
        var url = window.content.window.location;
        // コマンドの引数
        var commandPram = '';
        // google検索か判定
        if(url.host === 'www.google.co.jp') {
          // クエリ部の抜き出し
          var q = decodeURI(url.href).match(/q=(.*?)&/);
          // foo+bar+hogeの形で取得されるので'+'を' 'で置き換え
          var commandPram = q[1].replace(/\+/g,' ');
        }
        // コマンドの生成
        var command = 'open ' + commandPram;
        commandline.open('',
          commands.commandToString(
            {
              command: command
            }
        ),modes.EX);
      }
    );
})();

// vim:sw=2 ts=2 et si fdm=marker:
