/* NEW BSD LICENSE {{{
Copyright (c) 2008-2010, anekos.
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

// PLUGIN_INFO {{{
let PLUGIN_INFO = xml`
<VimperatorPlugin>
  <name>bit.ly</name>
  <description>Get short alias by bit.ly and j.mp</description>
  <description lang="ja">bit.ly や j.mp で短縮URLを得る</description>
  <version>2.1.2</version>
  <author mail="anekos@snca.net" homepage="http://d.hatena.ne.jp/nokturnalmortum/">anekos</author>
  <license>new BSD License (Please read the source code comments of this plugin)</license>
  <license lang="ja">修正BSDライセンス (ソースコードのコメントを参照してください)</license>
  <updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/bitly.js</updateURL>
  <minVersion>2.0pre</minVersion>
  <detail><![CDATA[
    == Commands ==
      :bitly [<URL>]
        Copy to clipboard.
      :jmp [<URL>]
        Copy to clipboard.
    == Require ==
      bit.ly API Key
  ]]></detail>
</VimperatorPlugin>`;
// }}}


(function () {

  const Realm = 'API Key for bit.ly (bitly.js)';
  const HostName = 'http://api.bit.ly';
  const ApiUrl = 'http://api.bit.ly/v3';
  const PasswordManager = Cc['@mozilla.org/login-manager;1'].getService(Ci.nsILoginManager);
  const LoginInfo =
    new Components.Constructor(
      '@mozilla.org/login-manager/loginInfo;1',
      Ci.nsILoginInfo,
      'init'
    );

  function getAuth () {
    let count = {};
    let logins = PasswordManager.findLogins(count, HostName, null, Realm);
    if (logins.length)
      return logins[0];
  }

  function setupAuth (callback) {
    liberator.open('http://bit.ly/a/your_api_key', liberator.NEW_TAB);
    commandline.input(
      'Login name for bit.ly: ',
      function (username) {
        commandline.input(
          'API Key: ',
          function (apiKey) {
            let login = LoginInfo(HostName, null, Realm, username, apiKey, '', '');
            PasswordManager.addLogin(login);
            callback();
          },
          {
            default: let (e = content.document.querySelector('#bitly_api_key')) (e ? e.value : '')
          }
        );
      }
    );
  }

  function shorten (url, domain, command, callback) {
    function fixResponseText (s)
      s.trim();

    liberator.log(arguments);
    function get () {
      let req = new XMLHttpRequest();
      req.onreadystatechange = function () {
        if (req.readyState != 4)
          return;
        if (req.status == 200)
          return callback && callback(fixResponseText(req.responseText), req);
        else
          return liberator.echoerr(req.statusText);
      };
      let requestUri =
        ApiUrl + '/' + (command || 'shorten') + '?' +
        'apiKey=' + auth.password + '&' +
        'login=' + auth.username + '&' +
        (command !== 'expand' ? 'uri=' : 'shortUrl=') + encodeURIComponent(url) + '&' +
        'domain=' + (domain || 'bit.ly') + '&' +
        'format=txt';
      req.open('GET', requestUri, callback);
      req.send(null);
      return !callback && fixResponseText(req.responseText);
    }

    if (!url)
      url = buffer.URL;

    let auth = getAuth();

    if (auth)
      return get();

    if (callback) {
      let args = Array.slice(arguments);
      setupAuth(function () shorten.apply(this, args));
    } else {
      liberator.echoerr('Not found API Key!! Try :bitly command, before use.');
    }
  }

  [
    ['jmp', 'j.mp'],
    ['bitly', 'bit.ly'],
  ].forEach(function ([name, domain]) {
    commands.addUserCommand(
      [name],
      'Copy ' + domain + ' url',
      function (args) {
        let url = args.literalArg ? util.stringToURLArray(args.literalArg)[0] : buffer.URL;
        let cmd = args['-expand'] ? 'expand' : 'shorten';

        shorten(url, domain, cmd, function (short) {
          util.copyToClipboard(short);
          liberator.echo(short + ' <= ' + url);
        });
      },
      {
        literal: 0,
        options: [
          [['-expand', '-e'], commands.OPTION_NOARG]
        ],
        completer: function (context) {
          context.completions = [
            [buffer.URL, 'Current URL']
          ];
          context.fork('URL', 0, context, completion.url);
        }
      },
      true
    );
    __context__[name] = function (url, cmd, callback) shorten(url, domain, cmd, callback);
  });

  __context__.get = shorten;
})();
