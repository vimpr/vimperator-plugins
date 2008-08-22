// ==VimperatorPlugin==
// @name           Migemized Find
// @description-ja デフォルトのドキュメント内検索をミゲマイズする。
// @license        Creative Commons 2.1 (Attribution + Share Alike)
// @version        1.0
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

  let delayCallTimer = null;

  let MF = {
    lastSearchText: null,
    previousSearchText: null,
    lastDirection: null,

    get buffer function () liberator.buffer,

    get document function () content.document,

    get storage function () (this.buffer.__migemized_find_storage || (this.buffer.__migemized_find_storage = {})),

    get defaultRange function () {
      let range = this.document.createRange();
      range.selectNodeContents(this.document.body);
      return range;
    },

    get highlightRemover function () (this.storage.highlightRemover || function () void(0)),
    set highlightRemover function (fun) (this.storage.highlightRemover = fun),

    MODE_NORMAL: 0,
    MODE_REGEXP: 1,
    MODE_MIGEMO: 2,

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

    highlightRange: function (range, setRemover) {
      let span = this.document.createElement('span');
      let spanStyle = 'background-color: lightblue; color: black; border: dotted 3px blue;';

      span.setAttribute('style', spanStyle);
      range.surroundContents(span);

      let scroll = function () {
        let pos = getPosition(span);
        content.scroll(pos.x - (content.innerWidth / 2),
                       pos.y - (content.innerHeight / 2));
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

      if (setRemover)
        this.highlightRemover = remover;

      return remover;
    },

    find: function (str, backwards, range, start, end) {
        if (!range)
          range = this.defaultRange;
        try {
          return XMigemoCore.regExpFind(str, 'i', range, start, end, backwards);
        } catch (e) {
          return false;
        }
    },

    findFirst: function (str, backwards) {
      let f = function () {
        this.lastDirection = backwards;
        this.lastSearchText = str = this.searchTextToRegExpString(str);

        let result = this.storage.lastResult = this.find(str, backwards);

        this.removeHighlight();
        if (result)
          this.highlightRange(result, true);

        return result;
      };

      if (delayCallTimer)
        clearTimeout(delayCallTimer);

      delayCallTimer = setTimeout(function () f.call(MF), 300);
    },

    findAgain: function (reverse) {
      this.removeHighlight();

      let str = this.lastSearchText;
      let range = this.defaultRange;
      let last = this.storage.lastResult;
      let backwards = !!(!this.lastDirection ^ !reverse);
      let start, end;

      if (last) {
        if (backwards) {
          end = last.cloneRange();
          end.setStart(last.endContainer, last.endOffset);
        } else {
          start = last.cloneRange();
          start.setStart(last.endContainer, last.endOffset);
        }
      }

      let result = this.storage.lastResult = this.find(str, backwards, range, start, end);
      if (!result)
        result = this.storage.lastResult = this.find(str, backwards, range);

      if (result)
        this.highlightRange(result, true);
      else
        liberator.echoerr('not found: ' + str);

      return result;
    },
  };

  let original = {};

  let migemized = {
    find: function find (str, backwards) {
      MF.findFirst(str, backwards);
    },

    findAgain: function findAgain (reverse) {
      MF.findAgain(reverse);
    },

    searchSubmitted: function searchSubmitted (command, forcedBackward) {
      if (!MF.storage.lastResult)
        liberator.echoerr('not found: ' + MF.lastSearchText);
      MF.previousSearchText = MF.lastSearchText;
    },

    searchCanceled: function searchCanceled () {
      MF.lastSearchText = MF.previousSearchText;
    },
  };

  for (let name in migemized)
    original[name] = liberator.search[name];

  function set (funcs) {
    for (let name in funcs)
      liberator.search[name] = funcs[name];
  }

  set(migemized);

  liberator.plugins.migemizedFind = {
    install: function () set(migemized),
    uninstall: function () set(original),
  };

}catch(e){liberator.log(e);}})();
