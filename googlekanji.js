/* NEW BSD LICENSE {{{
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
  <name>Google Kanji</name>
  <name lang="ja">Google 漢字</name>
  <description>Search kanji by google</description>
  <description lang="ja">グーグルを使って漢字を検索</description>
  <version>1.1.2</version>
  <author mail="anekos@snca.net" homepage="http://d.hatena.ne.jp/nokturnalmortum/">anekos</author>
  <license>new BSD License (Please read the source code comments of this plugin)</license>
  <license lang="ja">修正BSDライセンス (ソースコードのコメントを参照してください)</license>
  <updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/googlekanji.js</updateURL>
  <minVersion>2.0pre</minVersion>
  <maxVersion>2.0pre</maxVersion>
  <detail><![CDATA[
    == Usage ==
      :gkanji うぶめ
      のようにひらがななどで読みを入力します。
      すると、
      :gkcopy
      が開き、補完が可能になるので、正しそうな漢字を選びます。
      すると、クリップボードにその漢字がコピーされます。
  ]]></detail>
</VimperatorPlugin>;
// }}}

(function () {

  var copycompl = [];

  function getKanji (word) {
    var re = /[\u4e00-\u9fa0]+/g; // 一-龠
    var ignore = /\u691c\u7d22|\u95a2\u9023/; // 検索|関連
    var req = new XMLHttpRequest();
    var word = encodeURIComponent(word);
    req.open('GET', 'http://www.google.co.jp/search?hl=ja&q=' + word + '&lr=lang_ja', true);
    var f = function () {
      var cnt = {};
      for each (let it in req.responseText.match(re)) {
        if (ignore.test(it))
          continue;
        if (cnt[it])
          cnt[it] += 1;
        else
          cnt[it] = 1;
      }
      var cnta = [];
      for (let i in cnt) {
        if (cnt[i] < 3)
          continue;
        cnta.push([i, cnt[i]]);
      }
      cnta.sort(function (a, b) b[1] - a[1]);
      copycompl = cnta;
      commandline.open(":", "gkcopy ", modes.EX);
    };
    req.onreadystatechange = function (aEvt) {
      if (req.readyState == 4 && req.status == 200) {
        f();
      }
    };
    req.send(null);
  }

  commands.addUserCommand(
    ['gkanji', 'googlekanji'],
    'Google kanji',
    function (arg) getKanji(arg.string),
    {},
    true
  );

  function copyToClipboard (copytext) {
    const supstr = Cc["@mozilla.org/supports-string;1"].createInstance(Ci.nsISupportsString);
    const trans  = Cc["@mozilla.org/widget/transferable;1"].createInstance(Ci.nsITransferable);
    const clipid = Ci.nsIClipboard;
    const clip   = Cc["@mozilla.org/widget/clipboard;1"].getService(clipid);

    supstr.data = copytext;
    trans.addDataFlavor("text/unicode");
    trans.setTransferData("text/unicode", supstr, copytext.length * 2);

    clip.setData(trans, null, clipid.kGlobalClipboard);
  }

  commands.addUserCommand(
    ['gkcopy'],
    'Google kanji',
    copyToClipboard,
    {
      completer: function (context) {
        context.title = ['kanji', 'count'];
        context.completions = copycompl;
      }
    },
    true
  );

})();

// vim:sw=2 ts=2 et si fdm=marker:
