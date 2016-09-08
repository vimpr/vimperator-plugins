
// PLUGIN_INFO {{{
var PLUGIN_INFO = xml`
<VimperatorPlugin>
<name>PushFind</name>
<name lang="ja">プッシュファインド</name>
<description>push FIndHistory word searched on google</description>
<description lang="ja">Google検索したワードをfindの履歴に放り込みます</description>
<version>1.2</version>
<author mail="hiro@elzup.com" homepage="blog.elzup.com">elzup</author>
<minVersion>2.0pre</minVersion>
<maxVersion>2.0pre</maxVersion>
<detail lang="ja"><![CDATA[
]]></detail>
</VimperatorPlugin>`;
// }}}

(function () {
  /* n文字以下は弾く */
  var skip_char_num = 1;
  /* 実行した際にコマンドラインにechoする */
  var is_echo_pushfind = true;
  /* ヒットした文字列を逆に流し込む */
  var is_reverse_push = true;
  var pushfind_configs = 
  [
  { 
    name: "wikipedia",
    url: 'http:\/\/ja.wikipedia.org\/wiki/*',
    get_regex: /http:\/\/ja.wikipedia.org\/wiki\/([^#\/]*)/,
    delimiter: " "
  },
  { 
    name: "nicovideo",
    url: 'http:\/\/www.nicovideo.jp\/search\/*',
    get_regex: /http:\/\/www.nicovideo.jp\/search\/(.*)/,
    delimiter: " "
  },
  { 
    name: "google",
    url: 'https:\/\/www.google.co.jp\/search.*',
    get_regex: /google.co.jp\/search.*[&?]q=(.*?)&/,
    delimiter: " "
  },
  ];

  var urls,hiturl;
  urls = [];
  for each (var cf in pushfind_configs) {
    urls.push(cf.url);
  }
  hiturl = "(" + urls.join("|") + ")";

  autocommands.add(
      'PageLoad',
      hiturl,
      function (args) {
        var words, res, hits, hs, pushwords;
        hs = storage['history-search'];
        for each (var cf in pushfind_configs) {
          pushwords = [];
          hits = (args.url.match(cf.get_regex));
          if (!hits || !hits[1]) {
            continue;
          }
          res = decodeURI(hits[1]).replace(/[　+]/g, cf.delimiter);
          if (!cf.delimiter) {
            words.push(res);
          } else {
            words = res.split(cf.delimiter);
          }
          for each (var w in words) {
            //空白文字列,重複,短い単語のskip
            if (!w || pushwords.indexOf(w) != -1 || w.length <= skip_char_num) {
              continue;
            }
            pushwords.push(w);
            /*
             * 最近のfindワードと被っていたらそれをpopする
             var l = hs.length;
             for (var j = l - 1; j >= l - recent_pop; j--) {
             if (hs.get(j) == words[i]) {
             }
             var w = hs.get(j);
             }
             */
          }
          if (is_reverse_push) {
            pushwords.reverse();
          }
          for (var i = 0; i < pushwords.length; i++) {
            hs.push(pushwords[i]);
          }
          // autocommandsの出力をクリア
          // 抑制方法がわからない
          break;
        }
        liberator.echomsg(is_echo_pushfind ? "pushfind: " + pushwords : "");
      }
  );
//  liberator.echomsg("pushfind: 4.1 loaded");
})();

// vim:sw=2 ts=2 et si fdm=marker:

