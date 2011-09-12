var PLUGIN_INFO =
<VimperatorPlugin>
	<name>{NAME}</name>
	<description>Send to your Android Phone</description>
	<description lang="ja">Android 端末に URL などを送信します</description>
	<author mail="hotchpotch@gmail.com">Yuichi Tateno</author>
	<minVersion>2.3</minVersion>
	<maxVersion>2.3</maxVersion>
	<updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/vimp_to_android_phone.js</updateURL>
</VimperatorPlugin>;

(function() {

var apiVersion = '3';
var base = 'http://chrometophone.appspot.com';
var baseURL = base + '/send?ver=' + apiVersion;
var signInURL = base + '/signin?extret=about:blankZ&ver=' + apiVersion;
var signOutURL = base + '/signout?extret=about:blankZ&ver=' + apiVersion;
// var loginURL = 'https://www.google.com/accounts/ServiceLoginAuth?service=ah&sig=d71ef8b8d6150b23958ad03b3bf546b7';

var serialize = function(hash) {
  var res = [];
  for (var key in hash) {
    res.push(encodeURIComponent(key) + '=' + encodeURIComponent(hash[key]));
  }
  return res.join('&');
}

var sendToPhone = function(requestURL) {
  requestURL = baseURL + '&' + requestURL;
  var req = new libly.Request(requestURL, {
    'Content-Type': 'application/x-www-form-urlencoded',
    'X-Extension': 'true'
  });
  req.addEventListener('success', function(res) {
    var body = res.responseText;
    if (body.substring(0, 2) == 'OK') {
      liberator.echo('Send to phone successed.');
    } else if (body.indexOf('LOGIN_REQUIRED' == 0)) {
      liberator.echo('Please login first');
      liberator.open(signInURL, liberator.NEW_TAB);
    } else if (body.indexOf('DEVICE_NOT_REGISTERED') == 0) {
      liberator.echo('device not registered');
      liberator.open(signOutURL, liberator.NEW_TAB);
    }
  });
  req.addEventListener('failure', function(res) {
    liberator.echoerr('Send to phone failed.');
  });
  req.get();
}

liberator.modules.commands.addUserCommand(["sp[hone]"], "Sent to your Android Phone",
function(args) {
  if (args && args['-login']) {
    liberator.open(signInURL, liberator.NEW_TAB);
    return;
  } else if (args && args['-logout']) {
    liberator.open(signOutURL, liberator.NEW_TAB);
    return;
  }

  var req = {
    sel: libly.$U.getSelectedString()
  };

  if (args && !args.arguments && !args['-title'])
    req.url = args[0];
  else if (args && args.arguments)
    req.url = args.arguments[0];

  if (args && args['-title'])
    req.title = args['-title'];
  else if (!req.url)
    req.title = content.document.title;

  if (!req.url) req.url = content.location.href;
  if (!req.title) req.title = req.url;

  if (!req.url || !req.url.match(/^https?/)) {
    liberator.echoerr('http/https schema only');
    return;
  };
  sendToPhone(serialize(req));
}, {
  options: [
    [["-title",   "-t"], liberator.modules.commands.OPTION_STRING],
    [["-login"], liberator.modules.commands.OPTION_NOARG],
    [["-logout"], liberator.modules.commands.OPTION_NOARG],
  ]
}, {
//  replace: true
});

})();



