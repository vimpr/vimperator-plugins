// ==VimperatorPlugin==
// @name           Nico Related Videos
// @description-ja ニコニコ動画のオススメ動画のリスト
// @license        Creative Commons 2.1 (Attribution + Share Alike)
// @version        1.0.0
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
//      その他文字列  => ニコニコ動画でそれを検索
//
// Link:
//    http://d.hatena.ne.jp/nokturnalmortum/20080910#1220991278


(function () {

  function getVideoId () {
    let m = liberator.buffer.URL.match(/^http:\/\/www\.nicovideo\.jp\/watch\/([a-z0-9]+)/);
    return m && m[1];
  }

  function httpRequest (uri, onComplete) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(){
      if(xhr.readyState == 4){
        if(xhr.status == 200)
          onComplete(xhr.responseXML);
        else
          throw new Error(xhr.statusText)
      }
    };
    xhr.open("GET", uri, true);
    xhr.send(null);
  }

  function getRelatedVideos () {
    let videoId = getVideoId();
    if (!videoId)
      return [];
    let videos = [];
    let uri = 'http://www.nicovideo.jp/api/getrelation?sort=p&order=d&video=' + videoId;
    let xhr = new XMLHttpRequest();
    xhr.open("GET", uri, false);
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


  let last = {url: null, videos: []};
  let nothing = 'No related videos';

  liberator.commands.addUserCommand(
    ['nicorelated'],
    'niconico related videos',
    function (url) {
      url = (function () {
        if (url == nothing) 
          return 'http://www.nicovideo.jp/';
        if (url.match(/^[a-z]{2}\d+$/))
          return 'http://www.nicovideo.jp/watch/' + url;
        if (!url.match(/http:\/\//))
          return 'http://www.nicovideo.jp/search/' + encodeURIComponent(url);
      })() || url;
      liberator.open(url);
    },
    {
      completer: function (args) {
        if (liberator.buffer.URL != last.url) {
          last.videos = [[v.url, v.title] for each (v in getRelatedVideos())];
          last.url = liberator.buffer.URL;
        }
        return [0, last.videos.length ? last.videos : [[nothing, nothing]]];
      }
    }
  );

})();
