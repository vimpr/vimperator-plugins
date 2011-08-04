/* NEW BSD LICENSE {{{
Copyright (c) 2011, anekos.
Copyright (c) 2011, teramako.
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
  <plugin name="GooglePlusCommando" version="2.1.2"
          href="http://github.com/vimpr/vimperator-plugins/blob/master/google-plus-commando.js"
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
            <dt>mute</dt>           <dd>Mute current entry.</dd>
            <dt>open</dt>           <dd>Open something on current entry.</dd>
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

  function IA (list)
    Iterator(A(list));

  function click (elem) {
    if (!elem)
      throw GPCError('elem is undefined');
    buffer.followLink(elem, liberator.CURRENT_TAB);
  }

  function isDisplayed (elem)
    (elem && !/none/.test(util.computedStyle(elem).display));

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

  const [S, X] = (function () {

    let selector = {
      role: role,
      typePlusone: '[g\\:type="plusone"]',
      editable: '.editable',

      currentEntry: {
        root: '.tf.Ek.Lj',
        unfold: [
          role('button', '.d-k.Dk'),  // 発言の省略 (以前)
          role('button', '.d-k.Ck'),  // 発言の省略 (以降)
          role('button', '.d-k.Wk')   // 投稿の省略 ("このコメントを展開 »")
        ],
        menu: {
          mute: '.a-Y-k.a-Y-k-ye.d-V.Ki.Sl'
        },
        menuButton: role('button', '.d-k.Jt.Oi'),
        cancel: role('button', '[id$=".cancel"]'),
        submit: role('button', '[id$=".post"]'),
      },
      post: {
        root: '.h.h-nf',              // this.className += ' h-mb'
        open: '.h-je',                // 最近の出来事を共有しましょう... */
        cancel: 'div.fm[id$=".c"]',   // :6w.c
      },
      notification: '#gbi1',
      viewer: {
        root: '.Pr',
        prev: '.Pr.kS.fW',
        next: '.Pr.kS.gW'
      },
      dialog: {
        root: '.va-Q',
      },
      frames: {
        notifications: {
          root: 'iframe[src*="/_/notifications/"]',
          summary: {
            root: '#summary-view',
            prev: '.a-c-A-lb-bh',         // @title = 前のお知らせ
            next: '.a-c-A-lb-jg',         // @title = 次のお知らせ
            back: '.a-c-A-lb-Yo.d-k.TA'   // @title = お知らせに戻る
          },
          entry: {
            entries: 'div[id^=":2."]',   // :2.diz13l....
            comment: role('button', '.Py.Uk'),
            mute: role('button', '.a-c-A-lb-Jg.d-k.Jm.Tl')
          },
        }
      },
      closeButton: '.rl.hW'  // Viewer 等
    };

    let xpath = {
      hints: [
        'span[@role="button"]',
        'div[@role="button"]',
        'div[@data-content-type]',
        'img[contains(@class,"O-g-Sd-la")]',  // /photos の写真
        //FIXME 'div[contains(@class,"a-z-nb-A")]'
      ]
    };

    return [selector, xpath];

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
        get open () Elements.doc.querySelector(S.post.open),
      },
      get notification () Elements.doc.querySelector(S.notification),
      get viewer () MakeElement(Viewer, Elements.doc.querySelector(S.viewer.root)),
      get dialog () MakeElement(Dialog, Elements.doc.querySelector(S.dialog.root)),

      frames: {
        get notifications () MakeElement(Notifications, Elements.doc.querySelector(S.frames.notifications.root))
      },

      get focusedEditor () {
        function hasIFrame (elem) {
          let iframe = elem.querySelector('iframe');
          return iframe && iframe.contentWindow === win;
        }

        // エントリにコメント
        function get1 (root) {
          function button (editor, name)
            editor.parentNode.querySelector(S.role('button', <>[id$=".{name}"]</>));

          if (!root)
            return;

          let editors = A(root.querySelectorAll('div[id$=".editor"]')).filter(hasIFrame);
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

        // 新しく投稿
        function get2 () {
          function button (editor, index) {
            let result = editor.querySelectorAll('td > ' + S.role('button'))[index];
            if (result)
              return result;
            if (index === 1)
              return editor.querySelector(S.post.cancel);
          }

          const indexes = {submit: 0, cancel: 1};

          let editors = A(doc.querySelectorAll(S.post.root)).filter(hasIFrame);
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

        return get1(doc) || get2() || get1(Elements.frames.notifications.root.contentDocument);
      },

      /**
       * ノードをHTMLテキストに変換
       * @param {Node} aNode
       * @param {String} [aParentTag] 親ノードのタグ名
       * @param {String} [aIndent]    インデント文字列
       * @param {Number} [aIndex]     ノード番号(ol>li 時のみ使用)
       * @return {String}
       */
      node2txt: function (aNode, aParentTag, aIndent, aIndex) {
        var txt = "";
        switch (aNode.nodeType) {
        case Node.DOCUMENT_NODE: // 9
        case Node.DOCUMENT_FRAGMENT_NODE: // 11
          switch (aParentTag) {
          case "ol":
          case "ul":
          case "dl":
            aIndent = "&nbsp;&nbsp;";
            break;
          default:
            aIndent = "";
          }
          txt = nodelist2txt(aNode.childNodes, aParentTag, aIndent).join("");
          break;
        case Node.TEXT_NODE: // 3
          txt = aNode.nodeValue.replace(/\s+/g, " ");
          break;
        case Node.ELEMENT_NODE: // 1
          let localName = aNode.localName,
              children = aNode.childNodes;
          switch (localName) {
          case "ul":
          case "ol":
          case "dl":
            txt = "<br/>\n" + nodelist2txt(children, localName, aIndent + "&nbsp;&nbsp;").join("") + "<br/>\n";
            break;
          case "li":
            txt = aIndent + (aParentTag == "ol" ? ("  " + (aIndex+1)).slice(-2) + ". " : " * ").replace(" ", "&nbsp;", "g") +
                  nodelist2txt(children, "li", aIndent).join("") +
                  "<br/>\n";
            break;
          case "dt":
            txt = aIndent + "<b>" + nodelist2txt(children, localName, aIndent) + "</b>:<br/>\n";
            break;
          case "dd":
            txt = aIndent + "&nbsp;&nbsp;" + nodelist2txt(children, localName, aIndent) + "<br/>\n";
            break;
          case "br":
            txt = "<br/>\n";
            break;
          case "img":
            txt = "<img src=" + aNode.src.quote() + " width=\"" + aNode.width + "\" height=\"" + aNode.height + "\"/>";
            break;
          case "p":
            txt = nodelist2txt(children, "p", "").join("") + "<br/>\n";
            break;
          case "a":
            if (aNode.hasAttribute("href") && aNode.href.indexOf("http") == 0) {
              txt = "<a href=" + aNode.href.quote() + (aNode.title ? " title=" + aNode.title.quote() : "") + ">" +
                    nodelist2txt(children, "a", "").join("") +
                    "</a>";
              break;
            }
          default:
            txt = '<' + localName + '>' +
                  nodelist2txt(children, localName, aIndent).join("") +
                  '</' + localName + '>';
          }
          break;
        }
        return txt;
      },
    };

    function MakeElement (constructor, root) {
      if (root && isDisplayed(root))
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
        get unfold () root.querySelector(S.currentEntry.unfold.join(', ')),
        get buttons () A(self.plusone.parentNode.querySelectorAll(S.role('button'))),
        get commentButton () self.buttons[0],
        get commentEditor () let (e = root.querySelector(S.editable)) (e && e.parentNode),
        get comment() (self.commentEditor || self.commentButton),
        get plusone () root.querySelector(S.typePlusone),
        get share () self.buttons[1],
        menu: {
          get root () root.querySelector(S.role('menu')),
          get items () A(self.menu.root.querySelectorAll(S.role('menuitem'))),
          get mute () {
            // XXX 誤爆いやなので、チェックを入れる
            let item1 = self.menu.items.slice(-2)[0];
            let item2 = self.menu.root.querySelector(S.role('menuitem', S.currentEntry.menu.mute));
            if (item1 === item2)
              return item1;
          }
        },
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
        get visible () {
          let h = parseInt(root.style.height, 10) > 0;
          if (!h)
            return false;
          let nwc =  plugins.googlePlusCommando.element.frames.notifications.root.contentDocument.querySelector('#nw-content');
          return parseInt(util.computedStyle(nwc).height, 10) > 100;
        },
        summary: {
          get root () root.contentDocument.querySelector(S.frames.notifications.summary.root),
          get visible () isDisplayed(self.summary.root),
        },
        entry: {
          get root () self.summary.root.nextSibling,
          get entries () A(root.contentDocument.querySelectorAll(S.frames.notifications.entry.entries)),
          get current () self.entry.entries.filter(isDisplayed)[0],
          get visible () isDisplayed(self.entry.root),
          get prev () root.contentDocument.querySelector(S.frames.notifications.summary.prev),
          get next () root.contentDocument.querySelector(S.frames.notifications.summary.next),
          get back () root.contentDocument.querySelector(S.frames.notifications.summary.back),
          get comment () self.entry.current.querySelector(S.frames.notifications.entry.comment),
          get mute () self.entry.current.querySelector(S.frames.notifications.entry.mute),
          get unfold () root.contentDocument.querySelector(S.currentEntry.unfold.join(', '))
        }
      };
      return self;
    }

    /**
     * NodeListの子をテキストにして配列で返す
     * @param {NodeList} aChildNoes
     * @param {String} aParentTag
     * @param {String} aIndent
     * @return {String[]}
     */
    function nodelist2txt (aChildNodes, aParentTag, aIndent) {
      var a = [], index = 0;
      for (let i = 0, len = aChildNodes.length, child; child = aChildNodes[i]; ++i) {
        let txt = Elements.node2txt(child, aParentTag, aIndent, index);
        if (txt) {
          a.push(txt);
          ++index;
        }
      }
      return a;
    }

    return Elements;
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
    moveEntry: function (next) {
      let [arrow, vim, dir] = next ? ['<Down>', 'j', 'next'] : ['<Up>', 'k', 'prev'];

      if (Elements.viewer)
        return click(Elements.viewer[dir]);

      let notifications = Elements.frames.notifications;

      if (notifications && notifications.visible && notifications.entry.visible)
        return click(Elements.frames.notifications.entry[dir]);

      let arrowTarget = (function () {
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
    next: withCount(function () Commands.moveEntry(true)),
    prev: withCount(function () Commands.moveEntry(false)),
    comment: function () {
      let notifications = Elements.frames.notifications;
      if (notifications && notifications.visible && notifications.entry.visible) {
        let e = notifications.entry.current;
        e.scrollTop = e.scrollHeight;
        click(notifications.entry.comment);
      } else {
        let entry = Elements.currentEntry;
        click(entry.comment);
      }
      PostHelp.show();
    },
    plusone: function () click(Elements.currentEntry.plusone),
    share: function () click(Elements.currentEntry.share),
    post: function () {
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
      let notifications = Elements.frames.notifications;
      if (notifications && notifications.visible && notifications.entry.visible)
        return click(notifications.entry.back);

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
      let notifications = Elements.frames.notifications;
      if (notifications && notifications.visible && notifications.entry.visible)
        return click(notifications.entry.unfold);

      click(Elements.currentEntry.unfold);
    },
    menu: function () {
      click(Elements.currentEntry.menuButton);
    },
    mute: function () {
      let notifications = Elements.frames.notifications;
      if (notifications && notifications.visible && notifications.entry.visible)
        return click(notifications.entry.mute);
      click(Elements.currentEntry.menu.mute);
    },
    open: function () {
      function clicks (links) {
        if (links.length === 1)
          return click(links[0]);

        let t = {};
        A(links).forEach(function (link) (t[link.textContent] = link));

        commandline.input(
          'Selector a link',
          function (url) {
            let link = t[url];
            if (link) {
              click(link);
            } else {
              liberator.open(url, liberator.NEW_TAB);
            }
          },
          {
            completer: function (context) {
              context.completions = [
                [link.href, link.textContent]
                for ([, link] in IA(links))
              ];
            }
          }
        );
      }

      let ce = Elements.currentEntry;
      if (!ce)
        return;

      let dct = ce.root.querySelector('div[data-content-type]');
      if (dct) {
        if (!/application\/x-shockwave-flash/.test(dct.getAttribute('data-content-type')))
          return click(dct);

        let links = dct.parentNode.querySelectorAll('a');
          return clicks(links);
      }

      let links = ce.root.querySelectorAll('a.ot-anchor');
      clicks(links);
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
          } catch (e) {
            liberator.log(e);
            throw e;
          }
        },
        {
          count: func.length === 1,
          matchingUrls: MatchingUrls
        }
      );
    }

    'comment plusone share next prev post yank notification cancel unfold menu mute open'.split(/\s/).forEach(defineMapping.bind(null, modes.NORMAL));
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

          const roots = [
            {get visible () !!Elements.viewer, selector: ('div[contains(@class, "' + s2x(S.viewer.root) + '")]')},
            {get visible () !!Elements.dialog, selector: ('div[contains(@class, "' + s2x(S.dialog.root) + '")]')},
            {get visible () !!Elements.frames.notifications.visible, selector: 'id("nw-content")'}
          ];

          let xpath = options['hinttags'].split(/\s*\|\s*/).map(removeRoot).concat(X.hints);

          for (let [, root] in Iterator(roots)) {
            if (!root.visible)
              continue;
            xpath.push(String(<>div[contains(@class, "{s2x(S.closeButton)}")]</>));
            xpath = xpath.map(function (it) (root.selector + '//' + it));
            break;
          }

          styles.addSheet(false, HintStyleName, 'plus\\.google\\.com', '.a-b-f-W-Tj.a-f-W-Tj { display: inline  !important }');

          return xpath.map(function (it) (/^id\(/.test(it) ? it : '//' + it)).join(' | ');
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

    hints.addMode(
      'G',
      'Google+ Post',
      function action (elm) {
        var src = elm.src;
        commandline.open('', 'googleplus -i ' + src + ' ', modes.EX);
      },
      function getPath () util.makeXPath(['img'])
    );

  })();

  // }}}

  // Define Google+ post command {{{

  (function () {

    let HOME_URL = 'https://plus.google.com/',
        POST_URL_BASE = 'https://plus.google.com/u/0/_/sharebox/post/';

    /**
     * ${RUNTIMEPATH}/info/{profileName}/googlePlus のデータ取得/保存
     * @type {Object}
     */
    let store = storage.newMap('googlePlus', {store: true});

    commands.addUserCommand(
      ['gp', 'googleplus'],
      'Google+',
      function (args) {
        // ----------------------
        // -setup オプション
        // ----------------------
        if ('-setup' in args) {
          setupGooglePlus();
          return;
        }

        let message = args[0] || '',
            acls = null;

        // ----------------------
        // -link オプション
        // ----------------------
        let win = null;
        if ('-link' in args) {
          win = content;
        }
        // ----------------------
        // -imageURL オプション
        // ----------------------
        let image = null;
        if ('-imageURL' in args) {
          image = args['-imageURL'];
        }

        // ----------------------
        // -to オプション
        // ----------------------
        if ('-to' in args && args['-to'].indexOf('anyone') == -1)
          acls = [acl for ([,acl] in Iterator(store.get('CIRCLES', []))) if (args['-to'].indexOf(acl[0]) != -1)];

        // 引数が何も無い場合は、Google+のページへ
        if (!message && !win && !image) {
          let tab = getGooglePlusTab();
          if (tab)
            gBrowser.mTabContainer.selectedItem = tab;
          else
            liberator.open(HOME_URL, {where: liberator.NEW_TAB});

          return;
        }
        window.setTimeout(function () {
          let pd = new PostData(message, win, image, acls);
          postGooglePlus(pd);
        }, 0);
      }, {
        literal: 0,
        options: [
          [['-link', '-l'], commands.OPTION_NOARG],
          [['-imageURL', '-i'], commands.OPTION_STRING],
          [['-to', '-t'], commands.OPTION_LIST, null,
            function (context, args) {
              let [, prefix] = context.filter.match(/^(.*,)[^,]*$/) || [];
              if (prefix)
                context.advance(prefix.length);

              return [['anyone', 'to public']].concat([v for ([, v] in Iterator(store.get('CIRCLES', [])))]);
            }],
          [['-setup'], commands.OPTION_NOARG],
        ],
    },true);

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
          store.set('CIRCLES', [
            ['circles', 'Everyone in your circles', '1c'],
            ['excircles', 'Everyone in your circles, plus all the people in their circles', '1f'],
          ].concat([[c[1][0],c[1][2],c[0][0]] for each(c in circles.slice(0, circles.length / 2))]));
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
        window.setTimeout(function (XBW, msg) {
          if (XBW.jsDefaultStatus.indexOf('Google+:') == 0)
            XBW.setJSDefaultStatus('');
        }, 2000, XBW, msg);
      } else {
        msg += 'sending...';
      }
      liberator.log(msg, 0);
      XBW.setJSDefaultStatus(msg);
    };

    XPCOMUtils.defineLazyServiceGetter(__context__, 'MIME', '@mozilla.org/mime;1', 'nsIMIMEService');

    /**
     * Google+への送信データ生成
     * @Constructor
     * @param {String}    aMessage
     * @param {Window}    [aWindow]   現ページのWindowオブジェクト
     * @param {String}    [aImageURL] 表示させたい画像URL
     * @param {Array}     [aACLs]     ACL[]
     */
    function PostData () { this.init.apply(this, arguments); }
    PostData.sequence = 0;
    PostData.prototype = {
      init: function PD_init (aMessage, aWindow, aImageURL, aACLs) {
        this.message = aMessage;
        this.window = aWindow;
        this.imageURL = aImageURL;

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
            if (!this.window && !this.imageURL) {
              yield null;
            } else {
              let media = LinkDetector.get(this.window, this.imageURL);
              let data = [JSON.stringify(media.generateData())];
              if (media.hasPhoto) {
                data.push(JSON.stringify(media.generateData(true)));
              }
              yield JSON.stringify(data);
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
    };

  })();

  const LinkDetector = (function () {
    let commonProto = {
      init: function (win, imageURL) {
        this.window = win;
        this.imageURL = imageURL;
        if (imageURL) {
          if (win)
            this.hasPhoto = true;

          this.setupImage();
        }
      },
      type: {
        TITLE: 3,
        MEDIA_LINK: 5,
        UPLOADER: 9,
        TEXT: 21,
        TYPE: 24,
        IMAGE: 41,
        PROVIDER: 47,
      },
      generateData: function (isPhoto) {
        let data = new Array(48);
        data[this.type.TITLE] = this.getTitle(isPhoto);
        data[this.type.MEDIA_LINK] = this.getMediaLink(isPhoto);
        data[this.type.UPLOADER] = this.getUploader(isPhoto);
        data[this.type.TEXT] = this.getContentsText(isPhoto);
        data[this.type.TYPE] = this.getMediaType(isPhoto);
        data[this.type.IMAGE] = this.getMediaImage(isPhoto);
        data[this.type.PROVIDER] = this.getProvider(isPhoto);
        return data;
      },
      hasPhoto: false,
      imageElement: null,
      setupImage: function () {
        let imgs = content.document.images;
        for (let i = 0, len = imgs.length, img; img = imgs[i]; ++i) {
          if (img.src == this.imageURL) {
            this.imageElement = img;
          }
        }
      },
      getMimeType: function (uri, defaultType) {
        if (!(uri instanceof Ci.nsIURI))
          uri = util.createURI(uri);

        try {
          return MIME.getTypeFromURI(uri);
        } catch (e) {}
        return defaultType;
      },
      getTitle: function (isPhoto) {
        return (isPhoto || !this.window) ? null : this.window.document.title;
      },
      getContentsText: function (isPhoto) {
        if (!this.window || isPhoto)
          return null;

        let sel = this.window.getSelection();
        if (sel.isCollapsed)
          return '';

        let sels = [];
        for (let i = 0, count = sel.rangeCount; i < count; ++i) {
          let r = sel.getRangeAt(i),
              fragment = r.cloneContents();
          sels.push(Elements.node2txt(fragment, r.commonAncestorContainer.localName));
        }
        return sels.join('<br/>(snip)<br/>');
      },
      getUploader: function () [],
      getMediaLink: function (isPhoto) {
        if (this.window && !isPhoto)
          return [null, this.window.location.href];

        let data = [null, this.imageURL];
        if (this.imageElement)
          data.push(this.imageElement.height, this.imageElement.width);

        return data;
      },
      getMediaType: function (isPhoto) {
        if (isPhoto) {
          let type = this.getMimeType(this.imageURL, 'image/jpeg');
          let data = [null, this.imageURL, null, type, 'photo', null,null,null,null,null,null,null];
          if (this.imageElement)
            data.push(this.imageElement.width, this.imageElement.height);
          else
            data.push(null,null);

          return data;
        }
        if (this.window && !isPhoto) {
          type = this.window.document.contentType;
          switch (type.split('/')[0]) {
          case 'image':
            return [null, this.window.location.href, null, type, 'image'];
          case 'text':
          default:
            return [null, this.window.location.href, null, 'text/html', 'document'];
          }
        } else if (this.imageURL) {
          type = this.getMimeType(this.imageURL, 'image/jpeg');
          return [null, this.imageURL, null, type, 'image'];
        }
        return null
      },
      getMediaImage: function (isPhoto) {
        let url;
        if (this.window && !isPhoto) {
          let type = this.window.document.contentType.split('/');
          if (type[0] != 'image') {
            let host = this.window.location.host;
            url = '//s2.googleusercontent.com/s2/favicons?domain=' + host;
            return [ [null, url, null, null], [null, url, null, null] ];
          } else {
            url = this.window.location.href;
            return [ [null, url, null, null], [null, url, null, null] ];
          }
        }

        let data = [null, this.imageURL];
        let w = null, h = null;
        if (this.imageElement) {
          w = this.imageElement.width, h = this.imageElement.height;
          w = w / h * 120;
          h = 120;
        }
        data.push(h, w);
        return [ data, data ];
      },
      getProvider: function (isPhoto) {
        return [ [null, (isPhoto ? 'images' : ''), 'http://google.com/profiles/media/provider'] ];
      }
    };
    let classes = {}, checker = {};
    function MediaLink() { this.init.apply(this, arguments); };
    MediaLink.prototype = commonProto;

    let self = {
      addType: function (name, checkFunc, proto) {
        checker[name] = checkFunc;
        let func = function () { this.init.apply(this, arguments); };
        proto.__super__ = proto.__proto__ = commonProto;
        func.prototype = proto;
        classes[name] = func;
      },
      get: function (aWindow, aImageURL) {
        for (let [key, checkFunc] in Iterator(checker)) {
          if (checkFunc(aWindow, aImageURL)) {
            return new classes[key](aWindow, aImageURL);
          }
        }
        return new MediaLink(aWindow, aImageURL);
      }
    };

    (function () {
      // -------------------------------------------------------------------------
      // YouTube
      // ----------------------------------------------------------------------{{{
      self.addType('youtube',
        function (win) {
          if (!win) return false;

          return /^https?:\/\/(?:.*\.)?youtube.com\/watch/.test(win.location.href);
        }, {
          get VIDEO_ID () {
            let id = this.window.wrappedJSObject.yt.config_.VIDEO_ID;
            Object.defineProperty(this, 'VIDEO_ID', {value: id});
            return id;
          },
          getMediaLink: function () [null, 'http://www.youtube.com/v/' + this.VIDEO_ID + '&hl=en&fs=1&autoplay=1'],
          getContentsText: function () this.window.document.querySelector('meta[name=description]').content,
          getMediaType: function () [null, this.window.location.href, null, 'application/x-shockwave-flash', 'video'],
          getMediaImage: function () {
            let url = 'https://ytimg.googleusercontent.com/vi/' + this.VIDEO_ID + '/hqdefault.jpg';
            return [ [null, url, 120, 160], [null, url, 120, 160] ];
          },
          getProvider: function () [ [null, 'youtube', 'http://google.com/profiles/media/provider'] ],
        }); // }}}
      // -------------------------------------------------------------------------
      // Gyazo
      // ----------------------------------------------------------------------{{{
      self.addType('gyazo',
        function (win, image) {
          let reg = /^http:\/\/gyazo\.com\/\w+(\.png)?/;
          return reg.test(image);
        }, {
          init: function (win, imageURL) {
            this.window = win;
            if (imageURL.lastIndexOf('.png') != imageURL.length - 4)
              imageURL += '.png';

            this.imageURL = imageURL;
            this.hasPhoto = true;
          },
        });
      // }}}
    })();
    return self;
  })();

  // }}}

  // Export {{{

  __context__.command  = Commands;
  __context__.element  = Elements;
  __context__.selector  = S;
  __context__.linkDetector = LinkDetector;

  // }}}

})();

// vim:sw=2 ts=2 et si fdm=marker:
