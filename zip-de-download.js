let INFO =
<plugin name="zip-de-download" version="0.7.1"
        href=""
        summary="ZIPでダウンロードするお"
        xmlns="http://vimperator.org/namespaces/liberator">
  <author email="teramako@gmail.com">teramako</author>
  <license href="http://opensource.org/licenses/mit-license.php">MIT</license>
  <project name="Vimperator" minVersion="2.3"/>
  <p xmlns={XHTML}>
    特定ページの画像とかのURLを取ってきて一気にZIPにしてダウンロードするお
    <code style='font-family: sans-serif !important;'><![CDATA[
　　　　　　　　　　　　 ／）
　　　　　　　　　　　／／／）
　　　　　　　　　 ／,.=ﾞ''"／　　　
　　　／　　　　 i f　,.r='"-‐'つ＿＿＿_　　　こまけぇこたぁいいんだよ！！
　　/　　　　　 /　　　_,.-‐'~／⌒　　⌒＼
　　　　／　 　,i　　　,二ﾆ⊃（ ●）.　（●）＼
　　　/　 　　ﾉ　　　 ilﾞフ::::::⌒（__人__）⌒::::: ＼
　　　　　　,ｲ｢ﾄ､　　,!,!|　　　　　|r┬-|　　　　　|
　　　　　/　iﾄヾヽ_/ｨ"＼ 　　 　 `ー'´ 　 　 ／
    ]]></code>
  </p>
  <item>
    <tags>:zipd :zipdownload</tags>
    <spec>:zipd<oa>ownload</oa> <oa>-l<oa>ist</oa></oa> <oa>-f<oa>ilter</oa>=filter</oa> <a>downloadPath</a></spec>
    <description>
      <p>
        <a>downloadPath</a>へZIPでアーカイブする。
        <a>downloadPath</a>がディレクトリの場合、"ページタイトル.zip"となる。
        省略された場合、以下の順に値を見て、そのディレクトリへダウンロードされる。
        <ul>
          <li>g:zipDownloadDir (liberator.globalVariables.zipDownloadDir)</li>
          <li>browser.download.lastDir (Preference)</li>
          <li>ホームディレクトリ</li>
        </ul>
      </p>
      <p>
        <oa>-l<oa>ist</oa></oa>オプションを指定すると、ダウンロードされるURLをリストする。
        (ダウンロードはされない)
      </p>
      <p>
        <oa>-f<oa>ilter</oa></oa>オプションを指定すると、マッチするURLのアイテムのみダウンロードする。
      </p>
    </description>
  </item>
  <item>
    <tags>g:zipDownloadDir</tags>
    <spec><oa>g:</oa>zipDownloadDir</spec>
    <spec>liberator.globalVariables.zipDownloadDir</spec>
    <description>
      <p>ダウンロード先ディレクトリ。<a>downloadPath</a>を省略した場合に、使用される。</p>
      <p>例
        <code><ex>:let g:zipDownloadDir="~/downloads"</ex></code>
      </p>
    </description>
  </item>
  <item>
    <tags>g:zipDownloadFilter</tags>
    <spec><oa>g:</oa>zipDownloadFilter</spec>
    <spec>liberator.globalVariables.zipDownloadFilter</spec>
    <description>
      <p>デフォルトのフィルタ<a>filter</a>を省略した場合に、使用される。</p>
      <p>例
        <code><ex>:let g:zipDownloadFilter="\.(jpe?g|gif|png)$"</ex></code>
      </p>
    </description>
  </item>
  <item>
    <tags>plugins.zipDeDownload.SITE_INFO</tags>
    <spec>plugins.zipDeDownload.SITE_INFO</spec>
    <description>
      <p>
        ページ毎の設定。詳細はコードを見よ。(見れば分かると思う)
      </p>
    </description>
  </item>
</plugin>;

// FIXME: 将来的には、storageに入れるべき
// FIXME: あと、それぞれダウンロード先を指定できた方が良い(?)
// XXX: WeData化してもOK
let SITE_INFO = [
  {
    label: "みんくちゃんねる",
    site: "http://minkch\\.com/archives/.*\\.html",
    xpath: '//a[img[@class="pict"]]|//div/img[@class="pict"]',
    filter: "\\.(jpe?g|gif|png)$"
  }, {
    label: "カナ速",
    site: "http://kanasoku\\.blog82\\.fc2\\.com/blog-entry-.*\\.html",
    xpath: '//div[@class="entry_body"]//a[img]',
    filter: "\\.(jpe?g|gif|png)$"
  }, {
    label: "がぞう～速報",
    site: "http://stalker\\.livedoor\\.biz/archives/.*\\.html",
    xpath: '//div[@class="main" or @class="mainmore"]//a/img[@class="pict"]/..',
    filter: "\\.(jpe?g|gif|png)$"
  }, {
    label: "ギャルゲーブログ",
    site: "http://suiseisekisuisui\\.blog107\\.fc2\\.com/blog-entry-.*.html",
    xpath: '//div[@class="ently_text"]/a[img]',
    filter: "\\.(jpe?g|gif|png)$"
  }, {
    label: "わくてか速報",
    site: "http://blog\\.livedoor\\.jp/wakusoku/archives/.*\\.html",
    xpath: '//div[@class="article-body-inner" or @class="article-body-more"]//a[//img[@class="pict"]]',
    filter: "\\.(jpe?g|gif|png)$"
  }, {
    label: "らばＱ",
    site: "http://labaq\\.com/archives/.*\\.html",
    xpath: '//img[@class="pict"]',
  }, {
    labe: "【2ch】ニュー速クオリティ",
    site: "http://news4vip\\.livedoor\\.biz/archives/.*\\.html",
    xpath: '//a[img[@class="pict"]] | //div/img[@class="pict"]',
    filter: "\\.(jpe?g|gif|png)$"
  }, {
    label: "ねとねた",
    site: "http://vitaminabcdefg\\.blog6\\.fc2\\.com/blog-entry-.*\\.html",
    xpath: '//div[@class="mainEntryBody" or @class="mainEntryMore"]//a[img]',
    filter: "\\.(jpe?g|gif|png)$"
  }, {
    label: "PINK速報",
    site: "http://pinkimg\\.blog57\\.fc2\\.com/blog-entry-.*\\.html",
    xpath: '//div[@class="entry_text"]/a[img]',
    filter: "\\.(jpe?g|gif|png)$"
  }
];

(function(){
  // nsIZipWriter#open io-flags
  const PR_RDONLY      = 0x01;
  const PR_WRONLY      = 0x02;
  const PR_RDWR        = 0x04;
  const PR_CREATE_FILE = 0x08;
  const PR_APPEND      = 0x10;
  const PR_TRUNCATE    = 0x20;
  const PR_SYNC        = 0x40;
  const PR_EXCL        = 0x80;

  const mimeService = Cc["@mozilla.org/mime;1"].getService(Ci.nsIMIMEService);
  const zipWriter = Components.Constructor("@mozilla.org/zipwriter;1", "nsIZipWriter");

  function getFile(aFile){
    return liberator.modules.io.File(aFile);
  }
  function createChannel(url){
    return liberator.modules.services.get("io").newChannel(url, "UTF-8", null);
  }
  function getEntryName(uri, mimeType){
    let mime;
    try {
      mime = mimeService.getTypeFromURI(uri);
    } catch(e) {
      liberator.reportError(e);
    };
    let ext = mimeService.getPrimaryExtension(mime ? mime : mimeType, null)
    let name = uri.path.split("/").pop();
    name = (name ? name : "index") + (mime ? "" : "." + ext);
    return name;
  }
  function getDownloadDirectory(){
    let path = liberator.globalVariables.zipDownloadDir ||
               liberator.modules.options.getPref("browser.download.lastDir", null) ||
               liberator.modules.services.get("directory").get("Home", Ci.nsIFile).path;
    return getFile(path);
  }
  function fixFilename(filename){
    const badChars = /[\\\/:;\*\?\"\<\>\|\#]/g;
    return liberator.has('windows') ? filename.replace(badChars, '_') :  filename;
  }
  function getXPathFromExtensions(exts){
    function getXPath(elem){
      if (!elem)
        return '';

      // 連番かもしれない id は無視する
      let id = elem.getAttribute('id');
      if (id && !/\d/.test(id))
        return 'id("' + id + '")';

      return getXPath(elem.parentNode) + '/' + elem.tagName.toLowerCase();
    }

    let extPattern = RegExp('(' + exts.join('|')+')(\\W|$)');

    let links =
      Array.slice( content.document.querySelectorAll('a')).filter(
        function (link) (link.href && extPattern.test(link.href)));

    let xs = {};
    for each(let link in links){
      let xpath = getXPath(link);
      if (xs[xpath])
        xs[xpath]++;
      else
        xs[xpath] = 1;
    }

    let result = null, max = 0;
    for(let [xpath, count] in Iterator(xs)){
      if (count > max)
        [result, max] = [xpath, count];
    }
    return result;
  }
  function extensionValidator(vs)
    vs && vs.every(function (v) /^[\da-zA-Z]+$/.test(v));

  let self = {
    downloadZip: function(path, urls, comment, isAppend){
      let zipW = new zipWriter();
      urls = [url for each(url in urls)];
      liberator.assert(urls.length > 0, "None of URLs");

      if (!(/\.zip$/i).test(path)){
        path += ".zip";
      }
      let zipFile = getFile(path);
      if (isAppend && zipFile.exists()){
        zipW.open(zipFile, PR_RDWR | PR_APPEND);
      } else {
        zipW.open(zipFile, PR_RDWR | PR_CREATE_FILE | PR_TRUNCATE);
      }

      if (comment)
        zipW.comment = comment;

      let i = 0;
      for each(let url in urls){
        let ch = createChannel(url);
        try {
          let stream = ch.open();
          let entryName = ("000" + ++i).slice(-3) + "-" + getEntryName(ch.URI, ch.contentType);
          liberator.echomsg("zip: " + url + " to " + entryName, commandline.FORCE_SINGLELINE);
          zipW.addEntryStream(entryName, Date.now() * 1000, Ci.nsIZipWriter.COMPRESSION_DEFAULT, stream, false);
        } catch (e) {
          // XXX エラー分を通知すべき？
          liberator.log('zip-de-download: error: ' + e);
        }
      }
      zipW.close();
      return zipFile;
    },
    getInfoFromBuffer: function(){
      for each(data in SITE_INFO){
        let reg = new RegExp(data.site);
        if (reg.test(liberator.modules.buffer.URL)){
          return data;
        }
      }
      return null;
    },
    getURLs: function(info){
      let filter = new RegExp(info.filter || liberator.globalVariables.zipDownloadFilter || ".");
      let i = 0;
      for (let elm in liberator.modules.util.evaluateXPath(info.xpath, content.document)){
        let url;
        if (elm instanceof Ci.nsIDOMHTMLAnchorElement)
          url = elm.href;
        else if (elm instanceof Ci.nsIDOMHTMLImageElement)
          url = elm.src;
        else
          continue;

        if (filter.test(url))
          yield url;
      }
    },
    download: function(zipPath, listOnly, option){
      let info = this.getInfoFromBuffer() || {};
      if (option){
        let infoBuf = {};
        for (let key in info){
          infoBuf[key] = info[key];
        }
        for (let key in option){
          infoBuf[key] = option[key];
        }
        info = infoBuf;
      }
      liberator.assert(info.xpath, "not registered in SITE_INFO");

      let urls = this.getURLs(info);
      let title = fixFilename(liberator.modules.buffer.title);
      let comment = [title, liberator.modules.buffer.URL].join("\n");
      let file;
      if (!zipPath){
        file = getDownloadDirectory();
        file.append(title + ".zip");
      } else {
        file = getFile(zipPath);
        if (file.exists() && file.isDirectory()){
          file.append(title + ".zip");
        }
      }
      if (listOnly){
        return [file, urls, comment];
      }
      return this.downloadZip(file.path, urls, comment, info.append);
    }
  };

  // ---------------------------------------------------
  // Commands
  // ---------------------------------------------------
  liberator.modules.commands.addUserCommand(
    ["zipd[ownload]"], "download and archive to ZIP",
    function (arg){
      let option = {}
      option.append = ("-append" in arg);
      if ("-auto-detect" in arg){
        option.xpath = getXPathFromExtensions(arg["-auto-detect"]);
      }
      if ("-xpath" in arg){
        option.xpath = arg["-xpath"];
      }
      if ("-filter" in arg){
        option.filter = arg["-filter"];
      }
      if ("-list" in arg){
        let [file, urls, comment] = self.download(arg[0], true, option);
        let xml = <>
          <h1><span>Download :</span><span>{file.path}</span></h1>
          <p>{comment}</p>
          <ol>
            {liberator.modules.template.map(urls, function(url) <li>{url}</li>)}
          </ol>
          <br/>
        </>;
        liberator.echo(xml, true);
        return;
      }
      liberator.echo("Started DownloadZip");
      setTimeout(function () {
        let zipFile = self.download(arg[0], false, option);
        liberator.echo("Completed DownloadZip: " + zipFile.path);
      }, 0);
    }, {
      argCount: "?",
      literal: true,
      options: [
        [["-list", "-l"], liberator.modules.commands.OPTION_NOARG],
        [["-append", "-a"], liberator.modules.commands.OPTION_NOARG],
        [["-xpath", "-x"], liberator.modules.commands.OPTION_STRING],
        [["-auto-detect", "-d"], liberator.modules.commands.OPTION_LIST, extensionValidator,
         [["jpeg,jpg,png", "images"]]],
        [["-filter", "-f"], liberator.modules.commands.OPTION_STRING]
      ],
      completer: liberator.modules.completion.file
    }, true);

  util.extend(__context__, self);
})();
// vim: sw=2 ts=2 et:
