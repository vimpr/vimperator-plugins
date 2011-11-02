/*
 * ニコニコ動画のマイリストを何かするプラグイン
 * http://twitter.com/ebith
 */

var INFO =
<plugin name="nicolist"
        version="0.2"
        summary="ニコニコ動画のマイリストを操作します"
        xmlns="http://vimperator.org/namespaces/liberator">
  <author email="ebith.h@gmail.com">ebith</author>
  <project name="Vimperator" minVersion="3.2"/>
  <item>
    <tags>:nicolist-add</tags>
    <spec>:nicolist add <a>mylist-id</a></spec>
    <description><p>マイリストに動画を追加します</p></description>
  </item>
  <item>
    <tags>:nicolist-open</tags>
    <spec>:nicolist open <a>mylist-id</a> <a>video-id</a></spec>
    <description><p>mylist-idのみであればマイリストを、video-idの指定もあれば動画を開きます</p></description>
  </item>
</plugin>;

commands.addUserCommand(
  ['nicolist'],
  'ニコニコ動画のマイリストを操作する',
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
        ['o[pen]'],
        'マイリストか動画を開く',
        function (args) {
          liberator.log(args);
          let [mylist_id, video_id] = args;
          if (video_id) {
            let url = 'http://www.nicovideo.jp/watch/' + video_id;
            liberator.open(url, liberator.NEW_TAB);
          } else if (mylist_id) {
            let url = 'http://www.nicovideo.jp/mylist/' + mylist_id;
            liberator.open(url, liberator.NEW_TAB);
          }
        },
        {
          literal: 1,
          completer: mylistCompleter,
        }
      ),
    ]
  },
  true
);

function mylistCompleter (context, args) {
  if (args.completeArg == 0){
    let url = 'http://www.nicovideo.jp/api/mylistgroup/list';
    let mylistgroup = JSON.parse(util.httpGet(url).responseText).mylistgroup;
    context.title = ["id", "title"];
    context.filters = [CompletionContext.Filter.textDescription];
    context.compare = void 0;
    context.completions = [
      [v.id, v.name]
      for ([k, v] in Iterator(mylistgroup))
    ];
  } else if (args.completeArg == 1){
    let url = 'http://www.nicovideo.jp/api/mylist/list?group_id=' + args[0];
    let mylistitem = JSON.parse(util.httpGet(url).responseText).mylistitem.sort(sorter);
    context.title = ["id", "title"];
    context.filters = [CompletionContext.Filter.textDescription];
    context.compare = void 0;
    context.completions = [
      [v.item_data.video_id, v.item_data.title]
      for ([k, v] in Iterator(mylistitem))
    ];
  }
}

function sorter (a, b) {
  return - (a.create_time - b.create_time);
}
