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
  <plugin name="Slideshare" version="1.0.0"
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
  </plugin>
</>;
// }}}


(function () {

  function HTML5Slideshare (doc, callback) {
    let win = doc.defaultView;
    let player = win.player;

    doc.querySelector('.btnFullScreen').click();

    callback({
      next: function () {
        player.play(this.current + 1);
      },

      previous: function () {
        if (this.current > 1)
          player.play(this.current - 1);
      },

      get current () player.controller.currentPosition
    });
  }

  function FlashSlideshare (doc, callback) {
    let player = doc.querySelector('#player');

    let include = doc.querySelector('#h-flashplayer-inclusions').textContent;
    let pp = player.parentNode;
    doc.body.appendChild(pp);

    let cs = doc.body.children;
    for (var i = cs.length - 1; i >=0; i--)
      if (cs[i] !== pp)
        cs[i].style.display = 'none';

    doc.defaultView.eval(include);

    setTimeout(
      function () {
        player = doc.querySelector('#player');
        player.setAttribute(
          'style',
          player.getAttribute('style') + <><![CDATA[
            position: fixed !important;
            top: 0px !important;
            left: 0px !important;
            z-index: 1000;
            width: 100% !important;
            height: 100% !important;
          ]]></>
        );

        pp.setAttribute(
          'style',
          pp.getAttribute('style') + <><![CDATA[
            position: fixed !important;
            top: 0px !important;
            left: 0px !important;
            z-index: 1000;
            width: 100% !important;
            height: 100% !important;
          ]]></>
        );

        callback({
          next: function () {
            player.next();
          },

          previous: function () {
            player.previous();
          },

          get current () player.controller.currentPosition
        });
      },
      100
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
      ]
    },
    true
  );

})();

// vim:sw=2 ts=2 et si fdm=marker:
