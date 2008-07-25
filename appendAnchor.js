/**
 * == VimperatorPlugin==
 * @name          appendAnchor
 * @description   append anchors to texts look like url.
 * @author        SAKAI, Kazuaki
 * @version       0.02
 * == VimperatorPlugin==
 */

(function(){

  liberator.commands.addUserCommand(['anc'], 'append anchors to texts look like url',
    function(arg, special) {
      var doc = window.content.document;
      var nodes = liberator.buffer.evaluateXPath(
        '/descendant::*[not(contains(" TITLE STYLE SCRIPT TEXTAREA XMP A ", concat(" ", local-name(), " ")))]/child::text()'
      );
      var regex =  new RegExp("h?(ttps?):/+([a-zA-Z0-9][-_.!~*'()a-zA-Z0-9;/?:@&=+$,%#]+[-_~*(a-zA-Z0-9;/?@&=+$%#])");
      
      var range = doc.createRange();
      var last;
      var href;
      for (var i = 0; i < nodes.snapshotLength; i++) {
        var node = nodes.snapshotItem(i);
        range.selectNode(node);
        while (node && (last = range.toString().search(regex)) > -1) {
          range.setStart(node, last);
          range.setEnd(node, last + RegExp.lastMatch.length);
          href = 'h' + RegExp.$1 + '://' + RegExp.$2;
          var anchor = doc.createElement('a');
          range.insertNode(anchor);
          anchor.setAttribute('href', href);
          range.surroundContents(anchor);
          node = node.nextSibling.nextSibling;
          range.selectNode(node);
        }
      }
      range.detach();
    },{}
  );
})();
