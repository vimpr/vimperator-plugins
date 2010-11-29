/* NEW BSD LICENSE {{{
Copyright (c) 2009, anekos.
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
  <name>Multi-execute</name>
  <description>Add the command which execute some ex-commands.</description>
  <description lang="ja">複数のexコマンドを実行するコマンドを追加</description>
  <version>1.0.1</version>
  <author mail="anekos@snca.net" homepage="http://d.hatena.ne.jp/nokturnalmortum/">anekos</author>
  <license>new BSD License (Please read the source code comments of this plugin)</license>
  <license lang="ja">修正BSDライセンス (ソースコードのコメントを参照してください)</license>
  <updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/multi-exec.js</updateURL>
  <minVersion>2.0pre</minVersion>
  <maxVersion>2.0</maxVersion>
  <detail><![CDATA[
    == Description ==
      Execute the some ex-commands which has been separated by the specified separator.
    == Commands ==
      :mx [<SEPARATOR>] <EX-COMMAND-WITH-ARGS>...:
      The default value of <SEPARATOR> is "|"
        e.g.
        >||
          :mx echo 1 | echo 2
          :mx ; echo 1 ; echo 2
        ||<
  ]]></detail>
  <detail lang="ja"><![CDATA[
    == Description ==
     指定のセパレータによって分割された複数のexコマンドを実行します。 
     auto_source.js などで便利かもしれません。
    == Commands ==
      :mx [<SEPARATOR>] <EX-COMMAND-WITH-ARGS>...:
        <SEPARATOR> のデフォルトは "|" です。
        例
        >||
          :mx echo 1 | echo 2
          :mx ; echo 1 ; echo 2
        ||<
  ]]></detail>
</VimperatorPlugin>;
// }}}

(function () {

  commands.addUserCommand(
    ['mx', 'mulex'],
    'Multiple ex',
    function (args) {
      let [sep, body] = ['|', args.string];
      let (m = body.match(/^(\S)\s+(.*)$/))
        m && ([sep, body] = [m[1], m[2]]);
      body.split(sep)
          .map(function (it) it.replace(/^\s+/, ''))
          .forEach(liberator.execute, liberator);
    },
    {
      literal: 0,
      argCount: '*'
    },
    true
  );

})();

// vim:sw=2 ts=2 et si fdm=marker:

