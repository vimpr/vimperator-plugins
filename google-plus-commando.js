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
  <plugin name="GooglePlusCommando" version="1.7.0"
          href="http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/google-plus-commando.js"
          summary="The handy commands for Google+"
          lang="en-US"
          xmlns="http://vimperator.org/namespaces/liberator">
    <author email="anekos@snca.net">anekos</author>
    <license>New BSD License</license>
    <project name="Vimperator" minVersion="3.0"/>
    <p>Mappings for Google+</p>
    <p>require: feedSomeKeys_3.js and x-hint.js</p>
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

  // State {{{

  const State = {
    form: null
  };

  // }}}

  // Elements {{{

  const Names = {
    viewer: 'zg',
    dialog: 'va-Q',
    closeButton: 'CH'
  };

  const Elements = {
    get doc() content.document,
    get currentEntry () MakeElement(Entry, Elements.doc.querySelector('.a-f-oi-Ai')),
    post: {
      //get editor () Elements.postForm.querySelector('.editable').parentNode,
      get editor () (
        Elements.doc.querySelector('.n-Ob')
        ||
        Elements.postForm.querySelector('.editable').parentNode
      ),
      get cancel () Elements.post.editor.querySelector('div.om[id$=".c"]'),
      get submit () Elements.doc.querySelector('[role="button"].d-s-r.tk3N6e-e.tk3N6e-e-qc.n-Ja-xg')
    },
    get notification () Elements.doc.querySelector('#gbi1'),
    get viewer () MakeElement(Viewer, Elements.doc.querySelector('.' + Names.viewer)),
    get dialog () MakeElement(Dialog, Elements.doc.querySelector('.' + Names.dialog))
  };

  function MakeElement (constructor, root) {
    if (root)
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
      get unfold () (
        root.querySelector('.a-b-f-i-gc-cf-Xb-h[role="button"]') // 発言の省略 (以前)
        ||
        root.querySelector('.a-b-f-i-gc-Sb-Xb-h[role="button"]') // 発言の省略 (以降)
        ||
        root.querySelector('.a-b-f-i-p-gc-h[role="button"]') // 投稿の省略
      ),
      get buttons () A(self.plusone.parentNode.querySelectorAll('[role="button"]')),
      get commentButton () self.buttons[0],
      get commentEditor () let (e = root.querySelector('.editable')) (e && e.parentNode),
      get comment() (self.commentEditor || self.commentButton),
      get plusone () root.querySelector('[g\\:type="plusone"]'),
      get share () self.buttons[1],
      get menu () root.querySelector('[role="menu"]'),
      get cancel () root.querySelector('[role="button"][id$=".cancel"]'),
      get submit () root.querySelector('[role="button"][id$=".post"]')
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
      get buttons () A(root.querySelectorAll('[role="button"]')),
      get submit () nButton(0),
      get cancel () nButton(1)
    };
    return self;
  }

  function Viewer (root) {
    function nButton (n) {
      let bs = self.buttons;
      if (bs.length === 2)
        return bs[n];
    }
    let self = {
      get cancel () root.querySelector('.' + Names.closeButton),
      get prev () root.querySelector('.vn.GE.AH'),
      get next () root.querySelector('.vn.GE.BH'),
    };
    return self;
  }

  // }}}

  // Commands {{{

  const Commands = {
    next: withCount(function () {
      if (Elements.viewer)
        return click(Elements.viewer.next);
      let menus = A(Elements.doc.querySelectorAll('[tabindex="0"][role="menu"]'));
      plugins.feedSomeKeys_3.API.feed.apply(
        null,
        menus.length === 1 ? ['<Down>', ['keypress'], menus[0]]
                           : ['j', ['vkeypress'], Elements.doc]
      );
    }),
    prev: withCount(function () {
      if (Elements.viewer)
        return click(Elements.viewer.prev);
      let menus = A(Elements.doc.querySelectorAll('[tabindex="0"][role="menu"]'));
      plugins.feedSomeKeys_3.API.feed.apply(
        null,
        menus.length === 1 ? ['<Up>', ['keypress'], menus[0]]
                           : ['k', ['vkeypress'], Elements.doc]
      );
    }),
    comment: function() {
      let entry = Elements.currentEntry;
      click(entry.comment);
      State.form = {
        cancel: function () click(entry.cancel),
        submit: function () click(entry.submit)
      };
    },
    plusone: function() click(Elements.currentEntry.plusone),
    share: function() click(Elements.currentEntry.share),
    post: function() {
      buffer.scrollTop();
      click(Elements.post.editor);
      State.form = {
        cancel: function () click(Elements.post.cancel),
        submit: function () click(Elements.post.submit)
      };
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
      click(Elements.doc.body);
    },
    submit: function () {
      if (liberator.focus || !State.form)
        return;
      State.form.submit();
      State.form = null;
    },
    unfold: function () {
      click(Elements.currentEntry.unfold);
    }
  };

  // }}}

  // Define mappiings {{{

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

  'comment plusone share next prev post yank notification cancel unfold'.split(/\s/).forEach(defineMapping.bind(null, modes.NORMAL));
  'submit'.split(/\s/).forEach(defineMapping.bind(null, modes.INSERT));

  mappings.addUserMap(
    [modes.INSERT],
    ['<Esc>'],
    'Escape from input area',
    function () {
      if (!liberator.focus && State.form) {
        State.form.cancel();
        State.form = null;
        modes.reset();
        return;
      }
      let esc = mappings.getDefault(modes.NORMAL, '<Esc>');
      esc.action.apply(esc, arguments);
    },
    {
      matchingUrls: MatchingUrls
    }
  );

  // }}}

  // Define hints {{{

  const HintStyleName = 'google-plus-commando-hint';

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
          xpath.push(String(<>div[contains(@class, "{Names.closeButton}")]</>));
          xpath = xpath.map(function (it) String(<>*[contains(@class, "{Names[name]}")]//{it}</>))
          break;
        }

        styles.addSheet(false, HintStyleName, "plus\\.google\\.com", '.a-b-f-W-Tj.a-f-W-Tj { display: inline  !important }');

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

  // }}}

  // Export {{{

  __context__.command  = Commands;
  __context__.element  = Elements;

  // }}}

})();

// vim:sw=2 ts=2 et si fdm=marker:
