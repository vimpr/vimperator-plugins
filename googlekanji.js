// ==VimperatorPlugin==
// @name           Google-Kanji
// @description-ja グーグルを使って漢字を検索
// @license        Creative Commons 2.1 (Attribution + Share Alike)
// @version        1.1
// ==/VimperatorPlugin==
//
// Usage:
//    :gkanji うぶめ
//    のようにひらがななどで読みを入力します。
//    すると、
//    :gkcopy
//    が開き、補完が可能になるので、正しそうな漢字を選びます。
//    すると、クリップボードにその漢字がコピーされます。

(function () {

  var copycompl = [];

  function getKanji (word) {
    var re = /[\u4e00-\u9fa0]+/g; // 一-龠
    var ignore = /\u691c\u7d22|\u95a2\u9023/; // 検索|関連
    var req = new XMLHttpRequest();
    var word = encodeURIComponent(word);
    req.open('GET', 'http://www.google.co.jp/search?hl=ja&q=' + word + '&lr=lang_ja', true);
    var f = function () {
      var cnt = {};
      for each (let it in req.responseText.match(re)) {
        if (ignore.test(it))
          continue;
        if (cnt[it])
          cnt[it] += 1;
        else
          cnt[it] = 1;
      }
      var cnta = [];
      for (let i in cnt) {
        if (cnt[i] < 3)
          continue;
        cnta.push([i, cnt[i]]);
      }
      cnta.sort(function (a, b) b[1] - a[1]);
      copycompl = cnta;
      commandline.open(":", "gkcopy ", modes.EX);
    };
    req.onreadystatechange = function (aEvt) {
      if (req.readyState == 4 && req.status == 200) {
        f();
      }
    };
    req.send(null);
  }

  commands.addUserCommand(
    ['gkanji', 'googlekanji'],
    'Google kanji',
    function (arg) getKanji(arg.string),
    {},
    true
  );

  function copyToClipboard (copytext) {
    const supstr = Cc["@mozilla.org/supports-string;1"].createInstance(Ci.nsISupportsString);
    const trans  = Cc["@mozilla.org/widget/transferable;1"].createInstance(Ci.nsITransferable);
    const clipid = Ci.nsIClipboard;
    const clip   = Cc["@mozilla.org/widget/clipboard;1"].getService(clipid);

    supstr.data = copytext;
    trans.addDataFlavor("text/unicode");
    trans.setTransferData("text/unicode", supstr, copytext.length * 2);

    clip.setData(trans, null, clipid.kGlobalClipboard);
  }

  commands.addUserCommand(
    ['gkcopy'],
    'Google kanji',
    copyToClipboard,
    {
      completer: function (context) {
        context.title = ['kanji', 'count'];
        context.items = copycompl;
      }
    },
    true
  );


})();
