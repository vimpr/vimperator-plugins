/*
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

*/

let PLUGIN_INFO =
<VimperatorPlugin>
  <name>Maine Coon</name>
  <name lang="ja">メインクーン</name>
  <description>Makes more large screen</description>
  <description lang="ja">なるべくでかい画面で使えるように</description>
  <version>1.1</version>
  <author mail="anekos@snca.net" homepage="http://d.hatena.ne.jp/nokturnalmortum/">anekos</author>
  <minVersion>2.0pre</minVersion>
  <maxVersion>2.0pre</maxVersion>
  <updateURL>http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/maine_coon.js</updateURL>
  <license>new BSD License (Please read the source code comments of this plugin)</license>
  <license lang="ja">修正BSDライセンス (ソースコードのコメントを参照してください)</license>
  <detail><![CDATA[
    == Commands ==
      :fullscreen:
        toggle fullscreen <-> normal
    == Global Variables ==
      maine_coon_targets:
        Other elements ids that you want to kill.
        let g:maine_coon_targets = "sidebar-2 sidebar-2-splitter"
      maine_coon_auto_hide:
        "true" or "false"
         Hide automatically commandline, if this variable is true.
  ]]></detail>
  <detail lang="ja"><![CDATA[
    == Commands ==
      fullscreen:
        切り替え fullscreen <-> normal
    == Global Variables ==
      maine_coon_targets:
        他の非表示にしたい要素のIDを空白区切りで指定します。
        let g:maine_coon_targets = "sidebar-2 sidebar-2-splitter"
      maine_coon_auto_hide:
        "true" / "false"
        true のとき、自動的にコマンドラインを隠す。
  ]]></detail>
</VimperatorPlugin>;

let tagetIDs = (liberator.globalVariables.maine_coon_targets || '').split(/\s+/);

(function () {

  let autoHideCommandLine = s2b(liberator.globalVariables.maine_coon_auto_hide || '', true);

  function around (obj, name, func) {
    let next = obj[name];
    obj[name] = function ()
      let (self = this, args = arguments)
        func.call(self,
                  function () next.apply(self, args),
                  args);
  }

  function s2b (s, d) (!/^(\d+|false)$/i.test(s)|parseInt(s)|!!d*2)&1<<!s;

  let mainWindow = document.getElementById('main-window');
  let messageBox = document.getElementById('liberator-message');

  if (autoHideCommandLine) {
    messageBox.collapsed = true;

    around(commandline, 'open', function (next, args) {
      messageBox.collapsed = false;
      return next();
    });

    around(commandline, 'close', function (next, args) {
      messageBox.collapsed = true;
      return next();
    });
  }

  function hideTargets (hide) {
    tagetIDs.forEach(
      function (id)
        let (elem = document.getElementById(id))
          (elem && (elem.collapsed = hide))
    );
  }

  function hideChrome (hide)
    mainWindow.setAttribute('hidechrome', hide);

  commands.addUserCommand(
    ['fullscreen', 'fs'],
    'Toggle fullscreen mode',
    function () {
      let hide = !window.fullScreen;
      window.fullScreen = hide;
      setTimeout(function () {
        hideTargets(hide);
        document.getElementById('status-bar').setAttribute('moz-collapsed', false);
        document.getElementById('navigator-toolbox').collapsed = hide;
        if (!hide)
          window.maximize();
      }, 400);
    },
    {},
    true
  );

})();

// vim:sw=2 ts=2 et si fdm=marker:
