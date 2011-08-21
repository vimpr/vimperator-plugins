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
  <plugin name="BufferMultipeHints" version="1.0.0"
          href="http://vimpr.github.com/"
          summary="Open multiple hints in tabs (;F) at the same time."
          lang="en-US"
          xmlns="http://vimperator.org/namespaces/liberator">
    <author email="anekos@snca.net">anekos</author>
    <license>New BSD License</license>
    <project name="Vimperator" minVersion="3.0"/>
    <require type="plugin">_libly.js</require>
    <p>This plugin requires _libly.js.</p>
  </plugin>
  <plugin name="BufferMultipeHints" version="1.0.0"
          href="http://vimpr.github.com/"
          summary=";F のヒントで同時にタブを開くようにします。"
          lang="ja"
          xmlns="http://vimperator.org/namespaces/liberator">
    <author email="anekos@snca.net">anekos</author>
    <license>New BSD License</license>
    <project name="Vimperator" minVersion="3.0"/>
    <require type="plugin">_libly.js</require>
    <p>This plugin requires _libly.js.</p>
  </plugin>
</>;
// }}}


(function () {

  if (!plugins.libly)
    return liberator.echoerr(__context__.NAME + ': Please install _libly.js.');

  let scheduled = [];

  plugins.libly.$U.around(
    events,
    'onEscape',
    function (next) {
      try {
        if (scheduled.length)
          scheduled.forEach(function (elem) buffer.followLink(elem, liberator.NEW_BACKGROUND_TAB));
      } finally {
        scheduled = [];
        return next();
      }
    }
  );

  hints._hintModes['F'].action = function (elem) (scheduled.push(elem), hints.show("F"));

})();

// vim:sw=2 ts=2 et si fdm=marker:
