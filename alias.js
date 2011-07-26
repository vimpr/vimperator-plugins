/* NEW BSD LICENSE {{{
Copyright (c) 2010, anekos.
All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

    1. Redistributions of source code must retain the above copyright notice,
       this list of conditions and the following disclaimer.
    2. Redistributions in binary form must reproduce the above copyright notice,
       this list of conditions and the following disclaimer in the documentation
       and/or other materials provided with the distribution.
    3. The names of the authors may not be used to endorse or promote products
       derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF
THE POSSIBILITY OF SUCH DAMAGE.


###################################################################################
# http://sourceforge.jp/projects/opensource/wiki/licenses%2Fnew_BSD_license       #
# に参考になる日本語訳がありますが、有効なのは上記英文となります。                #
###################################################################################

}}} */

// PLUGIN_INFO {{{
let PLUGIN_INFO =
<VimperatorPlugin>
  <name>alias</name>
  <name lang="ja">alias</name>
  <description>Define the alias for a command.</description>
  <description lang="ja">コマンドに別名(エイリアス|alias)をつける。</description>
  <version>1.0.0</version>
  <author mail="anekos@snca.net" homepage="http://d.hatena.ne.jp/nokturnalmortum/">anekos</author>
  <license>new BSD License (Please read the source code comments of this plugin)</license>
  <license lang="ja">修正BSDライセンス (ソースコードのコメントを参照してください)</license>
  <updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/alias.js</updateURL>
  <minVersion>2.3</minVersion>
  <maxVersion>2.3</maxVersion>
  <detail><![CDATA[
    :alias <new-command-name> <old-command-name>:
      Define the alias with <new-command-name> for the command <old-command-name>.
  ]]></detail>
  <detail lang="ja"><![CDATA[
    :alias <new-command-name> <old-command-name>:
      コマンド <old-command-name> に <new-command-name> という別名をつけます。
  ]]></detail>
</VimperatorPlugin>;
// }}}
// INFO {{{
let INFO =
<>
  <plugin name="alias" version="1.0.0"
          href="http://github.com/vimpr/vimperator-plugins/blob/master/alias.js"
          summary="Define the alias for a command."
          lang="en-US"
          xmlns="http://vimperator.org/namespaces/liberator">
    <author email="anekos@snca.net">anekos</author>
    <license>New BSD License</license>
    <project name="Vimperator" minVersion="2.3"/>
    <item>
      <tags>:alias</tags>
      <spec>:alias <a>newCommandName</a> <a>oldCommandName</a></spec>
      <description>
        <p>
          Define the alias with <a>newCommandName</a> for the command <a>oldCommandName</a>.
        </p>
      </description>
    </item>
    <h3 tag="alias-examples">alias examples for .vimperatorrc</h3>
    <p>If you input directly these commands in vimperator commandline, remove the ":lazy".</p>
    <code><ex>
:command! -nargs=+ lazy autocmd VimperatorEnter .* &lt;args>
:lazy alias newName oldCommandName
    </ex></code>
  </plugin>
  <plugin name="alias" version="1.0.0"
          href="http://github.com/vimpr/vimperator-plugins/blob/master/alias.js"
          summary="コマンドに別名(エイリアス|alias)をつける。"
          lang="ja"
          xmlns="http://vimperator.org/namespaces/liberator">
    <author email="anekos@snca.net">anekos</author>
    <license>New BSD License</license>
    <project name="Vimperator" minVersion="2.3"/>
    <item>
      <tags>:alias</tags>
      <spec>:alias <a>newCommandName</a> <a>oldCommandName</a></spec>
      <description>
        <p>
          コマンド <a>oldCommandName</a> に <a>newCommandName</a> という別名をつけます。
        </p>
      </description>
    </item>
    <h3 tag="alias-examples">alias examples for .vimperatorrc</h3>
    <p>If you input directly these commands in vimperator commandline, remove the ":lazy".</p>
    <code><ex>
:command! -nargs=+ lazy autocmd VimperatorEnter .* &lt;args>
:lazy alias newName oldCommandName
    </ex></code>
  </plugin>
</>;
// }}}


(function () {

  commands.addUserCommand(
    ['alias'],
    'Define the alias for a command.',
    function (args) {
      let [newName, oldName] = args;
      let cmd = commands.get(oldName);

      if (!cmd)
        return liberator.echoerr('Not found command with: ' + oldName);

      cmd.specs.push(newName);
      // XXX 必要でない気もする。実際コマンドの検索には要らない。
      Command.prototype.init.call(cmd, cmd.specs, cmd.description, cmd.action);
    },
    {
      completer: function (context, args) {
        if (args.completeArg == 1)
          return completion.command(context);
      }
    },
    true
  );

})();

// vim:sw=2 ts=2 et si fdm=marker:
