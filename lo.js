// ==VimperatorPlugin==
// @name           Link Opener
// @description    Open filtered link(s).
// @description-ja リンクをフィルタリングして開く
// @license        Creative Commons 2.1 (Attribution + Share Alike)
// @version        1.1
// ==/VimperatorPlugin==
//
// Usage:
//    :fo[pen][!] <REGEXP> [-i <INTERVAL_SEC>]
//      Open filtered links by regexp.
//      When used "!", open links in foreground.
//
//    :lo[pen][!] URI
//      Open URI
//
// Usage-ja:
//    :fo[pen][!] <ミゲ文字列> [-i <INTERVAL_SEC>]
//    :fo[pen][!] /<正規表現> [-i <INTERVAL_SEC>]
//      ミゲ文字列か正規表現でフィルタされたリンクを開く
//
//    :lo[pen][!] URI
//      URI を開く
//
//    ちなみに Migemo はなくても動きます。
//    無い場合は、 "/" 要らずで正規表現オンリーになります。
//
// Variables:
//    let g:fopen_default_interval="<INTERVAL_SEC>"
//
// Notice:
//    "--where" option's implementation has not been completed yet.


(function () { try{

  let migemo = window.XMigemoCore;

  function isHttpLink (link) {
    return link.href && ~link.href.indexOf('http');
  }

  function lmatch (re, link) {
    return isHttpLink(link) && (link.href.match(re) || link.textContent.toString().match(re));
  }

  function makeRegExp (str) {
    if (!migemo)
      return new RegExp(str, 'i');
    if (str.indexOf('/') == 0)
      return new RegExp(str.slice(1), 'i');
    else
      return migemo.getRegExp(str);
  }

  function filteredLinks (word) {
    if (word.match(/^\s*$/))
      return []; // [it for each (it in content.document.links) if (it.href)];
    let re = makeRegExp(word);
    return [it for each (it in content.document.links) if (lmatch(re, it))];
  }

  function charToWhere (str, fail) {
    const table = {
      f: NEW_TAB,
      t: NEW_TAB,
      b: NEW_BACKGROUND_TAB,
      c: CURRENT_TAB,
      w: NEW_WINDOW,
    };
    return (str && table[str.charAt(0).toLowerCase()]) || fail;
  }

  let foihandle;

  liberator.commands.addUserCommand(
    ['fo[pen]', 'filteropen'],
    'Filtered open',
    function (opts, bang) {
      let where = charToWhere(opts['-where'], bang ? NEW_TAB : NEW_BACKGROUND_TAB);
      let [i, links] = [1, filteredLinks(opts.arguments.join(''))];
      if (!links.length)
        return;
      open(links[0].href, where);
      if (links.length <= 1)
        return;
      let interval = (opts['-interval'] || liberator.globalVariables.fopen_default_interval || 1) * 1000;
      foihandle = setInterval(function () {
        try {
          open(links[i].href, where);
          if ((++i) >= links.length)
            clearInterval(foihandle);
        } catch (e) {
          clearInterval(foihandle);
        }
      }, interval);
    },
    {
      options: [
        [['-interval', '-i'], liberator.commands.OPTIONS_INT],
        [['-where', '-w'], liberator.commands.OPTIONS_STRING],
      ],
      completer: function (word) {
        let links = filteredLinks(word);
        return [0, [[it.href, it.textContent] for each (it in links)]];
      }
    }
  );

  liberator.commands.addUserCommand(
    ['stopfilteropen', 'stopfo[pen]'],
    'Stop filtered open',
    function () {
      clearInterval(foihandle);
    }
  );

  let lolinks = [];
  let looptions = [ [['-where', '-w'], liberator.commands.OPTIONS_STRING], ];

  liberator.commands.addUserCommand(
    ['lo[pen]', 'linkopen'],
    'Filtered open',
    function (opts, bang) {
      let where = charToWhere(opts['-where'], bang ? NEW_TAB : CURRENT_TAB);
      let uri = opts.arguments[0];
      for each (let link in lolinks) {
        if (~link.href.indexOf(uri))
          return liberator.buffer.followLink(link, where);
      }
      if (lolinks[0]) {
        liberator.buffer.followLink(lolinks[0], where);
      } else {
        liberator.echoerr('lol');
      }
    },
    {
      options: looptions,
      completer: function (word) {
        let opts = liberator.parseArgs(word, looptions, "1", true);
        log(opts);
        lolinks = filteredLinks(word);//word.match(/\bhttp\S+/));
        return [0, [[it.href, it.textContent] for each (it in lolinks)]];
      }
    }
  );

}catch(e){log(e);}})();

// vim:sw=2 ts=2 et:
