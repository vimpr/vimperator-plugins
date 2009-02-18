//
// tada.js
//
// LICENSE: {{{
//   Copyright (c) 2009 snaka<snaka.gml@gmail.com>
// 
//   Distributable under the terms of an MIT-style license.
//   http://www.opensource.jp/licenses/mit-license.html
// }}}

// PLUGIN INFO: {{{
var PLUGIN_INFO =
<VimperatorPlugin>
  <name>Ta-Da</name>
  <description>Show ToDo items in commandline buffer. Also add item to your Ta-da list.</description>
  <description lang="ja">コマンドラインバッファからTa-Da list のToDo一覧を参照したり、からToDo項目を追加したりします。</description>
  <minVersion>2.0pre</minVersion>
  <maxVersion>2.0</maxVersion>
  <updateURL>http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/tada.js</updateURL>
  <author mail="snaka.gml@gmail.com" homepage="http://vimperator.g.hatena.ne.jp/snaka72/">snaka</author>
  <license>MIT style license</license>
  <version>0.7</version>
  <detail><![CDATA[
    == Subject ==
    Show ToDo items in commandline buffer. 
    Also add item to your Ta-da list.

    == Global variables ==
    Following variable is *requied*.
    tada_userId:
    Please specify your user ID.

    Following variable is optional.
    tada_defaultListName:
      Default list name.
      Use this list name if command parameter is not supplied.
      However this variable not specified, use first one of lists as default.

    == Command ==
    Usage:
      tada [list name] [subject]
      - Show default list if no parameter supplied.
      - Show specified list if 'list name' is supplied.
      - Add todo item to default list if 'list name' is not supplied and 'subject' is supplied.
      - Add todo item to specified list if 'list name' and 'subject' are supplied.

    == ToDo ==
      - 'Done' functionlity.
      - Item deletion.
      - Performance tunning.

  ]]></detail>
  <detail lang="ja"><![CDATA[
    == 概要 ==
    コマンドラインバッファからTa-Da list のToDo一覧を参照したり、ToDo項目を追加したりします。

    == グローバル変数 ==
    以下の変数は必須です。
    tada_userId:
      あなたのユーザIDを設定してください。

    以下の変数は任意で設定可能です。
    tada_defaultListName:
      デフォルトのリスト名
      コマンドのパラメタでリスト名を省略した場合に使用するリストの名前を定義してください。
      この変数が設定されていない場合、デフォルトのリストとして先頭のリストが使用されます。

    == コマンド ==
    Usage:
      tada [list name] [subject]
      - パラメタが省略された場合、デフォルトのリストの内容が表示されます。
      - 'list name' が指定された場合、該当リストの内容が表示されます。
      - 'list name' が指定されず 'subject' のみ指定されている場合、デフォルトのリストに'subject'の内容を追加します。
      - 'list name' も 'subject' も指定されている場合、該当リストに'subject'の内容を追加します。

    == ToDo ==
      - 'Done'機能の実装
      - 項目の削除機能
      - 表示のパフォーマンス改善

  ]]></detail>
</VimperatorPlugin>; 
// }}}

liberator.plugins.tada = (function(){
// COMMAND {{{
  commands.addUserCommand(
    ["tada"],
    "Show / Add ToDo items to Ta-Da list. (:tada [LISTNAME] [SUBJECT])",
    function(args) {

      var listId;
      switch (args.length) 
      {
      case 0:
       showTodoItems(getDefaultListId());
       break;
      case 1:
       if (listId = getListId(args[0]))
         showTodoItems(listId);
       else 
         addTodoItem(getDefaultListId(), args[0]);
       break;
      default:
       if (listId = getListId(args[0]))
         addTodoItem([listId, args[0]], args[1]);
       else
         addTodoItem(getDefaultListId(), args.join(''));
      }
    }, {
      completer: tadaListCompleter,
      argCount: "*",
      literal: true
    },
    true  // for DEVELOP
  );

  commands.addUserCommand(
    ["tadamail"],
    "Mail Ta-Da list. (:tadamail [LISTNAME])",
    function(args) {
      //
      switch(args.length) {
      case 0:
        break;
      default:
        sendEmail([getListId(args[0]), args[0]]);
      }
    }, {
      completer: tadaListCompleter,
      argCount: "*"
    },
    true
  ); 
// }}}
// PUBLIC {{{
  var PUBLICS = { 
    // for DEBUG {{{
    // getListId: getListId,
    // getDefaultListId: getDefaultListId,
    // getLists: getLists,
    // showTodoItems: showTodoItems,
    // addTodoItem: addTodoItem,
    // g: g
    // }}}
  };
// }}}
// PRIVATE {{{

  function tadaListCompleter(context) {
    context.title = ["List", "Items left"];
    context.completions = getLists().map(function(item) [item[1], item[2]]);
  }

  function getURI() {
    if (userId = g('tada_userId'))
      return "http://" + userId + ".tadalist.com/lists/";

    throw "Please specify your user id to global variable 'tada_userId'.";
  }

  function parseListId(source) {
    let m;
    if (m = source.match(/\/lists\/([0-9]+)/)) 
      return m[1];

    return source;
  }

  function getListId(name) {
    var list = getLists();
    for(var i in list) {
      if (list[i][1] == name) return list[i][0];
    }

    return null;
  }

  // Get default list id and name by Array
  // @return [defaultListId, defaultListName]
  //         1.Use global variable g:tadaDefaultListName if specified.
  //         2.Use first list if global variable not specified or specified list name is not
  //           exist in your lists.
  function getDefaultListId() {
    var defaultId;
    var defaultName;

    if (defaultName = g('tadaDefaultListName')) 
      if (defaultId = getListId(defaultName))
        return [defaultId, defaultName];

    var lists = getLists(); // [[id, name], ...]
    return [lists[0][0], lists[0][1]];
  }

  // Get Your 'MyLists'
  // @return [[id, name, left], .... ]
  function getLists() {
    var lists = [];
    var req = new libly.Request(getURI(), null, {asynchronous: false});

    req.addEventListener('onSuccess', function(data) {
      liberator.log("success");
      data.getHTMLDocument();
      $LXs("//div[@id='Container']/div[2]/div/div/ul/li/a", data.doc).forEach(function(item){
        var left = $LX("../span/strong[text()]", item);
        lists.push([parseListId(item.href), item.innerHTML, left.innerHTML]);
      });
    });
    req.get();

    if (lists.length == 0)
      throw "Cannot get your list. Please chehek " + getURI() + " is accessible.";
    return lists;
  }

  function showTodoItems(listId) {
    var req = new libly.Request(getURI() + listId.toString());

    req.addEventListener('onSuccess', function(data) {
      liberator.log("success");
      data.getHTMLDocument();

      var list = <ul></ul>;
      $LXs("//ul[@id='incomplete_items']/li/form", data.doc).forEach(function(item){
        list.li += <li>{item.textContent.replace(/^\s*|\n|\r|\s*$/g, '')}</li>;
      });

      liberator.echo(list.toXMLString(), commandline.FORCE_MULTILINE);
      liberator.log(list.toXMLString());
    });
    req.get();
  }

  function  addTodoItem([listId, listName], content) {
    var endpoint = getURI() + listId + "/items"
    liberator.log("endpoint:" + endpoint);
    var req = new libly.Request(
      endpoint,
      null,
      {
        postBody: "item[content]=" + encodeURIComponent(content)
      }
    );

    req.addEventListener('onSuccess', function(data) {
      liberator.echo("Posted[" + listName + "]:" + content);
      liberator.plugins.posted = data;
    });

    req.addEventListener('onFailure', function(data) {
      liberator.echoerr("POST FAILURE: " + content);
    });

    req.post();
  }

  function sendEmail([listId, listName]) {
    var endpoint = getURI() + listId + "/email";
    liberator.log("endpoint:" + endpoint);

    var req = new libly.Request(endpoint, null, {postBody: "dummy=hoge"});
    req.addEventListener('onSuccess', function(data) {
      liberator.echo("Send Ta-Da list '" + listName + "' to your email address.");
    });
    req.addEventListener('onFailure', function(data) {
      liberator.echoerr("EMAIL SENDING ERROR.");
      liberator.log(data.responseText);
    });
    req.post();
  }

  // Utilities 
  function g(str)    liberator.globalVariables[str]; 
  function $LXs(a,b) libly.$U.getNodesFromXPath(a, b);
  function $LX(a,b)  libly.$U.getFirstNodeFromXPath(a, b);

  return PUBLICS;
// }}}
})();

// vim: sw=2 ts=2 et si fdm=marker:
