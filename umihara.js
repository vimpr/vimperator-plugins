/* {{{
Copyright (c) 2008-2011, anekos.
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
  <name>Exchange Converter</name>
  <name lang="ja">外国為替換算</name>
  <description>for exchangeconvertion</description>
  <description lang="ja">為替換算をします</description>
  <version>1.1.2</version>
  <author mail="anekos@snca.net" homepage="http://d.hatena.ne.jp/nokturnalmortum/">anekos</author>
  <license>new BSD License (Please read the source code comments of this plugin)</license>
  <license lang="ja">修正BSDライセンス (ソースコードのコメントを参照してください)</license>
  <minVersion>2.0pre</minVersion>
  <maxVersion>2.0pre</maxVersion>
  <detail><![CDATA[
    == Usage ==
      :kawase[!] <VALUE> [<SOURCE> [<TARGET>]]:
      :kawase[!] <VALUE> <SOURCE1> <SOURCE2> ... <TARGET>:
        Convert <SOURCE> to <TARGET>.
        When used with "!", copy result to clipboard.
    === Example ===
       :kawase 30000 JPY THB
    == Global Variables ==
      - g:umihara_default_source
      - g:umihara_default_target
      === Example ===
      >||
        let g:umihara_default_source="USD"
        let g:umihara_default_target="JPY"
      ||<
    == Require ==
      _libly.js
  ]]></detail>
  <detail lang="ja"><![CDATA[
    == Usage ==
      :kawase[!] <金額> [<ソース> [<ターゲット>]]:
      :kawase[!] <金額> <ソース1> <ソース2> ... <ターゲット>:
        ソースをターゲットに換算します。
        "!" 指定でクリップボードにコピーされます。
      === Example ===
        >||
          :kawase 30000 JPY THB
        ||<
    == Global Variables ==
      引数省略時のデフォルト値を設定します
      - g:umihara_default_source
      - g:umihara_default_target
      === Example ===
        >||
          let g:umihara_default_source="USD"
          let g:umihara_default_target="JPY"
        ||<
    == Require ==
      _libly.js
  ]]></detail>
</VimperatorPlugin>`;
// }}}

(function () {

  const defaultSource = liberator.globalVariables.umihara_default_source || 'USD';
  const defaultTarget = liberator.globalVariables.umihara_default_target || 'JPY';

  const ContryCodes = [
    ['USD', '\u30a2\u30e1\u30ea\u30ab\u30c9\u30eb'],
    ['GBP', '\u30a4\u30ae\u30ea\u30b9 \u30dd\u30f3\u30c9'],
    ['INR', '\u30a4\u30f3\u30c9 \u30eb\u30d4\u30fc'],
    ['IDR', '\u30a4\u30f3\u30c9\u30cd\u30b7\u30a2 \u30eb\u30d4\u30a2'],
    ['ECS', '\u30a8\u30af\u30a2\u30c9\u30eb \u30b9\u30af\u30ec'],
    ['EGP', '\u30a8\u30b8\u30d7\u30c8 \u30dd\u30f3\u30c9'],
    ['AUD', '\u30aa\u30fc\u30b9\u30c8\u30e9\u30ea\u30a2 \u30c9\u30eb'],
    ['CAD', '\u30ab\u30ca\u30c0 \u30c9\u30eb'],
    ['KRW', '\u97d3\u56fd \u30a6\u30a9\u30f3'],
    ['KWD', '\u30af\u30a6\u30a7\u30fc\u30c8 \u30c7\u30a3\u30ca\u30fc\u30eb'],
    ['COP', '\u30b3\u30ed\u30f3\u30d3\u30a2 \u30da\u30bd'],
    ['SAR', '\u30b5\u30a6\u30b8 \u30ea\u30a2\u30eb'],
    ['SGD', '\u30b7\u30f3\u30ac\u30dd\u30fc\u30eb \u30c9\u30eb'],
    ['CHF', '\u30b9\u30a4\u30b9 \u30d5\u30e9\u30f3'],
    ['SEK', '\u30b9\u30a6\u30a7\u30fc\u30c7\u30f3 \u30af\u30ed\u30fc\u30ca'],
    ['THB', '\u30bf\u30a4 \u30d0\u30fc\u30c4'],
    ['TWD', '\u53f0\u6e7e \u30c9\u30eb'],
    ['CNY', '\u4e2d\u56fd \u5143'],
    ['CLP', '\u30c1\u30ea \u30da\u30bd'],
    ['DKK', '\u30c7\u30f3\u30de\u30fc\u30af \u30af\u30ed\u30fc\u30cd'],
    ['TRY', '\u30c8\u30eb\u30b3 \u30ea\u30e9'],
    ['JPY', '\u65e5\u672c \u5186'],
    ['NZD', '\u30cb\u30e5\u30fc\u30b8\u30fc\u30e9\u30f3\u30c9 \u30c9\u30eb'],
    ['NOK', '\u30ce\u30eb\u30a6\u30a7\u30fc \u30af\u30ed\u30fc\u30cd'],
    ['PYG', '\u30d1\u30e9\u30b0\u30a2\u30a4 \u30b0\u30a1\u30e9\u30cb'],
    ['PHP', '\u30d5\u30a3\u30ea\u30d4\u30f3 \u30da\u30bd'],
    ['BRL', '\u30d6\u30e9\u30b8\u30eb \u30ea\u30a2\u30eb'],
    ['VEF', '\u30d9\u30cd\u30ba\u30a8\u30e9 \u30dc\u30ea\u30d0\u30eb\u30fb\u30d5\u30a8\u30eb\u30c6'],
    ['PEN', '\u30da\u30eb\u30fc \u30bd\u30eb'],
    ['HKD', '\u9999\u6e2f \u30c9\u30eb'],
    ['MYR', '\u30de\u30ec\u30fc\u30b7\u30a2 \u30ea\u30f3\u30ae'],
    ['ZAR', '\u5357\u30a2\u30d5\u30ea\u30ab \u30e9\u30f3\u30c9'],
    ['MXN', '\u30e1\u30ad\u30b7\u30b3 \u30da\u30bd'],
    ['AED', 'UAE \u30c0\u30fc\u30cf\u30e0'],
    ['EUR', '\u6b27\u5dde \u30e6\u30fc\u30ed'],
    ['JOD', '\u30e8\u30eb\u30c0\u30f3 \u30c7\u30a3\u30ca\u30fc\u30eb'],
    ['RON', '\u30eb\u30fc\u30de\u30cb\u30a2 \u30ec\u30a6'],
    ['LBP', '\u30ec\u30d0\u30ce\u30f3 \u30dd\u30f3\u30c9'],
    ['RUB', '\u30ed\u30b7\u30a2\u30f3 \u30eb\u30fc\u30d6\u30eb'],
  ];

  function echo (msg) {
    liberator.echo(xml`<pre>${msg}</pre>`);
  }

  function kawase (value, clipboard, from, to) {
    let resultBuffer = '';

    [from, to] = [from || defaultSource, to || defaultTarget].map(function (it) it.toUpperCase());
    if (from == '-')
      from = defaultSource;
    if (to == '-')
      to = defaultTarget;
    //let url = 'http://quote.yahoo.co.jp/m5?a=' + value + '&s=' + from + '&t=' + to;
    let url = 'http://info.finance.yahoo.co.jp/fx/convert/?a=' + value + '&s=' + from + '&t=' + to;
    var req = new XMLHttpRequest();
    req.open('GET', url);
    req.onreadystatechange = function (aEvt) {
      if (req.readyState == 4 && req.status == 200) {
        let html = req.responseText;
        let doc = liberator.plugins.libly.$U.createHTMLDocument(html);
        let a = doc.querySelector('tbody > tr > td > a[href^="http://rdsig.yahoo.co.jp"]');
        if (a) {
          let tr = a.parentNode.parentNode;
          liberator.__tr = tr;
          let toValue = tr.querySelectorAll('td')[3].textContent;
          let rateTime = tr.querySelectorAll('td')[2].textContent.match(/([\d,]+\.[\d,]+)[^\d]*(\d+:\d+)/);
          let rate = rateTime[1];
          let time = rateTime[2];
          let text = from + ' -> ' + to +
                     '\n ' + from + ': ' + value +
                     '\n ' + to + ': ' + toValue +
                     '\n rate: ' + rate +
                     '\n time: ' + time;
          echo('<<Results>>\n' + text);
          if (clipboard) {
            resultBuffer += text + '\n';
            util.copyToClipboard(resultBuffer);
          }
        } else {
          liberator.echoerr('parse error');
        }
      }
    };
    req.send(null);
  }

  function evalValue (value) {
    let sandbox = new Cu.Sandbox('about:blank');
    return Cu.evalInSandbox(value, sandbox);
  }

  let extra = {
    argCount: '+',
    bang: true,
    options: [
      [['-clipboard', '-c'], commands.OPTION_NOARG],
    ],
    completer: function (context, args) {
      if (args.length == 1) {
        // TODO - history
      } else {
        let  def = args.length < 3 ? defaultSource
                                   : defaultTarget;
        context.title = ['Country Code', 'Country Name'];
        context.completions = [['-', def]].concat(ContryCodes);
      }
    }
  };

  commands.addUserCommand(
    ['kawase'],
    'Umihara Kawase Meow',
    function (args) {
      if (args.length == 0)
        args.push('1');

      while (args.length < 3)
        args.push('-');

      for (let i = 1, l = args.length - 1; i < l; i++) {
        let [value, from, to] = [args[0], args[i], l == i ? '-' : args[l]];
        value = evalValue(value);
        kawase(value, args['-clipboard'] || args.bang, from, to);
      }
    },
    extra,
    true
  );

})();


// vim:sw=2 ts=2 et si fdm=marker:
