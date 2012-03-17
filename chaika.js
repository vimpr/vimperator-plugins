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
  <plugin name="Chaika-Controller" version="1.0.0"
          href="http://vimpr.github.com/"
          summary="for Chika"
          lang="en-US"
          xmlns="http://vimperator.org/namespaces/liberator">
    <author email="anekos@snca.net">anekos</author>
    <license>New BSD License</license>
    <project name="Vimperator" minVersion="3.0"/>
    <p></p>
    <item>
      <tags>:chaika deletelog</tags>
      <spec>:chaika deletelog</spec>
      <description><p>
        Delete current thread log.
      </p></description>
    </item>
    <item>
      <tags>:chaika open</tags>
      <spec>:chaika open</spec>
      <description><p>
        open current page in chaika.
      </p></description>
    </item>
  </plugin>
</>;
// }}}

(function () {
  const Chaika = {};
  Components.utils.import("resource://chaika-modules/ChaikaThread.js", Chaika);
  Components.utils.import("resource://chaika-modules/Chaika2chViewer.js", Chaika);

  function deleteCurrentThreadLog () {
    let currentURI = getBrowser().currentURI.QueryInterface(Ci.nsIURL);

    if (currentURI.host != "localhost" && currentURI.host != "127.0.0.1")
      throw "Not chaika tab page";

    if (currentURI.path.substring(0, 8) != "/thread/")
      throw "Not chaika tab page";

    liberator.log(currentURI);
    let URI = util.newURI(currentURI.path.substring(8));

    let thread = new Chaika.ChaikaThread(URI);
    thread.deteleThreadData();
  }

  commands.addUserCommand(
    ['chaika'],
    'Chaika control',
    function (args) {},
    {
      subCommands: [
        new Command(
          ['o', 'open'],
          'Open current page',
          function (args) {
            liberator.open('http://127.0.0.1:8823/thread/' + buffer.URL);
          }
        ),
        new Command(
          ['deletelog'],
          'Delete current thread log',
          function (args) {
            try {
              deleteCurrentThreadLog();
              liberator.echo('Current thread log has been deleted.');
            } catch (ex) {
              liberator.echoerr(ex);
            }
          }
        ),
        new Command(
          ['auth'],
          'Maru auth(?)',
          function (args) {
            Chaika.Chaika2chViewer.auth();
          },
          {
            argCount: '0'
          }
        ),
        new Command(
          ['abonem[anager]'],
          'Open abone manager',
          function (args) {
            liberator.open('chrome://chaika/content/settings/abone-manager.xul', liberator.NEW_TAB);
          },
          {}
        )
      ]
    },
    true
  );

})();

// vim:sw=2 ts=2 et si fdm=marker:

