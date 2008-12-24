/**
 * bookmarklet wo command ni suru plugin
 *
 * @author halt feits <halt.feits@gmail.com>
 * @version 0.6.3
 */

let PLUGIN_INFO =
<VimperatorPlugin>
<name>{NAME}</name>
<description>convert bookmarklets to commands</description>
<description lang="ja">ブックマークレットをコマンドにする</description>
<author mail="halt.feits@gmail.com">halt feits</author>
<version>0.6.3</version>
<minVersion>2.0pre</minVersion>
<maxVersion>2.0pre</maxVersion>
<updateURL>http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/commandBookmarklet.js</updateURL>
<detail><![CDATA[
== SYNOPSIS ==
This plugin automatically converts bookmarklets to valid commands for Vimperator.

== COMMAND ==
Nothing built-in command, but each bookmarklets convert to commands that start with "bml".

== EXAMPLE ==
"Hatena-Bookmark" -> bmlhatena-bookmark

== GLOBAL VARIABLES ==
command_bookmarklet_prefix:
This variable determines the prefix of a command name.

== KNOWN ISSUES ==
When title has non-ASCII characters, it converts to unaccountable command.
You should rewrite title of bookmarklet to ASCII characters, to escape this issue.

]]></detail>
<detail lang="ja"><![CDATA[
== SYNOPSIS ==
このプラグインはブックマークレットを Vimperator で実行可能なコマンドに自動的に変換します。

== COMMAND ==
固有のコマンドはありませんが、それぞれのブックマークレットは "bml" ではじまるコマンドに変換されます。

== EXAMPLE ==
"Hatena-Bookmark" -> bmlhatena-bookmark

== GLOBAL VARIABLES ==
command_bookmarklet_prefix:
コマンドの先頭に付加される文字列を規定します。
デフォルトは "bml"

== KNOWN ISSUES ==
タイトルに ASCII 文字以外が含まれている場合、わけのわからないコマンドになります。
この問題を避けるためにブックマークレットのタイトルを ASCII 文字のみに書き換えることをおすすめします。

]]></detail>
</VimperatorPlugin>;

( function () {

let prefix = liberator.globalVariables.command_bookmarklet_prefix;
if (prefix === undefined)
  prefix = 'bml';

let items = bookmarks.get('javascript:');
if (!items.length) {
    liberator.echoerr('No bookmarks set');
    return;
}

items.forEach(function (item) {
    commands.addUserCommand(
        [toValidCommandName(item.title)],
        'bookmarklet : ' + item.title,
        function () { liberator.open(item.url); },
        { shortHelp: 'Bookmarklet' },
        false
    );
});

function toValidCommandName(str) {
    str = prefix + escape(str.replace(/ +/g, '').toLowerCase()).replace(/[^a-zA-Z]+/g,'');
    return str.substr(0, str.length > 50 ? 50 : str.length);
}

} )();
// vim:sw=2 ts=2 et:
