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
//  TODO:
//    フレーム対応

(function () {

  // スクロール可能か？
  function isScrollable (elem) {
    const re = /auto|scroll/i;
    let s = elem.ownerDocument.defaultView.getComputedStyle(elem, '');
    if (elem.scrollHeight <= elem.clientHeight)
      return false;
    return ['overflow', 'overflowY', 'overflowX'].some(function (n)
      s[n] && re.test(s[n]));
  }

  // 光らせる
  function flashElement (elem) {
    let indicator = elem.ownerDocument.createElement('div');
    let rect = elem.getBoundingClientRect();
    indicator.id = 'nyantoro-element-indicator';
    let style = 'background-color: blue; opacity: 0.5; z-index: 999;' +
                'position: fixed; ' +
                'top: ' + rect.top + 'px;' +
                'height:' + elem.clientHeight + 'px;'+
                'left: ' + rect.left + 'px;' +
                'width: ' + elem.clientWidth + 'px';
    indicator.setAttribute('style', style);
    elem.appendChild(indicator);
    setTimeout(function () elem.removeChild(indicator), 500);
  }

  // スクロール可能な要素のリストを返す
  function scrollableElements () {
    let result = [];
    let doc = content.document;
    let r = doc.evaluate('//div|//ul', doc, null, 7, null)
    for (let i = 0, l = r.snapshotLength; i < l; i++) {
      let elem = r.snapshotItem(i);
      if (isScrollable(elem))
        result.push(elem);
    }
    return result;
  }

  // スクロール対象を変更
  function shiftScrollElement (n) {
    let doc = content.document;
    let idx = doc.__div_scroller_index || 0;
    let es = scrollableElements();
    if (es.length <= 0)
      liberator.echoerr('scrollable element not found');
    idx += (n || 1);
    if (idx < 0)
      idx = es.length - 1;
    if (idx >= es.length)
      idx = 0;
    content.document.__div_scroller_index = idx;
    flashElement(es[idx]);
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
  }


  mappings.addUserMap(
    [modes.NORMAL],
    ['<Leader>j'],
    'Scroll down',
    function () scroll(true)
  );

  mappings.addUserMap(
    [modes.NORMAL],
    ['<Leader>k'],
    'Scroll up',
    function () scroll(false)
  );

  mappings.addUserMap(
    [modes.NORMAL],
    [']d'],
    'Shift Scroll Element',
    function () shiftScrollElement(1)
  );

  mappings.addUserMap(
    [modes.NORMAL],
    ['[d'],
    'Shift Scroll Element',
    function () shiftScrollElement(-1)
  );


})();
