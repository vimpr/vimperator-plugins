/*** BEGIN LICENSE BLOCK {{{
  Copyright (c) 2008 suVene<suvene@zeromemory.info>

  distributable under the terms of an MIT-style license.
  http://www.opensource.jp/licenses/mit-license.html
}}}  END LICENSE BLOCK ***/
// PLUGIN_INFO//{{{
var PLUGIN_INFO =
<VimperatorPlugin>
  <name>nextlink</name>
  <description>mapping "[[", "]]" by AutoPagerize XPath.</description>
  <description lang="ja">AutoPagerize 用の XPath より "[[", "]]" をマッピングします。</description>
  <author mail="suvene@zeromemory.info" homepage="http://zeromemory.sblo.jp/">suVene</author>
  <author mail="konbu.komuro@gmail.com" homepage="http://d.hatena.ne.jp/hogelog/">hogelog</author>
  <version>0.3.4</version>
  <license>MIT</license>
  <minVersion>1.2</minVersion>
  <maxVersion>2.0pre</maxVersion>
  <updateURL>http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/nextlink.js</updateURL>
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


== TODO ==
- Autopager 利用時の MICROFORMAT の対応.

  ]]></detail>
</VimperatorPlugin>;
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
        this.siteinfo = data.map(function(item) item.data)
            .sort(function(a, b) b.url.length - a.url.length); // sort url.length desc
        this.initialized = true;
      })
    );
    // for debug
    /*
    this.initialized = true;
    this.siteinfo = [
      {
        url: "^https?://(?:192\\.168(?:\\.\\d+){2}|localhost)(?::\\d+)?/",
        nextLink: "id("next")",
        pageElement: "//*"
      }
    ];
    */

    this.customizeMap(this);
  },
  nextLink: function(count) {
    var doc = window.content.document;
    var url = doc.location.href;
    if (!doc[UUID]) {
      var value = doc[UUID] = {};
      for (var i = 0, len = this.siteinfo.length; i < len; i++) {
        if (url.match(this.siteinfo[i].url) && this.siteinfo[i].url != "^https?://.") {
          value.siteinfo = this.siteinfo[i];
          break;
        }
      }
    }

    this.pager.nextLink(this, doc, count);
  },
  setCache: function(key, subKeys, values) {
    if (!this.cache[key]) this.cache[key] = {};
    values = [].concat(values);
    [].concat(subKeys).forEach($U.bind(this, function(subKey, i) {
      this.cache[key][subKey] = values[i];
    }));
    return this.cache[key];
  },
  customizeMap: function(context) {
    mappings.addUserMap(context.browserModes, [ prevMap ], "customize by nextlink.js",
      function(count) context.nextLink(count > 0 ? -1 * count : -1),
      { flags: Mappings.flags.COUNT });

    mappings.addUserMap(context.browserModes, [ nextMap ], "customize by nextlink.js",
      function(count) context.nextLink(count > 0 ? count : 1),
      { flags: Mappings.flags.COUNT });
  },
};//}}}

var Autopager = function() {};//{{{
Autopager.prototype = {
  nextLink: function(context, doc, count) {
    var url = doc.location.href;
    var value = doc[UUID];

    // TODO: support MICROFORMAT
    // rel="next", rel="prev"

    // no siteinfo, defalut [[, ]] action
    if (!value.siteinfo) {
      if (count < 0) {
        buffer.followDocumentRelationship("previous");
      } else {
        buffer.followDocumentRelationship("next");
      }
      return;
    }

    if (context.is2_0later) {
      let css = $U.xmlToDom(pageNaviCss, doc);
      let node = doc.importNode(css, true);
      doc.body.insertBefore(node, doc.body.firstChild);
      //doc.body.appendChild(css);
    }

    let curPage = this.getCurrentPage(doc);
    let page = (count < 0 ? Math.round : Math.floor)(curPage + count);
    logger.log(curPage);
    logger.log(page);
    if (page <= 1) {
      doc.defaultView.scrollTo(0, 0);
      return true;
    }
    if (this.focusPagenavi(doc, page)) {
      return true;
    }

    if (value.isLoading) {
      logger.echo("loading now...");
      return;
    }

    next = value.next;
    if (!next)
      [ next ] = $U.getNodesFromXPath(value.siteinfo.nextLink, doc);
    if (!next || value.terminate) {
      logger.echo("end of pages.");
      return;
    }

    let reqUrl = $U.pathToURL(next, url, doc);
    value.isLoading = true;
    var req = new libly.Request(
                reqUrl, null,
                { asynchronous: true, encoding: doc.characterSet,
                  context: context, url: url,
                  doc: doc }
              );

    req.addEventListener("onSuccess", $U.bind(this, this.onSuccess));
    req.addEventListener("onFailure", $U.bind(this, this.onFailure));
    req.addEventListener("onException", $U.bind(this, this.onFailure));
    req.get();
  },
  onSuccess: function(res) {
    var context = res.req.options.context;
    var url = res.req.options.url;
    var doc = res.req.options.doc;
    var value = doc[UUID];
    var page = res.getHTMLDocument(value.siteinfo.pageElement);
    var resDoc = res.doc;
    var [ next ] = $U.getNodesFromXPath(value.siteinfo.nextLink, resDoc);

    value.next = next;
    value.isLoading = false;

    if (!page || page.length < 1)
      page = res.getHTMLDocument('//*[contains(@class, "autopagerize_page_element")]');

    if (!page || page.length < 1) return;

    var addPage = this.getPageNum(doc) + 1;
    this.addPage(context, doc, resDoc, page, res.req.url, addPage);
    this.focusPagenavi(doc, addPage);
  },
  addPage: function(context, doc, resDoc, page, reqUrl, addPage) {
    var url = doc.location.href;
    var value = doc[UUID];
    if(!value.insertPoint)
      value.insertPoint = this.getInsertPoint(doc, value.siteinfo);
    var insertPoint = value.insertPoint;

    var p = doc.createElementNS(HTML_NAMESPACE, "p");
    var tagName;

    if (page[0] && page[0].tagName)
      tagName = page[0].tagName.toLowerCase();

    if (tagName == "tr") {
      let insertParent = insertPoint.parentNode;
      let colNodes = getElementsByXPath("child::tr[1]/child::*[self::td or self::th]", insertParent);

      let colums = 0;
      for (let i = 0, l = colNodes.length; i < l; i++) {
        let col = colNodes[i].getAttribute("colspan");
        colums += parseInt(col, 10) || 1;
      }
      let td = doc.createElement("td");
      td.appendChild(p);
      let tr = doc.createElement("tr");
      td.setAttribute("colspan", colums);
      tr.appendChild(td);
      insertParent.insertBefore(tr, insertPoint);
    } else if (tagName == "li") {
      let li = doc.createElementNS(HTML_NAMESPACE, "li");
      insertPoint.parentNode.insertBefore(li, insertPoint);
      li.appendChild(p);
    } else {
      insertPoint.parentNode.insertBefore(p, insertPoint);
    }

    p.id = "vimperator-nextlink-" + addPage;
    p.innerHTML = 'page: <a href="' + reqUrl + '">' + addPage + "</a>";
    p.className = "vimperator-nextlink-page";

    $H.addURI(makeURI(reqUrl), false, true, makeURI(url));

    return page.map(function(elem) {
      var pe = resDoc.importNode(elem, true);
      insertPoint.parentNode.insertBefore(pe, insertPoint);
      return pe;
    });
  },
  onFailure: function(res) {
    logger.log("onFailure");
    var context = res.req.options.context;
    var url = res.req.options.url;
    var doc = res.req.options.doc;
    var value = doc[UUID];
    value.isLoading = false;
    logger.echoerr("nextlink: loading failed. " + "[" + res.status + "]" + res.statusText + " > " + res.req.url);
    value.terminate = true;
  },
  focusPagenavi: function(doc, page) {
    var xpath = '//*[@id="vimperator-nextlink-' + page + '"]';
    var [ elem ] = $U.getNodesFromXPath(xpath, doc);
    var win = doc.defaultView;
    if(elem) {
      let p = $U.getElementPosition(elem);
      win.scrollTo(0, p.top);
      return true;
    }
    return false;
  },
  getPageNum: function(doc) {
    var xpath = '//*[@class="vimperator-nextlink-page"]';
    var page = 1 + $U.getNodesFromXPath(xpath, doc).length;
    return page;
  },
  getCurrentPage: function(doc) {
    var page = 1.0;
    var xpath = '//*[@class="vimperator-nextlink-page"]';
    var makers = $U.getNodesFromXPath(xpath, doc);
    var win = doc.defaultView;
    var curPos = win.scrollY;

    // bottom of page
    if(curPos == win.scrollMaxY) return 1 + makers.length;

    // return n.5 if between n and n+1
    for (let i = 0; i < makers.length; ++i) {
      let p = $U.getElementPosition(makers[i]);
      if (curPos == p.top)
        return page+1;
      else if (curPos < p.top)
        return page+0.5;
      ++page;
    }
    return page;
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
  }
};
//}}}

var FollowLink = function() {};//{{{
FollowLink.prototype = {
  nextLink: function(context, doc, count) {
    var url = doc.location.href;
    var value = doc[UUID];

    function followXPath(xpath) {
      var [ elem ] = $U.getNodesFromXPath(xpath, doc);
      if (elem) {
        if (elem.tagName == "LINK") {
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

