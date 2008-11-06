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
var walkinput = function() {
    var win = document.commandDispatcher.focusedWindow;
    var d = win.document;
    var xpath = '//input[@type="text" or @type="password" or @type="search" or not(@type)] | //textarea';
    var list = d.evaluate(xpath, d, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    if (list.snapshotLength == 0) return;

    var focused = document.commandDispatcher.focusedElement;
    var current = null;
    var next = null;
    for (let i = 0; i < list.snapshotLength; ++i) {
        let e = list.snapshotItem(i);
        if (e == focused) {
            current = e;
        } else if (current && next == null) {
            next = e;
        }
    }
    if (next) {
        next.focus();
    } else {
        list.snapshotItem(0).focus();
    }
};

liberator.modules.mappings.add([liberator.modules.modes.NORMAL], ['<M-i>'], 'Walk Input Fields', walkinput);
liberator.modules.mappings.add([liberator.modules.modes.INSERT], ['<M-i>'], 'Walk Input Fields', walkinput);
liberator.modules.mappings.add([liberator.modules.modes.NORMAL], ['<A-i>'], 'Walk Input Fields', walkinput);
liberator.modules.mappings.add([liberator.modules.modes.INSERT], ['<A-i>'], 'Walk Input Fields', walkinput);
})();
