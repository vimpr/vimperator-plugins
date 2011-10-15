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
let INFO =
<>
  <plugin name="Slideshare" version="1.1.0"
          href="http://vimpr.github.com/"
          summary="Controll slideshare's slide."
          lang="en-US"
          xmlns="http://vimperator.org/namespaces/liberator">
    <author email="anekos@snca.net">anekos</author>
    <license>New BSD License</license>
    <project name="Vimperator" minVersion="3.0"/>
    <p></p>
    <item>
      <tags>:slideshare-next</tags>
      <spec>:Slideshare next</spec>
      <description><p>Go next page.</p></description>
    </item>
    <item>
      <tags>:slideshare-prev</tags>
      <spec>:Slideshare prev</spec>
      <description><p>Go previous page.</p></description>
    </item>
    <item>
      <tags>:slideshare-fullscreen</tags>
      <spec>:Slideshare fullscreen</spec>
      <description><p>Toggle fullscreen.</p></description>
    </item>
  </plugin>
  <plugin name="Slideshare" version="1.0.0"
          href="http://vimpr.github.com/"
          summary="Slideshare のスライドを操作する"
          lang="ja"
          xmlns="http://vimperator.org/namespaces/liberator">
    <author email="anekos@snca.net">anekos</author>
    <license>New BSD License</license>
    <project name="Vimperator" minVersion="3.0"/>
    <p></p>
    <item>
      <tags>:slideshare-next</tags>
      <spec>:Slideshare next</spec>
      <description><p>次のページに移動</p></description>
    </item>
    <item>
      <tags>:slideshare-prev</tags>
      <spec>:Slideshare prev</spec>
      <description><p>前のページに移動</p></description>
    </item>
    <item>
      <tags>:slideshare-fullscreen</tags>
      <spec>:Slideshare fullscreen</spec>
      <description><p>フルスクリーン切り換え</p></description>
    </item>
  </plugin>
</>;
// }}}


(function () {

  function makeStyleToggler (myStyle, e) {
    let originalStyle = e.getAttribute('style') || '';
    return function () {
      if (e.__anekos_style_override) {
        e.setAttribute('style', originalStyle);
        delete e.__anekos_style_override;
      } else {
        e.setAttribute('style', originalStyle + myStyle.toString());
        e.__anekos_style_override = true;
      }
    }
  }

  function makeFullscreenToggler (doc, main) {
    const hiddenStyle = 'display: none !important';

    let styleTogglers = Array.slice(doc.querySelectorAll('object')).map(makeStyleToggler.bind(null, hiddenStyle));

    return function (callback) {
      main();
      styleTogglers.forEach(function (f) f());
      setTimeout(function () {
        if (callback)
          callback();
      }, 1000);
    };
  }

  function HTML5Slideshare (doc, callback) {
    let win = doc.defaultView;
    let player = win.player;

    let toggleFullscreen =
      makeFullscreenToggler(
        doc,
        let (isFullscreen = false)
          function () {
            doc.querySelector(isFullscreen ? '.btnLeaveFullScreen' : '.btnFullScreen').click();
            isFullscreen ^= true;
          }
      );

    toggleFullscreen(
      function () {
        callback({
          next: function () {
            player.play(this.current + 1);
          },

          previous: function () {
            if (this.current > 1)
              player.play(this.current - 1);
          },

          toggleFullscreen: function () {
            toggleFullscreen();
          },

          get current () player.controller.currentPosition
        });
      }
    );
  }

  function FlashSlideshare (doc, callback) {
    let player = doc.querySelector('#player');

    const fullScreenStyle = <><![CDATA[
      position : fixed !important;
      top : 0px !important;
      left : 0px !important;
      z-index : 1000 !important;
      width : 100% !important;
      height : 100% !important;
    ]]></>;

    styleTogglers.push();

    let toggleFullscreen = makeFullscreenToggler(doc, makeStyleToggler(fullScreenStyle, player));

    toggleFullscreen(
      function () {
        callback({
          next: function () {
            this.player.next();
          },

          previous: function () {
            this.player.previous();
          },

          toggleFullscreen: function () {
            toggleFullscreen();
          },

          get player () doc.querySelector('#player'),

          get current () player.controller.currentPosition
        });
      }
    );
  }

  function Slideshare (callback) {
    const PN = '__anekos_slidehare';

    if (content.document.location.host !== 'www.slideshare.net')
      return liberator.echoerr('This is not slideshare!!?');

    let doc = content.document;
    let docw = doc.wrappedJSObject;

    if (doc[PN])
      return callback.call(doc[PN]);

    let func = docw.defaultView.player ? HTML5Slideshare : FlashSlideshare;
    func(docw, function (instance) {
      doc[PN] = instance;
      callback.call(instance);
    });
  }

  commands.addUserCommand(
    ['slideshare'],
    'Slideshare controller',
    function () {
    },
    {
      subCommands: [
        new Command(['n[ext]'], 'Go next page', function () Slideshare(function () this.next())),
        new Command(['p[rev]'], 'Go previous page', function () Slideshare(function () this.previous())),
        new Command(['f[ullscreen]'], 'Toggle fullscrenn', function () Slideshare(function () this.toggleFullscreen())),
      ]
    },
    true
  );

})();

// vim:sw=2 ts=2 et si fdm=marker:
