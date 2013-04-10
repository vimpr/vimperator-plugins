/*** BEGIN LICENSE BLOCK {{{
  Copyright (c) 2008 suVene<suvene@zeromemory.info>

  Released under the GPL license
  http://www.gnu.org/copyleft/gpl.html
}}}  END LICENSE BLOCK ***/
// PLUGIN_INFO//{{{
var PLUGIN_INFO = xml`
<VimperatorPlugin>
  <name>nextlink</name>
  <description>mapping "[[", "]]" by AutoPagerize XPath.</description>
  <description lang="ja">AutoPagerize 用の XPath より "[[", "]]" をマッピングします。</description>
  <author mail="suvene@zeromemory.info" homepage="http://zeromemory.sblo.jp/">suVene</author>
  <author mail="konbu.komuro@gmail.com" homepage="http://d.hatena.ne.jp/hogelog/">hogelog</author>
  <version>0.3.9</version>
  <license>GPL</license>
  <minVersion>2.2pre</minVersion>
  <maxVersion>2.2pre</maxVersion>
  <updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/nextlink.js</updateURL>
  <detail><![CDATA[
== Needs Library ==
- _libly.js(ver.0.1.20)
  @see http://coderepos.org/share/browser/lang/javascript/vimperator-plugins/trunk/_libly.js

== Option ==
>||
  let g:nextlink_followlink = "true"
||<
と設定することにより、"[[", "]]" の動作は、カレントのタブに新しくページを読み込むようになります。

>||
  let g:nextlink_prevmap = "[n"
  let g:nextlink_nextmap = "]n"
||<
のように設定することにより、"[[", "]]" 以外のキーに割り当てることができます。

SITEINFOが無い場合の処理を
>||
  let g:nextlink_nositeinfo_act = "f"
||<
のように設定できます。現在は
f:
  Vimperatorの"[[", "]]"の動作
e:
  マッチするSITEINFOが無いことを知らせる(デフォルト設定)
n:
  何もしない
が設定可能です

<RUNTIME_PATH>/info/<YOUR_PROFILE>/nextlink-local-siteinfo に
>||
[
  {
    "url":          "^http://[^.]+\\.google\\.(?:[^.]+\\.)?[^./]+/search\\b",
    "nextLink":     "id('navbar')//td[last()]/a",
    "pageElement":  "id('res')/div",
    "exampleUrl":   "http://www.google.com/search?q=nsIObserver",
  },
]
||<
のような JSON を置くことでローカルで SITEINFO を設定できます

== TODO ==
  ]]></detail>
</VimperatorPlugin>`;
//}}}
liberator.plugins.nextlink = (function() {

// initialize //{{{
if (!liberator.plugins.libly) {
  liberator.log("nextlink: needs _libly.js");
  return;
}

var libly = liberator.plugins.libly;
var $U = libly.$U;
var logger = $U.getLogger("nextlink");
var $H = Cc["@mozilla.org/browser/global-history;2"].getService(Ci.nsIGlobalHistory2);
const HTML_NAMESPACE = "http://www.w3.org/1999/xhtml";
const UUID = "{3b72c049-a347-4777-96f6-b128fc76ed6a}"; // siteinfo cache key

const DEFAULT_PREVMAP = "[[";
const DEFAULT_NEXTMAP = "]]";
var prevMap = liberator.globalVariables.nextlink_prevmap || DEFAULT_PREVMAP;
var nextMap = liberator.globalVariables.nextlink_nextmap || DEFAULT_NEXTMAP;

var isFollowLink = typeof liberator.globalVariables.nextlink_followlink == "undefined" ?
                   false : $U.eval(liberator.globalVariables.nextlink_followlink);

const MICROFORMAT = {
    url:          "^https?://.",
    nextLink:     '//a[translate(normalize-space(@rel), "NEXT", "next")="next"] | //link[translate(normalize-space(@rel), "NEXT", "next")="next"]',
    insertBefore: '//*[contains(concat(" ", @class, " "), " autopagerize_insert_before ")]',
    pageElement:  '//*[contains(concat(" ", @class, " "), " autopagerize_page_element ")]',
}

const nositeinfoActions = {
  // vimperator [[, ]] action
  f: function(doc, count) {
       if (count < 0) {
         return buffer.followDocumentRelationship("previous");
       }
       return buffer.followDocumentRelationship("next");
     },
  e: function(doc, count) {
       var url = doc.location.href;
       return liberator.echo("No SITEINFO match " + url);
     },
  n: function() true,
};
var actpattern = liberator.globalVariables.nextlink_nositeinfo_act || "e";
var nositeinfoAct = nositeinfoActions[actpattern];


var localSiteinfo = storage.newMap("nextlink-local-siteinfo", {store: false});
if (localSiteinfo)
  localSiteinfo = [ info for ([ i, info ] in localSiteinfo) ];

var pageNaviCss =
    <style type="text/css"><![CDATA[
      .vimperator-nextlink-page {
        background-color: #555;
        color: #fff;
        opacity: .85;
        padding: 10px;
        margin-top: 5px;
        margin-bottom: 5px;
        height: 1em;
        font-weight: bold;
        text-align: left;
        -moz-border-radius: 5px;
      }
      .vimperator-nextlink-page a:link {
        color: #EF6D29;
      }
      .vimperator-nextlink-page a:visited {
        color: #A50000;
      }
    ]]></style>;
//}}}

var NextLink = function() {//{{{
  this.initialize.apply(this, arguments);
};
NextLink.prototype = {
  initialize: function(pager) {

    this.initialized = false;
    this.siteinfo = [];
    this.pager = pager;
    this.browserModes = config.browserModes || [ modes.NORMAL, modes.VISUAL ];
    this.is2_0later = config.autocommands.some(function ([ k, v ]) k == "DOMLoad"); // toriaezu

    var wedata = new libly.Wedata("AutoPagerize");
    wedata.getItems(24 * 60 * 60 * 1000, null,
      $U.bind(this, function(isSuccess, data) {
        if (!isSuccess) return;
        this.siteinfo = data.map(function(item) item.data);

        if (localSiteinfo)
          this.siteinfo = this.siteinfo.concat(localSiteinfo);
        this.siteinfo = this.siteinfo.sort(function(a, b) b.url.length - a.url.length); // sort url.length desc

        this.initialized = true;
      })
    );

    this.customizeMap(this);
  },
  initDoc: function(context, doc) {
    var value = doc[UUID] = {};
    value.siteinfo = this.getSiteinfo(doc);
    this.pager.initDoc(context, doc);
  },
  getSiteinfo: function(doc) {
    function valid(prop)
      $U.getNodesFromXPath(MICROFORMAT[prop], doc).length > 0;
    if (valid("nextLink") && valid("pageElement")) return MICROFORMAT;
    var url = doc.location.href;
    for (let i = 0, len = this.siteinfo.length; i < len; i++) {
      if (url.match(this.siteinfo[i].url) && this.siteinfo[i].url != "^https?://.") {
        return this.siteinfo[i];
      }
    }

    return null;
  },
  nextLink: function(count) {
    if (!this.initialized) {
      liberator.echo("before initialized.");
      return false;
    }
    var doc = window.content.document;
    if (!doc[UUID])
      this.initDoc(this, doc);

    this.pager.nextLink(doc, count);
  },
  customizeMap: function(context) {
    mappings.addUserMap(context.browserModes, [ prevMap ], "customize by nextlink.js",
      function(count) context.nextLink(count > 0 ? -1 * count : -1),
      { count: true });

    mappings.addUserMap(context.browserModes, [ nextMap ], "customize by nextlink.js",
      function(count) context.nextLink(count > 0 ? count : 1),
      { count: true });
  },
};//}}}

var Autopager = function() {};//{{{
Autopager.prototype = {
  initDoc: function(context, doc) {
    doc[UUID].loadURLs = [];

    if (context.is2_0later) {
      let css = $U.xmlToDom(pageNaviCss, doc);
      let node = doc.importNode(css, true);
      doc.body.insertBefore(node, doc.body.firstChild);
      //doc.body.appendChild(css);
    }
  },
  nextLink: function(doc, count) {
    var value = doc[UUID];

    // TODO: support MICROFORMAT
    // rel="next", rel="prev"

    if (!value.siteinfo && nositeinfoAct) {
      return nositeinfoAct(doc, count);
    }

    var curPage = this.getCurrentPage(doc);
    logger.log(curPage);
    var page = (count < 0 ? Math.round : Math.floor)(curPage + count);
    if (page <= 1) {
      value.isLoading = false;
      doc.defaultView.scrollTo(0, 0);
      return true;
    }
    if (this.focusPagenavi(doc, page)) {
      value.isLoading = false;
      return true;
    }

    if (value.isLoading) {
      logger.echo("loading now...");
      return false;
    }

    value.isLoading = true;

    if (value.terminate) {
      value.isLoading = false;
      logger.echo("terminated.");
      return false;
    }

    var req = this.createNextRequest(doc);
    if (!req) {
      value.isLoading = false;
      let win = doc.defaultView;
      win.scrollTo(0, win.scrollMaxY);
      logger.echo("end of pages.");
      return true;
    }

    req.addEventListener("success", $U.bind(this, this.onSuccess));
    req.addEventListener("failure", $U.bind(this, this.onFailure));
    req.addEventListener("exception", $U.bind(this, this.onFailure));
    req.get();
  },
  onSuccess: function(res) {
    var doc = res.req.options.doc;
    var url = doc.location.href;
    var value = doc[UUID];
    var pages = res.getHTMLDocument(value.siteinfo.pageElement)
    var resDoc = res.doc;
    var reqUrl = res.req.url;
    var [ next ] = $U.getNodesFromXPath(value.siteinfo.nextLink, resDoc);

    value.loadURLs.push(reqUrl);
    value.next = next;
    value.isLoading = false;

    // set reqUrl link-state visited
    $H.addURI(makeURI(reqUrl), false, true, makeURI(url));

    if (!pages || pages.length == 0) return;

    var addPageNum = this.getPageNum(doc) + 1;
    this.addPage(doc, resDoc, pages, reqUrl, addPageNum);
    this.focusPagenavi(doc, addPageNum);
  },
  addPage: function(doc, resDoc, pages, reqUrl, addPageNum) {
    var url = doc.location.href;
    var value = doc[UUID];
    if (!value.insertPoint)
      value.insertPoint = this.getInsertPoint(doc, value.siteinfo);
    var insertPoint = value.insertPoint;

    this.insertRule(doc, addPageNum, reqUrl, pages[0], insertPoint);

    pages.forEach(function(elem) {
      var pe = resDoc.importNode(elem, true);
      insertPoint.parentNode.insertBefore(pe, insertPoint);
    });
    return true;
  },
  onFailure: function(res) {
    logger.log("onFailure");
    var doc = res.req.options.doc;
    var url = doc.location.href;
    var value = doc[UUID];
    value.isLoading = false;
    value.terminate = true;
    logger.echoerr("nextlink: loading failed. " + "[" + res.status + "]" + res.statusText + " > " + res.req.url);
  },
  focusPagenavi: function(doc, page) {
    var xpath = '//*[@id="vimperator-nextlink-' + page + '"]';
    var [ elem ] = $U.getNodesFromXPath(xpath, doc);
    var win = doc.defaultView;
    if (elem) {
      let p = $U.getElementPosition(elem);
      win.scrollTo(0, p.top);
      return true;
    }
    return false;
  },
  createNextRequest: function(doc) {
    var value = doc[UUID];
    var url = doc.location.href;
    var next = value.next;
    if (!next)
      [ next ] = $U.getNodesFromXPath(value.siteinfo.nextLink, doc);
    if (!next)
      return false;

    var reqUrl = $U.pathToURL(next, url, doc);
    if (value.loadURLs.some(function(url) url == reqUrl)) return false;

    var req = new libly.Request(
                reqUrl, null,
                { asynchronous: true, encoding: doc.characterSet,
                  doc: doc }
              );
    return req;
  },
  getPageNum: function(doc) {
    var xpath = '//*[@class="vimperator-nextlink-page"]';
    var page = 1 + $U.getNodesFromXPath(xpath, doc).length;
    return page;
  },
  getCurrentPage: function(doc) {
    var xpath = '//*[@class="vimperator-nextlink-page"]';
    var markers = $U.getNodesFromXPath(xpath, doc);
    var win = doc.defaultView;
    var curPos = win.scrollY;

    // top of page
    if (curPos <= 0) return 1.0;

    // bottom of page
    if (curPos >= win.scrollMaxY) {
      if (markers.length > 0) {
        let lastMarker = $U.getElementPosition(markers[markers.length-1]).top;
        if (curPos <= lastMarker) return markers.length + 1;
      }
      return markers.length + 1.5;
    }

    // return n.5 if between n and n+1
    var page = 1.0;
    for (let i = 0, len = markers.length; i < len; i++) {
      let pos = $U.getElementPosition(markers[i]).top;
      if (curPos == pos) return page + 1;
      if (curPos < pos) return page + 0.5;
      ++page;
    }

    return page + 0.5;
  },
  getInsertPoint: function(doc, siteinfo) {
    var insertPoint, lastPageElement;

    if (siteinfo.insertBefore)
      [ insertPoint ] = $U.getNodesFromXPath(siteinfo.insertBefore, doc);

    if (!insertPoint) {
      let elems = $U.getNodesFromXPath(siteinfo.pageElement, doc);
      if (elems.length > 0) lastPageElement = elems.pop();
    }

    if (lastPageElement)
      insertPoint = lastPageElement.nextSibling ||
        lastPageElement.parentNode.appendChild(doc.createTextNode(" "));
    return insertPoint;
  },
  insertRule: function(doc, addPageNum, reqUrl, page, insertPoint) {
    var p = doc.createElementNS(HTML_NAMESPACE, "p");
    p.id = "vimperator-nextlink-" + addPageNum;
    p.innerHTML = 'page: <a href="' + reqUrl + '">' + addPageNum + "</a>";
    p.className = "vimperator-nextlink-page";

    var tagName;
    if (page && page.tagName)
      tagName = page.tagName.toLowerCase();

    if (tagName == "tr") {
      let insertParent = insertPoint.parentNode;
      let colNodes = getElementsByXPath("child::tr[1]/child::*[self::td or self::th]", insertParent);

      let colums = 0;
      for (let i = 0, l = colNodes.length, f = function(col) {
        colums += parseInt(col, 10) || 1;
      }; i < l; f(colNodes[i++].getAttribute("colspan")));
      let td = insertParent.insertBefore(doc.createElement("tr"), insertPoint)
                           .appendChild(doc.createElement("td"));
      td.setAttribute("colspan", colums);
      td.appendChild(p);
    } else if (tagName == "li") {
      insertPoint.parentNode.insertBefore(doc.createElementNS(HTML_NAMESPACE, "li"), insertPoint)
                 .appendChild(p);
    } else {
      insertPoint.parentNode.insertBefore(p, insertPoint);
    }
  },
};
//}}}

var FollowLink = function() {};//{{{
FollowLink.prototype = {
  initDoc: function(context, doc) {
  },
  nextLink: function(doc, count) {
    var url = doc.location.href;
    var value = doc[UUID];

    function followXPath(xpath) {
      var [ elem ] = $U.getNodesFromXPath(xpath, doc);
      if (elem) {
        let tagName = elem.tagName.toLowerCase();
        if (tagName == "link") {
          liberator.open(elem.href);
        } else {
          buffer.followLink(elem, liberator.CURRENT_TAB);
        }
        return true;
      }
      return false;
    }

    if (count < 0) {
      let xpath = [ "link", "a" ].map(function(e)
        "//" + e + '[translate(normalize-space(@rel), "PREV", "prev")="prev"]')
                                 .join(" | ");

      if (followXPath(xpath)) return;
      buffer.followDocumentRelationship("previous");
    } else {
      let xpath = [ "link", "a" ].map(function(e)
        "//" + e + '[translate(normalize-space(@rel), "NEXT", "next")="next"]')
                                 .join(" | ");
      if (followXPath(xpath)) return;

      if (value.siteinfo && followXPath(value.siteinfo.nextLink)) return;
      buffer.followDocumentRelationship("next");
    }
  }
};
//}}}

var instance = new NextLink((isFollowLink ? new FollowLink() : new Autopager()));
return instance;

})();
// vim: set fdm=marker sw=2 ts=2 sts=0 et:

