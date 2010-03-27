/* ***** BEGIN LICENSE BLOCK ***** {{{
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Spatial Navigation.
 *
 * The Initial Developer of the Original Code is Mozilla Corporation
 * Portions created by the Initial Developer are Copyright (C) 2008
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *  Doug Turner <dougt@meer.net>  (Original Author)
 *  anekos <anekos@snca.net>  (Vimperator plugin version Author)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** }}} */

// PLUGIN_INFO {{{
let PLUGIN_INFO =
<VimperatorPlugin>
  <name> --- </name>
  <name lang="ja"> --- </name>
  <description> --- </description>
  <description lang="ja"> --- </description>
  <version> --- </version>
  <updateURL>http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/spatial-navigation.js</updateURL>
  <minVersion>2.3</minVersion>
  <maxVersion>2.3</maxVersion>
  <detail><![CDATA[
    ----
  ]]></detail>
  <detail lang="ja"><![CDATA[
    ----
  ]]></detail>
</VimperatorPlugin>;
// }}}
// INFO {{{
let INFO =
<>
  <plugin name="SpatialNavigation" version="1.0.0"
          href="http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/spatial-navigation.js"
          summary="Spatial navigation"
          lang="en-US"
          xmlns="http://vimperator.org/namespaces/liberator">
    <project name="Vimperator" minVersion="2.3"/>
    <p></p>
    <item>
      <tags>:hoge</tags>
      <spec>:hoge</spec>
      <description><p></p></description>
    </item>
  </plugin>
  <plugin name="SpatialNavigation" version="1.0.0"
          href="http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/spatial-navigation.js"
          summary="空間ナビゲーション"
          lang="ja"
          xmlns="http://vimperator.org/namespaces/liberator">
    <project name="Vimperator" minVersion="2.3"/>
    <p></p>
    <item>
      <tags>:hoge</tags>
      <spec>:hoge</spec>
      <description><p></p></description>
    </item>
  </plugin>
</>;
// }}}


(function () {

  const [DIR_U, DIR_D, DIR_L, DIR_R] = [1, 2, 3, 4];
  const gDirectionalBias = 10;
  const gRectFudge = 1;

  function getFocusedElement ()
    window.document.commandDispatcher.focusedElement;

  function isRectInDirection (dir, focusedRect, anotherRect) {
    if (dir === DIR_L) {
      return (anotherRect.left < focusedRect.left);
    }

    if (dir === DIR_R) {
      return (anotherRect.right > focusedRect.right);
    }

    if (dir === DIR_U) {
      return (anotherRect.top < focusedRect.top);
    }

    if (dir === DIR_D) {
      return (anotherRect.bottom > focusedRect.bottom);
    }
      return false;
  }

  function inflateRect (rect, value) {
    var newRect = new Object();

    newRect.left   = rect.left - value;
    newRect.top    = rect.top - value;
    newRect.right  = rect.right  + value;
    newRect.bottom = rect.bottom + value;
    return newRect;
  }

  function containsRect (a, b) {
    return ( (b.left  <= a.right) &&
             (b.right >= a.left)  &&
             (b.top  <= a.bottom) &&
             (b.bottom >= a.top) );
  }

  function spatialDistance (dir, a, b) {
    var inlineNavigation = false;
    var mx, my, nx, ny;

    if (dir === DIR_L) {

      //  |---|
      //  |---|
      //
      //  |---|  |---|
      //  |---|  |---|
      //
      //  |---|
      //  |---|
      //

      if (a.top > b.bottom) {
        // the b rect is above a.
        mx = a.left;
        my = a.top;
        nx = b.right;
        ny = b.bottom;
      }
      else if (a.bottom < b.top) {
        // the b rect is below a.
        mx = a.left;
        my = a.bottom;
        nx = b.right;
        ny = b.top;
      }
      else {
        mx = a.left;
        my = 0;
        nx = b.right;
        ny = 0;
      }
    } else if (dir === DIR_R) {

      //         |---|
      //         |---|
      //
      //  |---|  |---|
      //  |---|  |---|
      //
      //         |---|
      //         |---|
      //

      if (a.top > b.bottom) {
        // the b rect is above a.
        mx = a.right;
        my = a.top;
        nx = b.left;
        ny = b.bottom;
      }
      else if (a.bottom < b.top) {
        // the b rect is below a.
        mx = a.right;
        my = a.bottom;
        nx = b.left;
        ny = b.top;
      } else {
        mx = a.right;
        my = 0;
        nx = b.left;
        ny = 0;
      }
    } else if (dir === DIR_U) {

      //  |---|  |---|  |---|
      //  |---|  |---|  |---|
      //
      //         |---|
      //         |---|
      //

      if (a.left > b.right) {
        // the b rect is to the left of a.
        mx = a.left;
        my = a.top;
        nx = b.right;
        ny = b.bottom;
      } else if (a.right < b.left) {
        // the b rect is to the right of a
        mx = a.right;
        my = a.top;
        nx = b.left;
        ny = b.bottom;
      } else {
        // both b and a share some common x's.
        mx = 0;
        my = a.top;
        nx = 0;
        ny = b.bottom;
      }
    } else if (dir === DIR_D) {

      //         |---|
      //         |---|
      //
      //  |---|  |---|  |---|
      //  |---|  |---|  |---|
      //

      if (a.left > b.right) {
        // the b rect is to the left of a.
        mx = a.left;
        my = a.bottom;
        nx = b.right;
        ny = b.top;
      } else if (a.right < b.left) {
        // the b rect is to the right of a
        mx = a.right;
        my = a.bottom;
        nx = b.left;
        ny = b.top;
      } else {
        // both b and a share some common x's.
        mx = 0;
        my = a.bottom;
        nx = 0;
        ny = b.top;
      }
    }

    let scopedRect = inflateRect(a, gRectFudge);

    if (dir === DIR_L ||
        dir === DIR_R) {
      scopedRect.left = 0;
      scopedRect.right = Infinity;
      inlineNavigation = containsRect(scopedRect, b);
    }
    else if (dir === DIR_U ||
             dir === DIR_D) {
      scopedRect.top = 0;
      scopedRect.bottom = Infinity;
      inlineNavigation = containsRect(scopedRect, b);
    }

    var d = Math.pow((mx-nx), 2) + Math.pow((my-ny), 2);

    // prefer elements directly aligned with the focused element
    if (inlineNavigation)
      d /= gDirectionalBias;

    return d;
  }

  function defaultMove (dir) {
    if (dir === DIR_R || dir === DIR_D) {
      window.document.commandDispatcher.advanceFocus();
    } else {
      window.document.commandDispatcher.rewindFocus();
    }
    flashFocusedElement();
  }

  const flasher = Cc['@mozilla.org/inspector/flasher;1'].createInstance(Ci.inIFlasher);
  flasher.color = '#FF0000';
  flasher.thickness = 2;

  function flashFocusedElement () {
    let elem = getFocusedElement();
    if (!elem)
      return;
    setTimeout(
      function () {
        flasher.drawElementOutline(elem);
        elem.addEventListener(
          'blur',
          function () {
            elem.removeEventListener(arguments.callee);
            flasher.repaintElement(elem);
          },
          false
        );
      },
      0
    );
  }

  function focusElement (elem) {
    // doc.defaultView.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowUtils).focus(bestElementToFocus);
    elem.focus();
    flashFocusedElement();
  }

  function move (dir, target, callback) {
    let doc = target.ownerDocument;

    // If it is XUL content (e.g. about:config), bail.
    /*
    if (doc instanceof Ci.nsIDOMXULDocument)
      return ;
    */

    if ((target instanceof Ci.nsIDOMHTMLInputElement && (target.type == "text" || target.type == "password")) ||
        target instanceof Ci.nsIDOMHTMLTextAreaElement ) {

      // if there is any selection at all, just ignore
      if (target.selectionEnd - target.selectionStart > 0)
        return;

      // if there is no text, there is nothing special to do.
      if (target.textLength > 0) {
        if (dir === DIR_R ||
            dir === DIR_D) {
          // we are moving forward into the document
          if (target.textLength != target.selectionEnd)
            return;
        }
        else
        {
          // we are at the start of the text, okay to move
          if (target.selectionStart != 0)
            return;
        }
      }
    }

    // Check to see if we are in a select
    if (target instanceof Ci.nsIDOMHTMLSelectElement)
    {
      if (dir === DIR_D) {
        if (target.selectedIndex + 1 < target.length)
          return;
      }

      if (dir  === DIR_U) {
        if (target.selectedIndex > 0)
          return;
      }
    }

    function snavfilter(node) {

      if (node instanceof Ci.nsIDOMHTMLLinkElement ||
          node instanceof Ci.nsIDOMHTMLAnchorElement) {
        // if a anchor doesn't have a href, don't target it.
        if (node.href == "")
          return Ci.nsIDOMNodeFilter.FILTER_SKIP;
        return  Ci.nsIDOMNodeFilter.FILTER_ACCEPT;
      }

      if ((node instanceof Ci.nsIDOMHTMLButtonElement ||
           //node instanceof Ci.nsIDOMHTMLInputElement ||
           node instanceof Ci.nsIDOMHTMLLinkElement ||
           node instanceof Ci.nsIDOMHTMLOptGroupElement ||
           node instanceof Ci.nsIDOMHTMLSelectElement
           //node instanceof Ci.nsIDOMHTMLTextAreaElement
          ) &&
          node.disabled == false)
        return Ci.nsIDOMNodeFilter.FILTER_ACCEPT;

      return Ci.nsIDOMNodeFilter.FILTER_SKIP;
    }

    var bestElementToFocus = null;
    var distanceToBestElement = Infinity;
    var focusedRect = inflateRect(target.getBoundingClientRect(), -gRectFudge);

    var treeWalker = doc.createTreeWalker(doc, Ci.nsIDOMNodeFilter.SHOW_ELEMENT, snavfilter, false);
    var nextNode;

    while ((nextNode = treeWalker.nextNode())) {

      if (nextNode == target)
        continue;

      var nextRect = inflateRect(nextNode.getBoundingClientRect(),
                                  - gRectFudge);

      if (! isRectInDirection(dir, focusedRect, nextRect))
        continue;

      var distance = spatialDistance(dir, focusedRect, nextRect);

      //dump("looking at: " + nextNode + " " + distance);

      if (distance <= distanceToBestElement && distance > 0) {
        distanceToBestElement = distance;
        bestElementToFocus = nextNode;
      }
    }

    if (bestElementToFocus != null) {
      //dump("focusing element  " + bestElementToFocus.nodeName + " " + bestElementToFocus) + "id=" + bestElementToFocus.getAttribute("id");

      // Wishing we could do element.focus()
      focusElement(bestElementToFocus);

      // if it is a text element, select all.
      if((bestElementToFocus instanceof Ci.nsIDOMHTMLInputElement && (bestElementToFocus.type == "text" || bestElementToFocus.type == "password")) ||
         bestElementToFocus instanceof Ci.nsIDOMHTMLTextAreaElement ) {
        bestElementToFocus.selectionStart = 0;
        bestElementToFocus.selectionEnd = bestElementToFocus.textLength;
      }

    } else {
      // couldn't find anything.  just advance and hope.
      defaultMove(dir);
    }

  }

  [['<A-k>', DIR_U], ['<A-j>', DIR_D], ['<A-h>', DIR_L], ['<A-l>', DIR_R]].forEach(
    function ([name, dir]) {
      liberator.log(name);
      mappings.addUserMap(
        [modes.NORMAL],
        [name],
        'Spatial Navigation',
        function () {
          let (target = getFocusedElement())
            target ? move(dir, target) : defaultMove(dir);
        },
        {}
      )
    }
  );

})();

// vim:sw=2 ts=2 et si fdm=marker:
