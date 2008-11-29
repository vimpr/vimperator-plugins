/**
 * == VimperatorPlugin==
 * @name          appendAnchor
 * @description   append anchors to texts look like url.
 * @author        SAKAI, Kazuaki
 * @version       0.03
 * @minVersion    2.0pre
 * @maxVersion    2.0pre
 * == /VimperatorPlugin==
 */

(function(){

  // settings ---
  // "ACEILMPRSTXY" is result of below code.
  //   Array.prototype.uniq = function() this.reduceRight( function (a, b) (a[0] === b || a.unshift(b), a), []);
  //   [ 'TITLE', 'STYLE', 'SCRIPT', 'TEXTAREA', 'XMP', 'A', ].join('').split('').sort().uniq().join('');
  const xpathQueryPlainText = '/descendant::*[not(contains(" TITLE STYLE SCRIPT TEXTAREA XMP A ", concat(" ", translate(local-name(), "aceilmprstxy", "ACEILMPRSTXY"), " ")))]/child::text()';
  const regexpLikeURL = new RegExp("h?(ttps?):/+([a-zA-Z0-9][-_.!~*'()a-zA-Z0-9;/?:@&=+$,%#]+[-_~*(a-zA-Z0-9;/?@&=+$%#])");

  // process global variable
  if (stringToBoolean(liberator.globalVariables.auto_append_anchor, 'false')) {
    let originalHintsShow = liberator.modules.hints.show;
    hints.show = function () {
      liberator.execute('anc');
      originalHintsShow.apply(this, arguments);
    };
  }

  // register command
  liberator.modules.commands.addUserCommand(['anc'], 'append anchors to texts look like url',
    function(arg, special) {
      const doc = window.content.document;
      const range = doc.createRange();

      let nodes = liberator.modules.buffer.evaluateXPath(xpathQueryPlainText);
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
          node = node.nextSibling.nextSibling;
        }
      }
      range.detach();
    },{}
  );

  // stuff function
  function stringToBoolean(str, defaultValue) {
    return !str                          ? (defaultValue ? true : false)
         : str.toLowerCase() === 'false' ? false
         : /^\d+$/.test(str)             ? (parseInt(str) ? true : false)
         :                                 true;
  }

})();
