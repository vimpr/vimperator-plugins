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
var PLUGIN_INFO = xml`
<VimperatorPlugin>
  <name>AmebaNau</name>
  <name lang="ja">Amebaなう</name>
  <description>nau</description>
  <description lang="ja">Amebaなうする</description>
  <version>1.0.4</version>
  <author mail="anekos@snca.net" homepage="http://d.hatena.ne.jp/nokturnalmortum/">anekos</author>
  <license>new BSD License (Please read the source code comments of this plugin)</license>
  <license lang="ja">修正BSDライセンス (ソースコードのコメントを参照してください)</license>
  <updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/amebanow.js</updateURL>
  <minVersion>2.3</minVersion>
  <maxVersion>2.3</maxVersion>
  <require>_libly.js</require>
  <detail><![CDATA[
    == command ==
    :nau <MESSAGE>
    == multi post setting ==
      >||
        let g:amebanow_multipost = "twitter|wassr"
      ||<
  ]]></detail>
</VimperatorPlugin>`;
// }}}
// INFO {{{
var INFO = xml`
<plugin name="AmebaNow" version="1.0.4"
        href="http://github.com/vimpr/vimperator-plugins/blob/master/amebanow.js"
        summary="AmebaNau"
        xmlns="http://vimperator.org/namespaces/liberator">
  <author email="anekos@snca.net">anekos</author>
  <license>New BSD License</license>
  <project name="Vimperator" minVersion="2.3"/>
  <p>
  </p>
  <item>
    <tags>:nau</tags>
    <spec>:nau message</spec>
    <description>
      <p>
        Nau message.
      </p>
    </description>
  </item>
</plugin>`;
// }}}


(function () {

  function getToken (onSuccess) {
    const url = 'http://now.ameba.jp/';
    let req = new liberator.plugins.libly.Request(url);
    req.addEventListener(
      'onSuccess',
      function (res) {
        let m = res.responseText.match(/<input id="token" type="hidden" name="token" value="(\w+)"/);
        if (m)
          onSuccess(m[1]);
      }
    );
    req.get();
  }

  function now (msg, token) {
    const url = 'http://ucsnow.ameba.jp/post';
    let data =
      'entryText=' + encodeURIComponent(msg) +
      '&token=' + token +
      '&inputBtn=%E6%8A%95%E7%A8%BF';
    let req =
      new liberator.plugins.libly.Request(
        url,
        {Referer: 'http://now.ameba.jp/'},
        {postBody: data}
      );
    req.addEventListener(
      'onSuccess',
      function (res) {
        liberator.echo('\u3042\u3081\u30FC\u3070\u306A\u3046: ' + util.escapeString(msg));
      }
    );
    req.post();
  }

  commands.addUserCommand(
    ['amebanow', 'nau'], //XXX nau は typo に非ず！かぶり防止
    'Description',
    function (args) {
      let msg = args.literalArg;
      let mpCmds =
        let (gv = liberator.globalVariables.amebanow_multipost)
          (gv ? gv.split('|') : []);
      getToken(function (token) now(msg, token));
      mpCmds.forEach(function (cmd) liberator.execute(cmd + ' ' + msg));
    },
    {
      literal: 0,
    },
    true
  );

})();

// vim:sw=2 ts=2 et si fdm=marker:
