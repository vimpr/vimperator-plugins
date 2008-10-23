// ==VimperatorPlugin==
// @name           Link Opener
// @description    Open filtered link(s).
// @description-ja リンクをフィルタリングして開く
// @license        Creative Commons 2.1 (Attribution + Share Alike)
// @version        1.2
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


(function () { try {

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
      function (opts, bang) {
        let where = charToWhere(opts['-where'], bang ? liberator.NEW_TAB : liberator.NEW_BACKGROUND_TAB);
        let [i, links] = [1, filteredLinks(opts.arguments.join(''))];
        if (!links.length)
          return;
        liberator.open(links[0].href, where);
        if (links.length <= 1)
          return;
        let interval = (opts['-interval'] || liberator.globalVariables.fopen_default_interval || 1) * 1000;
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
        options: [
          [['-interval', '-i'], commands.OPTION_INT],
          [['-where', '-w'], commands.OPTION_STRING],
        ],
        completer: function (word) {
          let links = filteredLinks(word);
          return [0, [[it.href, it.textContent] for each (it in links)]];
        },
      }
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
      function (opts, bang) {
        let where = charToWhere(opts['-where'], bang ? liberator.NEW_TAB : liberator.CURRENT_TAB);
        let arg = opts.arguments[0];
        let m = arg.match(/^\d+(?=,)/);
        if (m)
          buffer.followLink(lolinks[parseInt(m[0], 10)], where);
      },
      {
        options: looptions,
        bang: true,
        completer: function (word) {
          if (!word || word.match(/\s|\d+,/))
            return [];
          lolinks = filteredLinks(word);
          return [0, [[i + ',' + lolinks[i].href, lolinks[i].textContent] for (i in lolinks || [])]];
        }
      }
    );

  }

} catch (e) { liberator.log(e); }})();

// vim:sw=2 ts=2 et:
