/* NEW BSD LICENSE {{{
Copyright (c) 2011, anekos.
All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

    1. Redistributions of source code must retain the above copyright notice,
       this list of conditions and the following disclaimer.
    2. Redistributions in binary form must reproduce the above copyright notice,
       this list of conditions and the following disclaimer in the documentation
       and/or other materials provided with the distribution.
    3. The names of the authors may not be used to endorse or promote products
       derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF
THE POSSIBILITY OF SUCH DAMAGE.


###################################################################################
# http://sourceforge.jp/projects/opensource/wiki/licenses%2Fnew_BSD_license       #
# に参考になる日本語訳がありますが、有効なのは上記英文となります。                #
###################################################################################

}}} */

// INFO {{{
let INFO =
<>
  <plugin name="GooglePlusCommando" version="1.9.2"
          href="http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/google-plus-commando.js"
          summary="The handy commands for Google+"
          lang="en-US"
          xmlns="http://vimperator.org/namespaces/liberator">
    <author email="anekos@snca.net">anekos</author>
    <license>New BSD License</license>
    <project name="Vimperator" minVersion="3.0"/>
    <p>Mappings for Google+</p>
    <p>require: feedSomeKeys_3.js and x-hint.js and _libly.js</p>
  </plugin>
</>;
// }}}

(function () {

  // Utils {{{

  function A (list)
    Array.slice(list);

  function click (elem) {
    if (!elem)
      throw GPCError('elem is undefined');
    buffer.followLink(elem, liberator.CURRENT_TAB);
  }

  function withCount (command) {
    return function (count) {
      if (count < 1)
        count = 1;
      for (let i = 0; i < count; i++)
        command();
    };
  }

  function GPCError (msg) {
    if (this instanceof GPCError) {
      this.toString = function () String(msg);
    } else {
      return new GPCError(msg);
    }
  }

  // }}}

  // Selector {{{

  const S = (function () {

    return {
      role: role,
      typePlusone: '[g\\:type="plusone"]',
      editable: '.editable',

      currentEntry: {
        root: '.a-f-oi-Ai',
        unfold: [
          role('button', '.a-b-f-i-gc-cf-Xb-h'),                // 発言の省略 (以前)
          role('button', '.a-b-f-i-gc-Sb-Xb-h'), // 発言の省略 (以降)
          role('button', '.a-b-f-i-p-gc-h')      // 投稿の省略
        ],
        menuButton: role('button', '.d-h.a-f-i-Ia-D-h.a-b-f-i-Ia-D-h'),
        cancel: role('button', '[id$=".cancel"]'),
        submit: role('button', '[id$=".post"]'),
      },
      post: {
        root: '.n-Ob',
        open: '.n-Nd',
        cancel: 'div.om[id$=".c"]',
        submit: role('button', '.d-s-r.tk3N6e-e.tk3N6e-e-qc.n-Ja-xg')
      },
      notification: '#gbi1',
      viewer: {
        root: '.zg',
        prev: '.vn.GE.AH',
        next: '.vn.GE.BH'
      },
      dialog: {
        root: '.va-Q',
      },
      frames: {
        notifications: 'iframe[src*="/_/notifications/"]'
      },
      closeButton: '.CH'
    };

    function role (name, prefix)
      ((prefix || '') + '[role="' + name + '"]');

  })();

  // }}}

  // Elements {{{

  const Elements = (function () {

    return {
      get doc() content.document,
      get currentEntry () MakeElement(Entry, Elements.doc.querySelector(S.currentEntry.root)),
      post: {
        // get editor () Elements.postForm.querySelector('.editable').parentNode,
        // Elements.postForm.querySelector('.editable').parentNode
        get root () Elements.doc.querySelector(S.post.root),
        get open () Elements.doc.querySelector(S.post.open),
        get cancel () Elements.post.root.querySelector(S.post.cancel),
        get submit () Elements.doc.querySelector(S.post.submit)
      },
      get notification () Elements.doc.querySelector(S.notification),
      get viewer () MakeElement(Viewer, Elements.doc.querySelector(S.viewer.root)),
      get dialog () MakeElement(Dialog, Elements.doc.querySelector(S.dialog.root)),

      frames: {
        get notifications () MakeElement(Notifications, Elements.doc.querySelector(S.frames.notifications))
      },

      get focusedEditor () {
        function hasIFrame (elem) {
          let iframe = elem.querySelector('iframe');
          return iframe && iframe.contentWindow === win;
        }

        function get1 () {
          function button (editor, name)
            editor.parentNode.querySelector(S.role('button', <>[id$=".{name}"]</>));

          let editors = A(doc.querySelectorAll('div[id$=".editor"]')).filter(hasIFrame);
          if (editors.length === 0)
            return;
          if (editors.length > 1)
            throw 'Two and more editors were found.';

          return {
            editor: #1=(editors[0]),
            button: {
              submit: button(#1#, 'post'),
              cancel: button(#1#, 'cancel')
            }
          };
        }

        function get2 () {
          function button (editor, index) {
            let result = editor.querySelectorAll('td > ' + S.role('button'))[index];
            if (result)
              return result;
            if (index === 1)
              return editor.querySelector('.om[id$=".c"]');
          }

          const indexes = {submit: 0, cancel: 1};

          let editors = A(doc.querySelectorAll('.n')).filter(hasIFrame);
          if (editors.length === 0)
            return;
          if (editors.length > 1)
            throw 'Two and more editors were found.';

          return {
            editor: #1=(editors[0]),
            button: {
              submit: button(#1#, 0),
              cancel: button(#1#, 1)
            }
          };
        }

        let doc = content.document;
        let win = document.commandDispatcher.focusedWindow;

        return get1() || get2();
      }
    };

    function MakeElement (constructor, root) {
      if (root && !/none/.test(util.computedStyle(root).display))
        return constructor(root);
    }

    function Entry (root) {
      let self = {
        get root () root,
        get permlink () [
          e
          for ([, e] in Iterator(A(root.querySelectorAll('a'))))
          if (!e.getAttribute('oid'))
        ][0],
        get unfold () {
          for (let [, sel] in Iterator(S.currentEntry.unfold)) {
            let result = root.querySelector(sel);
            if (result)
              return result;
          }
        },
        get buttons () A(self.plusone.parentNode.querySelectorAll(S.role('button'))),
        get commentButton () self.buttons[0],
        get commentEditor () let (e = root.querySelector(S.editable)) (e && e.parentNode),
        get comment() (self.commentEditor || self.commentButton),
        get plusone () root.querySelector(S.typePlusone),
        get share () self.buttons[1],
        get menu () root.querySelector(S.role('menu')),
        get menuButton () root.querySelector(S.currentEntry.menuButton),
        get cancel () root.querySelector(S.currentEntry.cancel),
        get submit () root.querySelector(S.currentEntry.submit)
      };
      return self;
    }

    function Dialog (root) {
      function nButton (n) {
        let bs = self.buttons;
        if (bs.length === 2)
          return bs[n];
      }
      let self = {
        get buttons () A(root.querySelectorAll(S.role('button'))),
        get submit () nButton(0),
        get cancel () nButton(1)
      };
      return self;
    }

    function Viewer (root) {
      let self = {
        get cancel () root.querySelector(S.closeButton),
        get prev () root.querySelector(S.viewer.prev),
        get next () root.querySelector(S.viewer.next)
      };
      return self;
    }

    function Notifications (root) {
      let self = {
        get root () root,
        get visible () (parseInt(root.style.height, 10) > 0)
      };
      return self;
    }

    return [S, Elements];
  })();

  // }}}

  // Post Help {{{

  const PostHelp = {
    PanelID: 'google-plus-commando-help-panel',

    get panel () Elements.doc.querySelector('#' + PostHelp.PanelID),

    show: function () {
      function move (panel) {
        let contentHeight = document.getElementById('content').boxObject.height;
        let rect = Elements.focusedEditor.editor.getClientRects()[0];
        if (rect.top < (contentHeight / 2)) {
          panel.style.top = '';
          panel.style.bottom = '10px';
        } else {
          panel.style.top = '10px';
          panel.style.bottom = '';
        }
      }

      let doc = Elements.doc;
      let parent = doc.body;

      let exists = PostHelp.panel;
      if (exists) {
        move(exists);
        exists.style.display = 'block';
        return;
      }

      let panel  = doc.createElement('div');
      panel.setAttribute('id', PostHelp.PanelID);
      let (ps = panel.style) {
        ps.position = 'fixed';
        ps.left = '10px';
        ps.zIndex = 1000;
        ps.backgroundColor = 'white';
        ps.border = 'solid 1px grey';
      }
      panel.innerHTML = <>
        <table>
          <tr><th>入力</th>           <th>効果</th>                   <th>解説</th>                                 </tr>
          <tr><td>*TEXT*</td>         <td><b>TEXT</b></td>            <td>太字</td>                                 </tr>
          <tr><td>_TEXT_</td>         <td><i>TEXT</i></td>            <td>斜体</td>                                 </tr>
          <tr><td>-TEXT-</td>         <td><s>TEXT</s></td>            <td>打ち消し線</td>                           </tr>
          <tr><td>*-TEXT-*</td>       <td><b><s>TEXT</s></b></td>     <td>太字/打消。打消(-)は内側に書く</td>       </tr>
          <tr><td>-ねこ-</td>         <td>☓</td>                      <td>日本語の打消はダメ</td>                   </tr>
          <tr><td>-ね こ-</td>        <td><s>ね こ</s></td>           <td>英数字や半角スペースを入れたらOK</td>     </tr>
          <tr><td>-Aねこす-</td>      <td><s>Aあねこす</s></td>       <td>英数字を前後に入れても良い</td>           </tr>
        </table>
      </>;

      move(panel);
      parent.appendChild(panel);

      return;
    },

    hide: function () {
      let exists = PostHelp.panel;
      if (exists)
        exists.style.display = 'none';
    }
  };

  // }}}

  // Commands {{{

  const Commands = {
    moveEntry: function (arrow, vim) {
      if (Elements.viewer)
        return click(Elements.viewer.next);

      let arrowTarget = (function () {
        let notifications = Elements.frames.notifications;
        if (notifications && notifications.visible)
          return notifications.root.contentDocument.body;

        let menus = A(Elements.doc.querySelectorAll(S.role('menu', '[tabindex="0"]')));
        if (menus.length === 1)
          return menus[0];
      })();

      plugins.feedSomeKeys_3.API.feed.apply(
        null,
        arrowTarget ? [arrow, ['keypress'], arrowTarget] : [vim, ['vkeypress'], Elements.doc]
      );
    },
    next: withCount(function () Commands.moveEntry('<Down>', 'j')),
    prev: withCount(function () Commands.moveEntry('<Up>', 'k')),
    comment: function() {
      let entry = Elements.currentEntry;
      click(entry.comment);
      PostHelp.show();
    },
    plusone: function() click(Elements.currentEntry.plusone),
    share: function() click(Elements.currentEntry.share),
    post: function() {
      buffer.scrollTop();
      click(Elements.post.open);
      PostHelp.show();
    },
    yank: function () {
      let e = Elements.currentEntry.permlink;
      if (!e)
        liberator.echoerr('Not found permlink');
      util.copyToClipboard(e.href);
      liberator.echo('Copy the permlink to clipboard: ' + e.href);
    },
    notification: function () {
      click(Elements.notification);
    },
    cancel: function () {
      for (let [, n] in Iterator(['dialog', 'viewer'])) {
        let e = Elements[n];
        if (e && e.cancel)
          return click(e.cancel);
      }

      if (Elements.frames.notifications.visible)
        return click(Elements.notification);

      click(Elements.doc.body);
    },
    submit: function () {
      if (liberator.focus)
        return;
      PostHelp.hide();
      click(Elements.focusedEditor.button.submit);
    },
    unfold: function () {
      click(Elements.currentEntry.unfold);
    },
    menu: function () {
      click(Elements.currentEntry.menuButton);
    }
  };

  // }}}

  // Define mappiings {{{

  (function () {

    const MatchingUrls = RegExp('^https://plus\\.google\\.com/*');
    const MappingDescriptionSuffix = ' - Google plus Commando';

    function defineMapping (mode, cmd) {
      let gv =
        liberator.globalVariables[
          'gplus_commando_map_' +
          cmd.replace(/[A-Z]/g, function (m) ('_' + m.toLowerCase()))
        ];
      if (!gv)
        return;
      let func = Commands[cmd];
      mappings.addUserMap(
        [mode],
        gv.split(/\s+/),
        cmd + MappingDescriptionSuffix,
        function (count) {
          try {
            func(count);
          } catch (e if (e instanceof GPCError)) {
            /* DO NOTHING */
          }
        },
        {
          count: func.length === 1,
          matchingUrls: MatchingUrls
        }
      );
    }

    'comment plusone share next prev post yank notification cancel unfold menu'.split(/\s/).forEach(defineMapping.bind(null, modes.NORMAL));
    'submit'.split(/\s/).forEach(defineMapping.bind(null, modes.INSERT));

    mappings.addUserMap(
      [modes.INSERT],
      ['<Esc>'],
      'Escape from input area',
      function () {
        if (liberator.focus) {
          let esc = mappings.getDefault(modes.NORMAL, '<Esc>');
          esc.action.apply(esc, arguments);
        } else {
          click(Elements.focusedEditor.button.cancel);
          // FIXME
          window.document.commandDispatcher.advanceFocus();
          modes.reset();
          PostHelp.hide();
        }
      },
      {
        matchingUrls: MatchingUrls
      }
    );

  })();

  // }}}

  // Define hints {{{

  (function () {

    const HintStyleName = 'google-plus-commando-hint';

    function s2x (s)
      s.replace(/^\./, '');

    [
      ['o', 'f', function (e) click(e)],
      ['t', 'F', function (e) buffer.followLink(e, liberator.NEW_TAB)],
    ].forEach(function ([modeChar, mapKey, action]) {
      let modeName = 'google-plus-comando-hint-' + modeChar;

      hints.addMode(
        modeName,
        hints._hintModes[modeChar].prompt,
        function (elem, count) {
          function mouseEvent (name) {
            let evt = elem.ownerDocument.createEvent('MouseEvents');
            evt.initMouseEvent(name, true, true, elem.ownerDocument.defaultView, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            elem.dispatchEvent(evt);
          }

          let plusone = elem.getAttribute('g:type') === 'plusone';
          if (plusone)
            mouseEvent('mouseover');
          action(elem, count);
          if (plusone)
            mouseEvent('mouseout');
        },
        function () {
          function removeRoot (s)
            s.replace(/^\s*\/\//, '');

          const ext = [
            'span[@role="button"]',
            'div[@role="button"]',
            'div[@data-content-type]',
            'img[contains(@class,"ea-g-Vc-pa")]',
            'div[contains(@class,"a-z-nb-A")]'
          ];

          let xpath = options['hinttags'].split(/\s*\|\s*/).map(removeRoot).concat(ext);

          for (let [, name] in Iterator(['viewer', 'dialog'])) {
            if (!Elements[name])
              continue;
            xpath.push(String(<>div[contains(@class, "{s2x(S.closeButton)}")]</>));
            xpath = xpath.map(function (it) String(<>*[contains(@class, "{s2x(S[name].root)}")]//{it}</>))
            break;
          }

          styles.addSheet(false, HintStyleName, 'plus\\.google\\.com', '.a-b-f-W-Tj.a-f-W-Tj { display: inline  !important }');

          return xpath.map(function (it) '//' + it).join(' | ');
        }
      );

      mappings.addUserMap(
        [modes.NORMAL],
        [liberator.globalVariables['gplus_commando_map_hint_' + modeChar] || mapKey],
        'Hit a hint - Google plus Commando',
        function () hints.show(modeName),
        {
          matchingUrls: RegExp('^https://plus\\.google\\.com/.*')
        }
      );
    });

    plugins.libly.$U.around(
      hints,
      'hide',
      function (next) {
        setTimeout(function () styles.removeSheet(false, HintStyleName, 'plus\\.google\\.com'), 0);
        return next();
      },
      true
    );

  })();

  // }}}

  // Export {{{

  __context__.command  = Commands;
  __context__.element  = Elements;

  // }}}

})();

// vim:sw=2 ts=2 et si fdm=marker:
