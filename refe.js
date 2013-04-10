/* NEW BSD LICENSE {{{
Copyright (c) 2011, anekos.
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

// INFO {{{
let INFO = xml`
  <plugin name="refe" version="1.0.0"
          href="http://vimpr.github.com/"
          summary="refe (Ruby reference) for vimperator"
          lang="en-US"
          xmlns="http://vimperator.org/namespaces/liberator">
    <author email="anekos@snca.net">anekos</author>
    <license>New BSD License</license>
    <project name="Vimperator" minVersion="3.0"/>
    <require type="plugin">_libly.js</require>
    <item>
      <tags>:refe</tags>
      <spec>:refe</spec>
      <description><p>Seach with completer and open reference page in a current tab.</p></description>
    </item>
    <item>
      <tags>:trefe</tags>
      <spec>:trefe</spec>
      <description><p>Seach with completer and open reference page in a new tab.</p></description>
    </item>
  </plugin>
  <plugin name="refe" version="1.0.0"
          href="http://vimpr.github.com/"
          summary="refe (Ruby リファレンス) for Vimperator"
          lang="ja"
          xmlns="http://vimperator.org/namespaces/liberator">
    <author email="anekos@snca.net">anekos</author>
    <license>New BSD License</license>
    <project name="Vimperator" minVersion="3.0"/>
    <require type="plugin">_libly.js</require>
    <item>
      <tags>:refe</tags>
      <spec>:refe</spec>
      <description><p>補完で検索し、リファレンスのページを現在のタブに開きます。</p></description>
    </item>
    <item>
      <tags>:trefe</tags>
      <spec>:trefe</spec>
      <description><p>補完で検索し、リファレンスのページを新しいタブに開きます。</p></description>
    </item>
  </plugin>
`;
// }}}

(function () {

  let L = plugins.libly;

  function getList (word, callback) {
    let req = new L.Request('http://gimite.net/refe-web/main/search?query=' + encodeURIComponent(word));
    req.addEventListener(
      'success',
      function (res) {
        callback([
          [node.getAttribute('href'), node.textContent.trim()]
          for ([, node] in Iterator(Array.slice(L.$U.createHTMLDocument(res.responseText).querySelectorAll('a'))))
        ]);
      }
    );
    req.addEventListener(
      'failure',
      function (res) {
        liberator.echoerr('!API Error');
      }
    );
    req.get();
  }

  function addCommand (prefix, where) {
    commands.addUserCommand(
      [prefix + 'refe'],
      'refe - ruby reference',
      function (args) {
        liberator.open(args.literalArg, where);
      },
      {
        literal: 0,
        completer: let (getter) function (context, args) {
          function setCompletions (context, word) {
            getList(
              word,
              function (list) {
                context.incomplete = false;
                context.completions = list;
              }
            );
          }

          let word = args.literalArg;

          if (word.length <= 2)
            return;

          context.incomplete = true;
          context.filters = [CompletionContext.Filter.textDescription];

          if (getter)
            clearTimeout(getter);
          getter = setTimeout(setCompletions.bind(null, context, word), 1000);
        }
      },
      true
    );
  }

  addCommand('', liberator.CURRENT_TAB);
  addCommand('t', liberator.NEW_TAB);

})();

// vim:sw=2 ts=2 et si fdm=marker:
