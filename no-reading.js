/* NEW BSD LICENSE {{{
Copyright (c) 2009-2010, anekos.
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
  <name>No Reading</name>
  <name lang="ja">No Reading</name>
  <description>No reading!</description>
  <description lang="ja">～からデータを転送していますなどの表示を消す(またはecho)</description>
  <version>1.2.2</version>
  <author mail="anekos@snca.net" homepage="http://d.hatena.ne.jp/nokturnalmortum/">anekos</author>
  <license>new BSD License (Please read the source code comments of this plugin)</license>
  <license lang="ja">修正BSDライセンス (ソースコードのコメントを参照してください)</license>
  <updateURL>http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/no-reading.js</updateURL>
  <minVersion>2.2</minVersion>
  <maxVersion>2.3pre</maxVersion>
  <require type="plugin">_libly.js</require>
  <detail><![CDATA[
    let g:no_reading_do_echo = 1
    let g:no_reading_on_statusline = 1
    let g:no_reading_statusline_limit = 1
  ]]></detail>
  <detail lang="ja"><![CDATA[
    let g:no_reading_do_echo = 1
    let g:no_reading_on_statusline = 1
    let g:no_reading_statusline_limit = 1
  ]]></detail>
</VimperatorPlugin>;
// }}}
// INFO {{{
let INFO =
<>
  <plugin name="No-Reading" version="1.2.1"
          href="http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/no-reading.js"
          summary="No Reading"
          lang="en-US"
          xmlns="http://vimperator.org/namespaces/liberator">
    <author email="anekos@snca.net">anekos</author>
    <license>New BSD License</license>
    <project name="Vimperator" minVersion="2.3"/>
    <p>
      Remove or move some messages for statusline.
    </p>
    <item>
      <tags>g:no_reading_do_echo</tags>
      <spec>let g:no_reading_do_echo</spec>
      <spec>liberator.globalVariables.no_reading_do_echo</spec>
      <description>
        <p>substitute by echo</p>
      </description>
    </item>
    <item>
      <tags>g:no_reading_on_statusline</tags>
      <spec>let g:no_reading_on_statusline</spec>
      <spec>liberator.globalVariables.no_reading_on_statusline</spec>
      <description>
        <p>Move displays into statusline.</p>
      </description>
    </item>
  </plugin>
  <plugin name="No-Reading" version="1.2.1"
          href="http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/no-reading.js"
          summary="～からデータを転送していますなどの表示を消したり移動したり"
          lang="ja"
          xmlns="http://vimperator.org/namespaces/liberator">
    <author email="anekos@snca.net">anekos</author>
    <license>New BSD License</license>
    <project name="Vimperator" minVersion="2.3"/>
    <p>
      ～からデータを転送していますなどの表示を消したり、ステータスラインに移動したり、echo したり。
    </p>
    <item>
      <tags>g:no_reading_do_echo</tags>
      <spec>let g:no_reading_do_echo</spec>
      <spec>liberator.globalVariables.no_reading_do_echo</spec>
      <description>
        <p>echo で代用</p>
      </description>
    </item>
    <item>
      <tags>g:no_reading_on_statusline</tags>
      <spec>let g:no_reading_on_statusline</spec>
      <spec>liberator.globalVariables.no_reading_on_statusline</spec>
      <description>
        <p>表示をステータスラインに移動</p>
      </description>
    </item>
  </plugin>
</>;
// }}}

(function () {

    let eraseTimerHandle;
    let label;
    let (
      sl = document.getElementById('liberator-statusline'),
      slfu = document.getElementById('liberator-statusline-field-inputbuffer')
    ) {
      label = document.createElement('label');
      label.setAttribute('id', 'vimperator-plugin-no-reading-label');
      sl.insertBefore(label, slfu);
    }

  let $ = {
    get doEcho ()
      liberator.globalVariables.no_reading_do_echo,

    get onStatusLine ()
      !!liberator.globalVariables.no_reading_on_statusline,

    get statuslineLimit ()
      liberator.globalVariables.no_reading_statusline_limit
  };

  let (doErase = true)
    liberator.plugins.libly.$U.around(
      statusline,
      'updateUrl',
      function (next, args) {
        function setLabel (status) {
          label.tooltipText = status;
          label.value = status;
        }

        function updateStatus (status) {
          doErase = true;
          if ($.onStatusLine) {
            eraseTimerHandle && clearTimeout(eraseTimerHandle);
            if ($.statuslineLimit) {
              eraseTimerHandle =
                setTimeout(
                  function () (eraseTimerHandle = null, setLabel('')),
                  $.statuslineLimit
                );
            }
            setLabel(status);
          } else {
            if ($.doEcho)
              liberator.echo(status, commandline.FORCE_SINGLELINE)
          }
        }

        function showURL () {
          if ($.onStatusLine) {
            setLabel('');
          } else {
            if (doErase && $.doEcho)
              liberator.echo('', commandline.FORCE_SINGLELINE)
          }
          doErase = false;
          return next();
        }

        let [url] = args;
        return (url ? updateStatus : showURL)(url);
      }
    );

})();

// vim:sw=2 ts=2 et si fdm=marker:
