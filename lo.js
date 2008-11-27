// ==VimperatorPlugin==
// @name           Link Opener
// @description    Open filtered link(s).
// @description-ja リンクをフィルタリングして開く
// @license        Creative Commons Attribution-Share Alike 3.0 Unported
// @version        1.3
// @minVersion     2.0pre
// @maxVersion     2.0pre
// ==/VimperatorPlugin==
//
// Usage:
//    :fo[pen][!] <REGEXP> [-i <INTERVAL_SEC>] [-w <WHERE>]
//      Open filtered links by regexp.
//      When used "!", open links in foreground.
//
//    :lo[pen][!] URI [-w <WHERE>]
//      Open URI
//
// Usage-ja:
//    :fo[pen][!] <ミゲ文字列> [-i <INTERVAL_SEC>] [-w <WHERE>]
//    :fo[pen][!] /<正規表現> [-i <INTERVAL_SEC>] [-w <WHERE>]
//      ミゲ文字列か正規表現でフィルタされたリンクを開く
//
//    :lo[pen][!] URI [-w <WHERE>]
//      URI を開く
//
//    ちなみに Migemo はなくても動きます。
//    無い場合は、 "/" 要らずで正規表現オンリーになります。
//
// Variables:
//    let g:fopen_default_interval="<INTERVAL_SEC>"
//
// License:
//    http://creativecommons.org/licenses/by-sa/3.0/


(function () {

  let migemo = window.XMigemoCore;

  function isHttpLink (link) {
    return link.href && link.href.indexOf('http') == 0;
  }

  function lmatch (re, link) {
    return isHttpLink(link) && (link.href.match(re) || link.textContent.toString().match(re));
  }

  function makeRegExp (str) {
    return migemo ? (str.indexOf('/') == 0) ? new RegExp(str.slice(1), 'i')
                                            : migemo.getRegExp(str)
                  : new RegExp(str, 'i');
  }

  function filteredLinks (word) {
    if (word.match(/^\s*$/))
      return [];
    let re = makeRegExp(word);
    return [it for each (it in content.document.links) if (lmatch(re, it))];
  }

  function charToWhere (str, fail) {
    const table = {
      f: liberator.NEW_TAB,
      t: liberator.NEW_TAB,
      n: liberator.NEW_TAB,
      b: liberator.NEW_BACKGROUND_TAB,
      c: liberator.CURRENT_TAB,
      w: liberator.NEW_WINDOW,
    };
    return (str && table[str.charAt(0).toLowerCase()]) || fail;
  }

  const WHERE_COMPLETIONS = ['f', 't', 'n', 'b', 'c', 'w'];


  let (foihandle) {

    commands.addUserCommand(
      ['fo[pen]', 'filteropen'],
      'Filtered open',
      function (args, bang) {
        let where = charToWhere(args['-where'], bang ? liberator.NEW_TAB : liberator.NEW_BACKGROUND_TAB);
        let [i, links] = [1, filteredLinks(args.join(''))];
        if (!links.length)
          return;
        liberator.open(links[0].href, where);
        if (links.length <= 1)
          return;
        let interval = (args['-interval'] || liberator.globalVariables.fopen_default_interval || 1) * 1000;
        foihandle = setInterval(function () {
          try {
            liberator.open(links[i].href, where);
            if ((++i) >= links.length)
              clearInterval(foihandle);
          } catch (e) {
            clearInterval(foihandle);
          }
        }, interval);
      },
      {
        bang: true,
        argCount: '1',
        options: [
          [['-interval', '-i'], commands.OPTION_INT],
          [['-where', '-w'], commands.OPTION_STRING],
        ],
        completer: function (context, arg, bang) {
          context.title = ['URL', 'Text Content'];
          context.completions = filteredLinks(context.filter).map(function (it) ([it.href, it.textContent]));
        },
      },
      true
    );

    commands.addUserCommand(
      ['stopfilteropen', 'stopfo[pen]'],
      'Stop filtered open',
      function () {
        clearInterval(foihandle);
      }
    );

  }

  let (
    lolinks = [],
    looptions = [ [['-where', '-w'], commands.OPTION_STRING, null, WHERE_COMPLETIONS] ]
  ) {

    commands.addUserCommand(
      ['lo[pen]', 'linkopen'],
      'Filtered open',
      function (args, bang) {
        let where = charToWhere(args['-where'], bang ? liberator.NEW_TAB : liberator.CURRENT_TAB);
        let numUrl = args[0];
        let m = numUrl.match(/^(\d+),(.+)$/);
        if (m) {
          let link = lolinks[parseInt(m[1], 10)];
          if (link)
            buffer.followLink(link, where);
          else
            liberator.open(m[2], where);
        } else {
          liberator.open(numUrl, where);
        }
      },
      {
        argCount: '1',
        options: looptions,
        bang: true,
        completer: function (context) {
          let last = context.contextList.slice(-1)[0];
          lolinks = filteredLinks(last.filter);
          context.title = ['URL', 'Text Content'];
          context.advance(last.offset - last.caret);
          context.completions = lolinks.map(function (it, i) ([i + ',' + it.href, it.textContent]));
        }
      },
      true
    );

  }

})();

// vim:sw=2 ts=2 et si fdm=marker:
