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
var PLUGIN_INFO = xml`
<VimperatorPlugin>
  <name>{NAME}</name>
  <description>Search specified Hatena::Diary</description>
  <description lang="ja">はてなダイアリーのタイトル／カテゴリをインクリメンタルに検索</description>
  <minVersion>2.0pre</minVersion>
  <maxVersion>2.2pre</maxVersion>
  <updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/hateDAopener.js</updateURL>
  <author mail="snaka.gml@gmail.com" homepage="http://vimperator.g.hatena.ne.jp/snaka72/">snaka</author>
  <license>MIT style license</license>
  <version>1.1.1</version>
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
        コマンドを実行すると'Search Hatena::Diary?' というプロンプトが表示され、インクリメンタル検索モードになる。
        キーワードを入力することでダイアリーの一覧をインクリメンタルに絞り込む事ができる。
        キーワードを空白区切りで複数入力するとAnd検索となる。

    == グローバル変数 ==
    g:hatedaOpner_userId:
        検索対象とするはてなidとダイアリーを設定する。
        この変数に設定されている情報を元にダイアリーのエントリ一覧を取得する。
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
    - APIを用意する

  ]]></detail>
</VimperatorPlugin>`;
// }}}
plugins.hateDAopener = (function(){

    // PUBLIC ///////////////////////////////////////////////////////////////{{{
    let self = {
        getEntryList:   function(keywords) {
            return filteredCandidates(keywords);
        },
    };
    // }}}
    // COMMAND //////////////////////////////////////////////////////////////{{{
    commands.addUserCommand(
        ["hatedaopen", "ho"],
        "Hatena::Diary opener",
        function(args) {
            commandline.input('Search Hatena::Diary? ', function(str) {
                if (!str || str == '')
                    return;
                liberator.open(str, args.bang ? liberator.NEW_TAB
                                         : liberator.CURRENT_TAB);
            }, {
                default: args.string,
                completer: function(context) {
                    dump("context", context);
                    hatedaCompleter(context, context.filter.split(' '));
                },
                onChange: function(str) {
                    showCompletions();
                }
            });
            if (args.string != "")
                showCompletions();
        }, {
            bang: true,
            count: "*",
        },
        true
    );

    // }}}
    // PRIVATE //////////////////////////////////////////////////////////////{{{

   /**
    * search diary
    */
   function hatedaCompleter(context, args) {
        context.format = {
            anchored: false,
            title: ["Title and URL", "Tags"],
            keys: {
                text:   "url",
                baseUrl:"baseUrl",
                path:   "path",
                name:   "name",
                tags:   "tags"
            },
            process: [templateTitleAndUrl, templateTags]
        };
        context.filterFunc = null;
        context.regenerate = true;
        context.generate = function() filteredCandidates(args);
        context.createRow = createRow;
    }

    /**
     * get accounts
     * @return accounts info
     *          ex. [['snaka72', 'd'], ['snaka72', 'vimperator.g'], ...]
     */
    function accounts()
        liberator.globalVariables.hateDAopener_accounts || [];

    /**
     * filter candidates by words
     */
    function filteredCandidates(words) (
        generateCandidates()
        .filter(function(i)
            let (targetString = '' + i.tags + ' ' + i.name)
                (words || []).every(function(word) targetString.match(word, 'i'))
        )
    );

    /**
     *  create completion row
     */
    function createRow(item, highlightGroup) {
        if (typeof icon == "function")
            icon = icon();

        if (highlightGroup)
        {
            var text = item[0] || "";
            var desc = item[1] || "";
        }
        else
        {
            var text = this.process[0].call(this, item, item.text);
            var desc = this.process[1].call(this, item, item.description);
        }

        // <e4x>
        return <div highlight={highlightGroup || "CompItem"} style="white-space: nowrap">
                   <!-- The non-breaking spaces prevent empty elements
                      - from pushing the baseline down and enlarging
                      - the row.
                      -->
                   <li highlight="CompResult" style="width: 75%">{text}&#160;</li>
                   <li highlight="CompDesc" style="width: 25%">{desc}&#160;</li>
               </div>;
        // </e4x>
    }

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
            let key = userId + '/' + diary;
            if (cache[key])
                return cache[key];
            let res = util.httpGet(hatenaDiaryUrl(diary, userId) + "/archive/plaintext");
            return cache[key] = res.responseText
                                .split(/\r?\n/)
                                .map(function(i) i.split(','));
        };
    })();

    function hatenaDiaryUrl(diary, userId)
        'http://' + diary + '.hatena.ne.jp/' + userId;

    /**
     * @param String Title and Tags ex. "[hoge, fuga]About me."
     * @return [String title, [String tags, ...]]
     */
    function extractTitleAndTags(titleAndTag)
        let (patternTags = /\[[^\]]+\]/g) [
            titleAndTag.replace(patternTags, ''),
            (titleAndTag.match(patternTags) || [])
        ];

    /**
     * template: title & url
     */
    function templateTitleAndUrl(item)
        `
            <img src={getFaviconURI(item.baseUrl + '/')} />
            <span class="td-strut"/>{item.name}
            <a href={item.text} highlight="simpleURL">
              <span class="extra-info">{item.text.replace(/^https?:\/\//, '')}</span>
            </a>
        `;

    /**
     * template: tags
     */
    function templateTags(item)
        item.tags && item.tags.length > 0 ? item.tags.join("")  : "";

    // UTILITY //
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

    let showCompletions = function() {
        if (!options.get('wildoptions').has('auto')) {
            evalWithContext(function() {
                completions.complete(true, false);
                completions.itemList.show();
            }, commandline.input);
        }
    };

    let evalWithContext = function(func, context) {
        let str;
        let fstr = func.toString();
        if (fstr.indexOf('function () {') == 0) {
            str = fstr.replace(/.*?{([\s\S]+)}.*?/m, "$1");
        } else {
            str = '(' + fstr + ')()';
        }
        return liberator.eval(str, context);
    };

    function dump(title, obj)
        liberator.dump(title + "\n" + util.objectToString(obj));

    // }}}
    return self;
})();
// vim:sw=4 ts=4 et si fdm=marker fenc=utf-8
