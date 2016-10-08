/**
 * ==VimperatorPlugin==
 * @name           adddialog.js
 * @description    Add/Delete a :dialog argument.
 * @description-ja :dialog コマンドで開けるダイアログを追加/削除する。
 * @author         AmaiSaeta <amaisaeta@gmail.com>
 * @version        1.01.20091226
 * @minVersion     2.1
 * @maxVersion     2.1
 * ==/VimperatorPlugin==
 */
/* {{{ License
The MIT License

Copyright (c) 2009 AmaiSaeta

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
   }}} */

var PLUGIN_INFO = xml` // {{{
<VimperatorPlugin>
<name>{NAME}</name>
<description>Add/Delete a :dialog argument.</description>
<description lang="ja">:dialogコマンドで開けるダイアログを追加/削除する。</description>
<version>1.00.20091021</version>
<author mail="amaisaeta@gmail.com" homepage="http://amaisaeta.seesaa.net/">AmaiSaeta</author>
<license>MIT License</license>
<minVersion>2.1</minVersion>
<maxVersion>2.1</maxVersion>
<detail lang="ja"><![CDATA[
== 概要 ==
:dialog コマンドで開けるダイアログを追加/削除する。

== 使用法 ==
:adddia[log] name {description} uri
	uriが指し示すダイアログを、 :dialog name で開けるようにする。
	descriptionで説明文を指定する事も可能。

:deldia[log] name
	nameという名前のダイアログを、 :dialog の候補から削除する。

== 用法 ==
>||
:adddialog gmmanage "Greasemonkeyの『ユーザスクリプトの管理』ダイアログを開く" chrome://greasemonkey/content/manage.xul 

:deldialog gmmanage
||<
]]></detail>
</VimperatorPlugin>`;
/// }}}

liberator.plugins.adddialog = (function(args) { // {{{
	var name, desc, uri;

	if(args.length < 2) {
		liberator.echoerr("The arguments is not worth.", commandline.APPEND_TO_MESSAGES);
		return;
	}

	if(args.length == 2) { // omitted description.
		name = args[0];
		desc = args[1];
		uri  = args[1];
	} else {
		name = args[0];
		desc = args[1];
		uri  = args[2];
	}
	config.dialogs.push([name, desc, function() openDialog(uri, "_blank")]);
});
/// }}}

liberator.plugins.deldialog = function(args) { // {{{
	var index, dialogLen = config.dialogs.length;
	var i;

	if(args.length < 1) {
		liberator.echoerr("The argument is not worth.");
		return;
	}

	for(index = 0; index < dialogLen; ++index) {
		if(config.dialogs[index][0] === args[0]) { // found!
			for(var i = index + 1; i < dialogLen; ++i) {
				config.dialogs[i - 1] = config.dialogs[i];
			}
			config.dialogs.pop();
			return;	// success deleted
		}
	}
	liberator.echoerr("'" + args[0] + "' dialog is not found."); // not found
};
/// }}}

commands.addUserCommand(['adddia[log]'], 'Add a new :dialog argument.', liberator.plugins.adddialog);
commands.addUserCommand(['deldia[log]'], 'Delete a :dialog argument.', liberator.plugins.deldialog);

// vim: set autoindent tabstop=4 shiftwidth=4 softtabstop=4 textwidth=0 foldmethod=marker :
