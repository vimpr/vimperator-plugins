// ==VimperatorPlugin==
// @name           Bit.ly
// @description-ja Bit.ly で短縮URLを得る
// @license        Creative Commons 2.1 (Attribution + Share Alike)
// @version        1.0
// ==/VimperatorPlugin==
//

(function () {

  function bitly (uri) {
    var req = new XMLHttpRequest();
    req.onreadystatechange = function(){
      if (req.readyState == 4)
        return;
      if(req.status == 200) {
        var short = req.responseText;
        util.copyToClipboard(short);
        liberator.echo('`' + short + "' was copied to clipboard.");
        return;
      }
      throw new Error(req.statusText)
    };
    uri = 'http://bit.ly/api?url=' + uri;
    req.open("GET", uri, true);
    req.send(null);
  }

  //commands.removeUserCommand('bitly');
  commands.addUserCommand(
    ['bitly'],
    'Copy bitly url',
    function () {
      bitly(buffer.URL);
    }
  );

})();


