/* NEW BSD LICENSE {{{
Copyright (c) 2011, anekos.
Copyright (c) 2011, teramako.
All rights reserved.
>
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
  <plugin name="GooglePlusCommando" version="2.0.0"
          href="http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/google-plus-commando.js"
          summary="The handy commands for Google+"
          lang="en-US"
          xmlns="http://vimperator.org/namespaces/liberator">
    <author email="anekos@snca.net">anekos</author>
    <author email="teramako@gmail.com" homepage="http://d.hatena.ne.jp/teramako/">teramako</author>
    <license>New BSD License</license>
    <project name="Vimperator" minVersion="3.0"/>
    <p>Many Mappings and  Post command for Google+</p>
    <p>require: feedSomeKeys_3.js and x-hint.js and _libly.js</p>
    <item>
      <tags>:googleplus-setup</tags>
      <spec>:googleplus -setup</spec>
      <spec>:gp -setup</spec>
      <description>
        <p>Should setup at first</p>
        <ol>
          <li>Login to <a href="htts://plus.google.com/">Google+</a></li>
          <li>Execute <ex>:googleplus -setup</ex></li>
        </ol>
      </description>
    </item>
    <item>
      <tags>:googleplus-nonargs</tags>
      <spec>:googleplus</spec>
      <spec>:gp</spec>
      <description>
        <p>when argument is none, select the Google+ tab or open in new tab</p>
      </description>
    </item>
    <item>
      <tags>:googleplus :gp</tags>
      <spec>:googleplus <oa>-l[link]</oa> <oa>-i[mage] <a>imageURL</a></oa> <oa>-t[o] <a>to</a></oa> <a>message</a></spec>
      <spec>:gp <oa>-l[ink]</oa> <oa>-i[mage] <a>imageURL</a></oa> <oa>-t[o]> <a>to</a></oa> <a>message</a></spec>
      <description>
        <p>Post <a>message</a></p>
        <dl>
          <dt>-link</dt>
          <dd>
            Add the current URL. If the selections are available, add the selections as relataed page.
            And when <a>-image</a> option is not specified and image elements is contained in the selections,
            add the URL of the largest image.
          </dd>
          <dt>-image</dt>
          <dd>
            Specify image URL
          </dd>
          <dt>-to</dt>
          <dd>
            Specify the circles. Can set multiple. (Default: Anyone)
          </dd>
        </dl>
      </description>
    </item>
    <item>
      <tags>g:gplus_commando_map_</tags>
      <spec>let g:gplus_commando_map_<a>command</a> = <a>map-keys</a></spec>
      <description>
        <p>
          Map <a>map-keys</a> for <a>command</a>.
          The possible <a>command</a>s.
          <dl>
            <dt>next</dt>           <dd>Go to next entry.</dd>
            <dt>prev</dt>           <dd>Back to previous entry.</dd>
            <dt>share</dt>          <dd>Shate current entry.</dd>
            <dt>plusone</dt>        <dd>+1</dd>
            <dt>comment</dt>        <dd>Comment to current entry.</dd>
            <dt>post</dt>           <dd>Post new entry.</dd>
            <dt>yank</dt>           <dd>Copy the permlink of current entry to clipboard.</dd>
            <dt>notification</dt>   <dd>Open notification box.</dd>
            <dt>cancel</dt>         <dd>Cancel current something.</dd>
            <dt>submit</dt>         <dd>Submit current editing post.</dd>
            <dt>unfold</dt>         <dd>Unfold something on current entry.</dd>
            <dt>menu</dt>           <dd>Open the menu of current entry.</dd>
          </dl>
        </p>
        <p>rc file example</p>
        <code>
let g:gplus_commando_map_next            = "j"
let g:gplus_commando_map_prev            = "k"
let g:gplus_commando_map_share           = "s"
let g:gplus_commando_map_plusone         = "p"
let g:gplus_commando_map_comment         = "c"
let g:gplus_commando_map_post            = "C"
let g:gplus_commando_map_yank            = "y"
let g:gplus_commando_map_notification    = "n"
let g:gplus_commando_map_submit          = "&lt;C-CR&gt;"
let g:gplus_commando_map_cancel          = "&lt;Esc&gt;"
let g:gplus_commando_map_unfold          = "e"
let g:gplus_commando_map_menu            = "m"
        </code>
      </description>
    </item>
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
      // get editor () Elements.postForm.querySelector('.editable').parentNode,
      // Elements.postForm.querySelector('.editable').parentNode
      get root () Elements.doc.querySelector('.n-Ob'),
      get open () Elements.doc.querySelector('.n-Nd'),
      get cancel () Elements.post.root.querySelector('div.om[id$=".c"]'),
      get submit () Elements.doc.querySelector('[role="button"].d-s-r.tk3N6e-e.tk3N6e-e-qc.n-Ja-xg')
    },
    get notification () Elements.doc.querySelector('#gbi1'),
    get viewer () MakeElement(Viewer, Elements.doc.querySelector('.' + Names.viewer)),
    get dialog () MakeElement(Dialog, Elements.doc.querySelector('.' + Names.dialog)),

    get focusedEditor () {
      function hasIFrame (elem) {
        let iframe = elem.querySelector('iframe');
        return iframe && iframe.contentWindow === win;
      }

      function get1 () {
        function button (editor, name)
          editor.parentNode.querySelector(String(<>[role="button"][id$=".{name}"]</>));

        const names = {submit: 'post', cancel: 'cancel'};

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
          let result = editor.querySelectorAll('td > [role="button"]')[index];
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
      get menuButton () root.querySelector('[role="button"].d-h.a-f-i-Ia-D-h.a-b-f-i-Ia-D-h'),
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

  // Post Command {{{

  (function () {
    const HOME_URL = 'https://plus.google.com/',
          POST_URL_BASE = 'https://plus.google.com/u/0/_/sharebox/post/';

    /**
     * ${RUNTIMEPATH}/info/{profileName}/googlePlus のデータ取得/保存
     * @type {Object}
     */
    let store = storage.newMap('googlePlus', {store: true});

    commands.addUserCommand(
      ['gp', 'googleplus'],
      'Post to Google+',
      function (args) {
        // ----------------------
        // -setup オプション
        // ----------------------
        if ('-setup' in args) {
          setupGooglePlus();
          return;
        }

        let message = args[0] || '',
            page = {},
            acls = null,
            useContents = false;

        // ----------------------
        // -list オプション
        // ----------------------
        if ('-l' in args) {
          let sel = content.getSelection();
          page.selection = sel.isCollapsed ? null : sel;
          page.title     = buffer.title;
          page.url       = buffer.URI;
          useContents = true;
        }
        // ----------------------
        // -imageURL オプション
        // ----------------------
        if ('-i' in args) {
          page.image = args['-i'];
          useContents = true;
        }

        // ----------------------
        // -to オプション
        // ----------------------
        if ('-t' in args && args['-t'].indexOf('anyone') == -1)
          acls = store.get('CIRCLES', []).filter(function(c) this.indexOf(c[0]) != -1, args['-t']);

        // 引数が何も無い場合は、Google+のページへ
        if (!message && !useContents) {
          let tab = getGooglePlusTab();
          if (tab) {
            gBrowser.mTabContainer.selectedItem = tab;
          } else {
            liberator.open(HOME_URL, {where: liberator.NEW_TAB});
          }
          return;
        }

        postGooglePlus(new PostData(message, useContents ? page : null, acls));
      },
      {
        literal: 0,
        options: [
          [['-l', '-link'], commands.OPTION_NOARG],
          [['-i', '-imageURL'], commands.OPTION_STRING],
          [['-t', '-to'], commands.OPTION_LIST, null,
            function (context, args) {
              let [, prefix] = context.filter.match(/^(.*,)[^,]*$/) || [];
              if (prefix)
                context.advance(prefix.length);

              return [['anyone', 'to public']].concat(Array.slice(store.get('CIRCLES', [])))
            }],
          [['-setup'], commands.OPTION_NOARG],
        ],
      },
      true
    );

    /**
     * Google+のページから必要データを保存する
     * @return {Boolean}
     */
    function setupGooglePlus () {
      function onSuccess () {
        liberator.echomsg('Initialized: googleplus');
      }

      function onFail () {
        liberator.echoerr('Faild: initialize googleplus');
      }

      function getFromWindow (win) {
        let data = win.OZ_initData;
        if (!data)
          return false;
        // XXX 全てのデータが揃っていないケースがあるようなので、検査する
        try {
          store.set('UID', data[2][0]);
          store.set('AT', data[1][15]);
          let circles = data[12][0];
          // CIRCLES[]: [[Name, Description, ID], ...]
          store.set('CIRCLES', circles.slice(0, circles.length / 2).map(function (c) [c[1][0], c[1][2], c[0][0]]));
          onSuccess();
          return true;
        } catch (e) {
          liberator.log(e);
          return false;
        }
      }

      // XXX ブラチラ大作戦
      function getFromMakedBrowser () {
        let browser = document.createElementNS(XUL, 'browser');
        browser.setAttribute('type', 'content');
        browser.setAttribute('src', 'https://plus.google.com/');
        document.getElementById('main-window').appendChild(browser);

        browser.addEventListener(
          'DOMContentLoaded',
          function (e) {
            if (e.target !== browser.contentWindow.document)
              return;
            browser.removeEventListener('DOMContentLoaded', arguments.callee, false);
            getFromWindow(browser.contentWindow.wrappedJSObject);
            browser.parentNode.removeChild(browser);
          },
          false
        );
      }

      let found = false;

      let tab = getGooglePlusTab();
      if (tab)
        found = getFromWindow(tab.linkedBrowser.contentWindow.wrappedJSObject);

      if (!found)
        getFromMakedBrowser();
    }

    /**
     * Google+のタブを取ってくる
     * @return {Element|null}
     */
    function getGooglePlusTab () {
      let tabs = gBrowser.tabs;
      for (let i = 0, tab; tab = tabs[i]; ++i) {
        if (tab.linkedBrowser.currentURI.spec.indexOf(HOME_URL) == 0) {
          return tab;
        }
      }
      return null;
    }

    /**
     * Post to Google+
     * @param {PostData} aPostData
     */
    function postGooglePlus (aPostData) {
      let data = aPostData.getPostData();
      let queries = [];
      for (let key in data)
        queries.push(key + '=' + encodeURIComponent(data[key]));

      let xhr = new XMLHttpRequest();
      xhr.mozBackgroundRequest = true;
      xhr.open('POST', aPostData.POST_URL, true);
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded;charset=UTF-8');
      xhr.setRequestHeader('Origin', HOME_URL);
      xhr.onreadystatechange = postGooglePlus.readyStateChange;
      xhr.send(queries.join('&'));
    }
    /**
     * Google+への送信状況を表示する
     * @param {Event} aEvent
     *                aEvent.target は XMLHttpRequestオブジェクト
     */
    postGooglePlus.readyStateChange = function GooglePlus_readyStateChange (aEvent) {
      let xhr = aEvent.target,
          msg = 'Google+: ',
          XBW = window.XULBrowserWindow;
      if (xhr.readyState == 4) {
        msg += (xhr.status == 200) ? 'Posted' : 'Post faild (' + xhr.statusText + ')';
        window.setTimeout(function(XBW, msg){
          if (XBW.jsDefaultStatus.indexOf('Google+:') == 0)
            XBW.setJSDefaultStatus('');
        }, 2000, XBW, msg);
      } else {
        msg += 'sending...';
      }
      liberator.log(msg, 0);
      XBW.setJSDefaultStatus(msg);
    };

    XPCOMUtils.defineLazyServiceGetter(this, 'MIME', '@mozilla.org/mime;1', 'nsIMIMEService');

    /**
     * Google+への送信データ生成
     * @Constructor
     * @param {String}    aMessage
     * @param {Object}    aPage             現ページのコンテンツ情報
     * @param {Selection} [aPage.selection] 選択オブジェクト
     * @param {String}    [apage.title]     現ページのタイトル
     * @param {String}    [aPage.url]       現ページURL
     * @param {String}    [aPage.image]     表示させたい画像URL
     * @param {Array}     aACLs             ACL[]
     */
    function PostData () {
      this.init.apply(this, arguments);
    }
    PostData.sequence = 0;
    PostData.prototype = {
      init: function PD_init (aMessage, aPage, aACLs) {
        this.message = aMessage;
        this.page = aPage || null;

        this.UID = store.get('UID', null);
        liberator.assert(this.UID, 'Google+ Error: UID is not set. Please login and `:googleplus -setup\'');
        this.AT = store.get('AT', null);
        liberator.assert(this.AT, 'Google+ Error: AT is not set. Please login and `:googleplus -setup\'');

        this.setACLEnties(aACLs);
      },
      get token () {
        let t = 'oz:' + this.UID + '.' + this.date.getTime().toString(16) + '.' + this.sequence.toString(16);
        Object.defineProperty(this, 'token', {value: t});
        return t;
      },
      get date () {
        let d = new Date;
        Object.defineProperty(this, 'date', {value: d});
        return d;
      },
      get sequence () {
        let s = PostData.sequence++;
        Object.defineProperty(this, 'sequence', {value: s});
        return s;
      },
      get reqid () {
        let r = this.date.getHours() + 3600 + this.date.getMinutes() + 60 + this.date.getSeconds() + this.sequence * 100000;
        Object.defineProperty(this, 'reqid', {value: r});
        return r;
      },
      get POST_URL () {
        let url = POST_URL_BASE + '?_reqid=' + this.reqid + '&rt=j';
        Object.defineProperty(this, 'POST_URL', {value: url});
        return url
      },
      aclEntries: [{
        scope: {
          scopeType: 'anyone',
          name: 'Anyone',
          id: 'anyone',
          me: true,
          requiresKey: false
        },
        role: 20,
      }, {
        scope: {
          scopeType: 'anyone',
          name: 'Anyone',
          id: 'anyone',
          me: true,
          requiresKey: false,
        },
        role: 60
      }],
      setACLEnties: function PD_setACLEnties (aACLs) {
        if (!aACLs || aACLs.length == 0)
          return this.aclEntries = Object.getPrototypeOf(this).aclEntries;

        let entries = [];
        for (let i = 0, len = aACLs.length; i < len; ++i) {
          let acl = aACLs[i];
          let scope = {
            scopeType: 'focusGroup',
            name: acl[0],
            id: this.UID + '.' + acl[2],
            me: false,
            requiresKey: false,
            groupType: 'p'
          };
          entries.push({scope: scope, role: 60});
          entries.push({scope: scope, role: 20});
        }
        return this.aclEntries = entries;
      },
      getPostData: function PD_getPostData () {
        let spar = [v for each(v in this.generateSpar())];
        return {
          spar: JSON.stringify(spar),
          at  : this.AT
        };
      },
      generateSpar: function PD_generateSpar() {
        for (let i = 0, len = 17; i < len; ++i) {
          switch (i) {
          case 0:
            yield this.message;
            break;
          case 1:
            yield this.token;
            break;
          case 6:
            if (this.page) {
              let link = [v for each(v in this.generateLink())],
                  photo = [];
              if (link.length > 0) {
                photo = [v for each(v in this.generateImage())];
                yield JSON.stringify([JSON.stringify(link), JSON.stringify(photo)]);
              } else {
                yield JSON.stringify([JSON.stringify(link)]);
              }
            } else {
              yield null;
            }

            break;
          case 8:
            yield JSON.stringify({aclEntries: this.aclEntries});
            break;
          case 9:
          case 11:
          case 12:
            yield true;
            break;
          case 15:
          case 16:
            yield false;
            break;
          case 10:
          case 14:
            yield [];
            break;
          default:
            yield null;
            break;
          }
        }
      },
      generateLink: function PD_generateLink () {
        if (!this.page.url || !this.page.title) {
          yield null;
          throw StopIteration;
        }
        let url = this.page.url;
        let youtubeReg = /http:\/\/(?:.*\.)?youtube.com\/watch\?v=([a-zA-Z0-9_-]+)[-_.!~*'()a-zA-Z0-9;\/?:@&=+\$,%#]*/;
        let m = url.match(youtubeReg);
        for (let i = 0, len = 48; i < len; ++i) {
          switch(i) {
          case 3:
            yield this.page.title;
            break;
          case 5:
            yield m ? [null, 'http://www.youtube.com/v/' + m[1] + '&hl=en&fs=1&autoplay=1', 385, 640] : null;
            break;
          case 9:
            yield m ? [[null, content.wrappedJSObject.yt.config_.VIDEO_USERNAME, 'uploader']] : [];
            break;
          case 21:
            if (this.page.selection) {
              let sels = [];
              let image = ('image' in this.page), imgElms = [];
              for (let k = 0, count = this.page.selection.rangeCount; k < count; ++k) {
                let r = this.page.selection.getRangeAt(k),
                    fragment = r.cloneContents();
                sels.push(node2txt(fragment, r.commonAncestorContainer.localName));
                if (!image) {
                  imgElms.push.apply(imgElms, Array.slice(fragment.querySelectorAll('img')));
                }
              }
              if (imgElms.length > 0)
                this.page.image = imgElms.reduce(function(p, c) (p.width * p.height < c.width * c.height) ? c : p).src;

              yield sels.join('<br/>(snip)<br/>');
            } else {
              yield this.page.title + '<br/>' + this.page.url;
            }
            break;
          case 24:
            yield m ?
                  [null, url, null, 'application/x-shockwave-flash', 'video'] :
                  [null, url, null, 'text/html', 'document'];
            break;
          case 41:
            let imageURL = m ?
                'http://ytimg.googleusercontent.com/vi/' + m[1] + '/default.jpg' :
                '//s2.googleusercontent.com/s2/favicons?domain=' + util.createURI(url).host;
            yield [[null, imageURL, null, null], [null, imageURL, null, null]];
            break;
          case 47:
            yield [[null, (m ? 'youtube' : ''), 'http://google.com/profiles/media/provider']];
            break;
          default:
            yield null;
          }
        }
      },
      generateImage: function PD_generateImage() {
        if (this.page.image) {
          let uri = util.createURI(this.page.image);
          let reg = /https?:\/\/[^\s]+\.(jpe?g|png|gif)/i;
          let mime = '';
          try {
            mime = MIME.getTypeFromURI(uri);
          } catch(e) {
            if (url.host == 'gazo.com') {
              mime = 'image/png';
            } else {
              yield null;
              throw StopIteration;
            }
          }
          for (let i = 0, len = 48; i < len; ++i) {
            switch(i) {
            case 5:
              yield [null, uri.spec];
              break;
            case 9:
              yield [];
              break;
            case 24:
              yield [null, uri.spec, null, mime, 'photo', null,null,null,null,null,null,null,null,null];
              break;
            case 41:
              yield [[null, uri.spec, null, null], [null, uri.spec, null, null]];
              break;
            case 47:
              yield [[null,'images','http://google.com/profiles/media/provider']];
              break;
            default:
              yield null;
            }
          }
        } else {
          yield null;
        }
      },
    };

    /**
     * ノードをHTMLテキストに変換
     * @param {Node} aNode
     * @param {String} [aParentTag] 親ノードのタグ名
     * @param {String} [aIndent]    インデント文字列
     * @param {Number} [aIndex]     ノード番号(ol>li 時のみ使用)
     * @return {String}
     */
    function node2txt (aNode, aParentTag, aIndent, aIndex) {
      let txt = '';
      switch (aNode.nodeType) {
      case Node.DOCUMENT_NODE: // 9
      case Node.DOCUMENT_FRAGMENT_NODE: // 11
        switch (aParentTag) {
        case 'ol':
        case 'ul':
        case 'dl':
          aIndent = '&nbsp;&nbsp;';
          break;
        default:
          aIndent = '';
        }
        txt = nodelist2txt(aNode.childNodes, aParentTag, aIndent).join('');
        break;
      case Node.TEXT_NODE: // 3
        txt = aNode.nodeValue;
        break;
      case Node.ELEMENT_NODE: // 1
        let localName = aNode.localName,
            children = aNode.childNodes;
        switch (localName) {
        case 'ul':
        case 'ol':
        case 'dl':
          txt = nodelist2txt(children, localName, aIndent + '&nbsp;&nbsp;').join('');
          break;
        case 'li':
          txt = aIndent + (aParentTag == 'ol' ? ('  ' + (aIndex+1)).slice(-2) + '. ' : ' * ').replace(' ', '&nbsp;', 'g') +
                nodelist2txt(children, 'li', aIndent).join('') +
                '<br/>\n';
          break;
        case 'dt':
          txt = aIndent + '<b>' + nodelist2txt(children, localName, aIndent) + '</b>:<br/>\n';
          break;
        case 'dd':
          txt = aIndent + '&nbsp;&nbsp;' + nodelist2txt(children, localName, aIndent) + '<br/>\n';
          break;
        case 'br':
          txt = '<br/>\n';
          break;
        case 'img':
          txt = '<img src=' + aNode.src.quote() + ' width="' + aNode.width + '" height="' + aNode.height + '"/>';
          break;
        case 'p':
          txt = nodelist2txt(children, 'p', '').join('') + '<br/>\n';
          break;
        case 'a':
          if (aNode.hasAttribute('href') && aNode.href.indexOf('http') == 0) {
            txt = '<a href=' + aNode.href.quote() + (aNode.title ? ' title=' + aNode.title.quote() : '') + '>' +
                  nodelist2txt(children, 'a', '').join('') +
                  '</a>';
            break;
          }
        default:
          txt = '<' + localName + '>' +
                nodelist2txt(children, localName, aIndent).join('') +
                '</' + localName + '>';
        }
        break;
      }
      return txt;
    }

    /**
     * NodeListの子をテキストにして配列で返す
     * @param {NodeList} aChildNoes
     * @param {String} aParentTag
     * @param {String} aIndent
     * @return {String[]}
     */
    function nodelist2txt (aChildNodes, aParentTag, aIndent) {
      let a = [], index = 0;
      for (let i = 0, len = aChildNodes.length, child; child = aChildNodes[i]; ++i){
        let txt = node2txt(child, aParentTag, aIndent, index);
        if (txt) {
          a.push(txt);
          ++index;
        }
      }
      return a;
    }

  })();

  // }}}

  // Export {{{

  __context__.command  = Commands;
  __context__.element  = Elements;

  // }}}

})();

// vim:sw=2 ts=2 et si fdm=marker:
