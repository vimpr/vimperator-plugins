/* {{{
Copyright (c) 2008, anekos.
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
  <name>mkcolor</name>
  <name lang="ja">mkcolor</name>
  <description>Write current highlights to the specified file.</description>
  <description lang="ja">現在のHighlightを指定のファイルに書き出す。</description>
  <version>1.0.3</version>
  <author mail="anekos@snca.net" homepage="http://d.hatena.ne.jp/nokturnalmortum/">anekos</author>
  <license>new BSD License (Please read the source code comments of this plugin)</license>
  <license lang="ja">修正BSDライセンス (ソースコードのコメントを参照してください)</license>
  <updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/mkcolor.js</updateURL>
  <minVersion>2.3</minVersion>
  <maxVersion>2.3</maxVersion>
  <detail><![CDATA[
    == Commands ==
      - mkcolor <FILENAME>
        <FILENAME> に現在の Highlight 設定を書き出します。
  ]]></detail>
</VimperatorPlugin>;
// }}}

(function () {

  function rmrem (s)
    s.replace(/\s*\/\*.*\*\//g, '');

  function pad (s, max)
    (s.length < max ? pad(s + ' ', max) : s);

  function getcolor () {
    let result = [];
    let max = 0;
    for (let h in highlight)
      max = Math.max(h.class.length, max);
    for (let h in highlight)
      result.push(h.value ? 'hi ' + pad(h.class, max) + '  ' + rmrem(h.value)
                          : '" hi ' + h.class);
    return result.join("\n");
  }

  commands.addUserCommand(
    ['mkco[lor]'],
    'Write current highlights to the specified file',
    function (args) {
      let filename = args[0];
      let file = io.File(filename);
      if (file.exists() && !args.bang)
        return liberator.echoerr(filename + ' already exists (add ! to override)');
      io.File(file).write(getcolor());
    },
    {
      argCount: '1',
      bang: true,
      completer: function (context) completion.file(context, true)
    },
    true
  );

})();

// vim:sw=2 ts=2 et si fdm=marker:
