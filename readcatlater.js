/* {{{
Copyright (c) 2008-2011, anekos.
All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

    1. Redistributions of source code must retain the above copyright notice,
       this list of conditions and the following disclaimer.
    2. Redistributions in binary form must reproduce the above copyright notice,
       this list of conditions and the following disclaimer in the documentation
       and/or other materials provided with the distribution.
    3. The names of the authors may not be used to endorse or promote products
       derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF
THE POSSIBILITY OF SUCH DAMAGE.


###################################################################################
# http://sourceforge.jp/projects/opensource/wiki/licenses%2Fnew_BSD_license       #
# に参考になる日本語訳がありますが、有効なのは上記英文となります。                #
###################################################################################

}}} */

// PLUGIN_INFO {{{
var PLUGIN_INFO = xml`
<VimperatorPlugin>
  <name>Read Cat Later</name>
  <description>Read it later</description>
  <description lang="ja">後で読む</description>
  <version>1.1.5</version>
  <author mail="anekos@snca.net" homepage="http://d.hatena.ne.jp/nokturnalmortum/">anekos</author>
  <license>new BSD License (Please read the source code comments of this plugin)</license>
  <license lang="ja">修正BSDライセンス (ソースコードのコメントを参照してください)</license>
  <updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/readcatlater.js</updateURL>
  <minVersion>2.4</minVersion>
  <maxVersion>3.0</maxVersion>
  <detail><![CDATA[
    == Usage ==
      :readcatlater [TAG]:
      :rcl:
        Add current URL to read-it-later list.

      :readcatnow URL:
      :rcn URL:
        Open the URL and delete from bookmarks.
        When used with "!", delete the URL from bookmarks.

    == Link ==
       http://d.hatena.ne.jp/nokturnalmortum/20080918#1221729188
  ]]></detail>
  <detail lang="ja"><![CDATA[
    == Usage ==
      :readcatlater [タグ]:
      :rcl:
        現在のURLを後で読むリストに追加する。

      :readcatnow [-n=開く数] URL:
      :rcn URL:
        そのURLを開いて、ブックマークから削除する。
        "!" 付きの場合は、ブックマークから削除する。

    == Link ==
       http://d.hatena.ne.jp/nokturnalmortum/20080918#1221729188
  ]]></detail>
</VimperatorPlugin>`;
// }}}

(function () {
  // このプラグインでブックマークしたときに必ずつくタグ
  const RCL_TAG = 'readcatlater';
  // このプラグインが保存するブックマークのフォルダ名
  // 変更しても良いし、場所を移動しても平気である。
  const FOLDER_NAME = 'L';
  // 逆順表示
  const REVERSE = eval(liberator.globalVariables.readcatlater_reverse || 'false');

  let prefs = {
    prefix: 'extensions.vimperator.plugins.readcatlater.',

    prefs: Components.classes["@mozilla.org/preferences-service;1"].
             getService(Components.interfaces.nsIPrefBranch),

    get: function (name, def) {
      var name, type;
      try {
        const nsIPrefBranch = Components.interfaces.nsIPrefBranch;
        name = this.prefix + name;
        type = this.prefs.getPrefType(name);
        switch (type) {
          case nsIPrefBranch.PREF_STRING:
            try {
              return this.prefs.getComplexValue(name, Components.interfaces.nsISupportsString).data;
            } catch (e) {
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
          let str = Cc['@mozilla.org/supports-string;1'].
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


  const tagssvc = Cc["@mozilla.org/browser/tagging-service;1"].
                      getService(Ci.nsITaggingService);
  const IOService = Cc["@mozilla.org/network/io-service;1"].
                      getService(Ci.nsIIOService);
  const myURI = IOService.newURI("http://www.mozilla.com", null, null);
  const bookmarks = Cc["@mozilla.org/browser/nav-bookmarks-service;1"].
                      getService(Ci.nsINavBookmarksService);
  const history = Cc["@mozilla.org/browser/nav-history-service;1"].
                    getService(Ci.nsINavHistoryService);

  let folderId = prefs.get('folderId', false);

  if (!folderId) {
    folderId = bookmarks.createFolder(bookmarks.toolbarFolder, FOLDER_NAME, bookmarks.DEFAULT_INDEX);
    prefs.set('folderId', folderId);
  }

  /*
  // Get an array of tags for a URI
  let myTags = tagssvc.getTagsForURI(myURI, {});
  // Get an array of URIs for a tag
  let taggedURIs = tagssvc.getURIsForTag("mozilla");
  // Get an array of all tags
  let arrayOfAllTags = tagssvc.allTags;
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
    var title = doc.title || loc;
    var uri = makeURI(loc);
    var bkmk = bookmarks.insertBookmark(folderId, uri, bookmarks.DEFAULT_INDEX, title);
    tags.push(RCL_TAG);
    tagssvc.tagURI(uri, tags);
    return title;
  }

  function splitBySpaces (str) {
    return [it for each (it in str.split(/\s+/)) if (/\w/.test(it))];
  }

  function RCL_Bookmarks () { try {
    let query = history.getNewQuery();
    query.setFolders([folderId], 1);

    let result = [];
    let qres = history.executeQueries([query], 1, history.getNewQueryOptions());
    let folderNode = qres.root;

    let closeOriginally = !folderNode.containerOpen;
    if (closeOriginally)
      folderNode.containerOpen = true;

    for (let i = 0; i < folderNode.childCount; ++i) {
      let node = folderNode.getChild(i);
      if (PlacesUtils.nodeIsBookmark(node)) {
        let it = {id:    node.itemId,
                  title: node.title,
                  URI:   node.uri };
        result.push(it);
      }
    }

    if (closeOriginally)
      folderNode.containerOpen = false;

    return liberator.globalVariables.readcatlater_reverse ? result.reverse() : result;
  } catch (e) { liberator.log(e); } }

  function completer (context, arg) {
    context.compare = void 'meow';
    context.title = ['URL', 'Title'];
    context.filters = [CompletionContext.Filter.textDescription];
    context.completions = RCL_Bookmarks().
                            filter(function (it) it.id).
                            map(function (it) [it.URI, bookmarks.getItemTitle(it.id)]).
                            reverse();
  }

  function removeItems (uri) {
    if (typeof uri === 'number') {
      bookmarks.removeItem(uri);
      return true;
    }
    if (typeof uri === 'object') {
      bookmarks.removeItem(uri.id);
      return true;
    }
    var removed = false;
    for each (let id in bookmarks.getBookmarkIdsForURI(makeURI(uri), {}))
    if (id && (folderId == bookmarks.getFolderIdForItem(id))) {
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
    function (args) {
      var res = addEntry(window.content.document, splitBySpaces(args.string));
      if (res)
        liberator.echo('"' + buffer.title + '" was added');
      else
        liberator.echo("this URI already exists!?");
    },
    {},
    true
  );

  commands.addUserCommand(
    ['readcatnow', 'rcn'],
    'read cat now',
    function (arg) {
      let opennum = arg['-number'];
      if (opennum) {
        let us = RCL_Bookmarks(arg.literalArg).splice(0, opennum).map(function (it) it);
        liberator.open(us.map(function (it) it.URI), liberator.NEW_BACKGROUND_TAB);
        if (!arg.bang) {
          us.forEach(removeItems);
          liberator.echo(us.length + ' items were removed.');
        }
      } else {
        let uri = arg.string;
        openURI(uri);
        if (!arg.bang && removeItems(uri))
          liberator.echo('"' + uri + '" was removed.');
      }
    },
    {
      literal: 0,
      options: [ [['-number', '-n'], commands.OPTION_INT] ],
      completer: completer
    },
    true
  );

  commands.addUserCommand(
    ['deletecatnow', 'dcn'],
    'delete cat now',
    function (arg) {
      let uri = arg.string;
      if (removeItems(uri))
        liberator.echo('"' + uri + '" was removed.');
    },
    {
      completer: completer
    },
    true
  );

})();
