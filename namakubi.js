/* NEW BSD LICENSE {{{
Copyright (c) 2009, anekos.
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
  <name>Namakubi</name>
  <name lang="ja">生首</name>
  <description>Wonderful Namakubi Talker!</description>
  <description lang="ja">素敵な生首トーカー</description>
  <version>1.0.0</version>
  <author mail="anekos@snca.net" homepage="http://d.hatena.ne.jp/nokturnalmortum/">anekos</author>
  <license>new BSD License (Please read the source code comments of this plugin)</license>
  <license lang="ja">修正BSDライセンス (ソースコードのコメントを参照してください)</license>
  <updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/namakubi.js</updateURL>
  <minVersion>2.3pre</minVersion>
  <maxVersion>2.3</maxVersion>
  <detail><![CDATA[
    =  恐怖！喋る生首！ =
    ということで、棒読みちゃんというプログラムを Vimperator で操作するものです。

    = 棒読みちゃん？ =
    棒読みちゃんは日本語のテキストを合成音声で喋らせるプログラムです。
    http://chi.usamimi.info/Program/Application/BouyomiChan/
    で Windows 用バイナリが手に入ります。

    = コマンド =
    :namakubi [-speed=SPEED] [-tone=TONE] [-volume=VOLUME] [-voice=VOICE] [-host=HOST] [-port=PORT] TEXT:
      喋ります！

  ]]></detail>
</VimperatorPlugin>`;
// }}}
// INFO {{{
var INFO = xml`
<plugin name="生首" version="1.0.0"
        href="http://github.com/vimpr/vimperator-plugins/blob/master/namakubi.js"
        summary="Wonderful Namakubi Talker"
        xmlns="http://vimperator.org/namespaces/liberator">
  <author email="anekos@snca.net">anekos</author>
  <license>New BSD License</license>
  <project name="Vimperator" minVersion="2.3"/>
  <p>
    恐怖！喋る生首！
    ということで、棒読みちゃんというプログラムを Vimperator で操作するものです。
  </p>
  <item>
    <tags>:namakubi</tags>
    <spec>
      :namakubi
      <oa>-s<oa>peed</oa>=<a>SPEED</a></oa>
      <oa>-t<oa>one</oa>=<a>TONE</a></oa>
      <oa>-vol<oa>ume</oa>=<a>VOLUME</a></oa>
      <oa>-v<oa>oice</oa>=<a>VOICE</a></oa>
      <oa>-h<oa>ost</oa>=<a>HOST</a></oa>
      <oa>-p<oa>ort</oa>=<a>PORT</a></oa>
      text
    </spec>
    <description>
      <p>
        しゃ、しゃべったぞ！！
      </p>
      <p>各オプション値の意味は以下の通り()内はデフォルト値</p>
      <dl>
        <dt>SPEED</dt><dd>速度(-1)</dd>
        <dt>TONE</dt><dd>音程(-1)</dd>
        <dt>VOLUME</dt><dd>音量(-1)</dd>
        <dt>VOICE</dt><dd>声質(1)</dd>
        <dt>HOST</dt><dd>棒読みちゃんサーバのホスト名("localhost")</dd>
        <dt>PORT</dt><dd>棒読みちゃんサーバのポート番号(50001)</dd>
      </dl>
    </description>
  </item>
  <h3 tag="what-about-bouyomi-chang">棒読みちゃん？</h3>
  <p>
    棒読みちゃんは日本語のテキストを合成音声で喋らせるプログラムです。
    <link topic="http://chi.usamimi.info/Program/Application/BouyomiChan/">http://chi.usamimi.info/Program/Application/BouyomiChan/</link>
    で Windows 用バイナリが手に入ります。
  </p>
</plugin>`;
// }}}

(function () {

  function intToBin (n, sz) {
    let r = '';
    if (n < 0)
      n = 0x100000000 - Math.abs(n);
    for (let i = 0; i < sz; i++)
      r += String.fromCharCode((n >> (i * 8)) & 0xff);
    return r;
  }

  function strToBin (string) {
    return unescape(encodeURIComponent(string));
  }

  let talkOption = {
    speed:  {value: -1,          short: 's',   desc: 'Speech speed (50-300)'},
    tone:   {value: -1,          short: 't',   desc: 'Tone (50-200)'},
    volume: {value: -1,          short: 'vol', desc: 'Volume (0-100)'},
    voice:  {value: 1,           short: 'v',   desc: 'Voice Type (0-8 = Aques Talk, 9- = SAPI)'},
    host:   {value: 'localhost', short: 'h',   desc: 'Hostname of BouyomiChan Server'},
    port:   {value: 50001,       short: 'p',   desc: 'Port number of server'}
  };

  let socketService =
    (function () {
      let stsvc = Components.classes["@mozilla.org/network/socket-transport-service;1"];
      let svc = stsvc.getService();
      return svc.QueryInterface(Components.interfaces["nsISocketTransportService"]);
    })();

  function talk (msg, option) {
    function value (name, size) {
      let v = (option && typeof option[name] !== 'undefined') ? option[name] : talkOption[name].value;
      return (size ? intToBin(v, size) : v);
    }

    let transport = socketService.createTransport(null, 0, value('host'), value('port'), null);
    let outputStream = transport.openOutputStream(0, 0, 0);
    (function () {
      let binaryOutputStream = Components.classes["@mozilla.org/binaryoutputstream;1"].createInstance(Components.interfaces["nsIBinaryOutputStream"]);
      binaryOutputStream.setOutputStream(outputStream);
    })();

    msg = strToBin(msg);
    let buf =
      intToBin(1, 2) +
      value('speed', 2) +
      value('tone', 2) +
      value('volume', 2) +
      value('voice', 2) +
      intToBin(0, 1) +
      intToBin(msg.length, 4) +
      msg;

    outputStream.write(buf, buf.length);
  }

  commands.addUserCommand(
    ['namakubi'],
    'Description',
    function (args) {
      let option = {};
      [option[n] = args['-' + n] for (n in talkOption) if (args['-' + n])];
      talk(args.literalArg, option);
    },
    {
      literal: 0,
      options:
        [
          [
            ['-' + n, '-' + talkOption[n].short],
            commands[(typeof talkOption[n] === 'number') ? 'OPTION_INT' : 'OPTION_ANY']
          ]
          for (n in talkOption)
        ],
      completer: function (context, args) {
        context.title = ['message'];
        /* 素敵な補完募集中！ */
        context.completions = [
          [
            '-speed=1 \u3086\u3063\u304F\u308A\u3057\u3066\u3044\u3063\u3066\u306D\uFF01',
            'Relaxation'
          ],
          [
            '\u306D\u304E\u3092\u3076\u3061\u3053\u3093\u3067\u3084\u308D\u3046\u304B\uFF01',
            'Miku Hatune'
          ]
        ];
      }
    },
    true
  );

  liberator.plugins.namakubi = {
    talk: talk
  };

})();

// vim:sw=2 ts=2 et si fdm=marker:


