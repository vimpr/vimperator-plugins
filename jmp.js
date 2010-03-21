/* NEW BSD LICENSE {{{
Copyright (c) 2008-2010, anekos.
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
  <name>j.mp</name>
  <description>Get short alias by j.mp</description>
  <description lang="ja">j.mp で短縮URLを得る</description>
  <version>1.1.1</version>
  <author mail="anekos@snca.net" homepage="http://d.hatena.ne.jp/nokturnalmortum/">anekos</author>
  <license>new BSD License (Please read the source code comments of this plugin)</license>
  <license lang="ja">修正BSDライセンス (ソースコードのコメントを参照してください)</license>
  <updateURL>http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/j.mp.js</updateURL>
  <minVersion>2.0pre</minVersion>
  <maxVersion>2.3</maxVersion>
  <detail><![CDATA[
    == Commands ==
      :jmp [<URL>]
        Copy to clipboard.
  ]]></detail>
</VimperatorPlugin>;
// }}}


(function () {

  function jmp (uri, callback) {
    let req = new XMLHttpRequest();
    req.onreadystatechange = function () {
      if (req.readyState != 4)
        return;
      if (req.status == 200)
        return callback && callback(req.responseText, req);
      else
        throw new Error(req.statusText);
    };
    req.open('GET', 'http://j.mp/api?url=' + encodeURIComponent(uri), callback);
    req.send(null);
    return !callback && req.responseText;
  }

  commands.addUserCommand(
    ['jmp'],
    'Copy jmp url',
    function (args) {
      jmp(args.literalArg || buffer.URL, function (short) {
        util.copyToClipboard(short);
        liberator.echo('`' + short + "' was copied to clipboard.");
      });
    },
    {
      literal: 0,
      completer: function (context) {
        context.completions = [
          [buffer.URL, 'Current URL']
        ];
      }
    },
    true
  );

  __context__.get = jmp;

})();
