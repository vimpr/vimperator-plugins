/*
 * ニコニコ動画のマイリストを何かするプラグイン
 * http://twitter.com/ebith
 */

var INFO = xml`
<plugin name="nicolist"
        version="0.3"
        summary="ニコニコ動画のマイリストを操作します"
        xmlns="http://vimperator.org/namespaces/liberator">
  <author email="ebith.h@gmail.com">ebith</author>
  <license href="http://www.opensource.org/licenses/bsd-license.php">New BSD License</license>
  <project name="Vimperator" minVersion="3.2"/>
  <item>
    <tags>:nicolist-add</tags>
    <spec>:nicolist add <a>mylist-id</a> <a>mylist-comment</a></spec>
    <description><p><a>mylist-id</a>で指定したマイリストに動画を追加します。マイリストコメントの入力も可能です</p></description>
  </item>
  <item>
    <tags>:nicolist-delete</tags>
    <spec>:nicolist delete <a>mylist-id</a> <a>item-id</a></spec>
    <description><p><a>mylist-id</a>のみであればマイリストを削除、<a>item-id</a>の指定もあれば動画をマイリストから削除します</p></description>
  </item>
  <item>
    <tags>:nicolist-new</tags>
    <spec>:nicolist new  <oa>-p<oa>ublic</oa></oa> <a>name</a> </spec>
    <description><p><a>name</a>という名前でマイリストを新規作成します。<oa>-public</oa>を付けると公開マイリストになります</p></description>
  </item>
  <item>
    <tags>:nicolist-open</tags>
    <spec>:nicolist open <a>mylist-id</a> <a>video-id</a></spec>
    <description><p><a>mylist-id</a>のみであればマイリストを、<a>video-id</a>の指定もあれば動画を開きます</p></description>
  </item>
</plugin>`;

let video = {};
commands.addUserCommand(
  ['nicolist'],
  'ニコニコ動画のマイリストを操作する',
  function(args) {
    liberator.echoerr('nicolist : サブコマンドが足りない！');
  },
  {
    subCommands: [
      new Command(
        ['v[olume]'],
        '音量を調節する',
        function (args) {
          if (/^(\+|-)/.test(args.literalArg)) {
            video.container.volume += args.literalArg * 0.1
          } else {
            video.container.volume = args.literalArg * 0.1
          }
        },
        {
          literal: 0,
          completer: function(context, args) {
            context.filters = [CompletionContext.Filter.textDescription];
            context.title = ['volume']
            context.completions = [['', (video.container.volume * 10) + '/10']]
          }
        }
      ),
      new Command(
        ['a[dd]'],
        'マイリストに追加する',
        function (args) {
          let video_id = content.window.wrappedJSObject.WatchJsApi.video.getVideoID();
          if (!video_id) {
            return liberator.echoerr('nicolist : watchページじゃない！');
          }
          let [mylist_id, description] = args;
          if (!description){ description = ''; }  //undefinedが入っているとそれをマイリストコメントにしてしまうので。
          let token = getToken(true);
          let url = 'http://www.nicovideo.jp/api/mylist/add?group_id=' + mylist_id + '&token=' + token + '&item_id=' + video_id + '&description=' + description;
          liberator.echo('nicolist add : ' + JSON.parse(util.httpGet(url).responseText).status);
        },
        {
          literal: 1,
          completer: mylistCompleter,
        }
      ),
      new Command(
        ['p[lay]'],
        '動画を再生する',
        function (args) {
          let [mylist_id, video_id] = args;
          let video_ids = []
          if (video_id) {
            video_ids = [video_id];
          } else if (mylist_id) {
            let list = JSON.parse(util.httpGet('http://www.nicovideo.jp/api/mylist/list?group_id=' + mylist_id).responseText).mylistitem;
            list.forEach(function(v){
              video_ids.push(v.item_data.video_id);
            });
          } else { return; }
          video_ids = video_ids.shuffle();
          let i = 0;

          video.container = document.createElementNS('http://www.w3.org/1999/xhtml', 'video');
          video.container.volume = 0.5;
          video.container.autoplay = true;
          ['error', 'ended'].forEach(function(event) {
            video.container.addEventListener(event, function() {
              if (video.container.src === 'chrome://browser/content/browser.xul') { return; }
              if (!video_ids[i]) { return; }
              i++;
              setupVideo();
            });
          });

          setupVideo();

          function setupVideo() {
            video.flv = {}
            util.httpGet('http://flapi.nicovideo.jp/api/getflv/' + video_ids[i]).responseText.split('&').forEach(function(param){
              let tmp = param.split('=');
              video.flv[tmp[0]] = decodeURIComponent(tmp[1]);
            });

            video.thumbinfo = util.httpGet('http://ext.nicovideo.jp/api/getthumbinfo/' + video_ids[i]).responseXML;
            video.video_id = video.thumbinfo.getElementsByTagName('video_id')[0].firstChild.nodeValue;
            video.title = video.thumbinfo.getElementsByTagName('title')[0].firstChild.nodeValue;
            video.description = video.thumbinfo.getElementsByTagName('description')[0].firstChild.nodeValue;

            util.httpGet('http://www.nicovideo.jp/watch/' + video_ids[i]); // watchページにアクセスしておかないと読み込み時403
            video.container.src = video.flv.url;
          }
        },
        {
          literal: 1,
          completer: mylistCompleter,
        }
      ),
      new Command(
        ['s[top]'],
        '動画の再生を止める',
        function (args) {
          video.container.pause();
          video.container.src = ''; // chrome://browser/content/browser.xul になる
        }
      ),
      new Command(
        ['now[Playing]'],
        '再生中の動画情報',
        function (arg) {
          if (arg) {
            let url = 'http://www.nicovideo.jp/watch/' + arg;
            liberator.open(url, liberator.NEW_TAB);
          }
        },
        {
          literal: 0,
          completer: function(context, args) {
            context.filters = [CompletionContext.Filter.textDescription];
            context.title = ['id', 'title']
            context.completions = [[video.video_id, video.title]]
          }
        }
      ),
      new Command(
        ['o[pen]'],
        'マイリストか動画を開く',
        function (args) {
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
      new Command(
        ['n[ew]'],
        'マイリストを新しく作る',
        function (args) {
         let token = getToken();
          let url = 'http://www.nicovideo.jp/api/mylistgroup/add?name=' + args.literalArg + '&token=' + token;
          if ( args['-public'] ) { url += '&public=1'; }
          liberator.echo('nicolist new : ' + JSON.parse(util.httpGet(url).responseText).status);
        },
        {
          literal: 0,
          options: [ [['-public', '-p'], commands.OPTION_NOARG] ],
        }
      ),
      new Command(
        ['d[elete]'],
        'マイリストか動画を削除する',
        function (args) {
          let token = getToken();
          let [mylist_id, item_id] = args;
          if (item_id) {
            let url = 'http://www.nicovideo.jp/api/mylist/delete?group_id=' + mylist_id + '&id_list[0][]=' + item_id + '&token=' + token;
            liberator.echo('nicolist delete : ' + JSON.parse(util.httpGet(url).responseText).status);
          } else if (mylist_id) {
            let url = 'http://www.nicovideo.jp/api/mylistgroup/delete?group_id=' + mylist_id + '&token=' + token;
            liberator.echo('nicolist delete : ' + JSON.parse(util.httpGet(url).responseText).status);
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
    context.incomplete = true;
    context.title = ["id", "title"];
    context.filters = [CompletionContext.Filter.textDescription];
    context.compare = void 0;

    let url = 'http://www.nicovideo.jp/api/mylistgroup/list';
    util.httpGet(url, function (xhr) {
      context.incomplete = false;
      context.completions = [
        for (v of JSON.parse(xhr.responseText).mylistgroup)
        [v.id, v.name]
      ];
    });
  } else if (args.completeArg == 1 && !/add/.test(context.name)){
    context.incomplete = true;
    context.title = ["id", "title"];
    context.filters = [CompletionContext.Filter.textDescription];
    context.compare = void 0;

    let url = 'http://www.nicovideo.jp/api/mylist/list?group_id=' + args[0];
    util.httpGet(url, function (xhr) {
      context.incomplete = false;

      if (/open|play/.test(context.name)) {
        context.completions = [
          for (v of JSON.parse(xhr.responseText).mylistitem.sort(sorter))
          [v.item_data.video_id, v.item_data.title]
        ];
      } else if (/delete/.test(context.name)) {
        context.completions = [
          for (v of JSON.parse(xhr.responseText).mylistitem.sort(sorter))
          [v.item_id, v.item_data.title]
        ];
      }
    });
  }
}

function sorter (a, b) {
  return - (a.create_time - b.create_time);
}

function getToken (isWatchPage) {
  if (isWatchPage) {
    let watchAPIData = JSON.parse(content.document.wrappedJSObject.getElementById('watchAPIDataContainer').firstChild.nodeValue);
    return watchAPIData.flashvars.csrfToken;
  } else {
    let url = 'http://www.nicovideo.jp/my/mylist';
    return util.httpGet(url).responseText.match(/NicoAPI\.token.+/)[0].match(/\d{5}-\d{10}-[\d\w]{40}/)[0];
  }
}

Object.defineProperty(Array.prototype, 'shuffle', {value:
  function() {
    var i = this.length;
    while(i){
        var j = Math.floor(Math.random()*i);
        var t = this[--i];
        this[i] = this[j];
        this[j] = t;
    }
    return this;
  }
});
