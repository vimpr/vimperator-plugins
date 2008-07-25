// ==VimperatorPlugin==
// @name           Google-Kanji
// @description-ja グーグルを使って漢字を検索
// @license        Creative Commons 2.1 (Attribution + Share Alike)
// @version        1.0
// ==/VimperatorPlugin==
//
// Usage:
//    :gkanji うぶめ
//    のようにひらがななどで読みを入力します。
//    すると、
//    :gkcopy
//    が開き、補完が可能になるので、正しそうな漢字を選びます。
//    すると、クリップボードにその漢字がコピーされます。

(function () { try{

  var copycompl = [];

  function getKanji (word) {
    var re = /[一-龠]+/g;
    var ignore = /検索|関連/;
    var spaces = /^\s+$/;
    var req = new XMLHttpRequest();
    var word = encodeURIComponent(word);
    liberator.log(word);
    req.open('GET', 'http://www.google.co.jp/search?hl=ja&q=' + word + '&lr=lang_ja', true);
    var f = function () {
      var cnt = {};
      for each (var it in req.responseText.match(re)) {
        if (!it.match || it.match(ignore))
          continue;
        if (cnt[it])
          cnt[it] += 1;
        else
          cnt[it] = 1;
      }
      var cnta = [];
      for (var i in cnt) {
        if (cnt[i] < 3)
          continue;
        cnta.push([i, cnt[i]]);
      }
      cnta.sort(function (a, b) b[1] - a[1]);
      copycompl = cnta;
      liberator.commandline.open(":", "gkcopy ", liberator.modes.EX);
    }; 
    req.onreadystatechange = function (aEvt) {
      if (req.readyState == 4) {
        if(req.status == 200) {
          f();
        }
      }
    };
    req.send(null); 
  }

  liberator.commands.addUserCommand(
    ['gkanji', 'googlekanji'],
    'google kanji',
    function (word) {
      getKanji(word);
    }
  );

  function copyToClipboard (copytext) {
    const supstr  = Cc["@mozilla.org/supports-string;1"].createInstance(Ci.nsISupportsString);
    const trans   = Cc["@mozilla.org/widget/transferable;1"].createInstance(Ci.nsITransferable);
    const clipid  = Ci.nsIClipboard;
    const clip    = Cc["@mozilla.org/widget/clipboard;1"].getService(clipid);
      
    supstr.data = copytext;
    trans.addDataFlavor("text/unicode");
    trans.setTransferData("text/unicode", supstr, copytext.length * 2);

    clip.setData(trans, null, clipid.kGlobalClipboard);
  }

  liberator.commands.addUserCommand(
    ['gkcopy'],
    'google kanji',
    function (word) {
      copyToClipboard(word); 
    },
    {
      completer: function (args) {
        return [0, copycompl];
      }
    }
  );


}catch(e){liberator.log(e)}})();
