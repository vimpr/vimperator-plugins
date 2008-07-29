// ==VimperatorPlugin==
// @name           Auto Detect Link
// @description-ja (次|前)っぽいページへのリンクを探してジャンプ
// @license        Creative Commons 2.1 (Attribution + Share Alike)
// @version        1.0
// ==/VimperatorPlugin==
//
//  Usage:
//    デフォルトの設定では、"]]" "[[" を上書きします。
//    ]]    次っぽいページへ
//    [[    前っぽいページへ
//
//  Setting:
//    liberator.globalVariables.autoDetectLink
//      nextPatterns:
//      backPatterns:
//        (次|前)のパターンの配列。
//        要素は、
//          ・リンク文字列に対する(正規表現|文字列)
//          ・リンクに対する関数のリスト
//      nextMappings:
//      backPatterns:
//        (次|前)移動のマッピング(Array)
//      useNextHistory:
//      useBackHistory:
//        履歴を併用。
//        履歴がある場合はそっちを優先します。
//      useSuccPattern:
//        doc_01.html のときは、 doc_02.html を次と見なす…ようなパターン。
//        ファイル名に当たる部分の、数字列あるいは一文字のアルファベットが対象です。
//        (つながっているアルファベットは無視されます。)
//          doc_02.html => doc_03.html
//          doc_a.html => doc_b.html
//      force:
//        (次|前)っぽいURIを捏造してそこに移動します。
//
//  Function:
//    (次|前)へのリンクを検出する。
//    liberator.plugins.autoDetectLink.detect(next, setting)
//      next:     次のリンクを探すときは、true。
//      setting:  設定を一時的に上書きする。省略可。
//      return:   リンクのURIなどを含んだオブジェクト
//        uri:    アドレス。
//        text:   リンクテキストなど。
//        frame:  リンクの存在するフレームの Window オブジェクト。
//
//    (次|前)へのリンクに移動。
//    liberator.plugins.autoDetectLink.go(next, setting)
//      引数は detect と同じ。
//
//    example:
//      履歴を使用しないで、前のリンクを探す。
//        liberator.plugins.autoDetectLink.detect(false, {useBackHistory: false});
//
// Note:
//    単純なリンクと、フォームのボタンを検出できます。
//
// License:
//    http://creativecommons.org/licenses/by-sa/2.1/jp/
//    http://creativecommons.org/licenses/by-sa/2.1/jp/deed.en_CA
//
// TODO:
//    input / form
//    history


(function () { try{
  liberator.log('auto_detect_link.js loading');

  ////////////////////////////////////////////////////////////////
  // default setting
  ////////////////////////////////////////////////////////////////

  let defaultSetting = {
    nextPatterns: [
      /ＮＥＸＴ/, /ｎｅｘｔ/, /Ｎｅｘｔ/, 
      /^次(へ|の)/, /つぎへ/, /つづく/, /続/, /次/, /つぎ/, /next/i, /進む/,
      /^>$/, />>/, />/
    ],
    backPatterns: [
      /back/i, /back/i, /ＢＡＣＫ/, /ＰＲＥＶ/, 
      /^前(へ|の)/, /前/, /戻る/, /^<$/, /<</, /</
    ],
    nextMappings: [']]'],
    backMappings: ['[['],
    useSuccPattern: true,
    useNextHistory: false,
    useBackHistory: false,
    //clickButton: true,
    force: false,
  }

  ////////////////////////////////////////////////////////////////
  // setting
  ////////////////////////////////////////////////////////////////

  let _gv;

  // 評価を遅延するために関数にしておく
  function gv () {
    if (_gv) 
      return _gv;

    if (liberator.globalVariables) {
      if (!liberator.globalVariables.autoDetectLink)
        liberator.globalVariables.autoDetectLink = {};
      _gv = liberator.globalVariables.autoDetectLink;
    }

    for (let key in defaultSetting) {
      if (_gv[key] == undefined)
        _gv[key] = defaultSetting[key];
    }

    return _gv;
  }


  ////////////////////////////////////////////////////////////////
  // functions
  ////////////////////////////////////////////////////////////////

  // Array#find
  function find (ary, f) {
    let func = (typeof f == 'function') ? f : function (v) v == f;
    for (var i = 0; i < ary.length; i++) {
      if (func(ary[i])) {
        return ary[i];
      }
    }
    return null;
  }


  // 要素をクリックする
  function clickElement (elem) {
    liberator.log('click: ' + elem);
    var e = content.document.createEvent('MouseEvents');
    e.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null); 
    elem.dispatchEvent( e ); 
  }


  // 開いたURIなどの表示
  function displayOpened (link) {
    let msg = 'open <' + link.text + '> ' + link.uri;
    setTimeout(function () liberator.echo(msg), 1000);
    liberator.log(msg);
  }


  // リンクを開く
  function open (link) {
    liberator.log(link);
    if (link.element) {
      clickElement(link.element);
    } else if (link.uri) {
      link.frame.location.href = link.uri
    }
    displayOpened(link);
  }


  // 元の文字列、詰め込む文字、長さ
  function padChar (s, c, n) {
    return s.replace(new RegExp('^(.{0,'+(n-1)+'})$'), function(s)padChar(c+s,c,n));
  }


  // (次|前)の数字文字列リストを取得
  function succNumber (n, next) {
    let m = (parseInt(n.replace(/^0*(.)/,'$1')||0) + (next ? 1 : -1)).toString();
    let result = [m];
    if (m.length < n.length)
      result.unshift(padChar(m.toString(), '0', n.length));
    return result;
  }


  // (次|前)の文字列リストを取得
  function succString (s, next) {
    let result = [], d = next ? 1 : -1;
    let c = String.fromCharCode(s.charCodeAt(0) + d);
    if (('a' <= c && c <= 'z') || 'A' <= c && c <= 'Z')
      result.push(c);
    return result;
  }


  // (次|前)のURIリストを取得
  function succURI (uri, next) {
    let urim = uri.match(/^(.+\/)([^\/]+)$/);
    if (!urim)
      return [];
    let [_, dir, file] = urim, result = [];
    // succ number
    let (dm, succs, file = file, left = '') {
      while (file && (dm = file.match(/\d+/))) {
        let [rcontext, lcontext, lmatch] = [RegExp.rightContext, RegExp.leftContext, RegExp.lastMatch];
        left += lcontext;
        succs = succNumber(lmatch, next);
        for each (let succ in succs) {
          result.push(dir + left + succ + rcontext);
        }
        left += lmatch;
        file = rcontext;
      }
    }
    // succ string
    let (dm, succs, file = file, left = '') {
      while (file && (dm = file.match(/(^|[^a-zA-Z])([a-zA-Z])([^a-zA-Z]|$)/))) {
        let [rcontext, lcontext] = [RegExp.rightContext, RegExp.leftContext];
        left += lcontext + dm[1];
        succs = succString(dm[2], next);
        for each (let succ in succs) {
          result.push(dir + left + succ + dm[3] + rcontext);
        }
        left += dm[1];
        file = dm[3] + rcontext;
      }
    }
    return result;
  }


  // パターンマッチング
  function match (pattern, link) {
    if (pattern instanceof Function)
      return pattern(link);
    if (!link.text)
      return;
    if (pattern instanceof RegExp)
      return pattern.test(link.text);
    return link.text.toLowerCase().indexOf(pattern.toString().toLowerCase()) >= 0;
  }


  // XPath
  function getElementByXPath (xpath, root) {
    let res = content.document.evaluate(xpath, root, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
    if (res)
      return res.singleNodeValue;
  }


  // XPath
  function getElementsByXPath (xpath, root) {
    let result = [], res = content.document.evaluate(xpath, root, null, 7, null);
    for (let i = 0; i < res.snapshotLength; i++)
      result.push(res.snapshotItem(i));
    return result;
  }


  // リンクのフィルタ
  function linkFilter (link) {
    return link.href && !link.href.match(/@/) && link.href.match(/^((https?|file|ftp):\/\/|javascript:)/) && link.textContent;
  }


  // 全てのリンクを取得
  // 再帰的にフレーム内のも取得する
  function getAllLinks (content) {
    var result = [];
    // Anchor
    for each (let it in content.document.links) {
      if (linkFilter(it))
        result.push({frame: content, uri: it.href, text: it.textContent, element: it});
    }
    // Form
    for each (let input in content.document.getElementsByTagName('input')) {
      (function (input) {
        result.push({
          frame: content, 
          uri: input.form.action, 
          text: input.value,
          click: input.click,
          element: input,
          });
      })(input);
    }
    // Frame
    if (content.frames) {
      for (let i = 0; i < content.frames.length; i++) {
        result = result.concat(getAllLinks(content.frames[i]));
      }
    }
    return result;
  }


  // 上書きした設定を返す。
  function getCurrentSetting (setting) {
    if (!setting)
      setting = {};
    for (let n in gv()) {
      if (setting[n] == undefined)
        setting[n] = gv()[n];
    }
    return setting;
  }


  ////////////////////////////////////////////////////////////////
  // main
  ////////////////////////////////////////////////////////////////

  // リンクを探す
  function detect (next, setting) {
    try {
      setting = getCurrentSetting(setting);

      patterns = next ? setting.nextPatterns : setting.backPatterns;

      let uri = window.content.location.href;
      let links = getAllLinks(window.content);

      // keywords
      if (1) {
        for each (let pattern in patterns) {
          let link = find(links, function (link) match(pattern, link));
          if (link)
            return link;
        }
      }

      // succ
      let succs = succURI(uri, next);
      if (setting.useSuccPattern) {
        for each (succ in succs) {
          let link = find(links, function (link) (link.uri.indexOf(succ) >= 0));
          if (link)
            return link;
        }
      }

      // force
      if (setting.force && succs.length) 
        return {
          uri: succs[0],
          text: '!force!',
          frame: window.content,
        };

    } catch (e) {
      liberator.log(e);
      liberator.echoerr(e);
    }
  }


  // 猫又
  function go (next, setting) {
    setting = getCurrentSetting(setting);

    if ((next && setting.useNextHistory) || (!next && setting.useBackHistory)) {
      next ? BrowserForward() : BrowserBack();
      displayOpened({uri: 'history', text: next ? 'next' : 'back'});
      return;
    }

    let link = detect(next, setting);
    if (link)
      open(link);
  }


  // 外部から使用可能にする。
  if (liberator.plugins)
    liberator.plugins.autoDetectLink = {detect: detect, go: go};


  ////////////////////////////////////////////////////////////////
  // Mappings
  ////////////////////////////////////////////////////////////////

  if (gv().nextMappings.length) {
    liberator.mappings.addUserMap(
      [liberator.modes.NORMAL], 
      gv().nextMappings,
      'Go next',
      function () go(true)
    );
  }


  if (gv().backMappings.length) {
    liberator.mappings.addUserMap(
      [liberator.modes.NORMAL], 
      gv().backMappings,
      'Go back',
      function () go(false)
    );
  }


  liberator.log('auto_nextandback.js loaded');

}catch(e){liberator.log(e)}
})();


