// ==VimperatorPlugin==
// @name           Read Cat Later
// @description-ja Read It Later 的な物
// @license        Creative Commons 2.1 (Attribution + Share Alike)
// @version        0.2
// ==/VimperatorPlugin==
//
// Usage:
//    :readcatlater [タグ]
//    :rcl
//    で、現在のURLを後で読むリストに追加する。
//
//    :readcatnow タイトル
//    :rcn タイトル
//    で、そのURLを開く。
//    ! 付きの場合は、開いた後にブックマークから削除する。
//
// License:
//    http://creativecommons.org/licenses/by-sa/2.1/jp/
//    http://creativecommons.org/licenses/by-sa/2.1/jp/deed.en_CA
//
// Link:
//    http://d.hatena.ne.jp/nokturnalmortum/20080918#1221729188

(function () { try{
  liberator.log('readcatlater.js loading');
  
  // このプラグインでブックマークしたときに必ずつくタグ
  const RCL_TAG = 'readcatlater'; 
  // このプラグインが保存するブックマークのフォルダ名
  // 変更しても良いし、場所を移動しても平気である。
  const FOLDER_NAME = 'L';
  // 逆順表示
  const REVERSE = eval(liberator.globalVariables.readcatlater_reverse || 'false');

  var prefs = {
    prefix: 'extensions.vimperator.plugins.readcatlater.',

    prefs: Components.classes["@mozilla.org/preferences-service;1"].
             getService(Components.interfaces.nsIPrefBranch),

    get: function (name, def) {
      try {
      var name = this.prefix + name;
      var type = this.prefs.getPrefType(name);
      const nsIPrefBranch = Components.interfaces.nsIPrefBranch;
        switch (type) {
          case nsIPrefBranch.PREF_STRING:
            try {
              return this.prefs.getComplexValue(name, Components.interfaces.nsISupportsString).data;
            }
            catch (e) {
              this.prefs.getCharPref(name);
            }
            break;
          case nsIPrefBranch.PREF_INT:
            return this.prefs.getIntPref(name);
            break;
          case nsIPrefBranch.PREF_BOOL:
            return this.prefs.getBoolPref(name);
          default:
            return def;
        }
      } catch (e) {
        return def;
      }
    },

    set: function (name, value, type) {
      var name = this.prefix + name;
      switch (type || typeof value) {
        case 'string':
          var str = Cc['@mozilla.org/supports-string;1'].
                      createInstance(Ci.nsISupportsString);
          str.data = value;
          return this.prefs.setComplexValue(name, Components.interfaces.nsISupportsString, str);
        case 'boolean':
          return this.prefs.setBoolPref(name, value);
        case 'number':
          return this.prefs.setIntPref(name, value);
        default:
          alert('unknown pref type');
      }
    },
  };


  const migemo = Cc['@piro.sakura.ne.jp/xmigemo/factory;1'].
                   getService(Components.interfaces.pIXMigemoFactory).
                   getService("ja");
  const tagssvc = Cc["@mozilla.org/browser/tagging-service;1"].
                      getService(Ci.nsITaggingService);
  const IOService = Cc["@mozilla.org/network/io-service;1"].
                      getService(Ci.nsIIOService);
  const myURI = IOService.newURI("http://www.mozilla.com", null, null);
  const bookmarks = Cc["@mozilla.org/browser/nav-bookmarks-service;1"].
                      getService(Ci.nsINavBookmarksService);
  const history = Cc["@mozilla.org/browser/nav-history-service;1"].
                    getService(Ci.nsINavHistoryService);

  var [folderId, folderGUID] = [prefs.get('folderId', false), prefs.get('folderGUID', false)];

  if (!(folderGUID && folderId && (folderId == bookmarks.getItemIdForGUID(folderGUID)))) {
    folderId = bookmarks.createFolder(bookmarks.toolbarFolder, FOLDER_NAME, bookmarks.DEFAULT_INDEX);    
    prefs.set('folderId', folderId);
    prefs.set('folderGUID', bookmarks.getItemGUID(folderId));
  }

  /*
  // Get an array of tags for a URI
  var myTags = tagssvc.getTagsForURI(myURI, {});
  // Get an array of URIs for a tag
  var taggedURIs = tagssvc.getURIsForTag("mozilla");
  // Get an array of all tags
  var arrayOfAllTags = tagssvc.allTags;
  // Remove tags from a URI
  tagssvc.untagURI(myURI, ["mozilla", "firefox"]);
  */

  function openURI (uri) {
    if (window.content.document.location.href == 'about:blank') {
      window.loadURI(uri);
    } else {
      if ('delayedOpenTab' in window)
        window.delayedOpenTab(uri, null);
      else
        window.getBrowser().addTab(uri, null);
    }
  }

  function makeURI (uri) {
    return IOService.newURI(uri, null, null);
  }

  function addEntry (doc, tags) {
    var loc = doc.location.href;
    //履歴の物が検出されてしまう。
    //if (bookmarks.isBookmarked(makeURI(loc)))
    //  return;
    var title = doc.title || loc;
    var uri = makeURI(loc);
    var bkmk = bookmarks.insertBookmark(folderId, uri, bookmarks.DEFAULT_INDEX, title);
    tags.push(RCL_TAG);
    tagssvc.tagURI(uri, tags);
    return title;
  }

  function splitBySpaces (str) {
    return [it for each (it in str.split(/\s+/)) if (it.match && it.match(/\w+/))];
  }

  function RCL_Bookmarks (terms) { try{
    var query = history.getNewQuery();
    query.setFolders([folderId], 1);

    if (terms) {
      var ts = splitBySpaces(terms).map(function (it) {
        var re = new RegExp(migemo.getRegExp(it), 'i');
        var f = function (it) re.exec(it);
        return {s: it, r: f};
      });
      var m = function (it) {
        for each (var t in ts) {
          if ((it.URI.indexOf(t.s) >= 0)   ||  
              (it.title.indexOf(t.s) >= 0) ||
              (t.r(it.URI)) ||
              (t.r(it.title)) )
            return true;
        }
      };
    } else {
      var m = function () true;
    }

    var result = [];
    var qres = history.executeQueries([query], 1, history.getNewQueryOptions());
    var folderNode = qres.root;

    var closeOriginally = !folderNode.containerOpen;
    if (closeOriginally)
      folderNode.containerOpen = true;

    for (var i = 0; i < folderNode.childCount; ++i) {
      var node = folderNode.getChild(i);
      if (PlacesUtils.nodeIsBookmark(node)) {
        var it = {id:    node.itemId,
                  title: node.title,
                  URI:   node.uri };
        if (m(it))
          result.push(it);
      }
    }

    if (closeOriginally)
      folderNode.containerOpen = false;

    return liberator.globalVariables.readcatlater_reverse ? result.reverse() : result;
  }catch(e){ liberator.log(e); }}

  function completer (args) {
    try{
      var cs = [ [it.URI, bookmarks.getItemTitle(it.id)] for each (it in RCL_Bookmarks(args)) if (it.id) ];
      return [0, cs]
    } catch(e) { liberator.log(e); }
  } 

  function removeItems (uri) {
    var removed = false;
    for each (var id in bookmarks.getBookmarkIdsForURI(makeURI(uri), {})) 
      if (folderId == bookmarks.getFolderIdForItem(id)) {
        removed = true;
        bookmarks.removeItem(id);
      }
    return removed;
  }

  /********************************************************************************
  * Add Command
  ********************************************************************************/

  commands.addUserCommand(
    ['readcatlater', 'rcl'],
    'read cat later',
    function (args, _, num, extra) {
      // for HEAD
      if (args.string != undefined)
        args = args.string;
      var res = addEntry(window.content.document, splitBySpaces(args)); // FIXME
      if (res)
        liberator.echo('"' + title + '" was added');
      else
        liberator.echo("this URI already exists!?");
    },
    {}
  );

  commands.addUserCommand(
    ['readcatnow', 'rcn'],
    'read cat now',
    function (uri, bang, num, extra) {
      // for HEAD
      if (uri.string != undefined)
        uri = uri.string;
      openURI(uri);
      if (!bang && removeItems(uri))
        liberator.echo('"' + uri + '" was removed.'); 
    },
    { 
      completer: completer
    }
  );

  commands.addUserCommand(
    ['deletecatnow', 'dcn'],
    'delete cat now',
    function (uri, bang, num, extra) {
      if (removeItems(uri))
        liberator.echo('"' + uri + '" was removed.'); 
    },
    { 
      completer: completer
    }
  );

  liberator.log('readcatlater.js loaded');

}catch(e){ liberator.log(e); }})();

