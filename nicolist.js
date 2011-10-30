/*
 * ニコニコ動画のマイリストを何かするプラグイン
 * http://twitter.com/ebith
 */

commands.addUserCommand(
  ['nicolist'],
  'ニコニコ動画のマイリストを何かする',
  function(args) {
    liberator.echoerr('nicolist : サブコマンドが足りない！');
  },
  {
    subCommands: [
      new Command(
        ['a[dd]'],
        'マイリストに追加する',
        function (args) {
          let video_id = content.window.wrappedJSObject.video_id;
          if (!video_id)
            return liberator.echoerr('nicolist : watchページじゃない！');
          let token = content.window.wrappedJSObject.so.variables.csrfToken;
          let url = 'http://www.nicovideo.jp/api/mylist/add?group_id=' + args.literalArg + '&token=' + token + '&item_id=' + video_id;
          liberator.echo('nicolist add : ' + JSON.parse(util.httpGet(url).responseText).status);
        },
        {
          literal: 0,
          completer: mylistCompleter,
        }
      ),
      new Command(
        ['j[ump]'],
        'マイリストのページに飛ぶ',
        function (args) {
          let url = 'http://www.nicovideo.jp/mylist/' + args.literalArg;
          liberator.open(url, liberator.NEW_TAB);
        },
        {
          literal: 0,
          completer: mylistCompleter,
        }
      ),
    ]
  },
  true
);

function mylistCompleter (context) {
  let url = 'http://www.nicovideo.jp/api/mylistgroup/list';
  let mylistgroup = JSON.parse(util.httpGet(url).responseText).mylistgroup;
  context.title = ["id", "title"];
  context.filters = [CompletionContext.Filter.textDescription];
  context.compare = void 0;
  context.completions = [
    [v.id, v.name]
    for ([k, v] in Iterator(mylistgroup))
  ];
}
