// ==VimperatorPlugin==
// @name           Link Opener
// @description    Open filtered link(s).
// @description-ja リンクをフィルタリングして開く
// @license        Creative Commons 2.1 (Attribution + Share Alike)
// @version        1.0
// ==/VimperatorPlugin==
//
// Usage:
//    :fopen <REGEXP> [-i <INTERVAL_SEC>]
//      Open filtered links by regexp.
//
//    :lo[pen] URI
//      Open URI
//
// Usage-ja:
//    :fo[pen] <ミゲ文字列> [-i <INTERVAL_SEC>]
//    :fo[pen] /<正規表現> [-i <INTERVAL_SEC>]
//      ミゲ文字列か正規表現でフィルタされたリンクを開く
//
//    :lo[pen] URI
//      URI を開く
//
//    ちなみに Migemo はなくても動きます。
//    無い場合は、 "/" 要らずで正規表現オンリーになります。
//
// Variables:
//    let g:fopen_default_interval="<INTERVAL_SEC>"


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
    if (str.indexOf('/') == 0) {
      return new RegExp(str.slice(1), 'i');
    } else { 
      return migemo.getRegExp(str);
    }
  }

  function filteredLinks (word) {
    if (word.match(/^\s*$/))
      return []; // [it for each (it in content.document.links) if (it.href)];  
    let re = makeRegExp(word);
    return [it for each (it in content.document.links) if (lmatch(re, it))]; 
  }

  let foihandle;

  liberator.commands.addUserCommand(
    ['fo[pen]', 'filteropen'],
    'Filtered open',
    function (opts) {
      let [i, links] = [1, filteredLinks(opts.arguments.join(''))];
      if (!links.length)
        return;
      open(links[0].href, NEW_BACKGROUND_TAB);
      if (links.length <= 1)
        return;
      let interval = (opts['-interval'] || liberator.globalVariables.fopen_default_interval || 1) * 1000;
      foihandle = setInterval(function () {
        try {
          open(links[i].href, NEW_BACKGROUND_TAB);
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
      ],
      completer: function (word) {
        let links = filteredLinks(word);
        return [0, [[it.href, it.textContent] for each (it in links)]];
      },
    }
  );

  liberator.commands.addUserCommand(
    ['stopfilteropen'],
    'Stop filtered open',
    function () {
      clearInterval(foihandle);
    }
  );

  let lolinks = [];

  liberator.commands.addUserCommand(
    ['lo[pen]', 'linkopen'],
    'Filtered open',
    function (uri) {
      for each (let link in lolinks) {
        if (~link.href.indexOf(uri))
          return liberator.buffer.followLink(link);
      }
      if (lolinks[0]) {
        liberator.buffer.followLink(lolinks[0]);
      } else {
        liberator.echoerr('lol')
      }
    },
    {
      completer: function (word) {
        lolinks = filteredLinks(word);
        return [0, [[it.href, it.textContent] for each (it in lolinks)]];
      }
    }
  );

}catch(e){log(e);}})();

// vim:sw=2 ts=2 et:
