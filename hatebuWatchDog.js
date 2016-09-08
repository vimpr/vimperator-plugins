//
//  hatebuWatchDog.js     - hatena bookmark watch dog -
//
// LICENSE: {{{
//
// This software distributable under the terms of an MIT-style license.
//
// Copyright (c) 2009 snaka<snaka.gml@gmail.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//
// OSI page : http://opensource.org/licenses/mit-license.php
// Japanese : http://sourceforge.jp/projects/opensource/wiki/licenses%2FMIT_license
//
// }}}
// PLUGIN INFO: {{{
var PLUGIN_INFO = xml`
<VimperatorPlugin>
  <name>{NAME}</name>
  <description>Make notify hatebu-count when specified site's hatebu-count changed.</description>
  <description lang="ja">指定されたサイトのはてブ数を監視、変動があったらお知らせします。</description>
  <minVersion>2.0pre</minVersion>
  <maxVersion>2.2pre</maxVersion>
  <updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/hatebuWatchDog.js</updateURL>
  <author mail="snaka.gml@gmail.com" homepage="http://vimperator.g.hatena.ne.jp/snaka72/">snaka</author>
  <license>MIT style license</license>
  <version>1.3.0</version>
  <detail><![CDATA[
    == Subject ==
      Make notify hatebu-count when specified site's hatebu-count changed.
      Usage is just put this script into vimperator's plugin directory.

    == Global variables ==
      g:hatebuWatchDogInterval:
        Number. Watching interval. Default:600 Min:60
      g:hatebuWtachDogTargets:
        String. Sites where it wants you to watch.
        If you want watch only one site, you should specify like following.
        >||
          :let g:hatebuWatchDogTargets = "http://d.hatena.ne.jp/snaka72/"
        ||<
        If you want watch more than one site, you should specify like following.
        >||
          :let g:hatebuWatchDogTargets = "['http://d.hatena.ne.jp/snaka72/', 'http://vimperator.g.hatena.ne.jp/snaka72/']"
        ||<
      g:hatebuWatchDogAlways:
        Boole. Make notify every time. (for debug) Default:false

  ]]></detail>
  <detail lang="ja"><![CDATA[
    == 概要 ==
      指定されたサイトの被はてブ数を監視して、その数値に変動があったらお知らせします。
      使い方は、このスクリプトをVimperatorのpluginディレクトリに格納するだけです。

    == グローバル変数 ==
      g:hatebuWatchDogInterval:
        Number. 監視の間隔(秒). デフォルト600 設定可能な最小値:60
      g:hatebuWtachDogTargets:
        String. Sites where it wants you to watch
        監視対象のサイトが一つだけの場合は以下のように設定します。
        >||
          :let g:hatebuWatchDogTargets = "http://d.hatena.ne.jp/snaka72/"
        ||<
        監視対象のサイトがが複数の場合は以下のように設定します。
        >||
          :let g:hatebuWatchDogTargets = "['http://d.hatena.ne.jp/snaka72/', 'http://vimperator.g.hatena.ne.jp/snaka72/']"
        ||<
      g:hatebuWatchDogAlways:
        Boole. 毎回報告を挙げるかどうか。デフォルト:false （主にでバッグ用）

    == ToDo ==
      - 新着ブックマークのユーザidとコメントの表示
      - 監視フレームワークにのっける

    ]]></detail>
  </VimperatorPlugin>`;
// }}}

// Clear all watchers if started watcher exists.
if (liberator.plugins.hatebuWatchDog && liberator.plugins.hatebuWatchDog.stopWatching)
  liberator.plugins.hatebuWatchDog.stopWatching();

let publics = liberator.plugins.hatebuWatchDog = (function() {
  // PRIVATE //////////////////////////////////////////////////////////////{{{
  const libly = liberator.plugins.libly;
  let previousValue = 0;
  let tasks = [];

  function getCurrentValue(target, onSuccess, onFailure) {
    // build hatebu xml-rpc request
    let req = new libly.Request(
      'http://b.hatena.ne.jp/xmlrpc',
      {
        'Content-Type' : 'text/xml'
      },{
        postBody : <methodCall>
                     <methodName>bookmark.getTotalCount</methodName>
                     <params>
                       <param><value><string>{target}</string></value></param>
                     </params>
                   </methodCall>.toXMLString()
      }
    );

    let currentValue;
    req.addEventListener("success", function(data) {
      liberator.log("XML-RPC request was succeeded.");
      let resXml = new XML(data.responseText.replace(/^<\?xml version[^>]+?>/, ''));
      currentValue = window.eval(resXml..int.toString());
      onSuccess(currentValue);
    });
    req.addEventListener("failure", function(data) {
      onFailure();
    });
    liberator.log("reauest...");
    req.post();
    liberator.log("done...");
  }

  function notifyAlways()
    window.eval(liberator.globalVariables.hatebuWatchDogAlways) || false;

  function showHatebuNotification(targetSite, currentValue, delta) {
    let title = delta >= 0
              ? "hatebuWatchDog\u304B\u3089\u306E\u304A\u77E5\u3089\u305B"  // ordinary notification
              : "\u6B8B\u5FF5\u306A\u304A\u77E5\u3089\u305B"                // bad notification
    let suffix = delta != 0 ? "\u306B\u306A\u308A\u307E\u3057\u305F\u3002"
                            : "\u3067\u3059\u3002";
    let message = "'" + targetSite + "' \u306E\u88AB\u306F\u3066\u30D6\u6570\u306F '" +
                  currentValue + "' " + suffix + " (" + getSignedNum(delta) + ")";

    (getNotifier())(title, message, growlIcon);
  }

  function getSignedNum(num) {
    if (num > 0) return "+" + num;
    if (num < 0) return "-" + Math.abs(num);
    return "0";
  }

  let _notifier = null;
  const GROWL_EXTENSION_ID = "growlgntp@brian.dunnington";

  function getNotifier() {
    if (_notifier) return _notifier;

    if (Application.extensions.has(GROWL_EXTENSION_ID) &&
        Application.extensions.get(GROWL_EXTENSION_ID).enabled) {
      _notifier = publics.notify;
    }
    else {
      _notifier = showAlertNotification;
    }
    return _notifier;
  }

  function showAlertNotification(title, message, icon) {
    liberator.dump("icon:" + icon);
    Cc['@mozilla.org/alerts-service;1']
    .getService(Ci.nsIAlertsService)
    .showAlertNotification(
      null, //'chrome://mozapps/skin/downloads/downloadIcon.png',
      title,
      message
    );
  }

  function growl() Components.classes['@growlforwindows.com/growlgntp;1']
                   .getService().wrappedJSObject;
  const growlIcon = "http://img.f.hatena.ne.jp/images/fotolife/s/snaka72/20090608/20090608045633.gif";  // temporary

  function growlRegister() {
    growl().register(
      PLUGIN_INFO.name,
      growlIcon,
      [
        {name: 'announce', displayName: 'Announce from hatebuWatchDog'},
        {name: 'sadlynews',displayName: 'Sadly announce from hatebuWatchdog'},
        {name: 'failed',   displayName: 'Erroer report from hatebuWatchdog'}
      ]
    );
  }

  function getInterval()
    window.eval(liberator.globalVariables.hatebuWatchDogInterval) || 600; // default : 10 min.

  // for debug
  let log  = liberator.log;
  let dump = liberator.dump;

  // }}}
  // PUBLIC ///////////////////////////////////////////////////////////////{{{
  let self = {
    startWatching: function() {
      let targets;
      try {
        targets = window.eval(liberator.globalVariables.hatebuWatchDogTargets);
      } catch(e) {
        targets = liberator.globalVariables.hatebuWatchDogTargets;
      }
      if (targets) {
        if (!(targets instanceof Array))
          targets = [targets];
        let i = 1, delay = 5000;
        log("before setTimeout()");
        targets.forEach(function(targetSite) {
            setTimeout(function() {
              publics.addTask({site : targetSite});
            }, delay * i++);
        });
        log("after setTimeout()");
      }
      else {
        liberator.echoerr("Please set g:hatebeWatchDogTargets before watching().");
      }
    },

    addTask: function(target) {
      dump(target.site);
      const MINUTE = 60; // sec.
      interval = getInterval() || (10 * MINUTE);       // default 10 min.
      interval = Math.max(interval, MINUTE);      // lower limt is 1 min.

      // initialize previous value
      target.previousValue = 0;
      target.initialize = true;
      publics.watching(target);

      // set watching interval
      tasks.push(setInterval(publics.watching, 1000 * interval, target));
      dump({target: target, interval: interval});
    },

    clearAllTasks: function() {
      tasks.forEach(function(task) {
          clearInterval(task);
      });
      tasks = [];
      dump("watch dog is sleeping...");
    },

    watching: function(target) {
      dump("watching...");
      dump(target);

      getCurrentValue(
        target.site,
        function(currentValue) {
          if (target.initialize) {
            target.initialize = false;
            target.previousValue = currentValue;
            return;
          }
          let delta =  currentValue - target.previousValue;
          if (delta || notifyAlways()) {
            showHatebuNotification(target.site, currentValue, delta);
          }
          target.previousValue = currentValue;
          if (delta > 0) {
            liberator.dump("***hoge");
            self.getBookmarklistByURL(target.site)
            .slice(0, delta)
            .forEach(function(item)
                      self.reportBookmarkedItem(self.parseBookmarkItem(item)));
          }
        },
        function() {
          liberator.echoerr("Cannot get current value.");
        }
      );
    },

    notify: function(title, message) {
      growlRegister();
      growl().notify(
        PLUGIN_INFO.name,
        'announce',
        title,
        message
      );
    },

    getBookmarkListRss: function(url) {
      return util.httpGet("http://b.hatena.ne.jp/bookmarklist.rss?url=" + encodeURIComponent(url));
    },

    getBookmarklistByURL: function(url) {
      liberator.dump("********** getBookmarklistByURL");
      let res = util.httpGet('http://b.hatena.ne.jp/bookmarklist.rss?url=' + encodeURIComponent(url));
      liberator.dump(res);
      return self.evaluateXPath("//rss:item", res.responseXML, self.nsResolver);
    },

    nsResolver: {
        lookupNamespaceURI: function(pfx) (({
          'rdf'         : "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
          'content'     : "http://purl.org/rss/1.0/modules/content/",
          'taxo'        : "http://purl.org/rss/1.0/modules/taxonomy/",
          'opensearch'  : "http://a9.com/-/spec/opensearchrss/1.0/",
          'dc'          : "http://purl.org/dc/elements/1.1/",
          'hatena'      : "http://www.hatena.ne.jp/info/xmlns#",
          'media'       : "http://search.yahoo.com/mrss"
        })[pfx] || 'http://purl.org/rss/1.0/')
    },

    // reffered  _libly.js
    evaluateXPath: function(xpath, context, nsresolver) {
      if (!xpath) return [];

      var ret = [];
      context = context || window.content.document;
      var nodesSnapshot = (
        context.ownerDocument ||
        context
      ).evaluate(
        xpath,
        context,
        nsresolver || self.nsResolver,
        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
        null
      );

      for (let i = 0, l = nodesSnapshot.snapshotLength; i < l; i++) {
          ret.push(nodesSnapshot.snapshotItem(i));
      }
      return ret;
    },

    parseBookmarkItem: function(item) {
      let parsed = {
        title: self.evaluateXPath("./rss:title", item)[0].textContent,
        creator: self.evaluateXPath("./dc:creator", item)[0].textContent,
        date: self.evaluateXPath("./dc:date", item)[0].textContent,
        comment: self.evaluateXPath("./rss:description", item)[0].textContent,
        tags: self.evaluateXPath("./dc:subject", item).map(function(i) i.textContent).join(",")
      };
      return parsed;
    },

    reportBookmarkedItem: function(item) {
      liberator.dump(item);
      (getNotifier())(
          item.title,
          item.creator + " bookmarked at " + item.date + "\n" +
          item.tags + ":" + item.comment,
          'http://www.hatena.ne.jp/users/' + item.creator.substr(0, 2) + '/' + item.creator + '/profile.gif'
      );
    }
  };
  // }}}
  return self;
})();

// Awaking the watch dog.
publics.startWatching();
liberator.dump("Watch dog is awaking ...");
// vim: sw=2 ts=2 et fdm=marker
