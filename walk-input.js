// Vimperator plugin: 'Walk Input'
// Last Change: 2008-11-19
// License: BSD
// Version: 1.1
// Maintainer: Takayama Fumihiko <tekezo@pqrs.org>

// ------------------------------------------------------------
// The focus walks <input> & <textarea> elements.
// If you type M-i first, the focus moves to "<input name='search' />".
// Then if you type M-i once more, the focus moves to "<input name='name' />".
//
// <html>
//     <input name="search" />
//     <a href="xxx">xxx</a>
//     <a href="yyy">yyy</a>
//     <a href="zzz">zzz</a>
//     <input name="name" />
//     <textarea name="comment"></textarea>
// </html>

(function() {

var xpath = '//input[@type="text" or @type="password" or @type="search" or not(@type)] | //textarea';

var walkinput = function(forward) {
    var focused = document.commandDispatcher.focusedElement;
    var current = null;
    var next = null;
    var prev = null;
    var list = [];

    (function (frame) {
      var doc = frame.document;
      if (doc.body.localName.toLowerCase() == 'body') {
        var r = doc.evaluate(xpath, doc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        for (let i = 0, l = r.snapshotLength; i < l; ++i) {
            let e = r.snapshotItem(i);
            list.push(e);
            if (e == focused) {
                current = e;
            } else if (current && !next) {
                next = e;
            } else if (!current) {
                prev = e;
            }
        }
      }
      for (let i = 0; i < frame.frames.length; i++)
        arguments.callee(frame.frames[i]);
    })(content);

    if (list.length <= 0)
      return;

    let elem = forward ? (next || list[0])
                       : (prev || list[list.length - 1]);
    elem.focus();

};

mappings.addUserMap([modes.NORMAL, modes.INSERT], ['<M-i>', '<A-i>'],
                    'Walk Input Fields (Forward)', function () walkinput(true));
mappings.addUserMap([modes.NORMAL, modes.INSERT], ['<M-I>', '<A-I>'],
                    'Walk Input Fields (Backward)', function () walkinput(false));

})();
