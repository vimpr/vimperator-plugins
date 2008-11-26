// ==VimperatorPlugin==
// @name           YouTube HD
// @description    High-Quality Movie Monster YoUTuBe
// @description-ja 高画質妖怪ようつべ
// @license        Creative Commons 2.1 (Attribution + Share Alike)
// @version        1.0
// @author         anekos (anekos@snca.net)
// @minVersion     2.0pre
// @maxVersion     2.0pre
// ==/VimperatorPlugin==
//
// Links:
//

(function () {

  function monsterize (url) {
    if (url.match(/&fmt=22/))
      return url;
    if (url.match(/^http:\/\/(?:[^.]+\.)?youtube\.com\/watch/))
       return url + '&fmt=22';
    let m = url.match(/^http:\/\/(?:[^.]+\.)?youtube\.com\/.*\?.*v=([^&]+)/);
    if (m)
       return 'http://www.youtube.com/watch?v=' + m[1] + '&fmt=22';
    return url;
  }

  let original = liberator.plugins.hd_youkai_youtube;
  if (!original) {
    liberator.plugins.youtubehd = original = {
      open: liberator.open,
      followLink: buffer.followLink
    };
  }

  liberator.open = function (urls) {
    if (typeof urls === 'string')
      arguments[0] = monsterize(urls);
    else
      arguments[0] = urls.map(monsterize);
    return original.open.apply(this, arguments);
  };

  buffer.followLink = function (elem) {
    if (elem.href)
      elem.href = monsterize(elem.href);
    original.followLink.apply(this, arguments);
  };

})();

// vim:sw=2 ts=2 et si fdm=marker:
