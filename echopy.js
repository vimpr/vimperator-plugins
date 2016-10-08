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
var PLUGIN_INFO = xml`
<VimperatorPlugin>
  <name>{NAME}</name>
  <name lang="ja">{NAME}</name>
  <description>Echo and Copy(to clipboard)</description>
  <description lang="ja">:echo! で echo しつつクリップボードにコピーできる様にする</description>
  <version>1.0.3</version>
  <author mail="anekos@snca.net" homepage="http://d.hatena.ne.jp/nokturnalmortum/">anekos</author>
  <license>new BSD License (Please read the source code comments of this plugin)</license>
  <license lang="ja">修正BSDライセンス (ソースコードのコメントを参照してください)</license>
  <updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/echopy.js</updateURL>
  <minVersion>2.3</minVersion>
  <maxVersion>2.3</maxVersion>
  <detail><![CDATA[
    == Usage ==
      :echo! <EXPRESSION>:
        echo and copy (to clipboard).
        When used without "!", "echo" does not copy to clipboard.
    == Link ==
      http://d.hatena.ne.jp/nokturnalmortum/20081111#1226414487
  ]]></detail>
  <detail lang="ja"><![CDATA[
    == Usage ==
      :echo! <EXPRESSION>:
        echo しつつクリップボードにコピー
        "!" とつけない場合は、クリップボードにコピーされません。
    == Link ==
      http://d.hatena.ne.jp/nokturnalmortum/20081111#1226414487
  ]]></detail>
</VimperatorPlugin>`;
// }}}

(function () {

  let echo = commands.get('echo');
  let original_action = echo.action;

  echo.action = function (args) {
    original_action.apply(null, arguments);
    if (args.bang)
      util.copyToClipboard(CommandLine.echoArgumentToString(args.string, false));
  };
  echo.bang = true;

})();
