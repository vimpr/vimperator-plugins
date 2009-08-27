// ==VimperatorPlugin==
// @name           Nico Related Videos
// @description-ja ニコニコ動画のオススメ動画のリスト
// @license        Creative Commons 2.1 (Attribution + Share Alike)
// @version        1.3.1
// ==/VimperatorPlugin==
//
//  Author:
//    anekos
//
//  Usage:
//    ニコニコ動画のオススメ動画のリストを補完で表示します。
//
//    コマンドにURL以外を指定したときの動作:
//      空            => ニコニコ動画のトップページに移動
//      動画ID(sm.+)  => 動画に移動
//      ":" タグ名    => タグ検索
//      その他文字列  => ニコニコ動画でそれを検索
//
//    "!" をつけると新しいタブで開く。
//
// Link:
//    http://d.hatena.ne.jp/nokturnalmortum/20080910#1220991278


(function () {

  function getVideoId () {
    let m = buffer.URL.match(/^http:\/\/(?:tw|es|de|www)\.nicovideo\.jp\/watch\/([a-z0-9]+)/);
    return m && m[1];
  }

  function httpRequest (uri, onComplete) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4) {
        if (xhr.status == 200)
          onComplete(xhr.responseXML);
        else
          throw new Error(xhr.statusText)
      }
    };
    xhr.open('GET', uri, true);
    xhr.send(null);
  }

  function getRelatedVideos () {
    let videoId = getVideoId();
    if (!videoId)
      return [];
    let videos = [];
    let uri = 'http://www.nicovideo.jp/api/getrelation?sort=p&order=d&video=' + videoId;
    let xhr = new XMLHttpRequest();
    xhr.open('GET', uri, false);
    xhr.send(null);
    let xml = xhr.responseXML;
    let v, vs = xml.evaluate('//video', xml, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE , null);
    while (v = vs.iterateNext()) {
      let [cs, video] = [v.childNodes, {}];
      for each (let c in cs)
        if (c.nodeName != '#text')
          video[c.nodeName] = c.textContent;
      videos.push(video);
    }
    return videos;
  }

  function getRelatedTags () {
    let doc = content.document;
    let nodes = doc.getElementsByClassName('nicopedia');
    return [it.textContent for each (it in nodes) if (it.rel == 'tag')];
  }


  let last = {url: null, completions: []};
  let nothing = 'No related videos';

  commands.addUserCommand(
    ['nicorelated'],
    'niconico related videos',
    function (args) {
      let url = args.string;
      url = (function () {
        if (url == nothing)
          return 'http://www.nicovideo.jp/';
        if (url.match(/^[a-z]{2}\d+$/))
          return 'http://www.nicovideo.jp/watch/' + url;
        if (url.match(/^[:\uff1a]/))
          return 'http://www.nicovideo.jp/tag/' + encodeURIComponent(url.substr(1));
        if (url.indexOf('http://') == -1)
          return 'http://www.nicovideo.jp/search/' + encodeURIComponent(url);
      })() || url;
      liberator.open(url, args.bang ? liberator.NEW_TAB : liberator.CURRENT_TAB);
    },
    {
      bang: true,
      completer: function (context, arg) {
        if ((buffer.URL != last.url) || !last.completions.length) {
          last.completions = [];
          getRelatedVideos().forEach(function (it) last.completions.push([it.url, it.title]));
          getRelatedTags().forEach(function (it) last.completions.push([":" + it, "tag"]));
          last.url = buffer.URL;
        }
        context.title = ['Keyword'];
        context.completions = last.completions;
      }
    },
    true
  );

})();
