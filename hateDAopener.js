//
// hateDAopener.js
//
// LICENSE: {{{
//
// This software distributable under the terms of an MIT-style license.
//
// Copyright (c) 2009 snaka<snaka.gml@gmail.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//
// OSI page : http://opensource.org/licenses/mit-license.php
// Japanese : http://sourceforge.jp/projects/opensource/wiki/licenses%2FMIT_license
//
// }}}

// PLUGIN INFO: {{{
let PLUGIN_INFO =
<VimperatorPlugin>
  <name>{NAME}</name>
  <description>Search specified Hatena::Diary</description>
  <description lang="ja">はてなダイアリーのタイトル／カテゴリをインクリメンタルに検索</description>
  <minVersion>2.0pre</minVersion>
  <maxVersion>2.2pre</maxVersion>
  <updateURL>http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/hateDAopener.js</updateURL>
  <author mail="snaka.gml@gmail.com" homepage="http://vimperator.g.hatena.ne.jp/snaka72/">snaka</author>
  <license>MIT style license</license>
  <version>0.0.1</version>
  <detail><![CDATA[
    == Subject ==
    Open specified page of Hatena::Diary

    == Commands ==

    == Global variables ==

    == Options ==

    == ToDo ==

  ]]></detail>
  <detail lang="ja"><![CDATA[
    == 概要 ==
    はてなダイアリーのタイトル/カテゴリのインクリメンタル検索

    == コマンド ==
    :hatedaopen or :ho :
        ダイアリーを開く。<TAB>で候補を一覧表示。
        キーワードを入力することで一覧をインクリメンタル検索(wildoptions=auto時)
        キーワードが複数の場合は空白区切りで入力

    == グローバル変数 ==
    g:hatedaOpner_userId:
        検索対象とするはてなidとダイアリー
        ex)
        >||
            js <<EOM
            liberator.globalVariables.hateDAopener_accounts = [
                ['snaka72', 'd'],
                ['Snaka', 'd'],
                ['snaka72', 'vimperator.g']
            ];
            EOM
        ||<

    == ToDo ==

  ]]></detail>
</VimperatorPlugin>;
// }}}
plugins.hateDAopener = (function(){

    let libly = liberator.plugins.libly;
    // PUBLIC ///////////////////////////////////////////////////////////////{{{
    let self = {
        extractTitleAndTags: extractTitleAndTags,
        generateCandidates:  generateCandidates,
        getDiaryEntries:     getDiaryEntries,
        getFaviconURI:       getFaviconURI,
    };
    // }}}
    // COMMAND //////////////////////////////////////////////////////////////{{{
    commands.addUserCommand(
        ["hatedaopen", "ho"],
        "Hatena::Diary opener",
        function(args, bang) {
            liberator.open(args.string, liberator.CURRENT_TAB);
        }, {
            completer: function(context, args) {
              context.format = {
                anchored: false,
                title: ["Title and URL", "Tags"],
                keys: { text: "url", baseUrl: "baseUrl", path: "path", name: "name", tags: "tags"},
                process: [templateTitleAndUrl, templateTags]
              };
              context.filterFunc = null;
              context.regenerate = true;
              context.generate = function() filteredCandidates(args);
            },
            argCount: "*",
            bang: true,
        },
        true
    );

    // }}}
    // PRIVATE //////////////////////////////////////////////////////////////{{{

    /**
     * @return accounts info
     *      ex.
     *          [['snaka72', 'd'],
     *           ['Snaka',   'd'],
     *           ['snaka72', 'vimperator.g']]
     */
    function accounts()
        liberator.globalVariables.hateDAopener_accounts || [];

    /**
     * filter candidates by words
     */
    function filteredCandidates(words) {
        return  generateCandidates()
                .filter(function(i)
                    let (targetString = '' + i.tags + ' ' + i.name)
                    words.every(function(word) targetString.match(word, 'i'))
                );
    }

    function hatenaDiaryUrl(diary, userId)
        'http://' + diary + '.hatena.ne.jp/' + userId;

    /**
     * Get candidates list
     * @return [{"url": "(url)", "name": "hogehoge", "tags": "[hoge]"}, ... ]
     */
    function generateCandidates() {
      let allEntries = [];
      let notEmpty = function(i) i && i != "";

      accounts().forEach(function([userId, diary]) {
          let entries =  getDiaryEntries(userId, diary)
          .filter(notEmpty)
          .map(function([dateTime, path, titleAndTag])
              let ([title, tags] = extractTitleAndTags(titleAndTag)) {
                  "url"     : hatenaDiaryUrl(diary, userId) + path,
                  "baseUrl" : hatenaDiaryUrl(diary, userId),
                  "path"    : path,
                  "name"    : title,
                  "tags"    : tags
              }
          );
          allEntries = allEntries.concat(entries);
      });
      return allEntries;
    }

    /**
     * Get Diary entries
     * @param String UserID
     * @return [String dateTime, String path, String titleAndTag]
     */
    let getDiaryEntries = (function() {
        let cache = {};
        return function(userId, diary) {
            if (cache[diary + userId])
                return cache[diary + userId];
            let res = util.httpGet(hatenaDiaryUrl(diary, userId) + "/archive/plaintext");
            return cache[diary + userId] = res.responseText
                                           .split(/\r?\n/)
                                           .map(function(i) i.split(','));
        };
    })();

    /**
     * @param String Title and Tags ex. "[hoge, fuga]About me."
     * @return [String title, [String tags, ...]]
     */
    function extractTitleAndTags(titleAndTag) {
        let patternTags = /\[[^\]]+\]/g;
        return [
            titleAndTag.replace(patternTags, ''),
            (titleAndTag.match(patternTags) || [])
        ];
    }

    function templateTitleAndUrl(item){
      let simpleURL = item.text.replace(/^https?:\/\//, '');
      let favicon = getFaviconURI(item.baseUrl + '/');
      return <>
        <img src={favicon} />
        <span class="td-strut"/>{item.name}
        <a href={item.text} highlight="simpleURL">
          <span class="extra-info">{simpleURL}</span>
        </a>
      </>;
    }

    function templateTags(item){
      return item.tags && item.tags.length > 0 ? item.tags.join("")  : "";
    }

    let getFaviconURI = (function() {
        let faviconCache = {};

        return function (pageURI) {
            if (faviconCache[pageURI])
                return faviconCache[pageURI];

            let uri = Cc["@mozilla.org/network/io-service;1"]
                    .getService(Ci.nsIIOService)
                    .newURI(pageURI, null, null);
            let faviconURI = Cc["@mozilla.org/browser/favicon-service;1"]
                    .getService(Ci.nsIFaviconService)
                    .getFaviconImageForPage(uri);
            return faviconCache[pageURI] = faviconURI.spec;
        }
    })();

    // }}}
    // UTILITY //////////////////////////////////////////////////////////////{{{
    function dump(title, obj)
        liberator.dump(title + "\n" + util.objectToString(obj));

    function rns(source)
        source.split(/\r?\n/);

    function csv(source)
        source.split(",");

    // }}}
    return self;
})();
let(msg="loaded...") {
    liberator.echo(msg);
    setTimeout(function() commandline.close(), 1000);
}
// vim:sw=4 ts=4 et si fdm=marker fenc=utf-8
