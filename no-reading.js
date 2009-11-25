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
  <name>No Reading</name>
  <name lang="ja">No Reading</name>
  <description>No reading!</description>
  <description lang="ja">～からデータを転送していますなどの表示を消す(またはecho)</description>
  <version>1.0.0</version>
  <author mail="anekos@snca.net" homepage="http://d.hatena.ne.jp/nokturnalmortum/">anekos</author>
  <license>new BSD License (Please read the source code comments of this plugin)</license>
  <license lang="ja">修正BSDライセンス (ソースコードのコメントを参照してください)</license>
  <updateURL>http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/no-reading.js</updateURL>
  <minVersion>2.2</minVersion>
  <maxVersion>2.3pre</maxVersion>
  <require type="plugin">_libly.js</require>
  <detail><![CDATA[
    let g:no_reading_do_echo = 1
  ]]></detail>
  <detail lang="ja"><![CDATA[
    let g:no_reading_do_echo = 1
  ]]></detail>
</VimperatorPlugin>;
// }}}

(function () {

  function doEcho ()
    liberator.globalVariables.no_reading_do_echo;

  let (doErase = true)
    liberator.plugins.libly.$U.around(
      statusline,
      'updateUrl',
      function (next, args) {
        let [url] = args;
        if (url) {
          doErase = true;
          doEcho() && liberator.echo(url, commandline.FORCE_SINGLELINE)
        } else {
          if (doErase && doEcho())
            liberator.echo('', commandline.FORCE_SINGLELINE)
          doErase = false;
          return next();
        }
      }
    );

})();

// vim:sw=2 ts=2 et si fdm=marker:
