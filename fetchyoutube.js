// ==VimperatorPlugin==
// @name           Fetch YouTube Video
// @description    Fetch YouTube Video (fmt=22)
// @license        Creative Commons 2.1 (Attribution + Share Alike)
// @version        1.1.1
// @author         anekos (anekos@snca.net)
// @minVersion     2.3pre
// @maxVersion     2.3pre
// ==/VimperatorPlugin==
//
// Usage:
//    :fetchyoutube
//      Download YouTube video to default download directory.
//      (pref: browser.download.dir)
//
// Links:
//    http://d.hatena.ne.jp/nokturnalmortum/20081118#1227004197
//
// Refs:
//    http://creazy.net/2008/11/another_way_to_find_youtube_hd_file.html

(function () {

    function fixFilename (filename) {
      const badChars = /[\\\/:;*?"<>|]/g;
      return filename.replace(badChars, '_');
    }

    function makeFile (s) {
      var file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
      file.initWithPath(s);
      return file;
    }

    function makeURL (s) {
      var url = Cc["@mozilla.org/network/standard-url;1"].createInstance(Ci.nsIURL);
      url.spec = s;
      return url;
    }

    function fetch (arg) {
      let doc = content.document;
      if (!doc.location.href.match(/^http:\/\/(?:[^.]+\.)?youtube\.com\/watch/))
        return;
      let filepath = arg.string;
      let as = content.document.defaultView.wrappedJSObject.swfArgs;
      let title = doc.title.replace(/^YouTube - /, '');
      // XXX 今が、fmt=22 じゃなかったら確認した方が良い？
      let fmt = /^22/.test(as.fmt_map) ? '22' : '18';
      let url = 'http://www.youtube.com/get_video?fmt=' + fmt + '&video_id=' + as.video_id + '&t=' + as.t;

      let dm = Cc["@mozilla.org/download-manager;1"].getService(Ci.nsIDownloadManager);
      let wbp = Cc["@mozilla.org/embedding/browser/nsWebBrowserPersist;1"].createInstance(Ci.nsIWebBrowserPersist);

      let file;
      if (filepath) {
        file = io.File(io.expandPath(filepath));
      } else {
        file = dm.userDownloadsDirectory;
      }
      if (file.isDirectory())
        file.appendRelativePath(fixFilename(title) + '.mp4');
      if (file.exists())
        return liberator.echoerr('The file already exists! -> ' + file.path);
      file = makeFileURI(file);


      let dl = dm.addDownload(0, makeURL(url, null, null), file, title, null, null, null, null, wbp);
      wbp.progressListener = dl;
      wbp.persistFlags |= wbp.PERSIST_FLAGS_AUTODETECT_APPLY_CONVERSION;
      wbp.saveURI(makeURL(url), null, null, null, null, file);
      liberator.echo('maybe downloading started');
    }

    commands.addUserCommand(
      ['fetchyoutube', 'fetchyt'],
      'fecth YouTube HD video',
      fetch,
      {argCount: '*', completer: function (context) completion.file(context)},
      true
    );

    // fetch({});

})();

// vim:sw=2 ts=2 et si fdm=marker:

