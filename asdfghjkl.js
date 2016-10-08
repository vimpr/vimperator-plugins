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
var PLUGIN_INFO = xml`
<VimperatorPlugin>
  <name>asdfghjkl;</name>
  <description>Inputting numbers by asdfghjkl; keys in hint mode.</description>
  <description lang="ja">Hintモードで、asdfghjkl;キーを使って数字入力をする。</description>
  <version>1.4.1</version>
  <author mail="anekos@snca.net" homepage="http://d.hatena.ne.jp/nokturnalmortum/">anekos</author>
  <license>new BSD License (Please read the source code comments of this plugin)</license>
  <license lang="ja">修正BSDライセンス (ソースコードのコメントを参照してください)</license>
  <updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/asdfghjkl.js</updateURL>
  <minVersion>2.0pre</minVersion>
  <maxVersion>2.0pre</maxVersion>
  <detail><![CDATA[
    == Usage ==
      In hint-mode, When press <Space>, enter into asdfghjkl; mode.
      (If you want to leave this mode, re-press <Space>)

      You can change the keybind for enter into asdfghjkl like below
      >||
       let g:asdfghjkl_mode_change_key = "<C-c>"
      ||<

      You can also change the keys for inputting numbers like below
      >||
       let g:asdfghjkl_hintchars = "/zxcvbnm,."
      ||<

     Note that the numbers 0-9 are corresponding to
     characters from the left side to the right side of the string.

    == Link ==
      http://d.hatena.ne.jp/nokturnalmortum/20081021#1224543467
  ]]></detail>
  <detail lang="ja"><![CDATA[
    == Usage-ja ==
      ヒントモードで、<Space> を押すと asdfghjkl; モード(?)に入ります。
      出たい場合は、もう一度押します。

      切り替えキーを変更したい場合は、以下のように設定できます。
      >||
        let g:asdfghjkl_mode_change_key = "<C-c>"
      ||<

      数字入力のためのキーは、以下のように変更出来ます。
      >||
        let g:asdfghjkl_hintchars = "/zxcvbnm,."
      ||<
     それぞれの文字は左側から0-9の数字の入力に対応します。

    == Link ==
      http://d.hatena.ne.jp/nokturnalmortum/20081021#1224543467
  ]]></detail>
</VimperatorPlugin>`;
// }}}

(function () {
  let asdfghjkl_default = eval(liberator.globalVariables.asdfghjkl_default || 'false');
  let mode_change_key = liberator.globalVariables.asdfghjkl_mode_change_key || '<Space>';
  let useShift = eval(liberator.globalVariables.asdfghjkl_useShift || 'false');
  let asdfghjkl_hintchars = liberator.globalVariables.asdfghjkl_hintchars || ";asdfghjkl";
  let active = false;

  function around (obj, name, func) {
    let next = obj[name];
    obj[name] = function () {
      let args = Array.from(arguments);
      func.call(this,
                () => next.apply(this, args),
                args);
    }
  }

  around(events, 'onKeyPress', function (next, [event]) {
    if (modes.extended & modes.HINTS) {
      let act = active;
      let key = events.toString(event);
      if (key == mode_change_key) {
        active = !active;
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      if (key.length == 1) {
        if (useShift && event.shiftKey) {
          act = !act;
          key = key.toLowerCase();
        }
        if (act) {
          let n = asdfghjkl_hintchars.indexOf(key);
          if (n >= 0) {
            events.feedkeys(n.toString(), true);
            event.preventDefault();
            event.stopPropagation();
            return;
          }
        }
      }
    }
    return next();
  });

  around(hints, 'show', function (next) {
    active = asdfghjkl_default;
    return next();
  });

})();
