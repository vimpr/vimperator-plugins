var PLUGIN_INFO =
<VimperatorPlugin>
  <name>Auto Detect Link</name>
  <description>Find (next|previous) link, and jump.</description>
  <description lang="ja">(次|前)っぽいページへのリンクを探してジャンプ</description>
  <version>1.8.3</version>
  <author mail="anekos@snca.net" homepage="http://d.hatena.ne.jp/nokturnalmortum/">anekos</author>
  <minVersion>2.0pre</minVersion>
  <updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/auto_detect_link.js</updateURL>
  <license document="http://creativecommons.org/licenses/by-sa/3.0/">
    Creative Commons Attribution-Share Alike 3.0 Unported
  </license>
  //<detail><![CDATA[
  //]]></detail>
  <detail lang="ja"><![CDATA[
    == Usage ==
      デフォルトの設定では、"]]" "[[" を上書きします。
      ]]:
        次っぽいページへ
      [[:
        前っぽいページへ
    == Setting ==
      liberator.globalVariables.autoDetectLink
      に以下の値をもつオブジェクトを設定します。
      rc ファイルなどに書いてください。
        nextPatterns/backPatterns:
          (次|前)のパターンの配列。
          要素は、
            - リンク文字列に対する(正規表現|文字列)
            - リンクに対する関数のリスト
        nextMappings/backPatterns:
          (次|前)移動のマッピング(Array)
        useNextHistory/useBackHistory:
          履歴を併用。
          履歴がある場合はそっちを優先します。
        useSuccPattern:
          doc_01.html のときは、 doc_02.html を次と見なす…ようなパターン。
          ファイル名に当たる部分の、数字列あるいは一文字のアルファベットが対象です。
          (つながっているアルファベットは無視されます。)
            - doc_02.html => doc_03.html
            - doc_a.html => doc_b.html
        force:
          (次|前)っぽいURIを捏造してそこに移動します。
        useAutoPagerize:
          AutoPagerize のキャッシュを利用します。
          (ただし、"次" へのリンクにしか使われません)
      === example ===
        >||
        :js liberator.globalVariables.autoDetectLink = {nextPatterns: [/next/, /次/]}
        ||<

    == Function ==
      外部から呼び出せる関数が liberator.plugins.autoDetectLink に入っています。
      === detect(next, setting) ===
        (次|前)へのリンクを検出する。
        ==== 引数 ====
          next:
            次のリンクを探すときは、true。
          setting:
            設定を一時的に上書きする。省略可。
        ==== 返値 ====
          リンクのURIなど以下のプロパティを持つオブジェクト
          uri:
            アドレス。
          text:
            リンクテキストなど
          frame:
            リンクの存在するフレームの Window オブジェクト
          element:
            リンクの要素
      === autoDetectLink.go(next, setting) ===
        (次|前)へのリンクに移動。
        引数は detect と同じ。

      === example ===
        履歴を使用しないで、前のリンクを探す。:
        >||
          liberator.plugins.autoDetectLink.detect(false, {useBackHistory: false});
        ||<
  ]]></detail>
</VimperatorPlugin>;


(function () {
  liberator.log('auto_detect_link.js loading');

  ////////////////////////////////////////////////////////////////
  // default setting
  ////////////////////////////////////////////////////////////////

  let defaultSetting = {
    nextPatterns: [
      //[NnＮｎ][EeＥｅ][XxＸｘ][TtＴｔ]/,
      /[Nn\uff2e\uff4e][Ee\uff25\uff45][Xx\uff38\uff58][Tt\uff34\uff54]/,
      //[FfＦｆ](?:[OoＯｏ][RrＲｒ])?[WwＷｗ](?:[AaＡａ][RrＲｒ])?[DdＤｄ]/,
      /[Ff\uff26\uff46](?:[Oo\uff2f\uff4f][Rr\uff32\uff52])?[Ww\uff37\uff57](?:[Aa\uff21\uff41][Rr\uff32\uff52])?[Dd\uff24\uff44]/,
      //^\s*(?:次|つぎ)[への]/, /つづく|続/, /次|つぎ/, /進む/,
      /^\s*(?:\u6b21|\u3064\u304e)[\u3078\u306e]/, /\u3064\u3065\u304f|\u7d9a/, /\u6b21|\u3064\u304e/, /\u9032\u3080/,
      //^\s*>\s*$/, />+|≫/
      /^\s*>\s*$/, />+|\u226b/
    ],
    backPatterns: [
      //[BbＢｂ][AaＡａ][CcＣｃ][KkＫｋ]/, /[PpＰｐ][RrＲｒ][EeＥｅ][VvＶｖ]/,
      /[Bb\uff22\uff42][Aa\uff21\uff41][Cc\uff23\uff43][Kk\uff2b\uff4b]/, /[Pp\uff30\uff50][Rr\uff32\uff52][Ee\uff25\uff45][Vv\uff36\uff56]/,
      //^\s*前[への]/, /前/, /戻る/,
      /^\s*\u524d[\u3078\u306e]/, /\u524d/, /\u623b\u308b/,
      //^\s*<\s*$/, /<+|≪/
      /^\s*<\s*$/, /<+|\u226a/
    ],
    nextMappings: [']]'],
    backMappings: ['[['],
    useSuccPattern: true,
    useNextHistory: false,
    useBackHistory: false,
    //clickButton: true,
    force: false,
    useAutoPagerize: true,
    displayDelay: 500,
    ignoreId: false
  };

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

  const APPREF = 'greasemonkey.scriptvals.http://swdyh.yu.to//AutoPagerize.cacheInfo';
  let ap_cache;
  try {
    ap_cache = eval(Application.prefs.getValue(APPREF, null));

    for each (let cache in ap_cache) {
      cache.info = cache.info.filter(function (i) 'url' in i);
      cache.info.sort(function (a, b) b.url.length - a.url.length);
    }
  } catch (e) {
    liberator.log('ap_cache evaluationg error. no autopagerize?: \n' + e);
  }


  ////////////////////////////////////////////////////////////////
  // functions
  ////////////////////////////////////////////////////////////////

  // 空白を
  function removeSpace (str)
    str.replace(/^\s+|\s+$/g, '').replace(/\s+/g, ' ');


  // Array#find
  function find (ary, f) {
    var func = (typeof f == 'function') ? f : function (v) v == f;
    for (let i = 0, l = ary.length; i < l; i++) {
      if (func(ary[i])) {
        return ary[i];
      }
    }
    return null;
  }


  // 要素をクリックする
  function clickElement (elem)
    buffer.followLink(elem, liberator.CURRENT_TAB);


  // 開いたURIなどの表示
  function displayOpened (link) {
    var msg = 'open: ' + link.type + ' <' + removeSpace(link.text) + '> ' + link.uri;
    setTimeout(function () liberator.echo(msg, commandline.FORCE_SINGLELINE), gv().displayDelay);
  }


  // リンクを開く
  function open (link) {
    if (link.element) {
      clickElement(link.element);
    } else if (link.uri) {
      link.frame.location.href = link.uri;
    }
    displayOpened(link);
  }


  // 元の文字列、詰め込む文字、長さ
  function padChar (s, c, n)
    s.replace(new RegExp('^(.{0,'+(n-1)+'})$'), function (s) padChar(c+s, c, n));


  // ID っぽい文字か考えてみる！
  //  数字だけで長いのは ID っぽい！
  //  西暦っぽいのは無視しない方が良いかも。
  //      根拠はないが、1980-2029 の範囲で。
  //  後方00 が含まれているパターンは、インクリメントしてもいい気がする
  //      830000 => 830001
  // XXX 根拠があやしぎる！
  function likeID (s)
    /^\d{6,}$/.test(s) && !/^(19[89]|20[012])\d/.test(s) && !/00\d\d$/.test(s);


  // (次|前)の数字文字列リストを取得
  function succNumber (n, next, ignoreId) {
    if (ignoreId && likeID(n))
      return [];
    var m = (parseInt(n || 0, 10) + (next ? 1 : -1)).toString();
    var result = [m];
    if (m.length < n.length)
      result.unshift(padChar(m.toString(), '0', n.length));
    return result;
  }


  // (次|前)の文字列リストを取得
  function succString (s, next) {
    var result = [], d = next ? 1 : -1;
    var c = String.fromCharCode(s.charCodeAt(0) + d);
    if (('a' <= c && c <= 'z') || 'A' <= c && c <= 'Z')
      result.push(c);
    return result;
  }


  // (次|前)のURIリストを取得
  function succURI (uri, next, ignoreId) {
    var urim = uri.match(/^(.+\/)([^\/]+)$/);
    if (!urim)
      return [];
    var [_, dir, file] = urim, result = [];
    // succ number
    let (dm, file = file, left = '', temp = []) {
      while (file && (dm = file.match(/\d+/))) {
        let [rcontext, lcontext, lmatch] = [RegExp.rightContext, RegExp.leftContext, RegExp.lastMatch];
        left += lcontext;
        succNumber(lmatch, next, ignoreId).reverse().forEach(function (succ) {
          temp.push(dir + left + succ + rcontext);
        });
        left += lmatch;
        file = rcontext;
      }
      result = result.concat(temp.reverse());
    }
    // succ string
    let (dm, file = file, left = '', temp = []) {
      while (file && (dm = file.match(/(^|[^a-zA-Z])([a-zA-Z])([^a-zA-Z]|$)/))) {
        let [rcontext, lcontext] = [RegExp.rightContext, RegExp.leftContext];
        left += lcontext + dm[1];
        succString(dm[2], next).forEach(function (succ) {
          temp.push(dir + left + succ + dm[3] + rcontext);
        });
        left += dm[1];
        file = dm[3] + rcontext;
      }
      result = result.concat(temp.reverse());
    }
    return result;
  }


  // パターンマッチング
  function match (pattern, link)
    pattern instanceof Function ? pattern(link) :
    !link.text                  ? null :
    pattern instanceof RegExp   ? pattern.test(link.text) :
    link.text.toLowerCase().indexOf(pattern.toString().toLowerCase()) >= 0;


  // 要素が表示されているか？
  function isVisible (element) {
    var st;
    try {
      st = content.document.defaultView.getComputedStyle(element, null);
      return !(st.display && st.display.indexOf('none') >= 0) && (!element.parentNode || isVisible(element.parentNode))
    } catch (e) {
      return true;
    }
  }


  // リンクのフィルタ
  function linkElementFilter (elem)
    isVisible(elem) && elem.href && elem.href.indexOf('@') < 0 && /^(?:(?:https?|f(?:ile|tp)):\/\/|javascript:)/.test(elem.href) && elem.textContent;


  // 全てのリンクを取得
  // 再帰的にフレーム内のも取得する
  function getAllLinks (content) {
    var result = [];
    // Anchor
    var elements = content.document.links;
    for (let i = 0, l = elements.length; i < l; i++) {
      let it = elements[i];
      if (linkElementFilter(it))
        result.push({
          type: 'link',
          frame: content,
          uri: it.href,
          rel: it.rel,
          text: it.textContent,
          element: it
        });
    }
    // Form
    elements = content.document.getElementsByTagName('input');
    for (let i = 0, l = elements.length; i < l; i++) {
      (function (input) {
        result.push({
          type: 'input',
          frame: content,
          uri: input.form && input.form.action,
          text: input.value,
          click: input.click,
          element: input,
          });
      })(elements[i]);
    }
    // Frame
    if (content.frames) {
      for (let i = 0, l = content.frames.length; i < l; i++) {
        result = result.concat(getAllLinks(content.frames[i]));
      }
    }
    return result;
  }


  // 全フレームの URL を得る
  function getAllLocations (content) {
    let result = [content.location.href];
    if (content.frames) {
      for (let i = 0, l = content.frames.length; i < l; i++) {
        result = result.concat(getAllLocations(content.frames[i]));
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


  // 相対アドレスから絶対アドレスに変換するんじゃないの？
  function toAbsPath (path) {
    with (content.document.createElement('a'))
      return (href = path) && href;
  }

  // AutoPagerize のデータからマッチする物を取得
  function getAutopagerizeNext () {
    if (!ap_cache)
      return;

    var info = (function () {
      var uri = buffer.URL;
      for each (let cache in ap_cache) {
        for (let i = 0, l = cache.info.length; i < l; i++) {
          let info = cache.info[i];
          if (uri.match(info.url))
            return info;
        }
      }
    })();

    if (!info)
      return;

    var doc = content.document;
    var result = doc.evaluate(info.nextLink, doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
    if (result.singleNodeValue)
      return result.singleNodeValue;
  }


  ////////////////////////////////////////////////////////////////
  // main
  ////////////////////////////////////////////////////////////////

  // リンクを探す
  function detect (next, setting) {
    try {
      setting = getCurrentSetting(setting);

      // TODO
      if (setting.useAutoPagerize && next) {
        let apnext = getAutopagerizeNext();
        if (apnext) {
          return {
            type: 'aplink',
            frame: content,
            uri: apnext.href || apnext.action || apnext.value,
            text: apnext.textContent || apnext.title || apnext,
            element: apnext
          };
        }
      }

      patterns = next ? setting.nextPatterns : setting.backPatterns;

      let uri = window.content.location.href;
      let links = getAllLinks(window.content);

      // rel="prev|next"
      {
        let relValue = next ? /(?:^|[ \t\r\n])next(?:[ \t\n\r]|$)/
                            : /(?:^|[ \t\r\n])prev(?:[ \t\n\r]|$)/;
        let link = find(links, function (link) ((typeof link.rel == 'string') && relValue.test(link.rel.toLowerCase())));
        if (link)
          return link;
      }

      // keywords
      {
        let link;
        if (patterns.some(function (pattern) {
          link = find(links, function (link) match(pattern, link));
          return link ? true : false;
        }))
          return link;
      }

      // succ
      let succs = [];
      getAllLocations(window.content).forEach(function (uri) {
        succs = succs.concat(succURI(uri, next, setting.ignoreId));
      });
      if (setting.useSuccPattern) {
        let link;
        if (succs.some(function (succ) {
          link = find(links, function (link) link.uri && (link.uri.indexOf(succ) >= 0));
          return link ? true : false;
        }))
          return link;
      }

      // force
      if (setting.force && succs.length) {
        return {
          type: 'force',
          uri: succs[0],
          text: '-force-',
          frame: window.content,
        };
      }

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

    var link = detect(next, setting);
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
    mappings.remove([modes.NORMAL], gv().nextMappings);
    mappings.addUserMap(
      [modes.NORMAL],
      gv().nextMappings,
      'Go next',
      function () go(true)
    );
  }


  if (gv().backMappings.length) {
    mappings.remove([modes.NORMAL], gv().backMappings);
    mappings.addUserMap(
      [modes.NORMAL],
      gv().backMappings,
      'Go back',
      function () go(false)
    );
  }


  liberator.log('auto_detect_link.js loaded');

})();
