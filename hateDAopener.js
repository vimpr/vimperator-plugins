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
    // UTILITY //////////////////////////////////////////////////////////////{{{
    let log  = liberator.log;
    let dump = function(title, obj) liberator.dump(title + "\n" + util.objectToString(obj));
    // \r\n separated string to array
    let rns  = function(source) source.split("\r\n");
    // comma separated string to array
    let csv  = function(source) source.split(",");
    let libly = liberator.plugins.libly;
    // }}}
    // PUBLIC ///////////////////////////////////////////////////////////////{{{
    let self = {
        extractTitleAndTags: extractTitleAndTags,
        generateCandidates:  generateCandidates,
        getDiaryEntries:    getDiaryEntries,
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
                keys: { text: "url", name: "name", tags: "tags"},
                process: [templateTitleAndUrl, templateTags]
              };
              context.filterFunc = null;
              context.regenerate = true;
              context.generate = function() inputFilter(args);
            },
            argCount: "*",
            bang: true,
        },
        true
    );

    // }}}
    // PRIVATE //////////////////////////////////////////////////////////////{{{
    let cache = {
        data: null,
        userId: null
    };

    /**
     * @return accounts info
     *      ex.
     *          [['snaka72', 'd'],
     *           ['Snaka',   'd'],
     *           ['snaka72', 'vimperator.g']]
     */
    function accounts() {
        return liberator.globalVariables.hateDAopener_accounts || [];
    }

    /**
     * filter candidates by words
     */
    function inputFilter(words) {
        var start = new Date;
        dump(words.join(',') + "> start:" + start + "\n");
        words = words.map(function(i) i.toLowerCase());
        let filtered = generateCandidates().filter(
            function(i) {
                let targetString =  [i.tags, i.name].join(",").toLowerCase();
                return words.every(function(word) targetString.indexOf(word) > -1);
            }
        );
        var end = new Date;
        dump(words.join(',') + "> end  :" + end + "[" + (end - start) + "]\n");
        return filtered;
    }

    /**
     * Get candidates list
     * @return [{"url": "(url)", "name": "hogehoge", "tags": "[hoge]"}, ... ]
     */
    function generateCandidates() {
      let allEntries = [];
      accounts().forEach(function([userId, diary]) {
          let entries =  getDiaryEntries(userId, diary);
          entries = entries.filter(function(i) i && i != "");
          entries =  entries.map(function([dateTime, path, titleAndTag]) {
              let url = 'http://' + diary + '.hatena.ne.jp/' + userId + path;
              let title, tags;
              [title, tags] = extractTitleAndTags(titleAndTag);
              return {
                  "url"  : url,
                  "name" : title,
                  "tags" : tags
              };
          });
          allEntries = allEntries.concat(entries);
      });
      return allEntries;
    }

    /**
     * Get Diary entries
     * @param String UserID
     * @return [String dateTime, String path, String titleAndTag]
     */
    function getDiaryEntries(userId, diary) {
        if (cache[diary + userId])
            return cache[diary + userId];

        let req = new libly.Request(
            "http://"+ diary + ".hatena.ne.jp/" + userId + "/archive/plaintext",
            null,
            { asynchronous: false }
        );
        let result;
        req.addEventListener("onSuccess", function(data) {
            dump("request succeeded", data);
            result = data;
        });
        req.addEventListener("onFailure", function(data) {
            dump("request failed", data);
            return;
        });
        req.get();

        let entries = rns(result.responseText);
        entries = entries.map(function(i) i.split(','));
        return cache[diary + userId] = entries;
    }

    /**
     * @param String Title and Tags ex. "[hoge, fuga]About me."
     * @return [String title, [String tags, ...]]
     */
    function extractTitleAndTags(titleAndTag) {
        let patternTagAndTitle = /(\[.*\])?(.*)/;
        if (!patternTagAndTitle.test(titleAndTag))
            return [];

        let tags, title;
        [,tags, title] = titleAndTag.match(patternTagAndTitle);

        let patternTags = /\[([^\]]+)\]/g;
        if (!patternTags.test(tags))
            return [title, []];

        tags = tags.match(patternTags);
        return [
            title,
            tags
        ];
    }

    function templateTags(item){
      return item.tags && item.tags.length > 0 ? item.tags.join("")  : "";
    }

    function templateTitleAndUrl(item){
      let simpleURL = item.text.replace(/^https?:\/\//, '');
      return <>
        <span class="td-strut"/>{item.name}
        <a href={item.text} highlight="simpleURL">
          <span class="extra-info">{simpleURL}</span>
        </a>
      </>;
    }

    // }}}

    return self;
})();
let(msg="loaded...") {
    liberator.echo(msg);
    setTimeout(function() commandline.close(), 1000);
}
// vim:sw=4 ts=4 et si fdm=marker fenc=utf-8
