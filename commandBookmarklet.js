/**
 * bookmarklet wo command ni suru plugin
 *
 * @author halt feits <halt.feits@gmail.com>
 * @version 0.6.2
 */

let PLUGIN_INFO = 
<VimperatorPlugin>
<name>{NAME}</name>
<description>convert bookmarklets to command</description>
<description lang="ja">ブックマークレットをコマンドにする</description>
<author mail="halt.feits@gmail.com">halt feits</author>
<version>0.6.2</version>
<minVersion>2.0pre</minVersion>
<maxVersion>2.0pre</maxVersion>
<detail><![CDATA[
== SYNOPSIS ==
This plugin automatically convert bookmarklets to valid command for vimperator.

== COMMAND ==
Nothing built-in command, but each bookmarklets convert to commands that start with "bml".

== EXAMPLE ==
"Hatena-Bookmark" -> bmlhatena-bookmark

== KNOWN BUGS ==
When title has non-ASCII characters, it convert to unaccountable command.
You should rewrite title of bookmarklet to ASCII characters, to escape this bug.

]]></detail>
<detail lang="ja"><![CDATA[
== SYNOPSIS ==
このプラグインはブックマークレットを vimpertor で実行可能なコマンドに自動的に変換します。

== COMMAND ==
固有のコマンドはありませんが、それぞれのブックマークレットは "bml" ではじまるコマンドに変換されます。

== EXAMPLE ==
"Hatena-Bookmark" -> bmlhatena-bookmark

== KNOWN BUGS ==
タイトルに ASCII 文字以外が含まれている場合、わけのわからないコマンドになります。
このバグを避けるためにブックマークレットのタイトルを ASCII 文字のみに書き換えることをおすすめします。

]]></detail>
</VimperatorPlugin>;

( function () {

let items = bookmarks.get('javascript:');
if (!items.length) {
    liberator.echoerr('No bookmarks set');
    return;
}

for (let item in util.Array.iterator(items)) {
    commands.addUserCommand(
        [toValidCommandName(item.title)],
        'bookmarklet : ' + item.title,
        function () { liberator.open(item.url); },
        { shortHelp: 'Bookmarklet' },
        false
    );
}

function toValidCommandName(str) {
    str = 'bml' + escape(str.replace(/ +/g, '').toLowerCase()).replace(/[^a-zA-Z]/g,'');
    return str.substr(0, str.length > 50 ? 50 : str.length);
}

} )();
// vim:sw=2 ts=2 et:
