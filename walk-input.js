// Vimperator plugin: 'Walk Input'
// License: BSD
// Version: 1.2.3
// Maintainer: Takayama Fumihiko <tekezo@pqrs.org>
//             anekos <anekos@snca.net>

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
let INFO =
<plugin name="Walk-Input" version="1.2.3"
        href="http://github.com/vimpr/vimperator-plugins/blob/master/walk-input.js"
        summary="The focus walks 'input' and 'textarea' element."
        xmlns="http://vimperator.org/namespaces/liberator">
    <author email="tekezo@pqrs.org">Takayama Fumihiko</author>
    <author email="anekos@snca.net">anekos</author>
    <license>BSD</license>
    <project name="Vimperator" minVersion="2.2"/>
    <p>
		The focus walks &lt;input&gt; &amp; &lt;textarea&gt; element.
		If you type <k name="M-i"/> first, the focus moves to "&lt;input name='search' /&gt;".
		Then if you type <k name="M-i"/> once more, the focus moves to "&lt;input name='name' /&gt;".
    </p>
	<code><![CDATA[
<html>
  <input name="search" />
  <a href="xxx">xxx</a>
  <a href="yyy">yyy</a>
  <a href="zzz">zzz</a>
  <input name="name" />
  <textarea name="comment"></textarea>
</html>
	]]></code>
    <item>
	<tags><![CDATA[i_<M-i> i_<A-i> <M-i> <A-i>]]></tags>
	<spec>&lt;M-i&gt;</spec>
	<spec>&lt;A-i&gt;</spec>
	<description>
            <p>Move focus forward</p>
	</description>
    </item>
    <item>
	<tags><![CDATA[i_<M-S-i> i_<A-S-i> <M-S-i> <A-S-i>]]></tags>
	<spec>&lt;M-S-i&gt;</spec>
	<spec>&lt;A-S-i&gt;</spec>
	<description>
            <p>Move focus backward</p>
	</description>
    </item>
</plugin>;
// }}}

(function () {

var types = [
  "text",
  "password",
  "search",
  "datetime",
  "datetime-local",
  "date",
  "month",
  "time",
  "week",
  "number",
  "range",
  "email",
  "url",
  "tel",
  "color",
].map(function(type) "@type=" + type.quote()).join(" or ");
var xpath = '//input[(' + types + ' or not(@type)) and not(@disabled)] | //textarea';

function isVisible (elem) {
  while (elem && !(elem instanceof HTMLDocument)) {
    if (/^none$/i.test(getComputedStyle(elem, '').display))
      return false;
    elem  = elem.parentNode;
  }
  return true;
}

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
            if (!isVisible(e))
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
mappings.addUserMap([modes.NORMAL, modes.INSERT], ['<M-S-i>', '<A-S-i>'],
                    'Walk Input Fields (Backward)', function () walkinput(false));

})();
