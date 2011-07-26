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
  <name>lolipo-ojisan</name>
  <name lang="ja">ロリポおじさん</name>
  <description>Talk with lolipo-ojisan.</description>
  <description lang="ja">ロリポおじさんと話す</description>
  <version>1.0.1</version>
  <author mail="anekos@snca.net" homepage="http://d.hatena.ne.jp/nokturnalmortum/">anekos</author>
  <license>new BSD License (Please read the source code comments of this plugin)</license>
  <license lang="ja">修正BSDライセンス (ソースコードのコメントを参照してください)</license>
  <updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/lolipo-ojisan.js</updateURL>
  <minVersion>2.4</minVersion>
  <maxVersion>2.4</maxVersion>
  <detail><![CDATA[
    = Commands =
      lolipo [message]:
        Say to lolipo-ojisan.
        Start to enchanted chat mode, if [message] is not given.
  ]]></detail>
  <detail lang="ja"><![CDATA[
    = Commands =
      lolipo [message]:
        ロリポおじさんに話しかけます。
        [message] を省略すると、魅惑のチャットモードが始まります。
  ]]></detail>
</VimperatorPlugin>;
// }}}
// INFO {{{
let INFO =
<>
  <plugin name="lolipo-ojisan" version="1.0.1"
          href="http://github.com/vimpr/vimperator-plugins/blob/master/lolipo-ojisan.js"
          summary="Chat with lolipo-ojisan."
          lang="en-US"
          xmlns="http://vimperator.org/namespaces/liberator">
    <author email="anekos@snca.net">anekos</author>
    <license>New BSD License</license>
    <project name="Vimperator" minVersion="2.4"/>
    <p></p>
    <item>
      <tags>:lolipo</tags>
      <spec>:lolipo <oa>message</oa></spec>
      <description><p>
        Say to lolipo-ojisan.
        Start to enchanted chat mode, if <oa>message</oa> is not given.
      </p></description>
    </item>
  </plugin>
  <plugin name="lolipo-ojisan" version="1.0.1"
          href="http://github.com/vimpr/vimperator-plugins/blob/master/lolipo-ojisan.js"
          summary="ロリポおじさんとチャットしよう"
          lang="ja"
          xmlns="http://vimperator.org/namespaces/liberator">
    <author email="anekos@snca.net">anekos</author>
    <license>New BSD License</license>
    <project name="Vimperator" minVersion="2.4"/>
    <p></p>
    <item>
      <tags>:lolipo</tags>
      <spec>:lolipo <oa>message</oa></spec>
      <description><p>
        ロリポおじさんに話しかけます。
        <oa>message</oa> を省略すると、魅惑のチャットモードが始まります。
      </p></description>
    </item>
  </plugin>
</>;
// }}}


(function () {

  function createHTMLDocument (source) {
    let wcnt = window.content;
    let doc = wcnt.document.implementation.createDocument(
      'http://www.w3.org/1999/xhtml',
      'html',
      wcnt.document.implementation.createDocumentType(
        'html',
        '-//W3C//DTD HTML 4.01//EN',
        'http://www.w3.org/TR/html4/strict.dtd'
      )
    );
    let range = wcnt.document.createRange();
    range.selectNodeContents(wcnt.document.documentElement);
    let content = doc.adoptNode(range.createContextualFragment(source));
    doc.documentElement.appendChild(content);
    return doc;
  }


  function chatPo (msg, after) {
    let uri = 'http://lolipop.jp/support/ojisan/';
    let req =
      new plugins.libly.Request(
        uri,
        {
          'Referer': 'http://lolipop.jp/support/oshiete/',
          'X-Requested-With': 'XMLHttpRequest'
        },
        {
          postBody: 'say=' + encodeURIComponent(msg)
        }
      );
    req.addEventListener(
      'onSuccess',
      function (res) {
        function getContent (q)
          (new XML(
            '<span>' +
            doc.querySelectorAll(q)[1].innerHTML .
              replace(/<br>/g, '<br />') +
            '</span>'
          ));

        let doc = createHTMLDocument(res.responseText).documentElement;
        let you = getContent('.you > div > div > p');
        let ojisan = getContent('.ojisan > div > div > p');

        liberator.echo(<>
          <dt>&#x3042;&#x306A;&#x305F;</dt><dd>{you}</dd>
          <dt>&#x30ED;&#x30EA;&#x30DD;&#x304A;&#x3058;&#x3055;&#x3093;</dt><dd>{ojisan}</dd>
        </>);
        after && after();
      }
    );
    req.post();
  }

  let query =
    let (inputField = document.getElementById('liberator-commandline-command').inputField)
      function query () {
        let restore =
          let (oldStyle = inputField.style.imeMod)
            function () inputField.style.imeMode = oldStyle || 'inactive';

        inputField.style.imeMode = 'active';

        commandline.input(
          'loli-chat: ',
          function (msg) {
            restore();
            chatPo(msg, function () setTimeout(query, 0))
          },
          {
            onCancel: restore
          }
        );
      };

  commands.addUserCommand(
    ['lolipo'],
    'Chat with lolipo-ojisan',
    function (args) {
      if (args.literalArg) {
        chatPo(args.literalArg);
      } else {
        query()
      }
    },
    {
      literal: 0
    },
    true
  );

})();

// vim:sw=2 ts=2 et si fdm=marker:

