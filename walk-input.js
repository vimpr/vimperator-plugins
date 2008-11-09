// Vimperator plugin: 'Walk Input'
// Last Change: 2008-05-22.
// License: BSD
// Version: 1.0
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
//  </html>

(function() {
var walkinput = function(forward) {
    var win = document.commandDispatcher.focusedWindow;
    var d = win.document;
    var xpath = '//input[@type="text" or @type="password" or @type="search" or not(@type)] | //textarea';
    var list = d.evaluate(xpath, d, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    if (list.snapshotLength == 0)
        return;

    var focused = document.commandDispatcher.focusedElement;
    var current = null;
    var next = null;
    var prev = null;
    for (let i = 0, l = list.snapshotLength; i < l; ++i) {
        let e = list.snapshotItem(i);
        if (e == focused) {
            current = e;
        } else if (current && !next) {
            next = e;
        } else if (!current) {
            prev = e;
        }
    }

    if (forward) {
        (next || list.snapshotItem(0)).focus();
    } else {
        (prev || list.snapshotItem(list.snapshotLength - 1)).focus();
    }
};

mappings.add([modes.NORMAL, modes.INSERT], ['<M-i>', '<A-i>'],
             'Walk Input Fields (Forward)', function () walkinput(true));
mappings.add([modes.NORMAL, modes.INSERT], ['<M-I>', '<A-I>'],
             'Walk Input Fields (Backward)', function () walkinput(false));
})();
