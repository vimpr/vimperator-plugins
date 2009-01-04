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
  <name>translaten</name>
  <name lang="ja">自動一括翻訳</name>
  <description>Automatically translate by clipboard changes</description>
  <description lang="ja">クリップボードの変更を監視して、一括翻訳サービスに流し込む</description>
  <version>1.0</version>
  <author mail="anekos@snca.net" homepage="http://d.hatena.ne.jp/nokturnalmortum/">anekos</author>
  <license>new BSD License (Please read the source code comments of this plugin)</license>
  <license lang="ja">修正BSDライセンス (ソースコードのコメントを参照してください)</license>
  <minVersion>2.0pre</minVersion>
  <maxVersion>2.0pre</maxVersion>
  <detail><![CDATA[
    == Activation ==
      >||
        set translaten
      ||<
  ]]></detail>
  <detail lang="ja"><![CDATA[
    == Usage ==
      特に操作は必要ありません。
      >||
        set translaten
      ||<
      で、有効化した後に、クリップボードに変化があれば、その内容を 'http://7go.biz/translation/' に流し込んで翻訳します。
    == Link ==
      http://vimperator.g.hatena.ne.jp/nokturnalmortum/20090104/1231070505
  ]]></detail>
</VimperatorPlugin>;
// }}}

(function () {

  const URL = 'http://7go.biz/translation/';

  function TranslaTen () {
    this.handle;
    this.running = false;
  }

  function inTheSite ()
    (~buffer.URL.indexOf(URL))

  TranslaTen.prototype = {
    get clipboard () util.readFromClipboard(),

    open: function () {
      if (inTheSite())
        return;
      if (buffer.URL == 'about:blank')
        return liberator.open(URL, liberator.CURRENT_TAB);
      for (let [number, browser] in Iterator(tabs.browsers)) {
        if (~browser.contentDocument.location.href.indexOf(URL))
          return liberator.modules.tabs.select(number, false);
      }
      liberator.open(URL, liberator.NEW_TAB);
    },

    stop: function () {
      if (this.handle) {
        clearInterval(this.handle);
        this.handle = null;
      }
      this.running = false;
    },

    run: function () {
      let self = this;
      if (this.running)
        return;
      this.running = true;
      this.prev = this.clipboard;
      this.open();
      this.handle = setInterval(
        function () {
          let now = self.clipboard;
          if (now == self.prev)
            return;
          self.prev = now;
          self.open();
          let f = function () { self.elements.textarea.value = now; self.elements.submit.click(); };
          if (inTheSite()) {
            f();
          } else {
            let handle = setInterval(
              function () {
                if (inTheSite() && buffer.loaded) {
                  clearInterval(handle);
                  f();
                }
              },
              200
            );
          }
        },
        100
      );
    },

    elements: {
      get submit () content.document.getElementsByTagName('INPUT')[0],
      get textarea () content.document.getElementsByTagName('TEXTAREA')[0]
    }
  };

  let translaten = new TranslaTen();

  options.add(
    ['translaten'],
    'Automatically translate by clipboard changes',
    'boolean',
    false,
    {
      setter: function (value) {
        if (value)
          translaten.run();
        else
          translaten.stop();
      }
    }
  );

})();

// vim:sw=2 ts=2 et si fdm=marker:
