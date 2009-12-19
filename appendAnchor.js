let PLUGIN_INFO =
<VimperatorPlugin>
  <name>appendAnchor</name>
  <description>append anchors to texts look like url.</description>
  <description lang="ja">リンク中の URL っぽいテキストにアンカーをつける。</description>
  <version>0.4.2</version>
  <author>SAKAI, Kazuaki</author>
  <minVersion>2.0pre</minVersion>
  <maxVersion>2.3</maxVersion>
  <detail><![CDATA[
    == Commands ==
      :anc:
        Append anchors.
    == GlobalVariables ==
      g:auto_append_anchor:
        Execute ":anc" automatically when Vimperator shows the hints.
      g:auto_append_anchor_once:
        Just first once.
  ]]></detail>
  <detail lang="ja"><![CDATA[
    == Commands ==
      :anc:
        アンカーを付加する。
    == GlobalVariables ==
      g:auto_append_anchor:
        Vimperator がヒントを表示するときに自動的に ":anc" する。
      g:auto_append_anchor_once:
        最初の一回だけ。
  ]]></detail>
</VimperatorPlugin>;

(function(){

  // settings ---
  // "ACEILMPRSTXY" is result of below code.
  //   Array.prototype.uniq = function() this.reduceRight( function (a, b) (a[0] === b || a.unshift(b), a), []);
  //   [ 'TITLE', 'STYLE', 'SCRIPT', 'TEXTAREA', 'XMP', 'A', ].join('').split('').sort().uniq().join('');
  const xpathQueryPlainText = '/descendant::*[not(contains(" TITLE STYLE SCRIPT TEXTAREA XMP A ", concat(" ", translate(local-name(), "aceilmprstxy", "ACEILMPRSTXY"), " ")))]/child::text()';
  const regexpLikeURL = new RegExp("h?(ttps?):/+([a-zA-Z0-9][-_.!~*'()a-zA-Z0-9;/?:@&=+$,%#]+[-_~*(a-zA-Z0-9;/?@&=+$%#])");

  // process global variable
  if (stringToBoolean(liberator.globalVariables.auto_append_anchor, false)) {
    let originalHintsShow = liberator.modules.hints.show;
    let once = stringToBoolean(liberator.globalVariables.auto_append_anchor_once, false);
    hints.show = function () {
      if (!content.document.anchor_appended) {
        content.document.anchor_appended = true;
        liberator.execute('anc');
      }
      originalHintsShow.apply(this, arguments);
    };
  }

  // register command
  liberator.modules.commands.addUserCommand(['anc'], 'append anchors to texts look like url',
    function(arg) {
      const doc = window.content.document;
      const range = doc.createRange();

      let nodes = util.evaluateXPath(xpathQueryPlainText);
      for (let node in nodes) {
        while (node) {
          range.selectNode(node)

          // search string like URL
          let start = range.toString().search(regexpLikeURL);
          // go to next node when there is nothing look like URL in current node
          if (!(start > -1)) break;

          // build URL
          let href = 'h' + RegExp.$1 + '://' + RegExp.$2;

          // reset range
          range.setStart(node, start);
          range.setEnd(node, start + RegExp.lastMatch.length);

          // build anchor element
          let anchor = doc.createElement('a');
          anchor.setAttribute('href', href);
          range.surroundContents(anchor);

          // insert
          range.insertNode(anchor);

          // iterate
          node = node.nextSibling.nextSibling.nextSibling;
        }
      }
      range.detach();
    },
    {},
    true
  );

  // stuff function
  function stringToBoolean(str, defaultValue) {
    return !str                          ? (defaultValue ? true : false)
         : str.toLowerCase() === 'false' ? false
         : /^\d+$/.test(str)             ? (parseInt(str) ? true : false)
         :                                 true;
  }

})();
