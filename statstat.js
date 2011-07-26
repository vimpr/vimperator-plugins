/* NEW BSD LICENSE {{{
Copyright (c) 2008-2010, anekos.
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
  <name>Stat Stat</name>
  <name lang="ja">すた☆すた</name>
  <description>Show information on statusline.</description>
  <description lang="ja">ステータスラインに情報を表示</description>
  <version>1.0.4</version>
  <author mail="anekos@snca.net" homepage="http://d.hatena.ne.jp/nokturnalmortum/">anekos</author>
  <license>new BSD License (Please read the source code comments of this plugin)</license>
  <license lang="ja">修正BSDライセンス (ソースコードのコメントを参照してください)</license>
  <updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/statstat.js</updateURL>
  <minVersion>3.0</minVersion>
  <maxVersion>3.0</maxVersion>
  <detail><![CDATA[
    Usage:
      :statstat <JS_EXPRESSION>
    Links:
      http://d.hatena.ne.jp/nokturnalmortum/20081202/1228218135
  ]]></detail>
</VimperatorPlugin>;
// }}}
// INFO {{{
let INFO =
<plugin name="Stat Stat" version="1.0.4"
        href="http://github.com/vimpr/vimperator-plugins/blob/master/statstat.js"
        summary="Show information on statusline."
        xmlns="http://vimperator.org/namespaces/liberator">
  <author email="anekos@snca.net">anekos</author>
  <license>New BSD License</license>
  <project name="Vimperator" minVersion="3.0" maxVersion="3.0"/>
  <p>
  </p>
  <item>
    <tags>:statstat</tags>
    <spec>:statstat <a>jsExpression</a></spec>
    <description>
      <p>
        Set the expression for displaying information on statline.
      </p>
    </description>
  </item>
</plugin>;
// }}}

(function () {

  let stat = liberator.plugins.statstat;
  let defaultExpression = liberator.globalVariables.statstat_expression;
  let defaultInterval = liberator.globalVariables.statstat_interval;
  let autorun = s2b(liberator.globalVariables.statstat_autorun, false);

  function s2b (s, d) (!/^(\d+|false)$/i.test(s)|parseInt(s)|!!d*2)&1<<!s;
  function e2a (e)
    (typeof e === 'function' ? function () e()
                             : function () liberator.eval(e));

  // Initialize
  if (stat) {
    let e = stat.panel;
    if (e && e.parentNode)
      e.parentNode.removeChild(e);
    if (stat.handle) {
      clearInterval(stat.handle);
      stat.handle = null;
    }
  }

  {
    let panel = this.panel = document.createElement('statusbarpanel');
    panel.setAttribute('id', 'ank-stat-stat-panel');
    let label = document.createElement('label');
    label.setAttribute('value', '-----');
    panel.appendChild(label);
    let stbar = document.getElementById('status-bar');
    stbar.appendChild(panel);

    stat = liberator.plugins.statstat = {
      previousText: null,
      panel: panel,
      label: label,
      interval: 1000,
      set text (value) {
        value = value.toString();
        if (this.previousText === value)
          return value;
        this.label.setAttribute('value', '<- ' + value + ' ->');
        this.previousText = value;
        return value;
      },
      action: function () new Date().toLocaleString(),
      execute: function () (this.text = this.action.apply(this, arguments)),
      run: function () {
        let self = this;
        Array.slice(arguments).forEach(function (v) {
          if (v instanceof Function)
            self.action = v;
          else if (typeof v == 'string')
            self.action = function () liberator.eval(v);
          else if (typeof v == 'number')
            self.interval = v;
        });
        this.handle = setInterval(function () self.execute(), this.interval);
      },
      handle: null
    };
  }

  // set default
  if (defaultExpression)
    stat.action = e2a(defaultExpression);
  if (defaultInterval)
    stat.interval = parseInt(defaultInterval);
  if (autorun)
    stat.run();

  commands.addUserCommand(
    ['statstat'],
    'Run statstat',
    function (arg) {
      if (stat.handle)
        clearInterval(stat.handle);
      let interval = arg.count ? arg.count * 100 : 100;
      stat.action = e2a(arg.string);
      stat.handle = setInterval(function () stat.execute(), interval);
    },
    {
      completer: function (context) completion.javascript(context),
      argCount: '*',
      count: true
    },
    true
  );

})();

// vim:sw=2 ts=2 et si fdm=marker:
