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
var PLUGIN_INFO = xml`
<VimperatorPlugin>
  <name>{NAME}</name>
  <description>Show ToDo items in commandline buffer. Also add item to your Ta-da list.</description>
  <description lang="ja">コマンドラインバッファからTa-Da list のToDo一覧を参照したり、からToDo項目を追加したりします。</description>
  <minVersion>2.0pre</minVersion>
  <maxVersion>2.2pre</maxVersion>
  <updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/tada.js</updateURL>
  <author mail="snaka.gml@gmail.com" homepage="http://vimperator.g.hatena.ne.jp/snaka72/">snaka</author>
  <license>MIT style license</license>
  <version>0.10.0</version>
  <require type="plugin">_libly.js</require>
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
      :tada [list name] [subject]:
        Show default list unless 'list name' supplied.
        Show specified list if 'list name' is supplied.
        Add todo item to default list if 'list name' is not supplied and 'subject' is supplied.
        Add todo item to specified list if 'list name' and 'subject' are supplied.

      :tada -open [list name]:
        Open default list unless 'list name' supplied.
        Open specified list if 'list name' is supplied.

      :tadamail:
        Send list to registered mail address.

      :tadaclearcache:
        Clear cache data.

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
      :tada [list name] [subject]:
        パラメタが省略された場合、デフォルトのリストの内容が表示されます。
        'list name' が指定された場合、該当リストの内容が表示されます。
        'list name' が指定されず 'subject' のみ指定されている場合、デフォルトのリストに'subject'の内容を追加します。
        'list name' も 'subject' も指定されている場合、該当リストに'subject'の内容を追加します。

      :tada -open [list name]:
        'list name' が省略された場合、デフォルトのリストのページ開きます。
        'list name' が指定された場合、該当リストのページを開きます。

      :tadamail:
        Ta-da lists に登録されているアドレスにリストを送ります。

      :clearcache:
        キャッシュされたデータを破棄します

    == ToDo ==
      - 'Done'機能の実装
      - 項目の削除機能
      - 表示のパフォーマンス改善

  ]]></detail>
</VimperatorPlugin>`;
// }}}

liberator.plugins.tada = (function(){
// COMMAND ////////////////////////////////////////////////////////////{{{
  commands.addUserCommand(
    ["tada"],
    "Show / Add ToDo items to Ta-Da list. (:tada [LISTNAME] [SUBJECT])",
    function(args) {
        liberator.echo("Please wait ...");
        let action = parseAction(args, args["-open"]);
        action();
    }, {
      completer: tadaListCompleter,
      argCount: "*",
      options: [
        [["-open", "-o"], commands.OPTION_NOARG],
      ],
      literal: true
    },
    true  // for DEVELOP
  );

  function parseAction(args, isOpen) {
    let listId;
    let defaultListIdName = getDefaultListIdName();
    let defaultListURI = getURI() + defaultListIdName[0];

    switch (args.length) {
    case 0:
      // Open default tada list page
      if (isOpen)
        return function() liberator.open(defaultListURI, liberator.NEW_TAB);
      // list default list items
      return function() showTodoItems(defaultListIdName);

    case 1:
      // list name or tado item for default list.
      if (listId = getListId(args[0])) {
        if (isOpen)
          return function() liberator.open(getURI() + listId, liberator.NEW_TAB);
        return function() showTodoItems(listId);
      }
      if (isOpen)
        return function() liberator.open(defaultListURI, liberator.NEW_TAB);
      return function() addTodoItem(defaultListIdName, args[0]);
    }

    if (isOpen)
        return function() liberator.open(defaultListURI, liberator.NEW_TAB);
    // list name / tado item for selected list or
    // tado item for default list
    if (listId = getListId(args[0]))
      return function() addTodoItem([listId, args[0]], args[1]);
    return function() addTodoItem(defaultListIdName, args.join(' '));
  }

  commands.addUserCommand(
    ["done"],
    "Done to-do item.",
    function(args) {
      let listId = getListId(args[0]);
      let itemId = args[1];

      liberator.echo("Done...");
      doneItem(listId, itemId);
    },{
      completer : function(context, args) {
        context.title = ["id", "title"];
        context.completions = args.length <= 1
                                ? tadaListCompleter(context, args)
                                : tadaItemCompleter(args[0]);
      },
      argCount : "*",
      literal  : 1,
    },
    true
  );

  function tadaItemCompleter(listName) {
    let result = [];
    getTodoItems(getListId(listName)).forEach(function(item) {
      result.push([item.itemId, item.title]);
    });
    return result;
  }

  commands.addUserCommand(
    ["tadamail"],
    "Mail Ta-Da list. (:tadamail [LISTNAME])",
    function(args) {
      if (args.length > 0)
        sendEmail([getListId(args[0]), args[0]]);
    }, {
      completer: tadaListCompleter,
      argCount: "*"
    },
    true
  );

  commands.addUserCommand(
    ["tadaclearcache"],
    "Clear Ta-da lists cache",
    function()
      cachedLists = []
  );
// }}}
// PRIVATE ////////////////////////////////////////////////////////////{{{

  function tadaListCompleter(context, args) {
    if (args.length > 1)
      return;
    context.title = ["List", "Items left"];
    context.completions = getLists().map(function(item) [item[1], item[2]]);
  }

  function getURI() {
    if (userId = $g('tada_userId'))
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
  function getDefaultListIdName() {
    var defaultId;
    var defaultName;

    if (defaultName = $g('tadaDefaultListName'))
      if (defaultId = getListId(defaultName))
        return [defaultId, defaultName];

    var lists = getLists(); // [[id, name], ...]
    return [lists[0][0], lists[0][1]];
  }

  // Get Your 'MyLists'
  // @return [[id, name, left], .... ]
  function getLists() {
    let result = [];
    var req = new libly.Request(getURI(), null, {asynchronous: false});

    req.addEventListener('success', function(data) {
      liberator.log("success");
      data.getHTMLDocument("//div[@id='Container']/div[2]/div/div/ul/li/a").forEach(function(item){
        var left = $LX("../span/strong[text()]", item);
        result.push([parseListId(item.href), item.innerHTML, left.innerHTML]);
      });
    });
    req.get();

    if (result.length == 0)
      throw "Cannot get your list. Please chehek " + getURI() + " is accessible.";

    return result;
  }

  function showTodoItems(listId) {
    let list = <ul></ul>;
    getTodoItems(listId).forEach(function(item) {
      list.li += <li>{item.title}</li>;
    });
    liberator.echo(list, commandline.FORCE_MULTILINE);
  }

  /*
   * getTodoItems
   * @return  [[itemId, title], [itemId, title] ... ]
   */
  function getTodoItems(listId) {
    let result = [];
    var req = new libly.Request(getURI() + listId.toString(), null, {asynchronous: false});

    req.addEventListener('success', function(res) {
      liberator.log("success");
      res.getHTMLDocument("//ul[@id='incomplete_items']/li/form").forEach(function(item) {
        result.push({
          itemId : item.id.match(/edit_item_([^\"]+)/)[1],
          title  : item.textContent.replace(/^\s*|\n|\r|\s*$/g, '')
        });
      });
    });
    req.get();
    return result;
  }

  function addTodoItem([listId, listName], content) {
    var endpoint = getURI() + listId + "/items"
    liberator.log("endpoint:" + endpoint);
    var req = new libly.Request(
      endpoint,
      null,
      {
        postBody: "item[content]=" + encodeURIComponent(content)
      }
    );

    req.addEventListener('success', function(data) {
      liberator.echo("Posted[" + listName + "]:" + content);
      liberator.plugins.posted = data;
    });

    req.addEventListener('failure', function(data) {
      liberator.echoerr("POST FAILURE: " + content);
    });

    req.post();
  }

  function sendEmail([listId, listName]) {
    var endpoint = getURI() + listId + "/email";
    liberator.log("endpoint:" + endpoint);

    var req = new libly.Request(endpoint, null, {postBody: "dummy=hoge"});
    req.addEventListener('success', function(data) {
      liberator.echo("Send Ta-Da list '" + listName + "' to your email address.");
    });
    req.addEventListener('failure', function(data) {
      liberator.echoerr("EMAIL SENDING ERROR.");
      liberator.log(data.responseText);
    });
    req.post();
  }

  function doneItem(listId, itemId) {
    let endpoint = getURI() + listId + "/items/" + itemId;
    liberator.dump("endpoint: " + endpoint);

    var req = new libly.Request(endpoint, null,
        {
          postBody: toQuery({
            "_method" : "put",
            "item[completed]" : "1",
          })
        }
    );
    req.addEventListener('success', function(data) {
      liberator.echo("Done: " + itemId);
    });
    req.addEventListener('failure', function(data) {
      liberator.echoerr("Done item failed.");
      liberator.log(data.responseText);
    });
    req.post();
  }

  // Utilities
  function $s(obj)   util.objectToString(obj);
  function $g(str)   liberator.globalVariables[str];
  function $LXs(a,b) libly.$U.getNodesFromXPath(a, b);
  function $LX(a,b)  libly.$U.getFirstNodeFromXPath(a, b);
  function toQuery(source)
    [encodeURIComponent(i) + "=" + encodeURIComponent(source[i])
        for (i in source)
    ].join('&');


// }}}
// API ////////////////////////////////////////////////////////////////{{{
  return {
    getLists: getLists,
    getTodoItems: getTodoItems,
  };
// }}}
})();

// vim: sw=2 ts=2 et si fdm=marker:
