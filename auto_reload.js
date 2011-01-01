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
  <name>Auto Reload</name>
  <name lang="ja">自動リロード</name>
  <description>Watch local file, and automatically reload current page when the file is modified.</description>
  <description lang="ja">ローカルのファイルを監視して、現在のページをリロードする</description>
  <version>1.0.1</version>
  <author mail="anekos@snca.net" homepage="http://d.hatena.ne.jp/nokturnalmortum/">anekos</author>
  <license>new BSD License (Please read the source code comments of this plugin)</license>
  <license lang="ja">修正BSDライセンス (ソースコードのコメントを参照してください)</license>
  <minVersion>2.3pre</minVersion>
  <maxVersion>2.3pre</maxVersion>
  <detail><![CDATA[
    制作中
  ]]></detail>
  <detail lang="ja"><![CDATA[
    制作中
  ]]></detail>
</VimperatorPlugin>;
// }}}

(function () {

  let uuid = '{e49e10b3-a867-457a-8c4e-dbe09e3b285a}';

  commands.addUserCommand(
    ['autoreload'],
    'Auto reload current tab',
    function (args) {
      let tab = gBrowser.mCurrentTab;
      let storage = tab[uuid] || (tab[uuid] = {});
      let reload;
      let func = reload = function () tabs.reload(tab);
      let time = parseInt(parseFloat(args[0] || 1) * 1000);

      let (file = io.File(args.string)) {
        if (file.exists() && file.isFile()) {
          let filepath = file.path;
          storage.lastModifiedTime = file.lastModifiedTime;
          time = 200;
          func = function () {
            let file = io.File(filepath);
            let mt = file.lastModifiedTime;
            if (storage.lastModifiedTime == mt)
              return;
            storage.lastModifiedTime = mt;
            reload();
          };
        }
      }

      if (storage.timer) {
        liberator.log('removed');
        clearInterval(storage.timer);
      }

      storage.timer = setInterval(func, time);
    },
    {
      completer: function (context, args) completion.file(context)
    },
    true
  );

})();

// vim:sw=2 ts=2 et si fdm=marker:


