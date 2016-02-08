//
//  pino.js  - Open livedoor Reader (and clone server) pinned items -
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
  <description>Open livedoor Reader pinned items</description>
  <description lang="ja">livedoor Reader でピンを立てたページを開く</description>
  <minVersion>3.0</minVersion>
  <updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/pino.js</updateURL>
  <require type="plugin">_libly.js</require>
  <author mail="snaka.gml@gmail.com" homepage="http://vimperator.g.hatena.ne.jp/snaka72/">snaka</author>
  <license>MIT style license</license>
  <version>1.4.1</version>
  <detail><![CDATA[
    == Subject ==
    Open livedoor Reader pinned items.

    == Commands ==
    :[count]pino
      Following option is avilable.
      -list:
        Show pinned item list.

    == Global variables ==
    g:pinoOpenItemsCount:
      default: 5

    g:pinoOpenBehavior:
      default: liberator.NEW_BACKGROUND_TAB

    g:pinoAscendingOrder:
      default: "false"

    g:pinoBaseURL:
      If you want to use fastladder, set "http://fastladder.com" into this variable.
      default: "http://reader.livedoor.com"

    g:pinoOpenInterval:
      Interval of opening tabs. (msec)

    == API ==
    liberator.plugins.pino.items():
      Return pinned items list array.
      Each item is following structure.
      >||
      {
         created_on : (create date),
         link : (url),
         title : (page title)
      }
      ||<

    liberator.plugins.pino.shift():
      Return first item and remove pin.

    liberator.plugins.pino.remove(link):
      Remove pin from item that matched by 'link'.

  ]]></detail>
  <detail lang="ja"><![CDATA[
    == 概要 ==
    livedoor Reader でピンを立てた記事をVimperatorのコマンドラインから開く
    ことができます。

    == コマンド ==
    :[count]pino:
      そのまま<Enter>で先頭のn件（デフォルト5件、グローバル変数で調整可能）
      をバックグラウンドのタブで開きます。
      <TAB>で補完候補の一覧にピンを立てた記事の一覧から選択することもできます。
      count を指定すると、その件数だけ開きます。
      以下のオプションが指定可能です。
      -list:
        ピンの一覧を表示します。

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

    g:pinoBaseURL:
      fastladder を使う場合は、この変数を "http://fastladder.com" とする。
      default: "http://reader.livedoor.com"

    g:pinoOpenInterval:
      タブを開く間隔(ミリ秒)

    == API ==
    liberator.plugins.pino.items():
      ピンの一覧を配列で取得する。
      ピンのデータ構造は以下のとおりとなっている。
      >||
      {
         created_on : (create date),
         link : (url),
         title : (page title)
      }
      ||<

    liberator.plugins.pino.shift():
      先頭のピンを取得して、そのピンを一覧から削除する。

    liberator.plugins.pino.remove(link):
      linkに該当するピンを一覧から削除する。

  ]]></detail>
</VimperatorPlugin>`;
// }}}
let self = liberator.plugins.pino = (function() {
  // COMMAND /////////////////////////////////////////////////////// {{{
  commands.addUserCommand(
    ["pinneditemopen", "pino"],
    "Open livedoor Reader(and clone server) pinned item",
    function(args) {
      let pins = new Pins();
      let items = pins.items();
      if (!items || items.length == 0) {
        liberator.echo("Pinned item doesn't exists.");
        return;
      }

      if (args["-list"]) {
        //let items = pins.items();
        let list = xml`<div>{items.length} items.
                    <ul>{
                      [<li><a href={i.link}>{i.title}</a><br/></li>
                        for each (i in items)
                      ].reduce(function(a, b) a + b)
                    }</ul>
                   </div>`;
        liberator.echo(list, commandline.FORCE_MULTILINE);
        return;
      }

      if (args.string == "") {
        let pin;
        let max = (args.count >= 1) ? args.count : openItemsCount();
        for(let i = 0; i < max; i++) {
          if (!(pin = pins.shift()))
            break;
          setTimeout(function(link) liberator.open(link, openBehavior()), openInterval() * i, pin.link);
        }
      }
      else {
        liberator.open(args.string, openBehavior());
        pins.remove(args.string);
      }
    },
    {
      literal: 0,
      count: true,
      completer: function(context) {
        var pins = new Pins();
        context.title = ["url", "title"];
        context.filters = [CompletionContext.Filter.textDescription];
        context.anchored = false;
        context.completions = [
          [i.link, i.title] for each (i in pins.items())
        ];
      },
      options: [
        [["-list", "-l"], commands.OPTION_NOARG]
      ]
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

  function baseURL()
    gv.pinoBaseURL || "http://reader.livedoor.com";

  function openInterval()
    gv.pinoOpenInterval || 200;

  // }}}
  // CLASS ///////////////////////////////////////////////////////// {{{

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
      return (result || []).sort(this.sortOrder);
    },

    shift : function() {
      if (this.items().length == 0)
        return null;
      var pin = this.items().shift();
      this.remove(pin.link);
      return pin;
    },

    remove : function(link) {
      var unescapedLink = unescapeHTML(link);
      var request = new libly.Request(
        baseURL() + "/api/pin/remove",
        {
          //Cookie: "reader_sid=" + this.apiKey,
          //Referer: "http://reader.livedoor.com/reader/"
        },
        {
          postBody: toQuery({link: unescapedLink, ApiKey: this.apiKey})
        }
      );

      request.addEventListener("success", function(data) {
        liberator.log("Removed pin from '" + link + "' was succeeded.");
      });
      request.addEventListener("failure", function(data) {
        liberator.echoerr("Cannot remove pin");
      });
      request.post();
    },

    _getPinnedItems : function() {
      var result = null;
      var request = new libly.Request(
          baseURL() + "/api/pin/all",
          null,
          {
            asynchronous: false,
            postBody: toQuery({ApiKey: this.apiKey})
          }
      );

      request.addEventListener("success", function(data) {
        if (isLoginPage(data)) {
          liberator.echoerr("Can't get pinned list. Maybe you should login to livedoor.");
          return;
        }
        result = unentifyObjectValues(liberator.eval(data.responseText));
      });
      request.addEventListener("failure", function(data) {
        liberator.echoerr("Can't get pinned list!!!");
      });
      request.post();

      return result;
    },
  }
  // }}}
  // FUNCTIONS ///////////////////////////////////////////////////// {{{
  var libly = liberator.plugins.libly;

  function getLDRApiKey() {
    var ioService = Cc["@mozilla.org/network/io-service;1"]
                    .getService(Ci.nsIIOService);
    var uri = ioService.newURI(baseURL(), null, null);
    var channel = ioService.newChannelFromURI(uri);
    var cookie = Cc["@mozilla.org/cookieService;1"]
                .getService(Ci.nsICookieService)
                .getCookieString(uri, channel);
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

  function isLoginPage(response)
    response.responseText.substr(0, 5) == '<?xml'

  function unentify(s) {
    const EntityTable = {amp: '&'};
    return s.replace(
      /&([a-z-A-Z]+);/g,
      function (whole, name) (name in EntityTable ? EntityTable[name] : whole)
    );
  };

  function unentifyObjectValues(obj) {
    let result = Object.create(obj);
    for (let [n, v] in Iterator(obj)) {
      switch (typeof v) {
      case "object":
        result[n] = unentifyObjectValues(v);
        break;
      case "string":
        result[n] = unentify(v);
        break;
      }
    }
    return result;
  }

  // }}}
  // API /////////////////////////////////////////////////////////// {{{
  return {
    items : function()
      (new Pins).items(),

    shift : function()
      (new Pins).shift(),

    head : function()   // @deprecated
      self.shift(),

    remove : function(link)
      (new Pins).remove(link),
  };
  // }}}
})();
// for backward compatibility
self.api = {};
for each (p in "items head remove".split(' '))
  self.api[p] = self[p];
// vim: ts=2 sw=2 et fdm=marker
