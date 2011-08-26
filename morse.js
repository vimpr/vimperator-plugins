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
  <version>1.2.1</version>
  <author mail="anekos@snca.net" homepage="http://d.hatena.ne.jp/nokturnalmortum/">anekos</author>
  <license>new BSD License (Please read the source code comments of this plugin)</license>
  <license lang="ja">修正BSDライセンス (ソースコードのコメントを参照してください)</license>
  <updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/morse.js</updateURL>
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
<plugin name="Morse" version="1.2.1"
        href="http://github.com/vimpr/vimperator-plugins/blob/master/morse.js"
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
    ',': '--..--',
    '?': '..--..',
    ' ': '-...-',
    '-': '-....-',
    '/': '-..-.',
    '@': '.--.-.',
    '\u30A4': '.-',
    '\u30ED': '.-.-',
    '\u30CF': '-...',
    '\u30CB': '-.-.',
    '\u30DB': '-..',
    '\u30D8': '.',
    '\u30C8': '..-..',
    '\u30C1': '..-.',
    '\u30EA': '--.',
    '\u30CC': '....',
    '\u30EB': '-.--.',
    '\u30F2': '.---',
    '\u30EF': '-.-',
    '\u30AB': '.-..',
    '\u30E8': '--',
    '\u30BF': '-.',
    '\u30EC': '---',
    '\u30BD': '---.',
    '\u30C4': '.--.',
    '\u30CD': '--.-',
    '\u30CA': '.-.',
    '\u30E9': '...',
    '\u30E0': '-',
    '\u30A6': '..-',
    '\u30F0': '.-..-',
    '\u30A4': '.-',
    '\u30ED': '.-.-',
    '\u30CF': '-...',
    '\u30CB': '-.-.',
    '\u30DB': '-..',
    '\u30D8': '.',
    '\u30C8': '..-..',
    '\u30C1': '..-.',
    '\u30EA': '--.',
    '\u30CC': '....',
    '\u30EB': '-.--.',
    '\u30F2': '.---',
    '\u30EF': '-.-',
    '\u30AB': '.-..',
    '\u30E8': '--',
    '\u30BF': '-.',
    '\u30EC': '---',
    '\u30BD': '---.',
    '\u30C4': '.--.',
    '\u30CD': '--.-',
    '\u30CA': '.-.',
    '\u30E9': '...',
    '\u30E0': '-',
    '\u30A6': '..-',
    '\u30F0': '.-..-',
    '\u30CE': '..--',
    '\u30AA': '.-...',
    '\u30AF': '...-',
    '\u30E4': '.--',
    '\u30DE': '-..-',
    '\u30B1': '-.--',
    '\u30D5': '--..',
    '\u30B3': '----',
    '\u30A8': '-.---',
    '\u30C6': '.-.--',
    '\u30A2': '--.--',
    '\u30B5': '-.-.-',
    '\u30AD': '-.-..',
    '\u30E6': '-..--',
    '\u30E1': '-...-',
    '\u30DF': '..-.-',
    '\u30B7': '--.-.',
    '\u30F1': '.--..',
    '\u30D2': '--..-',
    '\u30E2': '-..-.',
    '\u30BB': '.---.',
    '\u30B9': '---.-',
    '\u30F3': '.-.-.',
    '゛': '..',
    '゜': '..--.'
  };

  let codeTableIAlphabet = {};
  let codeTableIKana = {};

  for (let [n, v] in Iterator(codeTable)) {
    if (/[\w.,? \-\/@]/.test(n))
      codeTableIAlphabet[v] = n;
  }

  for (let [n, v] in Iterator(codeTable)) {
    if (/[^a-z]/.test(n))
      codeTableIKana[v] = n;
  }

  let [defaultShort, defaultLong, defaultInterval] = [100, 400, 200];

  let keybd_event =
    (function () {
      try {
        Components.utils.import("resource://gre/modules/ctypes.jsm");
        let user32 = ctypes.open('user32.dll');
        return user32.declare(
            'keybd_event',
            ctypes.stdcall_abi,
            ctypes.void_t,
            ctypes.uint8_t, ctypes.uint8_t, ctypes.int32_t, ctypes.int32_t
          );
      } catch (e) {
        return function () "DO NOTHING";
      }
    })();

  function Morse (short, long, interval) {
    function bing (ch, next) {
      function _bing () {
        keybd_event(0x91, 0x45, 1, 0);
        keybd_event(0x91, 0x45, 3, 0);
      }

      return function () {
        if (ch == ' ')
          return setTimeout(next, interval);
        liberator.log(ch == '.' ? short : long);
        _bing();
        setTimeout(
          function () (_bing(), setTimeout(next, interval)),
          ch == '.' ? short : long
        );
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

  function toCode (text)
    Array.slice(text).map(function (c) codeTable[c.toLowerCase()] || '').join(' ');

  function fromCode (text, kana, char) {
    if (char) {
      let re = new RegExp(util.escapeRegex(char[0]) + '|' + util.escapeRegex(char[1]), 'g');
      text = text.replace(re, function (m) (m === char[0] ? '.' : '-'));
    }

    let table = kana ? codeTableIKana : codeTableIAlphabet;
    let result = '';
    text.split(/\s+/).forEach(function (c) (result += table[c]));
    return result;
  }

  commands.addUserCommand(
    ['morse'],
    'Mooooooooooooorse',
    function (args) {
      let code = args['-raw'] ? args.literalArg : toCode(args.literalArg);

      args['-clipboard'] && util.copyToClipboard(code);
      args['-echo'] && liberator.echo(code);

      let [short, long, interval] =
        [
          args['-short'] || defaultShort,
          args['-long'] || defaultLong,
          args['-interval'] || defaultInterval
        ];

      Morse(short, long, interval)(code);
    },
    {
      literal: 0,
      options: [
        [['-clipboard', '-c'], commands.OPTION_NOARG],
        [['-echo', '-e'], commands.OPTION_NOARG],
        [['-short', '-s'], commands.OPTION_INT],
        [['-long', '-l'], commands.OPTION_INT],
        [['-interval', '-i'], commands.OPTION_INT],
        [['-char', '-char'], commands.OPTION_STRING],
        [['-raw', '-r'], commands.OPTION_NOARG]
      ],
    },
    true
  );

})();

// vim:sw=2 ts=2 et si fdm=marker:

