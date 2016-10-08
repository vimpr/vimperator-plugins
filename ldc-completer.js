/* NEW BSD LICENSE {{{
Copyright (c) 2011, anekos.
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
var INFO = xml`
  <plugin name="LivedoorClipCompleter" version="1.0.0"
          href="http://vimpr.github.com/"
          summary="Add the completer for Livedoor Clip"
          lang="en-US"
          xmlns="http://vimperator.org/namespaces/liberator">
    <author email="anekos@snca.net">anekos</author>
    <license>New BSD License</license>
    <project name="Vimperator" minVersion="3.0"/>
    <p></p>
    <item>
      <tags>:livedoorclip sync</tags>
      <spec>:livedoorclip sync</spec>
      <description><p>synchronize to remote.</p></description>
    </item>
  </plugin>
  <plugin name="LivedoorClipCompleter" version="1.0.0"
          href="http://vimpr.github.com/"
          summary="Livedoor Clip 用の補完を追加する"
          lang="ja"
          xmlns="http://vimperator.org/namespaces/liberator">
    <author email="anekos@snca.net">anekos</author>
    <license>New BSD License</license>
    <project name="Vimperator" minVersion="3.0"/>
    <p></p>
    <item>
      <tags>:livedoorclip sync</tags>
      <spec>:livedoorclip sync</spec>
      <description><p>同期して、ローカルにインポートする。</p></description>
    </item>
  </plugin>
`;
// }}}

(function () {

  const DBFile =
    Cc['@mozilla.org/file/directory_service;1'].getService(Ci.nsIProperties).get('ProfD', Components.interfaces.nsIFile);
  DBFile.append('ldc-completer.sqlite');

  const DB =
    new AnkStorage(
      DBFile.path,
      {
        bookmarks: {
          id: 'integer',
          url: 'string',
          title: 'string',
          comment: 'string',
          tags: 'string',
          datetime: 'string',
          key_text: 'string',
          imported: 'integer'
        }
      }
    );

  DB.createTables();

  const XMigemoCore = Cc["@piro.sakura.ne.jp/xmigemo/factory;1"].getService(Ci.pIXMigemoFactory).getService("ja");
  const XMigemoTextUtils = Cc["@piro.sakura.ne.jp/xmigemo/text-utility;1"].getService(Ci.pIXMigemoTextUtils);


  function httpGet(url, {username, password}, callback) {
    let xmlhttp = new XMLHttpRequest();
    xmlhttp.mozBackgroundRequest = true;
    if (callback) {
      xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4)
          callback(xmlhttp);
      };
    }
    xmlhttp.open("GET", url, !!callback, username, password);
    xmlhttp.send(null);
    return xmlhttp;
  }

  function formatDate (date) {
    if (!(date instanceof Date))
      date = new Date(date);
    return date.toLocaleFormat('%Y/%m/%d-%H:%M:%S');
  }


  function withTransaction (block) {
    let connection = DB.database;
    connection.beginTransaction();
    try {
      block();
    } finally {
      connection.commitTransaction();
    }
  }


  function migeMatch (words) {
    let res = [
      new RegExp(XMigemoTextUtils.sanitize(word) + '|' + XMigemoCore.getRegExp(word), 'i')
      for ([, word] in Iterator(words))
    ];
    return function (item) res.every(function (re) re.test(item.text + ' ' + item.description));
  }


  function searchWithText (words) {
    let w = [];
    for (let [n, word] in Iterator(words)) {
      w.push('key_text like ?' + (n + 1));
    }

    let result = DB.select(
      'bookmarks',
      w.join(' AND '),
      function (stmt){
        let result = [];
        for (let [i, word] in Iterator(words))
          stmt.bindUTF8StringParameter(i, word)
        while (stmt.executeStep())
          result.push(AnkStorage.statementToObject(stmt));
        return result;
      }
    );
    return result;
  }


  function importBookmarks () {
    const URL = 'http://clip.livedoor.com/export/export?mode=rss';
    const dc = new Namespace("http://purl.org/dc/elements/1.1/");

    function importFromXML (xml) {
      for (let [i, item] in Iterator(xml.channel.item)) {
        let url = String(item.link);
        let title = String(item.title);
        let comment = String(item.description);
        let datetime = formatDate(String(item.pubDate));
        let tags = [it for ([, it] in Iterator(item.dc::subject))];
        DB.insert(
          'bookmarks', {
            url: url,
            title: title,
            comment: comment,
            datetime: datetime,
            tags: tags.map(function (it) ('[' + it + ']')).join(''),
            key_text: [url, title, comment, tags.join(' ')].join(' '),
            imported: 1
          }
        );
      }
    }

    DB.delete('bookmarks');

    //return withTransaction(importFromXML.bind(null ,liberator.__xml));

    httpGet(
      URL,
      {},
      function (xhr) {
        let xml = new XML(xhr.responseText.replace(/<\?.*?\?>\n/, '').replace(/\n/g, ''));
        liberator.__xml = xml;
        withTransaction(importFromXML.bind(null, xml));
        liberator.echo('Done: Livedoor Clip synchronization');
      }
    );
  }


  function initializeAuthInfo (username, password) {
    const PSVC = Cc['@mozilla.org/embedcomp/prompt-service;1'].getService(Ci.nsIPromptService);
    const PM = Cc["@mozilla.org/login-manager;1"].getService(Ci.nsILoginManager);

    let nsLoginInfo = new Components.Constructor('@mozilla.org/login-manager/loginInfo;1', Ci.nsILoginInfo, 'init');

    liberator.log([username, password]);
    let result = {username: {value: username}, password: {value: password}};

    let ok =
      PSVC.promptUsernameAndPassword(
        null,
        '',
        'Livedoor Clip Username and APIKey',
        result.username,
        result.password,
        null,
        {}
      );

    if (ok) {
      PM.addLogin(
        new nsLoginInfo(
          'http://api.clip.livedoor.com',
          'http://api.clip.livedoor.com',
           null,
           result.username.value,
           result.password.value,
           '',
           ''
        )
      );
    }
    return true;
  }


  function getAuthInfo () {
    const PM = Cc["@mozilla.org/login-manager;1"].getService(Ci.nsILoginManager);

    let logins =
      PM.findLogins(
        {},
        'http://api.clip.livedoor.com',
        'http://api.clip.livedoor.com',
        null
      ).filter(function ({username, password}) (username && password));
    return {
      username: logins[0].username,
      password: logins[0].password
    };
  }


  function updateBookmarks (callback, onError) {
    function onReceive (xml) {
      for (let [, post] in Iterator(xml.post)) {
        let tags = String(post.@tag).split(/\s+/);
        let url = post.@href;
        let title = post.@description;
        let datetime = formatDate(String(post.@time));
        let comment = post.@extended;
        DB.insert(
          'bookmarks', {
            url: url,
            title: title,
            comment: comment,
            datetime: datetime,
            tags: tags.map(function (it) ('[' + it + ']')).join(''),
            key_text: [url, title, comment, tags.join(' ')].join(' '),
            imported: 0
          }
        );
      }

      // 追加によって重複したものを削除する
      DB.delete(
        'bookmarks',
        'imported and url in (select url from bookmarks group by url having count(*) > 1)'
      );
      // 次回に削除されないように、フラグをつける
      DB.update('bookmarks', 'imported = 1', 'imported = 0');

      callback();
    }

    httpGet(
      'http://api.clip.livedoor.com/v1/posts/recent?count=100&password=',
      getAuthInfo(),
      function (xhr) {
        if (xhr.status != 200)
          return onError(xhr.responseText);
        try {
          let xml = liberator.___xml = new XML(xhr.responseText.replace(/\n/g, ''));
          onReceive(xml);
        } catch (e) {
          liberator.___xml_text  =  xhr.responseText;
          onError(/SyntaxError/.test(String(e)) ? xhr.responseText : e);
        }
      }
    );
  }


  let lastUpdate, updating = false, updaterCurrentCallback;

  function updateBookmarksIfExpired (callback) {
    updaterCurrentCallback = callback;

    if (updating)
      return;

    let i = parseInt(liberator.globalVariables.ldc_completer_update_interval || 10, 10);
    let expired = lastUpdate && (new Date().getTime() < (lastUpdate + 60 * i * 1000));

    if (expired)
      return callback();

    lastUpdate = new Date().getTime();
    updating = true;

    updateBookmarks(
      function () {
        updating = false;
        updaterCurrentCallback();
        liberator.echo('Done: Livedoor Clip update');
      },
      function (e) {
        updating = false;
        liberator.echo('Failed: Livedoor Clip update - ' + e);
        liberator.log(e);
      }
    );
  }


  function makeUrlCompleter (usePrefix) {
    return function (context, args) {
      let prefix = usePrefix && liberator.globalVariables.ldc_completer_prefix;
      let migemo = liberator.globalVariables.ldc_completer_use_migemo;

      let filter = context.filter.trim();

      if (prefix) {
        let p = filter.indexOf(prefix);
        if (p != 0)
          return;
        filter = filter.slice(prefix.length).trim();
      }

      let words = [];
      words = filter.split(/\s+/);

      if (words.length < 1 || (words.length < 2 && words[0].length < 1))
        return;

      if (migemo) {
        context.filters = [migeMatch(words)];
      } else {
        context.filters = [function () true];
        words = words.map(function (it) ('%' + it + '%'));
      }

      context.title = ['LDC URL', 'LDC Title'];
      context.keys = {text: "url", description: "title", icon: "icon"};
      context.incomplete = true;

      updateBookmarksIfExpired(
        function () {
          let found = searchWithText(migemo ? [] : words);

          let cs = [
            {url: v.url, title: v.title + ' ' + v.tags}
            for ([, v] in Iterator(found))
          ];

          context.completions = cs;
          context.incomplete = false;
        }
      );
    };
  }


  delete completion.urlCompleters.L;

  let completerCallback;

  completion.addUrlCompleter(
    'L',
    'Open the urls in tweets',
    makeUrlCompleter(true)
  );


  commands.addUserCommand(
    ['ldc', 'livedoorclip'],
    'Livedoor Clip',
    function (args) {},
    {
      subCommands: [
        new Command(
          ['auth'],
          'Setup auth info',
          function (args) {
            const URL = 'http://clip.livedoor.com/config/api';
            liberator.open(URL, liberator.NEW_TAB);
            let limit = 50;
            let h =
              setInterval(
                function () {
                  function q (sel) {
                    let doc = content.document;
                    let e = doc.querySelector(sel);
                    return e && e.textContent;
                  }

                  if (--limit <= 0) {
                    clearInterval(h);
                    initializeAuthInfo();
                    return;
                  }

                  if (buffer.URL === URL && buffer.loaded) {
                    clearInterval(h);
                    let username = q('.font-header > span[title]');
                    let password = q('.api-key-box');
                    initializeAuthInfo(username, password);
                    return;
                  }
                },
                100
              );
          }
        ),
        new Command(
          ['sync'],
          'synchronize LDC',
          function (args) {
            importBookmarks();
          }
        ),
        new Command(
          ['open'],
          'Open bookmark',
          function (args) {
            liberator.open(args.literalArg);
          },
          {
            literal: 0,
            completer: makeUrlCompleter(false)
          }
        )
      ]
    },
    true
  );

})();

// vim:sw=2 ts=2 et si fdm=marker:
