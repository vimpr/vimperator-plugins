/* NEW BSD LICENSE {{{
Copyright (c) 2009-2012, anekos.
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
var INFO = xml`
<plugin name="QiitaSlide"
        version="1.0.0"
        href="http://vimpr.github.com/"
        summary="Controll Qiita's slide."
        lang="en-US"
        xmlns="http://vimperator.org/namespaces/liberator">
  <author>kg8m</author>
  <license>New BSD License</license>
  <project name="Vimperator" minVersion="3.0"/>
  <p></p>
  <item>
    <tags>qiita-slide-command-next</tags>
    <spec>:QiitaSlide next</spec>
    <description><p>Go to next slide.</p></description>
  </item>
  <item>
    <tags>qiita-slide-command-prev</tags>
    <spec>:QiitaSlide prev</spec>
    <description><p>Go to previous slide.</p></description>
  </item>
  <item>
    <tags>qiita-slide-command-toggle-fullscreen</tags>
    <spec>:QiitaSlide fullscreen</spec>
    <description><p>Toggle fullscreen.</p></description>
  </item>
  <item>
    <tags>qiita-slide-keys-next</tags>
    <spec>qiita_slide_keys_next</spec>
    <description>
      <p>Keys to go to next slide. (Default: ["l"])</p>
    </description>
  </item>
  <item>
    <tags>qiita-slide-keys-prev</tags>
    <spec>qiita_slide_keys_prev</spec>
    <description>
      <p>Keys to go to prev slide. (Default: ["h"])</p>
    </description>
  </item>
  <item>
    <tags>qiita-slide-keys-toggle-fullscreen</tags>
    <spec>qiita_slide_keys_toggle_fullscreen</spec>
    <description>
      <p>Keys to toggle fullscreen. (Default: no mappings)</p>
    </description>
  </item>
  <item>
    <tags>qiita-slide-configuration-examples</tags>
    <spec>Configuration Examples</spec>
    <description>
      <p>In your vimperatorrc: </p>
      <code><ex><![CDATA[
javascript <<JS
liberator.globalVariables.qiita_slide_keys_next = ["l", "<Right>"];
liberator.globalVariables.qiita_slide_keys_prev = ["h", "<Left>"];
liberator.globalVariables.qiita_slide_keys_toggle_fullscreen = ["<C-S-f>"];
JS
      ]]></ex></code>
    </description>
  </item>
</plugin>
<plugin name="QiitaSlide"
        version="1.0.0"
        href="http://vimpr.github.com/"
        summary="Qiitaのスライドを操作する"
        lang="ja"
        xmlns="http://vimperator.org/namespaces/liberator">
  <author>kg8m</author>
  <license>New BSD License</license>
  <project name="Vimperator" minVersion="3.0"/>
  <p></p>
  <item>
    <tags>qiita-slide-command-next</tags>
    <spec>:QiitaSlide next</spec>
    <description><p>次のスライドに移動する</p></description>
  </item>
  <item>
    <tags>qiita-slide-command-prev</tags>
    <spec>:QiitaSlide prev</spec>
    <description><p>前のスライドに移動する</p></description>
  </item>
  <item>
    <tags>qiita-slide-command-toggle-fullscreen</tags>
    <spec>:QiitaSlide fullscreen</spec>
    <description><p>フルスクリーンのオンオフを切り替える</p></description>
  </item>
  <item>
    <tags>qiita-slide-keys-next</tags>
    <spec>qiita_slide_keys_next</spec>
    <description>
      <p>次のスライドに移動するキー（デフォルト: ["l"]）</p>
    </description>
  </item>
  <item>
    <tags>qiita-slide-keys-prev</tags>
    <spec>qiita_slide_keys_prev</spec>
    <description>
      <p>前のスライドに移動するキー（デフォルト: ["h"]）</p>
    </description>
  </item>
  <item>
    <tags>qiita-slide-keys-toggle-fullscreen</tags>
    <spec>qiita_slide_keys_toggle_fullscreen</spec>
    <description>
      <p>フルスクリーンを切り替えるキー（デフォルト: マッピングなし）</p>
    </description>
  </item>
  <item>
    <tags>qiita-slide-configuration-examples</tags>
    <spec>設定例</spec>
    <description>
      <p>vimperatorrc: </p>
      <code><ex><![CDATA[
javascript <<JS
liberator.globalVariables.qiita_slide_keys_next = ["l", "<Right>"];
liberator.globalVariables.qiita_slide_keys_prev = ["h", "<Left>"];
liberator.globalVariables.qiita_slide_keys_toggle_fullscreen = ["<C-S-f>"];
JS
      ]]></ex></code>
    </description>
  </item>
</plugin>
`;
// }}}

(function() {
  const HOST = "qiita.com";
  const MATCHING_URLS = "^https?://qiita\\.com/*";

  var QiitaSlide = {};

  QiitaSlide.next = function() { // {{{
    validateLocation();
    findController("next").click();
  }; // }}}

  QiitaSlide.prev = function() { // {{{
    validateLocation();
    findController("prev").click();
  }; // }}}

  QiitaSlide.toggleFullscreen = function() { // {{{
    validateLocation();
    findController("fullscreen").click();
  }; // }}}

  function validateLocation() { // {{{
    if (content.document.location.host !== HOST) {
      return liberator.echoerr("Not Qiita host!");
    }
  } // }}}

  function findController(type) { // {{{
    var selector,
        prefix = ".slide_controller_btn .fa-";

    switch (type) {
    case "next":
      selector = prefix + "forward";
      break;
    case "prev":
      selector = prefix + "backward";
      break;
    case "fullscreen":
      selector = prefix + "desktop";
      break;
    default:
      throw "Invalid type: " + type;
    }

    return content.document.querySelector(selector);
  } // }}}

  (function defineCommands() { // {{{
    commands.addUserCommand(
      ["QiitaSlide"],
      "Qiita Slide Controller",
      function() {},
      {
        subCommands: [
          new Command(["n[ext]"], "Go to next slide", QiitaSlide.next),
          new Command(["p[rev]"], "Go to previous slide", QiitaSlide.prev),
          new Command(["f[ullscreen]"], "Toggle fullscreen", QiitaSlide.toggleFullscreen)
        ]
      },
      true
    );
  })(); // }}}

  (function defineKeymappings() { // {{{
    var keys = {};

    keys.next = liberator.globalVariables.qiita_slide_keys_next || ["l"];
    keys.prev = liberator.globalVariables.qiita_slide_keys_prev || ["h"];
    keys.fullscreen = liberator.globalVariables.qiita_slide_keys_toggle_fullscreen || [];

    if (keys.next.length > 0) { // {{{
      mappings.addUserMap(
        [modes.NORMAL],
        keys.next,
        "Go to next slide",
        QiitaSlide.next,
        {
          matchingUrls: MATCHING_URLS
        }
      );
    } // }}}

    if (keys.prev.length > 0) { // {{{
      mappings.addUserMap(
        [modes.NORMAL],
        keys.prev,
        "Go to prev slide",
        QiitaSlide.prev,
        {
          matchingUrls: MATCHING_URLS
        }
      );
    } // }}}

    if (keys.fullscreen.length > 0) { // {{{
      mappings.addUserMap(
        [modes.NORMAL],
        keys.fullscreen,
        "Toggle fullscreen",
        QiitaSlide.toggleFullscreen,
        {
          matchingUrls: MATCHING_URLS
        }
      );
    } // }}}
  })(); // }}}
})();

// vim:sw=2 ts=2 et si fdm=marker:
