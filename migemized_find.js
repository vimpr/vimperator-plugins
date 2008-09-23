// ==VimperatorPlugin==
// @name           Migemized Find
// @description-ja デフォルトのドキュメント内検索をミゲマイズする。
// @license        Creative Commons 2.1 (Attribution + Share Alike)
// @version        1.2
// ==/VimperatorPlugin==
//
// Usage:
//    検索ワードの一文字目が
//      '/'  => 正規表現検索
//      '?'  => Migemo検索
//      以外 => Migemo検索
//
// Author:
//    anekos
//
// Link:
//    http://d.hatena.ne.jp/nokturnalmortum/20080805#1217941126

(function () { try {

  let XMigemoCore = Components.classes['@piro.sakura.ne.jp/xmigemo/factory;1']
                     .getService(Components.interfaces.pIXMigemoFactory)
                     .getService('ja');

  function getPosition (elem) {
    if (!elem)
      return {x: 0, y: 0};
    let parent = getPosition(elem.offsetParent);
    return { x: (elem.offsetLeft || 0) + parent.x,
             y: (elem.offsetTop  || 0) + parent.y  }
  }

  function slashArray (ary, center) {
    let head = [], tail = [];
    let current = head;
    for (let i = 0; i < ary.length; i++) {
      let it = ary[i];
      if (it == center)
        current = tail;
      else
        current.push(it);
    }
    return [head, tail];
  }

  let MF = {
    // 定数
    MODE_NORMAL: 0,
    MODE_REGEXP: 1,
    MODE_MIGEMO: 2,

    lastSearchText: null,
    lastSearchExpr: null,
    lastDirection: null,
    currentSearchText: null,
    currentSearchExpr: null,
    lastResult: null,

    get buffer function () liberator.buffer,

    get document function () content.document,

    // タブ毎に状態を保存するために、変数を用意
    get storage function () (gBrowser.mCurrentTab.__migemized_find_storage || (gBrowser.mCurrentTab.__migemized_find_storage = {})),

    makeBodyRange: function (frame) {
      let range = frame.document.createRange();
      range.selectNodeContents(frame.document.body);
      return range;
    },

    get highlightRemover function () (this.storage.highlightRemover || function () void(0)),
    set highlightRemover function (fun) (this.storage.highlightRemover = fun),

    // 検索文字列から検索モードと検索文字列を得る。
    searchTextToRegExpString: function (str) {
      let [head, tail] = [str[0], str.slice(1)];
      switch (head) {
        case '/':
          return tail;
        case '?':
          return XMigemoCore.getRegExp(tail);
      }
      return XMigemoCore.getRegExp(str);
    },

    removeHighlight: function () {
      this.highlightRemover()
      this.highlightRemover = null;
    },

    focusLink: function (range) {
      let node = range.commonAncestorContainer;
      while (node && node.parentNode) {
        if (node.localName.toString().toLowerCase() == 'a')
          return void(Components.lookupMethod(node, 'focus').call(node));
        node = node.parentNode;
      }
    },

    highlight: function (target, setRemover) {
      let span = this.document.createElement('span');
      let spanStyle = 'background-color: lightblue; color: black; border: dotted 3px blue;';

      span.setAttribute('style', spanStyle);
      target.range.surroundContents(span);

      let scroll = function () {
        let pos = getPosition(span);
        target.frame.scroll(pos.x - (target.frame.innerWidth / 2),
                            pos.y - (target.frame.innerHeight / 2));
      };
      setTimeout(scroll, 0);

      let remover = function () {
        let range = this.document.createRange();
        range.selectNodeContents(span);
        let content = range.extractContents();
        range.setStartBefore(span);
        range.insertNode(content);
        range.selectNode(span); 
        range.deleteContents(); 
      };

      this.focusLink(target.range);

      if (setRemover)
        this.highlightRemover = remover;

      return remover;
    },

    find: function (str, backwards, range, start, end) {
      if (!range)
        range = this.makeBodyRange(this.currentFrames[0]);

      if (!start) {
        start = range.startContainer.ownerDocument.createRange();
        start.setStartBefore(range.startContainer);
      }
      if (!end) {
        end = range.endContainer.ownerDocument.createRange();
        end.setEndAfter(range.endContainer);
      }

      // 検索方向に合わせて、開始終了位置を交換
      if (backwards)
        [start, end] = [end, start];

      try {
        return XMigemoCore.regExpFind(str, 'i', range, start, end, backwards);
      } catch (e) {
        return false;
      }
    },

    findFirst: function (str, backwards) {
      this.lastDirection = backwards;
      let expr = this.searchTextToRegExpString(str);
      this.currentSearchText = str;
      this.currentSearchExpr = expr;

      let result, frames = this.currentFrames;
      if (backwards)
        frames = frames.reverse();

      for each (let frame in frames) {
        let ret = this.find(expr, backwards, this.makeBodyRange(frame));
        if (ret) {
          result = this.storage.lastResult = {
            frame: frame,
            range: ret,
          };
          break;
        }
      }

      this.removeHighlight();
      if (result) 
        this.highlight(result, true);

      this.lastResult = result;

      return result;
    },

    findAgain: function (reverse) {
      let backwards = !!(!this.lastDirection ^ !reverse);
      let last = this.storage.lastResult;
      let currentFrames = this.currentFrames;

      // 前回の結果がないので、(初め|最後)のフレームを対象にする
      // findFirst と"似た"挙動になる
      if (!last) {
        let idx = backwards ? frames.length - 1 
                            : 0;
        last = {frame: frames[idx], range: this.makeBodyRange(frames[idx])};
      }

      this.removeHighlight();

      let str = this.lastSearchExpr;
      let start, end;

      if (backwards) {
        end = last.range.cloneRange();
        end.setEnd(last.range.startContainer, last.range.startOffset);
      } else {
        start = last.range.cloneRange();
        start.setStart(last.range.endContainer, last.range.endOffset);
      }

      let result;
      let ret = this.find(str, backwards, this.makeBodyRange(last.frame), start, end);

      if (ret) {
        result = {frame: last.frame, range: ret};
      } else {
        // 見つからなかったので、ほかのフレームから検索
        let [head, tail] = slashArray(currentFrames, last.frame);
        let next = backwards ? head.reverse().concat(tail.reverse())
                             : tail.concat(head);
        for each (let frame in next) {
          let r = this.find(str, backwards, this.makeBodyRange(frame));
          if (r) {
            result = {frame: frame, range: r};
            break;
          }
        }
      }

      this.storage.lastResult = result;

      if (result)
        this.highlight(result, true);

      return result;
    },

    submit: function () {
      this.lastSearchText = this.currentSearchText;
      this.lastSearchExpr = this.currentSearchExpr;
      return this.lastResult;
    },

    cancel: function () {
    },

    get currentFrames function () {
      let result = [];
      (function (frame) {
        // ボディがない物は検索対象外なので外す
        if (frame.document.body.localName.toLowerCase() == 'body')
          result.push(frame);
        for (let i = 0; i < frame.frames.length; i++)
          arguments.callee(frame.frames[i]);
      })(content);
      return result;
    },
  };


  // 前のタイマーを削除するために保存しておく
  let delayCallTimer = null;
  let delayedFunc = null;

  let migemized = {
    find: function find (str, backwards) {
      // 短時間に何回も検索をしないように遅延させる
      delayedFunc = function () MF.findFirst(str, backwards);
      if (delayCallTimer) {
        clearTimeout(delayCallTimer);
      }
      delayCallTimer = setTimeout(function () delayedFunc(), 300);
    },

    findAgain: function findAgain (reverse) {
      if (!MF.findAgain(reverse))
        liberator.echoerr('not found: ' + MF.currentSearchText);
    },

    searchSubmitted: function searchSubmitted (command, forcedBackward) {
      if (delayCallTimer) {
        clearTimeout(delayCallTimer);
        delayCallTimer = null;
        delayedFunc();
      }
      if (!MF.submit())
        liberator.echoerr('not found: ' + MF.currentSearchText);
    },

    searchCanceled: function searchCanceled () {
      MF.cancel();
    },
  };


  // オリジナルの状態に戻せるように保存しておく
  {
    let original = {};

    for (let name in migemized)
      original[name] = liberator.search[name];

    function set (funcs) {
      for (let name in funcs)
        liberator.search[name] = funcs[name];
    }

    set(migemized);

    MF.install = function () set(migemized);
    MF.uninstall = function () set(original);
  }


  // 外から使えるように
  liberator.plugins.migemizedFind = MF;

}catch(e){liberator.log(e);}})();
