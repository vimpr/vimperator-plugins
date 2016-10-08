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
var PLUGIN_INFO = xml`
<VimperatorPlugin>
  <name>Yet Mappings</name>
  <description>Display the keys that are not mapped yet.</description>
  <description lang="ja">まだマップされていないキーを表示する</description>
  <version>1.2.0</version>
  <author mail="anekos@snca.net" homepage="http://d.hatena.ne.jp/nokturnalmortum/">anekos</author>
  <license>new BSD License (Please read the source code comments of this plugin)</license>
  <license lang="ja">修正BSDライセンス (ソースコードのコメントを参照してください)</license>
  <updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/yetmappings.js</updateURL>
  <minVersion>2.3</minVersion>
  <maxVersion>2.4</maxVersion>
  <detail><![CDATA[
    == Usage ==
       :yetmap[pings] [<KEYS>]
       :ymap [<KEYS>]
       :yethintmodes
       :ymode
    == Links ==
      http://d.hatena.ne.jp/nokturnalmortum/20081109/1226223461
  ]]></detail>
</VimperatorPlugin>`;
// }}}

(function () {
  const other = '! @ # $ % ^ & * ( ) _ + | ~ { } : " < > ? - = \\ ` [ ] ; \' , . /'.split(/\s/);
  const special = 'Esc Return Tab Del BS Home Insert End Left Right Up Down PageUp PageDown F1 F2 F3 F4 F5 F6 F7 F8 F9 F10 F11 F12'.split(/\s/).map(function (it) ("<" + it + ">"));
  const alpha = 'a b c d e f g h i j k l m n o p q r s t u v w x y z'.split(/\s/);
  const number = '0 1 2 3 4 5 6 7 8 9'.split(/\s/);
  const keys = alpha.concat(alpha.map(String.toUpperCase)).concat(other).concat(special);

  function exists (modes, key)
    (mappings.getCandidates(modes, key).length || mappings.get(modes, key));

  function getYetMappings (pre, modes)
    keys.filter(function (key) (!exists(modes, pre + key)));


  function addCommand (char, modes) {
    commands.addUserCommand(
      [char + 'yetmap[pings]', char + 'ymap'],
      'display the keys that are not mapped yet.',
      function (arg) {
        liberator.echo(getYetMappings(arg.string || '', modes).join(' '));
      },
      {
        argCount: '*'
      },
      true
    );
  }

  for (let [name, mode] in Iterator(modes._modeMap)) {
    if (!mode.char)
      continue;
    addCommand(mode.char, [modes[name]]);
  }
  addCommand('', [modes.NORMAL]);

  commands.addUserCommand(
    ['yethintmodes', 'ymode'],
    'display the hint-modes that are not mapped yet.',
    function (arg) {
      const keys = alpha.concat(alpha.map(String.toUpperCase)).concat(other).concat(number);
      liberator.echo(keys.filter(function (m) !hints._hintModes[m]).join(' '));
    },
    {
      argCount: '0'
    },
    true
  );

  liberator.plugins.yet_mappgins = {
    get: getYetMappings
  };
})();

