// ==VimperatorPlugin==
// @name           Fetch YouTube Video
// @description    Fetch YouTube Video (fmt=22)
// @license        Creative Commons 2.1 (Attribution + Share Alike)
// @version        1.0
// @author         anekos (anekos@snca.net)
// @minVersion     2.0pre
// @maxVersion     2.0pre
// ==/VimperatorPlugin==
//
// Usage:
//    :fetchyoutube
//      Download YouTube video to default download directory.
//      (pref: browser.download.dir)
//
// Links:
//    http://d.hatena.ne.jp/nokturnalmortum/20081118#1227004197

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
      if (!doc.location.href.match(/http:\/\/(?:[^.]+\.)?youtube\.com\/watch/))
        return;
      let filepath = arg.string;
      let dir = options.getPref('browser.download.dir');
      let as = content.document.defaultView.wrappedJSObject.swfArgs;
      let title = doc.title.replace(/^YouTube - /, '');
      let url = 'http://www.youtube.com/get_video?fmt=22&video_id=' + as.video_id + '&t=' + as.t;

      let dm = Cc["@mozilla.org/download-manager;1"].getService(Ci.nsIDownloadManager);
      let wbp = Cc["@mozilla.org/embedding/browser/nsWebBrowserPersist;1"].createInstance(Ci.nsIWebBrowserPersist);

      let file;
      if (filepath) {
        filepath = io.expandPath(filepath);
        file = io.getFile(filepath);
        if (file.isDirectory())
          file.appendRelativePath(title + '.mp4');
      } else {
        file = dm.userDownloadsDirectory;
        file.appendRelativePath(title + '.mp4');
      }
      if (file.exists())
        return liberator.echoerr('The file already exists! -> ' + file.path);
      file = makeFileURI(file);


      let dl = dm.addDownload(0, makeURL(url, null, null), file, title, null, null, null, null, wbp);
      wbp.progressListener = dl;
      wbp.persistFlags |= wbp.PERSIST_FLAGS_AUTODETECT_APPLY_CONVERSION;
      wbp.saveURI(makeURL(url), null, null, null, null, file);
      liberator.echo('maybe downloading started');
    }
    //fetch();

    commands.addUserCommand(
      ['fetchyoutube', 'fetchyt'],
      'fecth YouTube HD video',
      fetch,
      {argCount: '*', completer: completion.file},
      true
    );

})();

// vim:sw=2 ts=2 et si fdm=marker:

