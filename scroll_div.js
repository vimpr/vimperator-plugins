(function () {

  let re = /auto|scroll/i;

  // FIXME!!!!!!!!  Firebug では overflow になってるのに false になったりする。
  function isScrollable (e, doc) {
    let s = doc.defaultView.getComputedStyle(e, null);
    for each (let n in ['overflow', 'overflow-x', 'overflow-y']) {
      //if (s[n] && s[n].match(/.+/)) liberator.log(n + ':' + s[n]);
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

    // var r = doc.evaluate("//div[contains(@style, 'overflow')]", doc, null, 7, null)
    // for (var i = 0; i < r.snapshotLength; i++) {
    //   r.snapshotItem(i).scrollTop += dy;
    // }

    var r = doc.evaluate("//div", doc, null, 7, null)
    for (var i = 0; i < r.snapshotLength; i++) {
      let e = r.snapshotItem(i);
      if (isScrollable(e, doc))
        result.push(e);
    }

    liberator.log(result.length);
    return result;
  }

  // スクロール対象を変更
  function shiftScrollElement () {
    let idx = content.document.__div_scroller_index || 0;
    let es = scrollableElements();
    idx++;
    if (idx >= es.length)
      idx = 0;
    content.document.__div_scroller_index = idx;
  }

  // 現在のスクロール対象を返す
  function currentElement () {
    let es = scrollableElements();
    let idx = content.document.__div_scroller_index || 0;
    liberator.log("idx: " + idx);
    return es[idx];
  }

  // スクロールする
  function scroll (dy) {
    let elem = currentElement();
    if (elem)
      elem.scrollTop += dy;
    //for each (let elem in scrollableElements())
    //  elem.scrollTop += dy;
  }

  liberator.mappings.addUserMap(
    [liberator.modes.NORMAL], 
    ['<Leader>j'],
    'Scroll down',
    function () scroll(30)
  );

  liberator.mappings.addUserMap(
    [liberator.modes.NORMAL], 
    [']d'],
    'Shift Scroll Element',
    function () shiftScrollElement()
  );




})();
