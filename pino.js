//
//  pino.js (Open livedoorReader pinned items)
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
var PLUGIN_INFO =
<VimperatorPlugin>
  <name>{NAME}</name>
  <description>Open livedoor Reader pinned items</description>
  <description lang="ja">livedoor Reader でピンを立てたページを開く</description>
  <minVersion>2.0pre</minVersion>
  <maxVersion>2.0</maxVersion>
  <updateURL>http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/pino.js</updateURL>
  <author mail="snaka.gml@gmail.com" homepage="http://vimperator.g.hatena.ne.jp/snaka72/">snaka</author>
  <license>MIT style license</license>
  <version>1.0.0</version>
  <detail><![CDATA[
    == Subject ==
    Open livedoor Reader pinned items.

    == Commands ==
    :pino

    == Global variables ==
    g:pinoOpenItemsCount:
      default: 5

    g:pinoOpenBehavior:
      default: liberator.NEW_BACKGROUND_TAB

    g:pinoAscendingOrder:
      default: "false"

    == API ==
    plugins.pino.items():
      Return pinned items list array.
      Each item is following structure.
      >||
      {
         created_on : (create date),
         link : (url),
         title : (page title)
      }
      ||<

    plugins.pino.head():
      Return head item and remove pin.

    plugins.pino.remove(link):
      Remove pin from item that matched by 'link'.

  ]]></detail>
  <detail lang="ja"><![CDATA[
    == 概要 ==
    livedoor Reader でピンを立てた記事をVimperatorのコマンドラインから開く
    ことができます。

    == コマンド ==
    :pino
    そのまま<Enter>で先頭のn件（デフォルト5件、グローバル変数で調整可能）
    をバックグラウンドのタブで開きます。
    <TAB>で補完候補の一覧にピンを立てた記事の一覧から選択することもできます。

    == グローバル変数 ==
    g:pinoOpenItemsCount:
      一度に開くピンの数
      default: 5

    g:pinoOpenBehavior:
      ピンを開くときの挙動、liberator.open()の第2引数として使用する値
      参考）http://wiki.livedoor.jp/shin_yan/d/liberator%282%2e0%29#content_34
      default: liberator.NEW_BACKGROUND_TAB

    g:pinoAscendingOrder:
      ピンの一覧の表示順を昇順（古い順）とするかどうか
      default: "false" （新しい順）

    == API ==
    plugins.pino.api.items():
      ピンの一覧を配列で取得する。
      ピンのデータ構造は以下のとおりとなっている。
      >||
      {
         created_on : (create date),
         link : (url),
         title : (page title)
      }
      ||<

    plugins.pino.api.head():
      先頭のピンを取得して、そのピンを一覧から削除する。

    plugins.pino.api.remove(link):
      linkに該当するピンを一覧から削除する。

  ]]></detail>
</VimperatorPlugin>;
// }}}
liberator.plugins.pino.api = (function() {
  // COMMAND /////////////////////////////////////////////////////// {{{
  commands.addUserCommand(
    ["pinneditemopen", "pino"],
    "Open livedoor Reader pinned item",
    function(args, bang) {
      let pins = new Pins();
      if (args.string == "") {
        let pin;
        let max = openItemsCount();
        for(let i = 0; i < max; i++) {
          if (!(pin = pins.head())) break;
          liberator.open(pin.link, openBehavior());
        }
      }
      else {
        liberator.open(args.string, openBehavior());
        pins.remove(args.string);
      }
    },
    {
      completer: function(context) {
        var pins = new Pins();
        context.title = ["title", "url"];
        context.completions = [
          [i.link, i.title] for each (i in pins.items())
        ];
      },
    },
    true    // for Debug
  );
  // }}}
  // GLOBAL VARIABLES ////////////////////////////////////////////// {{{
  var gv = liberator.globalVariables;
  function openItemsCount()
    gv.pinoOpenItemsCount || 5;

  function ascending()
    window.eval(gv.pinoAscendingOrder) == true; // default: false

  function openBehavior()
    window.eval(gv.pinoOpenBehavior) || liberator.NEW_BACKGROUND_TAB;

  // }}}
  // CLASS ///////////////////////////////////////////////////////// {{{
  const LDR_DOMAIN = "http://reader.livedoor.com"

  function Pins() {
    this.cache = null;
    this.apiKey = getLDRApiKey();
    this.sortOrder = ascending()
                      ? function(a, b) (a.created_on < b.created_on ? -1 : 1)
                      : function(a, b) (a.created_on > b.created_on ? -1 : 1);
  }
  Pins.prototype = {
    items : function() {
      let result = this.cache
              ? this.cache
              : this.cache = this._getPinnedItems();
      return result.sort(this.sortOrder);
    },

    head : function() {
      if (this.items().length == 0)
        return null;
      var pin = this.items().shift();
      this.remove(pin.link);
      return pin;
    },

    remove : function(link) {
      var unescapedLink = unescapeHTML(link);
      var request = new libly.Request(
        LDR_DOMAIN + "/api/pin/remove",
        {
          //Cookie: "reader_sid=" + this.apiKey,
          //Referer: "http://reader.livedoor.com/reader/"
        },
        {
          postBody: toQuery({link: unescapedLink, ApiKey: this.apiKey})
        }
      );

      request.addEventListener("onSuccess", function(data) {
        liberator.log("Removed pin from '" + link + "' was succeeded.");
      });
      request.addEventListener("onFailure", function(data) {
        liberator.echoerr("Cannot remove pin");
      });
      request.post();
    },

    _getPinnedItems : function() {
      var result = null;
      var request = new libly.Request(
          LDR_DOMAIN + "/api/pin/all",
          null,
          { asynchronous: false }
      );

      request.addEventListener("onSuccess", function(data) {
        liberator.log(data);
        result = liberator.eval(data.responseText);
      });
      request.addEventListener("onFailure", function(data) {
        liberator.echoerr("Can't get pinned list!!!");
        liberator.log(data);
      });
      request.post();

      return result;
    },
  }
  // }}}
  // FUNCTIONS ///////////////////////////////////////////////////// {{{
  var libly = plugins.libly;

  function getLDRApiKey() {
    var uri = Cc["@mozilla.org/network/io-service;1"]
                .getService(Ci.nsIIOService)
                .newURI(LDR_DOMAIN, null, null);
    var cookie = Cc["@mozilla.org/cookieService;1"]
                .getService(Ci.nsICookieService)
                .getCookieString(uri, null);
    var apiKey = cookie.match(/reader_sid=([^;]+)/);
    return apiKey ? apiKey[1]: null;
  }

  function unescapeHTML(source) {
    var result = source;
    [
      [/&lt;/g,  "<"],
      [/&gt;/g,  ">"],
      [/&amp;/g, "&"]
    ].forEach( function(rule) {
      result = result.replace(rule[0], rule[1]);
    });
    return result;
  }

  function toQuery(source)
    [encodeURIComponent(i) + "=" + encodeURIComponent(source[i])
        for (i in source)
    ].join('&');

  function $LX(a,b)
    libly.$U.getFirstNodeFromXPath(a,b);

  // }}}
  // API /////////////////////////////////////////////////////////// {{{
  return {
    items : function()
      (new Pins).items(),

    head : function()
      (new Pins).head(),

    remove : function(link)
      (new Pins).remove(link),
  }
  // }}}
})();
// vim: ts=2 sw=2 et fdm=marker
