// Vimperator plugin: 'Walk Input'
// Last Change: 2009-01-25
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

// PLUGIN_INFO {{{
let PLUGIN_INFO =
<VimperatorPlugin>
  <name>Walk Input</name>
  <description>The focus walks "input" and "textarea" elements.</description>
  <version>1.1</version>
  <author mail="tekezo@pqrs.org">Takayama Fumihiko</author>
  <license>BSD</license>
  <updateURL>http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/walk-input.js</updateURL>
  <minVersion>2.0</minVersion>
  <maxVersion>2.1pre</maxVersion>
  <detail><![CDATA[
    The focus walks <input> & <textarea> elements.
    If you type M-i first, the focus moves to "<input name='search' />".
    Then if you type M-i once more, the focus moves to "<input name='name' />".

    >||
      <html>
          <input name="search" />
          <a href="xxx">xxx</a>
          <a href="yyy">yyy</a>
          <a href="zzz">zzz</a>
          <input name="name" />
          <textarea name="comment"></textarea>
      </html>
    ||<
  ]]></detail>
</VimperatorPlugin>;
// }}}

(function () {

var xpath = '//input[@type="text" or @type="password" or @type="search" or not(@type)] | //textarea';

var walkinput = function (forward) {
    var focused = document.commandDispatcher.focusedElement;
    var current = null;
    var next = null;
    var prev = null;
    var list = [];

    (function (frame) {
      var doc = frame.document;
      if (doc.body.localName.toLowerCase() == 'body') {
        let r = doc.evaluate(xpath, doc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        for (let i = 0, l = r.snapshotLength; i < l; ++i) {
            let e = r.snapshotItem(i);
            if (/^none$/i.test(getComputedStyle(e, '').display))
              continue;
            let ef = {element: e, frame: frame};
            list.push(ef);
            if (e == focused) {
                current = ef;
            } else if (current && !next) {
                next = ef;
            } else if (!current) {
                prev = ef;
            }
        }
      }
      for (let i = 0; i < frame.frames.length; i++)
        arguments.callee(frame.frames[i]);
    })(content);

    if (list.length <= 0)
      return;

    var elem = forward ? (next || list[0])
                       : (prev || list[list.length - 1]);

    if (!current || current.frame != elem.frame)
      elem.frame.focus();
    elem.element.focus();
};

mappings.addUserMap([modes.NORMAL, modes.INSERT], ['<M-i>', '<A-i>'],
                    'Walk Input Fields (Forward)', function () walkinput(true));
mappings.addUserMap([modes.NORMAL, modes.INSERT], ['<M-I>', '<A-I>'],
                    'Walk Input Fields (Backward)', function () walkinput(false));

})();
