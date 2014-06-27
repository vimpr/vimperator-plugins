
// PLUGIN_INFO {{{
let PLUGIN_INFO = xml`
<VimperatorPlugin>
  <name>PushFind</name>
  <name lang="ja">プッシュファインド</name>
  <description>push FIndHistory word searched on google</description>
  <description lang="ja">Google検索したワードをfindの履歴に放り込みます</description>
  <version>1.0</version>
  <author mail="hiro@elzup.com" homepage="blog.elzup.com">elzup</author>
  <minVersion>2.0pre</minVersion>
  <maxVersion>2.0pre</maxVersion>
  <detail lang="ja"><![CDATA[
  ]]></detail>
</VimperatorPlugin>`;
// }}}

(function () {

  autocommands.add(
      'PageLoad',
      'https:\/\/www.google.co.jp\/search.*',
      function (args) {
        var get_regex,delimiter,res,words;
        var hs = storage['history-search'];
        get_regex = /google.co.jp\/search.*[&?]q=(.*?)&/;
        delimiter = "+";
        res = args.url.match(get_regex);
        if (res[1]) {
          words = res[1].split(delimiter);
        }
        for (var i = 0; i < words.length; i++) {
          /*
           * 最近のfindワードと被っていたらそれをpopする
           var l = hs.length;
           for (var j = l - 1; j >= l - recent_pop; j--) {
           if (hs.get(j) == words[i]) {
           }
           var w = hs.get(j);
           }
           */
          hs.push(decodeURI(words[i]));
        }

        // autocommandsの出力をクリア
        // 抑制方法がわからない
        liberator.echomsg("");
      }
  );
})();

// vim:sw=2 ts=2 et si fdm=marker:

