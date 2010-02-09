/* NEW BSD LICENSE {{{
Copyright (c) 2010, anekos.
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
  <name>Morse</name>
  <name lang="ja">Morse</name>
  <description>Morse code (Windows only)</description>
  <description lang="ja">モールス信号 (Windows専用)</description>
  <version>1.0.0</version>
  <author mail="anekos@snca.net" homepage="http://d.hatena.ne.jp/nokturnalmortum/">anekos</author>
  <license>new BSD License (Please read the source code comments of this plugin)</license>
  <license lang="ja">修正BSDライセンス (ソースコードのコメントを参照してください)</license>
  <updateURL>http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/morse.js</updateURL>
  <minVersion>2.3</minVersion>
  <maxVersion>2.3</maxVersion>
  <detail><![CDATA[
    :morse text:
      output text by morse code.
  ]]></detail>
  <detail lang="ja"><![CDATA[
    :morse text:
      output text by morse code.
  ]]></detail>
</VimperatorPlugin>;
// }}}
// INFO {{{
let INFO =
<plugin name="Morse" version="1.0.0"
        href="http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/morse.js"
        summary="Morse code"
        xmlns="http://vimperator.org/namespaces/liberator">
  <author email="anekos@snca.net">anekos</author>
  <license>New BSD License</license>
  <project name="Vimperator" minVersion="2.3"/>
  <p>
  </p>
  <item>
    <tags>:morse</tags>
    <spec>:morse <a>text</a></spec>
    <description>
      <p>
        output <a>text</a> by morse code.
      </p>
    </description>
  </item>
</plugin>;
// }}}


(function () {

  let codeTable = {
    a: '.-',
    b: '-...',
    c: '-.-.',
    d: '-..',
    e: '.',
    f: '..-.',
    g: '--.',
    h: '....',
    i: '..',
    j: '.---',
    k: '-.-',
    l: '.-..',
    m: '--',
    n: '-.',
    o: '---',
    p: '.--.',
    q: '--.-',
    r: '.-.',
    s: '...',
    t: '-',
    u: '..-',
    v: '...-',
    w: '.--',
    x: '-..-',
    y: '-.--',
    z: '--..',
    1: '.----',
    2: '..---',
    3: '...--',
    4: '....-',
    5: '.....',
    6: '-....',
    7: '--...',
    8: '---..',
    9: '----.',
    0: '-----',
    '.': '.-.-.-',
    '': '--..--',
    '?': '..--..',
    ' ': '-...-',
    '-': '-....-',
    '/': '-..-.',
    '@': '.--.-.',
    'イ': '.-',
    'ロ': '.-.-',
    'ハ': '-...',
    'ニ': '-.-.',
    'ホ': '-..',
    'ヘ': '.',
    'ト': '..-..',
    'チ': '..-.',
    'リ': '--.',
    'ヌ': '....',
    'ル': '-.--.',
    'ヲ': '.---',
    'ワ': '-.-',
    'カ': '.-..',
    'ヨ': '--',
    'タ': '-.',
    'レ': '---',
    'ソ': '---.',
    'ツ': '.--.',
    'ネ': '--.-',
    'ナ': '.-.',
    'ラ': '...',
    'ム': '-',
    'ウ': '..-',
    'ヰ': '.-..-',
    'イ': '.-',
    'ロ': '.-.-',
    'ハ': '-...',
    'ニ': '-.-.',
    'ホ': '-..',
    'ヘ': '.',
    'ト': '..-..',
    'チ': '..-.',
    'リ': '--.',
    'ヌ': '....',
    'ル': '-.--.',
    'ヲ': '.---',
    'ワ': '-.-',
    'カ': '.-..',
    'ヨ': '--',
    'タ': '-.',
    'レ': '---',
    'ソ': '---.',
    'ツ': '.--.',
    'ネ': '--.-',
    'ナ': '.-.',
    'ラ': '...',
    'ム': '-',
    'ウ': '..-',
    'ヰ': '.-..-',
  };

  Components.utils.import("resource://gre/modules/ctypes.jsm");
  let user32 = ctypes.open('user32.dll');
  let keybd_event =
    user32.declare(
      'keybd_event',
      ctypes.stdcall_abi,
      ctypes.void_t,
      ctypes.uint8_t, ctypes.uint8_t, ctypes.int32_t, ctypes.int32_t
    );

  function u (string)
    unescape(encodeURIComponent(string));

  function Morse (short, long, interval) {
    function bing (ch, next) {
      function _bing () {
        keybd_event(0x91, 0x45, 1, 0);
        keybd_event(0x91, 0x45, 3, 0);
      }

      function bong () {
        _bing();
        setTimeout(function () (next && next()), interval);
      }

      return function () {
          let time = ch == '.' ? short : long;
          _bing();
          setTimeout(bong, time);
      };
    }

    function bings (codes) {
      let [code,]  = codes;
      if (!code)
        return function () "DO NOTHING";
      return bing(code, bings(codes.slice(1)));
    }

    return function (codes) bings(codes)();
  }

  function code (text)
    Array.slice(text).map(function (c) codeTable[u(c.toLowerCase())] || '').join('');

  let morse = Morse(100, 500, 100);

  commands.addUserCommand(
    ['morse'],
    'Mooooooooooooorse',
    function (args) {
      morse(code(args.literalArg));
    },
    {
      literal: 0
    },
    true
  );


})();

// vim:sw=2 ts=2 et si fdm=marker:

