// ==VimperatorPlugin==
// @name           Kawase
// @description-ja 外国為替換算
// @license        Creative Commons 2.1 (Attribution + Share Alike)
// @version        1.0
// @author         anekos (anekos@snca.net)
// ==/VimperatorPlugin==
//
// Usage-ja:
//  引数書式
//    :kawase[!] <金額> [<ソース> [<ターゲット>]]
//  ソースをターゲットに換算します。
//  "!" 指定でクリップボードにコピーされます。
//
// Exsample:
//    :kawase 30000 JPY THB

(function () {

  const defaultSource = liberator.globalVariables.umihara_default_source || 'USD';
  const defaultTarget = liberator.globalVariables.umihara_default_target || 'JPY';

  const re = /<td nowrap>(\d+:\d+)<\/td><td>([\d,]+\.[\d,]+)<\/td><td><b>([\d,]+\.[\d,]+)<\/b><\/td><\/tr><\/table><\/div>/;

  const cl = [
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

  function kawase (value, clipboard, from, to) {
    [from, to] = [from || defaultSource, to || defaultTarget].map(function (it) it.toUpperCase());
    let url = 'http://quote.yahoo.co.jp/m5?a=' + value + '&s=' + from + '&t=' + to;
    var req = new XMLHttpRequest();
    req.open('GET', url);
    req.onreadystatechange = function (aEvt) {
      if (req.readyState == 4 && req.status == 200) {
        let m = req.responseText.match(re);
        if (m) {
          let text = from + ' -> ' + to +
                     '\n ' + from + ': ' + value +
                     '\n ' + to + ': ' + m[3] +
                     '\n rate: ' + m[2] +
                     '\n time: ' + m[1];
          liberator.echo(text);
          if (clipboard)
            liberator.modules.util.copyToClipboard(text);
        } else {
          //liberator.open(url);
          liberator.echoerr('parse error');
        }
      }
    };
    req.send(null);
  }

  let extra = {
    argCount: '+',
    bang: true,
    completer: function (context, arg, bang) {
      let last = context.contextList.slice(-1)[0];
      context.title = ['Country Code'];
      context.advance(last.offset - last.caret);
      context.items = completion.filter(cl, last.filter);
      /*
      if (!(arg = commands.parseArgs(arg, extra.options, extra.argCount)))
        return [0, []];
      let m = arg.string.match(/\s(\w+)$/);
      return [(m ? m.index : arg.string.length) + 1, m ? completion.filter(cl, m[1]) : cl];
      */
    }
  };

  //commands.removeUserCommand('kawase');
  commands.addUserCommand(
    ['kawase'],
    'Umihara Kawase Meow',
    function (arg, clipboard) {
      let [value, from, to] = arg.arguments;
      value = eval(value);
      kawase(value, clipboard, from, to);
    },
    extra,
    true
  );

})();
