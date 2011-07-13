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
  <plugin name="GooglePlusCommando" version="1.2.0"
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

  function A (list)
    Array.slice(list);

  function click (elem)
    buffer.followLink(elem, liberator.CURRENT_TAB);

  function withCount (command) {
    return function (count) {
      if (count < 1)
        count = 1;
      for (let i = 0; i < count; i++)
        command();
    };
  }


  const Conf = (function () {
    let gv = liberator.globalVariables;
    let conf = {};
    'label_shortcut'.split(/\s/).forEach(function (n) {
      conf.__defineGetter__(
        n.replace(/_./g, function (m) m.slice(1).toUpperCase()),
        function () gv['gmail_commando_' + n]
      );
    });
    return conf;
  })();


  const Names = {
    screen: 'zg',
    dialog: 'va-Q',
  };

  const Elements = {
    get doc() content.document,
    get currentEntry () Entry(Elements.doc.querySelector('.a-f-oi-Ai')),
    get postForm () Elements.doc.querySelector('#contentPane > div > div').nextSibling,
    //get postEditor () Elements.postForm.querySelector('.editable').parentNode,
    get postEditor () (
      Elements.doc.querySelector('.n-Ob')
      ||
      Elements.postForm.querySelector('.editable').parentNode
    ),
    get submitButton () Elements.postForm.querySelector('[role="button"]'),
    get notification () Elements.doc.querySelector('#gbi1'),
    get screen () Elements.doc.querySelector('.' + Names.screen),
    get dialog () Elements.doc.querySelector('.' + Names.dialog)
  };

  function Entry (root) {
    let self = {
      click: function (name) {
        if (!root)
          return;
        click(self[name]);
      },

      get permlink () [
        e
        for ([, e] in Iterator(A(root.querySelectorAll('a'))))
        if (!e.getAttribute('oid'))
      ][0],
      get buttons () A(self.plusone.parentNode.querySelectorAll('[role="button"]')),
      get commentButton () self.buttons[0],
      get commentEditor () let (e = root.querySelector('.editable')) (e && e.parentNode),
      get comment() (self.commentEditor || self.commentButton),
      get plusone () root.querySelector('[g\\:type="plusone"]'),
      get share () self.buttons[1],
      get menu () root.querySelector('[role="menu"]')
    };
    return self;
  }


  const Commands = {
    next: withCount(function () {
      let menus = A(Elements.doc.querySelectorAll('[tabindex="0"][role="menu"]'));
      plugins.feedSomeKeys_3.API.feed.apply(
        null,
        menus.length === 1 ? ['<Down>', ['keypress'], menus[0]]
                           : ['j', ['vkeypress'], Elements.doc]
      );
    }),
    prev: withCount(function () {
      let menus = A(Elements.doc.querySelectorAll('[tabindex="0"][role="menu"]'));
      plugins.feedSomeKeys_3.API.feed.apply(
        null,
        menus.length === 1 ? ['<Up>', ['keypress'], menus[0]]
                           : ['k', ['vkeypress'], Elements.doc]
      );
    }),
    comment: function() Elements.currentEntry.click('comment'),
    plusone: function() Elements.currentEntry.click('plusone'),
    share: function() Elements.currentEntry.click('share'),
    post: function() {
      buffer.scrollTop();
      click(Elements.postEditor);
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
    }
  };


  'comment plusone share next prev post yank notification'.split(/\s/).forEach(function (cmd) {
    let gv =
      liberator.globalVariables[
        'gplus_commando_map_' +
        cmd.replace(/[A-Z]/g, function (m) ('_' + m.toLowerCase()))
      ];
    if (!gv)
      return;
    let func = Commands[cmd];
    mappings.addUserMap(
      [modes.NORMAL],
      gv.split(/\s+/),
      cmd + ' - Google plus Commando',
      function (count) {
        func(count);
      },
      {
        count: func.length === 1,
        matchingUrls: RegExp('^https://plus\\.google\\.com/*')
      }
    );
  });


  [
    ['o', 'f', function (e) click(e)],
    ['t', 'F', function (e) buffer.followLink(e, liberator.NEW_TAB)],
  ].forEach(function ([modeChar, mapKey, action]) {
    let modeName = 'google-plus-comando-hint-' + modeChar;

    hints.addMode(
      modeName,
      hints._hintModes[modeChar].prompt,
      action,
      function () {
        function removeRoot (s)
          s.replace(/^\s*\/\//, '');

        const ext = [
          'span[@role="button"]',
          'div[@role="button"]',
          'div[@data-content-type]'
        ];

        let xpath = options['hinttags'].split(/\s*\|\s*/).map(removeRoot).concat(ext);


        for (let [, name] in Iterator(['screen', 'dialog'])) {
          if (!Elements[name])
            continue;
          xpath.push('div[contains(@class, "CH")]');
          xpath = xpath.map(function (it) String(<>*[contains(@class, "{Names[name]}")]//{it}</>))
          break;
        }

        return xpath.map(function (it) '//' + it).join(' | ');
      }
    );

    mappings.addUserMap(
      [modes.NORMAL],
      [liberator.globalVariables['gplus_commando_map_hint_' + modeChar] || mapKey],
      'Hit a hint - Google plus Commando',
      function () hints.show(modeName),
      {
        matchingUrls: RegExp('^https://plus\\.google\\.com/*')
      }
    );
  });

  __context__.command  = Commands;
  __context__.element  = Elements;

})();

// vim:sw=2 ts=2 et si fdm=marker:
