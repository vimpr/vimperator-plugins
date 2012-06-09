/* NEW BSD LICENSE {{{
Copyright (c) 2011-2012, anekos.
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
  <plugin name="AutoBookmark" version="1.3.1"
          href="http://vimpr.github.com/"
          summary="Auto update bookmark"
          lang="en-US"
          xmlns="http://vimperator.org/namespaces/liberator">
    <author email="anekos@snca.net">anekos</author>
    <license>New BSD License</license>
    <project name="Vimperator" minVersion="3.0"/>
    <p></p>
    <item>
      <tags>:autobookmark</tags>
      <spec>:autobookmark</spec>
      <description><p></p></description>
    </item>
  </plugin>
  <plugin name="AutoBookmark" version="1.3.1"
          href="http://vimpr.github.com/"
          summary="自動更新するブックマーク"
          lang="ja"
          xmlns="http://vimperator.org/namespaces/liberator">
    <author email="anekos@snca.net">anekos</author>
    <license>New BSD License</license>
    <project name="Vimperator" minVersion="3.0"/>
    <p></p>
    <item>
      <tags>:autobookmark</tags>
      <spec>:autobookmark</spec>
      <description><p></p></description>
    </item>
  </plugin>
</>;
// }}}

(function () {

  const bookmarks = storage.newMap('auto-bookmark-bookmarks', {store: true});
  const watching = {};
  let pendingJump = null;

  if (!__context__.Previous)
    __context__.Previous = {};

  function config (name, defaultValue) { // {{{
    let value = liberator.globalVariables['auto_bookmark_' + name];
    return (typeof value === 'undefined') ? defaultValue : value;
  } // }}}

  function highlightElement (target) { // {{{
    const Style = 'background-color: orange; color: black; border: dotted 2px blue;';

    let doc = target.ownerDocument;
    let span = doc.createElement('span');
    span.setAttribute('style', Style);
    let range = doc.createRange();
    range.selectNode(target);
    range.surroundContents(span);
  } // }}}

  function def (obj, names, defaultValue) { // {{{
    if (!obj)
      return defaultValue;
    if (typeof names === 'string')
      names = names.split('.');
    if (!names.length)
      return obj || defaultValue;
    return def(obj[names[0]], names.slice(1), defaultValue);
  } // }}}

  function getScroll (tab) { // {{{
    return {
      x: tab.linkedBrowser.contentWindow.wrappedJSObject.scrollX,
      y: tab.linkedBrowser.contentWindow.wrappedJSObject.scrollY
    };
  } // }}}

  function scrollTo (win, data) { // {{{
    win.scrollTo(data.scroll.x, data.scroll.y);
  } // }}}

  function fixTab (tab, data) { // {{{
    if (config('overwrite_target', true)) {
      let links = tab.linkedBrowser.contentDocument.querySelectorAll('a[href][target]');
      for (let [, link] in Iterator(Array.slice(links))) {
        link.removeAttribute('target');
      }
    }

    if (config('mark', true) && data.pages) {
      let links = tab.linkedBrowser.contentDocument.querySelectorAll('a[href]');
      for (let [, link] in Iterator(Array.slice(links))) {
        if (!data.pages.some(function (page) page.URL == link.href))
          continue;
        highlightElement(link);
      }
    }

    if (config('focus_next', true) && data.pages) {
      let links = tab.linkedBrowser.contentDocument.querySelectorAll('a[href]');
      let next = false;
      let last = data.pages[data.pages.length - 1].URL;
      for (let [, link] in Iterator(Array.slice(links))) {
        if (next) {
          link.focus();
          break;
        }
        next = last === link.href;
      }
    }

  } // }}}

  function initializeTab (tab, data) { // {{{
    fixTab(tab, data);

    if (tab.__anekos_auto_bookmark)
      return false;

    tab.__anekos_auto_bookmark = data.name;

    tab.linkedBrowser.addEventListener(
      'scroll',
      function () {
        data.scroll = getScroll(tab);
      },
      true
    );

    tab.linkedBrowser.addEventListener(
      'unload',
      function () {
        bookmarks.set(data.name, data);
        bookmarks.save();
      },
      true
    );

    bookmarks.set(data.name, data);
    updated();

    return true;
  } // }}}

  function setResumeListener (data) { // {{{
    let appcontent = document.getElementById('appcontent');

    let set =
      function (event) {
        let win = event.originalTarget.defaultView;
        if (win.location.href != data.current.URL)
          return;
        let tab = windowToTab(tab);
        if (!tab)
          return
        if (!AutoBookmark.resume(tab, data.name))
          return;
        liberator.echomsg('AutoBookmark: Continued - ' + data.name);
        appcontent.removeEventListener('DOMContentLoaded', set, false);
      };

    appcontent.addEventListener('DOMContentLoaded', set, false);
  } // }}}

  function updated () { // {{{
    bookmarks.save();
    watching = {};
    for (let [name, data] in Iterator(bookmarks)) {
      let url = data.current.URL;
      if (url)
        watching[url] = name;
    }
  } // }}}

  function namesCompleter (hidden) { // {{{
    return function (context, args) {
      function toTime (data) {
        if (data.last && data.last.date)
          return new Date(data.last.date).getTime();
        return 0;
      }

      let bs = [
        data
        for ([, data] in Iterator(bookmarks))
        if (!!data.hidden === !!hidden)
      ];

      context.title = ['Bookmark name'];
      if (args['-sort'] == 'title') {
      }else {
        // default date sorting
        context.compare = void 0;
        bs.sort(function (a, b) {
          let d = toTime(b) - toTime(a);
          return (d == 0 ? a.name.localeCompare(b.name) : d);
        });
      }

      context.completions = [
        [data.name, data.current.URL]
        for ([, data] in Iterator(bs))
      ];
    };
  } // }}}

  function windowToTab (win) { // {{{
    for (let [, tab] in Iterator(gBrowser.tabs)) {
      if (tab && tab.linkedBrowser.contentWindow === win)
        return tab;
    }
    return;
  } // }}}

  function checkTarget (win) { // {{{
    let url = win.location.href;
    if (!/^http/.test(url))
      return;

    let tab = windowToTab(win);
    if (!tab)
      return;

    let name = tab.__anekos_auto_bookmark || watching[url];
    let resume = false;

    if (!name)
      return;

    let data = bookmarks.get(name)
    if (!data)
      return;

    if (data.current.URL == url) {
      if (initializeTab(tab, data))
        liberator.echomsg('AutoBookmark: Continued - ' + data.name);
      return;
    }

    updateCurrent(data, url, buffer.title);

    bookmarks.set(name, data);
    updated();
    fixTab(tab, data);

    liberator.echomsg('AutoBookmark: CT Updated - ' + data.name + ' / ' + data.current.URL);
  } // }}}

  function processPendingJump (win) { // {{{
    if (!pendingJump)
      return;

    let URL = win && win.location.href;
    if (!URL)
      return;

    if (URL != pendingJump.current.URL)
      return;

    try {
      scrollTo(win, pendingJump);
    } catch (e) {
      window.alert(e);
    }

    pendingJump = null;
  } // }}}

  function updateCurrent (data, URL, title) { // {{{
    let now = new Date().toString();

    liberator.log('update-current: 1');
    data.current = {
      URL: URL,
      title: title,
      added: now
    };
    liberator.log('update-current: 2');
    data.last = {
      date: now
    };
    if (data.pages) {
      liberator.log('update-current: 3');
      if (data.pages.some(function (it) (it.URL == URL)))
        return;
      liberator.log('update-current: 4');
    } else {
      data.pages = [];
      liberator.log('update-current: 5');
    }
    liberator.log('update-current: 6');
    data.pages.push(data.current);
  } // }}}

  // appcontent on DOMContentLoaded {{{
  events.addSessionListener(
    document.getElementById("appcontent"),
    'DOMContentLoaded',
    function (event) {
      let win = event.originalTarget.defaultView;
      if (win) {
        checkTarget(win);
        processPendingJump(win);
      }
    },
    true
  ); // }}}

  // {{{
  let commandOptions = [
    [ ['-sort'], commands.OPTION_STRING, null,
      [ ['last', 'Last updated date (default)'], ['name', 'By name'] ] ]
  ];

  commands.addUserCommand(
    'autobookmark',
    'Auto bookmarking',
    function () {
      liberator.echo(
        <dl>{
          template.map(
            bookmarks,
            function ([name, data]) {
              return <>
                <dt style="font-weight: bold">{name}</dt>
                <dd>{data.current.title} <a href={data.current.URL}> {data.current.URL} </a> ({def(data, 'scroll.x', '?')}, {def(data, 'scroll.y', '?')}) ({def(data, 'pages.length', '?')})</dd>
              </>;
            }
          )
        }</dl>
      );
    },
    {
      subCommands: [
        new Command(
          ['s[tart]'],
          'Start bookmarking',
          function (args) {
            let error = {};
            let name = args.literalArg;
            let data = AutoBookmark.start(name, null, null, null, error);
            if (data) {
              liberator.echo('Started: ' + data.name);
            } else {
              liberator.echoerr(error.data);
            }
          },
          {
            literal: 0,
            completer: function (context, args) {
              context.title = ['Bookmark name'];
              context.completions = [
                [buffer.title, 'Buffer Title']
              ]
            }
          }
        ),
        new Command(
          ['r[emove]'],
          'Remove from memory',
          function (args) {
            let name = args.literalArg;
            if (AutoBookmark.remove(name)) {
              liberator.echo('Removed: ' + name);
            } else {
              liberator.echoerr('Bookmark not found: ' + name);
            }
          },
          {
            literal: 0,
            completer: namesCompleter(),
            options: commandOptions
          }
        ),
        new Command(
          ['c[ontinue]'],
          'Continue',
          function (args) {
            let name = args.literalArg;
            if (AutoBookmark.open(name)) {
            } else {
              liberator.echoerr('Bookmark not found: ' + name);
            }
          },
          {
            literal: 0,
            completer: namesCompleter(),
            options: commandOptions
          }
        ),
        new Command(
          ['u[pdate]'],
          'Update bookmark',
          function (args) {
            let name = args.literalArg;
            if (AutoBookmark.update(gBrowser.mCurrentTab, name)) {
              liberator.echomsg('Updated: ' + name);
            } else {
              liberator.echoerr('Bookmark not found: ' + name);
            }
          },
          {
            literal: 0,
            completer: namesCompleter(),
            options: commandOptions
          }
        ),
        new Command(
          ['d[etail]'],
          'Display bookmark\' detail',
          function (args) {
            let name = args.literalArg;
            let data = bookmarks.get(name);
            if (data) {
              liberator.echo(<>
                <dl>
                  <dt>Name</dt>
                  <dd>{name}</dd>
                  <dt>Start URL</dt>
                  <dd><a href={data.start.URL}>{data.start.URL}</a></dd>
                  <dt>Current Title</dt>
                  <dd>{data.current.Title}</dd>
                  <dt>Current URL</dt>
                  <dd><a href={data.current.URL}>{data.current.URL}</a></dd>
                  <dt>Current Position</dt>
                  <dd>{def(data, 'scroll.x', '?')}, {def(data, 'scroll.y', '?')}</dd>
                  <dt>Pages</dt>
                  <dd>{
                    template.map(data.pages, function (it) (<li>{it.URL}</li>))
                  }</dd>
                </dl>
              </>);
            } else {
              liberator.echoerr('Bookmark not found: ' + name);
            }
          },
          {
            literal: 0,
            completer: namesCompleter(),
            options: commandOptions
          }
        ),
        new Command(
          ['e[dit]'],
          'Edit bookmark',
          function (args) {
            let name = args.literalArg;
            let data = bookmarks.get(name);
            if (!data)
              return liberator.echoerr('Bookmark not found: ' + name);
            io.withTempFiles(
              function (file) {
                file.write(JSON.stringify(data, null, 2));
                editor.editFileExternally(file.path);
                let newData = JSON.parse(file.read());
                bookmarks.set(name, newData);
                bookmarks.save();
                updated();
              }
            );
          },
          {
            literal: 0,
            completer: namesCompleter(),
            options: commandOptions
          }
        ),
        new Command(
          ['sh[ow]'],
          'Show hidden bookmark',
          function (args) {
            let name = args.literalArg;
            let data = AutoBookmark.show(name);
            if (data) {
              liberator.echo('Hide: ' + data.name);
            } else {
              liberator.echoerr('Bookmark not found: ' + name);
            }
          },
          {
            literal: 0,
            completer: namesCompleter(true),
            options: commandOptions
          }
        ),
        new Command(
          ['h[ide]'],
          'Edit bookmark',
          function (args) {
            AutoBookmark.hide(args.literalArg);
          },
          {
            literal: 0,
            completer: namesCompleter(false),
            options: commandOptions
          }
        )
      ]
    },
    true
  ); // }}}

  // API - AutoBookmark {{{
  const AutoBookmark = {
    start: function (name, url, title, tab, error) {
      if (!name)
        name = buffer.title;
      if (!url)
        url = buffer.URL;
      if (!tab)
        tab = gBrowser.mCurrentTab;
      if (!title)
        title = name;

      if (bookmarks.get(name)) {
        error.data = String(<>"{name}" already exists</>);
        return false;
      }

      let data = {
        name: name,
        start: {URL: url},
      };
      updateCurrent(data, url, title);

      if (!initializeTab(tab, data)) {
        error.data = String(<>This tab is already started</>);
        return false;
      }

      return data;
    },

    remove: function (name) {
      function canceled () {
        liberator.echoerr('Canceled');
      }

      if (!bookmarks.get(name))
        return false;
      commandline.input(
        'Really? [yes/No]',
        function (args) {
          if (args != 'yes')
            return canceled();

          bookmarks.remove(name);
          for (let [, tab] in Iterator(gBrowser.tabs)) {
            if (tab && tab.__anekos_auto_bookmark == name)
              delete tab.__anekos_auto_bookmark;
          }
          updated();

          liberator.echo('Removed: ' + name);
        },
        {
          onCancel: canceled
        }
      )
      return true;
    },

    open: function (name) {
      let data = bookmarks.get(name);
      if (!data)
        return;
      liberator.open(data.current.URL, liberator.NEW_TAB);
      if (data.scroll)
        pendingJump = data;
      setResumeListener(data);
      return data;
    },

    resume: function (tab, name) {
      let data = bookmarks.get(name);
      if (!data)
        return;
      return initializeTab(tab, data);
    },

    update: function (tab, name) {
      let data = bookmarks.get(name);
      if (!data)
        return;
      let b = gBrowser.mCurrentTab.linkedBrowser;
      updateCurrent(
        data,
        b.contentWindow.location.href,
        def(b, 'contentDocument.title', 'No Title')
      );
      updated();
      return initializeTab(tab, data);
    },

    hide: function (name) {
      let data = bookmarks.get(name);
      if (!data)
        return false;
      data.hidden = true;
      bookmarks.save();
      updated();
      return true;
    },

    show: function (name) {
      let data = bookmarks.get(name);
      if (!data)
        return false;
      data.hidden = false;
      bookmarks.save();
      updated();
      return true;
    }
  }; // }}}

  updated();

})();

// vim:sw=2 ts=2 et si fdm=marker:
