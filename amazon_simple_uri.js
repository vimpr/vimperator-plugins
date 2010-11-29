// PLUGIN_INFO//{{{
var PLUGIN_INFO =
<VimperatorPlugin>
  <name>amazon_simple_uri</name>
  <description>Copy Amazon Simple URI.</description>
  <description lang="ja">シンプルなAmazon URIをクリップボードにコピーします。</description>
  <author mail="from.kyushu.island@gmail.com" homepage="http://iddy.jp/profile/from_kyushu">from_kyushu</author>
  <version>0.1</version>
  <license>GPL</license>
  <minVersion>1.2</minVersion>
  <maxVersion>2.1</maxVersion>
  <updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/amazon_simple_uri.js</updateURL>
  <detail><![CDATA[

== Option ==
>||
  let g:amazon_asamashi = "hogehoge-22"
||<
と設定することにより、Amazon アソシエイトID(上の例ではhogehoge-22)をURLに追加します。

  ]]></detail>
</VimperatorPlugin>;
//}}}
//
(function()
{
  // URLを正規表現でチェックしてISBNっぽい10桁,13桁の数字と取り出す
  function getIsbn(uri)
  {
    var regex = new RegExp("([0-9]{9,13}[0-9Xx])");
    var match = uri.match(regex);
    var isbn = match[0];
    if (isbn.length == 13)
    {
      isbn = getIsbn10(isbn);
    }
    return isbn;
  }

  // SSBのAPIを使ってISBNから書籍情報を取得
  function getBookInfo(isbn)
  {
    var uri = "http://stack.nayutaya.jp/api/book/";
    if (isbn.length == 10)
    {
      uri += "isbn10/" + isbn + ".json";
    }
    else if (isbn.length == 13)
    {
      uri += "isbn13/" + isbn + ".json";
    }
    var xhr = new XMLHttpRequest();
    xhr.open('GET', uri, false);
    xhr.send(null);
    if (xhr.status != 200) {
        liberator.echoerr('false');
        return;
    }
    return window.eval('(' + xhr.responseText + ')');
  }

  //SSBのAPIから書籍情報を取り、そこからISBN10を取得
  function getIsbn10(isbn13)
  {
    var info = getBookInfo(isbn13);
    return info.response.book.isbn10;
  }

  commands.addUserCommand(
    ['amazoncopy','asc'],
    'Copy Amazon Short URI',
    function(args)
    {
      var asin = window.content.document.getElementById('ASIN');
      // ASINが取得できなかった場合 / Amazon以外の書籍情報ページから取得する場合
      if (asin == null)
      {
        asin = getIsbn(buffer.URL);
      }
      else
      {
        asin = asin.value
      }

      var uri = "http://www.amazon.co.jp/dp/" + asin + "/";
      var asamashi = typeof liberator.globalVariables.amazon_asamashi == "undefined" ? '' : liberator.globalVariables.amazon_asamashi;
      if (args == "+a")
      {
        uri += asamashi;
      }
      util.copyToClipboard(uri);
      liberator.echo("[ASC] Copy to clipboard.");
    }
  );
})();
