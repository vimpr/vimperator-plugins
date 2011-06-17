/**
 * bookmarklet wo command ni suru plugin
 *
 * @author halt feits <halt.feits@gmail.com>
 * @version 0.6.4
 */

let PLUGIN_INFO =
<VimperatorPlugin>
<name>{NAME}</name>
<description>convert bookmarklets to commands</description>
<description lang="ja">ブックマークレットをコマンドにする</description>
<author mail="halt.feits@gmail.com">halt feits</author>
<version>0.6.6</version>
<minVersion>2.0pre</minVersion>
<maxVersion>2.1pre</maxVersion>
<updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/commandBookmarklet.js</updateURL>
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
  command_bookmarklet_use_sandbox:
    When this variable is 1, execute the script of bookmarklets in Sandbox.
    If you use NoScript addon, probably you should enable this option.

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
  command_bookmarklet_use_sandbox:
    1 の時、ブックマークレットのスクリプトを sandbox で実行します。
    NoScript アドオンをつかっている場合は、このオプションを有効にする必要があるでしょう。

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
  let name = toValidCommandName(item.title);
  if (commands.get(name))
    return;
  commands.addUserCommand(
    [name],
    'bookmarklet : ' + item.title,
    function () evalScript(item.url),
    { shortHelp: 'Bookmarklet' },
    false
  );
});

function toBoolean (value, def) {
  switch (typeof value) {
    case 'undefined':
      return def;
    case 'number':
      return !!value;
    case 'string':
      return !/^(\d+|false)$/i.test(value) || parseInt(value);
    default:
      return !!value;
  }
}

function evalInSandbox (str) {
  let sandbox = new Components.utils.Sandbox("about:blank");
  sandbox.__proto__ = content.window.wrappedJSObject;
  return Components.utils.evalInSandbox(str, sandbox);
}

function evalScript (url) {
  if (toBoolean(liberator.globalVariables.command_bookmarklet_use_sandbox, false)) {
    evalInSandbox(decodeURIComponent(url.replace(/^\s*javascript:/i, '')));
  } else {
    liberator.open(url);
  }
}

function toValidCommandName(str) {
  str = prefix + escape(str.replace(/ +/g, '').toLowerCase()).replace(/[^a-zA-Z]+/g,'');
  return str.substr(0, str.length > 50 ? 50 : str.length);
}

} )();
// vim:sw=2 ts=2 et:
