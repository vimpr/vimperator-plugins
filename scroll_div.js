// ==VimperatorPlugin==
// @name           Div Scroller
// @description-ja スクロールができる div 要素などでスクロールする
// @license        Creative Commons 2.1 (Attribution + Share Alike)
// @version        0.1
// ==/VimperatorPlugin==
//
//  Mappings:
//    ]d [d
//      スクロール対象を変更
//      ]f [f のようなもの
//    <Leader>j <Leader>k
//      スクロールする
//

(function () {

  // スクロール可能か？
  function isScrollable (e, doc) {
    const re = /auto|scroll/i;
    let s = doc.defaultView.getComputedStyle(e, '');
    if (e.scrollHeight <= e.clientHeight)
      return;
    for each (let n in ['overflow', 'overflowY', 'overflowX']) {
      if (s[n] && s[n].match(re))
        return true;
    }
  }

  // FIXME
  function flashElement (e, doc) {
    var indicator = doc.createElement("div");
    indicator.id = "liberator-frame-indicator";
    // NOTE: need to set a high z-index - it's a crapshoot!
    var style = "background-color: red; opacity: 0.5; z-index: 999;" +
                "position: fixed; top: 0; bottom: 0; left: 0; right: 0;";
    indicator.setAttribute("style", style);
    e.appendChild(indicator);
    // remove the frame indicator
    setTimeout(function () { e.removeChild(indicator); }, 500);
  }

  // スクロール可能な要素のリストを返す
  function scrollableElements () {
    let result = [];
    let doc = content.document;
    var r = doc.evaluate("//div|//ul", doc, null, 7, null)
    for (var i = 0; i < r.snapshotLength; i++) {
      let e = r.snapshotItem(i);
      if (isScrollable(e, doc))
        result.push(e);
    }
    liberator.log('scrollableElements: ' + result.length);
    return result;
  }

  // スクロール対象を変更
  function shiftScrollElement (n) {
    let idx = content.document.__div_scroller_index || 0;
    let es = scrollableElements();
    idx += (n || 1);
    if (idx < 0)
      idx = es.length - 1;
    if (idx >= es.length)
      idx = 0;
    content.document.__div_scroller_index = idx;
  }

  // 現在のスクロール対象を返す
  function currentElement () {
    let es = scrollableElements();
    let idx = content.document.__div_scroller_index || 0;
    return es[idx];
  }

  // スクロールする
  function scroll (down) {
    let elem = currentElement();
    if (elem)
      elem.scrollTop += Math.max(30, elem.clientHeight - 20) * (down ? 1 : -1);
    //for each (let elem in scrollableElements()) {
    //  liberator.log(elem.tagName);
    //  liberator.log(elem.id);
    //  elem.scrollTop += dy;
    //}
  }


  liberator.mappings.addUserMap(
    [liberator.modes.NORMAL], 
    ['<Leader>j'],
    'Scroll down',
    function () scroll(true)
  );

  liberator.mappings.addUserMap(
    [liberator.modes.NORMAL], 
    ['<Leader>k'],
    'Scroll up',
    function () scroll(false)
  );

  liberator.mappings.addUserMap(
    [liberator.modes.NORMAL], 
    [']d'],
    'Shift Scroll Element',
    function () shiftScrollElement(1)
  );

  liberator.mappings.addUserMap(
    [liberator.modes.NORMAL], 
    ['[d'],
    'Shift Scroll Element',
    function () shiftScrollElement(-1)
  );


})();
