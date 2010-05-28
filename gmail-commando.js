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
  <name>GMail Commando</name>
  <name lang="ja">GMail コマンドー</name>
  <description>The handy commands for GMail</description>
  <description lang="ja">便利なGMail用コマンドー</description>
  <version>1.2.0</version>
  <author mail="anekos@snca.net" homepage="http://d.hatena.ne.jp/nokturnalmortum/">anekos</author>
  <license>new BSD License (Please read the source code comments of this plugin)</license>
  <license lang="ja">修正BSDライセンス (ソースコードのコメントを参照してください)</license>
  <updateURL>http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/XXXXX</updateURL>
  <minVersion>2.4</minVersion>
  <maxVersion>2.4</maxVersion>
  <detail><![CDATA[
    ----
  ]]></detail>
  <detail lang="ja"><![CDATA[
    ----
  ]]></detail>
</VimperatorPlugin>;
// }}}
// INFO {{{
let INFO =
<>
  <plugin name="GMailCommando" version="1.2.0"
          href="http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/gmail-commando.js"
          summary="The handy commands for GMail"
          lang="en-US"
          xmlns="http://vimperator.org/namespaces/liberator">
    <author email="anekos@snca.net">anekos</author>
    <license>New BSD License</license>
    <project name="Vimperator" minVersion="2.4"/>
    <p></p>
    <item>
      <tags>:gmail</tags>
      <spec>:gmail</spec>
      <description><p></p></description>
    </item>
  </plugin>
  <plugin name="GMailコマンドー" version="1.2.0"
          href="http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/gmail-commando.js"
          summary="便利なGMail用コマンドー"
          lang="ja"
          xmlns="http://vimperator.org/namespaces/liberator">
    <author email="anekos@snca.net">anekos</author>
    <license>New BSD License</license>
    <project name="Vimperator" minVersion="2.4"/>
    <p></p>
    <item>
      <tags>:gmail</tags>
      <spec>:gmail</spec>
      <description><p></p></description>
    </item>
  </plugin>
</>;
// }}}


(function () {

  function A (list)
    Array.slice(list);

  const Elements = {
    get doc() content.frames[3].document,

    get labels() A(this.doc.querySelectorAll('a.n0')),

    get input() this.doc.getElementById(':rh'),

    get searchButton() this.doc.getElementById(':rj'),

    get translateButton () this.mail.querySelector('tr > td.SA > .iL.B9'),
    get translateButtons () A(this.doc.querySelector('tr > td.SA > .iL.B9')),

    get mail ()
      A(this.doc.querySelectorAll('.h7')).filter(
        function (it) !it.querySelector('.hF.hH > img.hG')
      )[0],
    get mails () A(this.doc.querySelectorAll('.h7')),

    get foldButton () this.doc.querySelector('#\\:54'),
    get unfoldButton () this.doc.querySelector('#\\:55'),
  };


  const Commands = {
    translate: function () buffer.followLink(Elements.translateButton),
    fold: function () buffer.followLink(Elements.foldButton),
    unfold: function () buffer.followLink(Elements.unfoldButton),
  };

  const GMailSearchKeyword = 'label subject from to cc bcc has is in'.split(/\s/);

  commands.addUserCommand(
    ['gmail'],
    'GMail Commando',
    function (args) {
      Elements.input.value = args.literalArg;
      buffer.followLink(Elements.searchButton);
    },
    {
      literal: 0,
      completer: function (context, args) {
        let input = args.string.slice(0, context.caret);
        let m;

        if (m = /(\s|^)(label):([^\s]*)$/(input)) {
          context.advance(input.length - m[3].length);
          let key = m[2];
          if (key === 'label') {
            context.completions = [
              [label.textContent.replace(/\s*\(\d+\+?\)$/, ''), label.textContent]
              for ([, label] in Iterator(Elements.labels))
            ];
          }
          return;
        }

        if (m = /\s*([^\s:]*)$/(input)) {
          context.advance(input.length - m[1].length);
          context.completions = [
            [v + ':', v] for ([, v] in Iterator(GMailSearchKeyword))
          ];
          return;
        }
      }
    },
    true
  );


  'translate fold unfold'.split(/\s/).forEach(function (cmd) {
    let gv = liberator.globalVariables['gmail_commando_map_' + cmd];
    if (!gv)
      return;
    mappings.addUserMap(
      [modes.NORMAL],
      gv.split(/\s+/),
      cmd + ' - Gmail Commando',
      function () {
        Commands.translate();
      },
      {
        matchingUrls: RegExp('https://mail\\.google\\.com/mail/*')
      }
    );
  });

  __context__.command  = Commands;

})();

// vim:sw=2 ts=2 et si fdm=marker:
