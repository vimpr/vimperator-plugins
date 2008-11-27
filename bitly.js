// ==VimperatorPlugin==
// @name           Bit.ly
// @description-ja Bit.ly で短縮URLを得る
// @license        Creative Commons 2.1 (Attribution + Share Alike)
// @version        1.0
// @minVersion     1.2
// @maxVersion     2.0pre
// ==/VimperatorPlugin==
//

(function () {

  function bitly (uri, callback) {
    let req = new XMLHttpRequest();
    req.onreadystatechange = function () {
      if (req.readyState != 4)
        return;
      if (req.status == 200)
        return callback && callback(req.responseText, req);
      else
        throw new Error(req.statusText);
    };
    req.open('GET', 'http://bit.ly/api?url=' + uri, callback);
    req.send(null);
    return !callback && req.responseText;
  }

  commands.addUserCommand(
    ['bitly'],
    'Copy bitly url',
    function () {
      bitly(buffer.URL, function (short) {
        alert(short);
        util.copyToClipboard(short);
        liberator.echo('`' + short + "' was copied to clipboard.");
      });
    },
    true
  );

  // 外から使えるように
  liberator.plugins.bitly = {
    get: bitly
  };

})();
