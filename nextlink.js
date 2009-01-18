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
    <version>0.3.0</version>
    <license>MIT</license>
    <minVersion>1.2</minVersion>
    <maxVersion>2.0pre</maxVersion>
    <updateURL>http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/nextlink.js</updateURL>
    <detail><![CDATA[
== Needs Library ==
- _libly.js(ver.0.1.15)
  @see http://coderepos.org/share/browser/lang/javascript/vimperator-plugins/trunk/_libly.js

== Option ==
>||
    let g:nextlink_followlink = "true"
||<
と設定することにより、"[[", "]]" の動作は、カレントのタブに新しくページを読み込むようになります。

== Command ==
:nextlink:
    autocmd によって呼び出されます。

== TODO ==
- 同一URLのページを複数開いている場合のバグフィックス
- Autopager利用時のMICROFORMATの対応

  ]]></detail>
</VimperatorPlugin>;
//}}}
liberator.plugins.nextlink = (function() {

// initialize //{{{
if (!liberator.plugins.libly) {
    liberator.log('nextlink: needs _libly.js');
    return;
}

var libly = liberator.plugins.libly;
var $U = libly.$U;
var logger = $U.getLogger('nextlink');
var $H = Cc["@mozilla.org/browser/global-history;2"].getService(Ci.nsIGlobalHistory2);
const HTML_NAMESPACE = 'http://www.w3.org/1999/xhtml';

var isFollowLink = typeof liberator.globalVariables.nextlink_followlink == 'undefined' ?
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
        this.cache = {}; // {url: {xpath: xpath, next: element, prev: url}} or null
        this.pager = pager;
        this.browserModes = config.browserModes || [modes.NORMAL, modes.VISUAL];
        this.is2_0later = config.autocommands.some(function ([k, v]) k == 'DOMLoad'); // toriaezu

        var wedata = new libly.Wedata('AutoPagerize');
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
                url: '^https?://(?:192\\.168(?:\\.\\d+){2}|localhost)(?::\\d+)?/',
                nextLink: 'id("next")',
                pageElement: '//*'
            }
        ];
        */
        ;

        getBrowser().addEventListener("DOMContentLoaded",
            $U.bind(this, function(event) {
                let win = (event.target.contentDocument||event.target).defaultView;
                this.onLoad(win);
            }), false);
        this.customizeMap(this);
    },
    onLoad: function(win) {
        if (!this.initialized) return;
        let doc = win.document;
        let url = doc.location.href;

        for (let i = 0, len = this.siteinfo.length; i < len; i++) {
            if (url.match(this.siteinfo[i].url) && this.siteinfo[i].url != '^https?://.') {
                win.addEventListener('unload',
                    $U.bind(this, function() {
                        this.cache[url] = null;
                    }), false);
                this.setCache(url,
                    ['xpath', 'siteinfo'],
                    [this.siteinfo[i].nextLink, this.siteinfo[i]]
                );
            }
        }
        return this.cache[url];
    },
    nextLink: function(count) {
        this.pager.nextLink(this, count);
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
        mappings.addUserMap(context.browserModes, ['[['], 'customize by nextlink.js',
            function(count) context.nextLink(count>0 ? -1*count : -1),
            { flags: Mappings.flags.COUNT });

        mappings.addUserMap(context.browserModes, [']]'], 'customize by nextlink.js',
            function(count) context.nextLink(count>0 ? count : 1),
            { flags: Mappings.flags.COUNT });
    },
};//}}}

var Autopager = function() {};//{{{
Autopager.prototype = {
    nextLink: function(context, count) {
        let self = this;
        let win = window.content;
        let doc = win.document;
        let url = doc.location.href;
        let cache = context.cache[url] || context.onLoad(win);

        // TODO: support MICROFORMAT
        // rel="next", rel="prev"

        // no siteinfo, defalut [[, ]] action
        if(!cache) {
            if(count < 0) {
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

        let page = this.getCurrentPage(win, doc) + count;
        if (page <= 1) {
            win.scrollTo(0, 0);
            return true;
        }
        if(this.focusPagenavi(win, doc, page)) {
            return true;
        }

        if (cache.isLoading) {
            logger.echo('loading now...');
            return;
        }

        let next = cache.next;
        if(!next)
            [next] = $U.getNodesFromXPath(cache.xpath, doc);
        if(!next) {
            logger.echo('end of pages.');
            return;
        }

        let reqUrl = $U.pathToURL(next, url, doc);
        cache.isLoading = true;
        var req = new libly.Request(
                        reqUrl, null,
                        { asynchronous: true, encoding: doc.characterSet,
                          context: context, url: url }
                      );

        req.addEventListener('onSuccess', function(res) self.onSuccess(win, doc, res));
        req.addEventListener('onFailure', function(res) self.onFailure(win, doc, res));
        req.addEventListener('onException', function(res) self.onFailure(win, doc, res));
        req.get();
    },
    onSuccess: function(win, doc, res) {
        var context = res.req.options.context;
        var url = res.req.options.url;
        var cache = context.cache[url];
        var page = res.getHTMLDocument(cache.siteinfo.pageElement);
        var resDoc = res.doc;
        var [next] = $U.getNodesFromXPath(cache.xpath, resDoc);

        cache.next = next;
        cache.isLoading = false;

        if (!page || page.length < 1)
            page = res.getHTMLDocument('//*[contains(@class, "autopagerize_page_element")]');

        if (!page || page.length < 1) {
            return;
        }

        let addPage = this.getPageNum()+1;
        this.addPage(context, doc, resDoc, page, res.req.url, addPage);
        this.focusPagenavi(win, doc, addPage);
        context.setCache(doc, 'isLoading', false);
    },
    addPage: function(context, doc, resDoc, page, reqUrl, addPage) {
        let url = doc.location.href;
        let cache = context.cache[url];
        if(!cache.insertPoint)
            cache.insertPoint = this.getInsertPoint(doc, cache.siteinfo);
        let insertPoint = cache.insertPoint;

        let p = doc.createElementNS(HTML_NAMESPACE, 'p');
        var tagName;


        if (page[0] && page[0].tagName)
            tagName = page[0].tagName.toLowerCase();

        if (tagName == 'tr') {
            let insertParent = insertPoint.parentNode;
            let colNodes = getElementsByXPath('child::tr[1]/child::*[self::td or self::th]', insertParent);

            let colums = 0;
            for (let i = 0, l = colNodes.length; i < l; i++) {
                let col = colNodes[i].getAttribute('colspan');
                colums += parseInt(col, 10) || 1;
            }
            let td = doc.createElement('td');
            td.appendChild(p);
            let tr = doc.createElement('tr');
            td.setAttribute('colspan', colums);
            tr.appendChild(td);
            insertParent.insertBefore(tr, insertPoint);
        } else if (tagName == 'li') {
            let li = doc.createElementNS(HTML_NAMESPACE, 'li');
            insertPoint.parentNode.insertBefore(li, insertPoint);
            li.appendChild(p);
        } else {
            insertPoint.parentNode.insertBefore(p, insertPoint);
        }

        p.id = 'vimperator-nextlink-' + addPage;
        p.innerHTML = 'page: <a href="' + reqUrl + '">' + addPage + '</a>';
        p.className = 'vimperator-nextlink-page';

        $H.addURI(makeURI(reqUrl), false, true, makeURI(url));

        return page.map(function(elem) {
            var pe = resDoc.importNode(elem, true);
            insertPoint.parentNode.insertBefore(pe, insertPoint);
            return pe;
        });
    },
    onFailure: function(win, doc, res) {
        logger.log('onFailure');
        var context = res.req.options.context;
        var url = res.req.options.url;
        var cache = context.cache[url];
        cache.isLoading = false;
        logger.echoerr('nextlink: loading failed. ' + '[' + res.status + ']' + res.statusText + ' > ' + res.req.url);
        res.req.options.context.setCache(res.req.options.url, 'terminate', cache.curPage);
    },
    focusPagenavi: function(win, doc, page) {
        let xpath = '//*[@id="vimperator-nextlink-' + page + '"]';
        let [elem] = $U.getNodesFromXPath(xpath, doc);
        if(elem) {
            let p = $U.getElementPosition(elem);
            win.scrollTo(0, p.top);
            return true;
        }
        return false;
    },
    getPageNum: function(doc) {
        let xpath = '//*[@class="vimperator-nextlink-page"]';
        let page = 1 + $U.getNodesFromXPath(xpath, doc).length;
        return page;
    },
    getCurrentPage: function(win, doc) {
        let page = 1;
        let xpath = '//*[@class="vimperator-nextlink-page"]';
        let makers = $U.getNodesFromXPath(xpath, doc);
        let curPos = win.scrollY;
        for(let i=0;i<makers.length;++i) {
            let p = $U.getElementPosition(makers[i]);
            if(curPos < p.top) break;
            ++page;
        }
        return page;
    },
    getInsertPoint: function(doc, siteinfo) {
        let insertPoint, lastPageElement;

        if (siteinfo.insertBefore)
            [insertPoint] = $U.getNodesFromXPath(siteinfo.insertBefore, doc);

        if (!insertPoint) {
            let elems = $U.getNodesFromXPath(siteinfo.pageElement, doc);
            if(elems.length>0) lastPageElement = elems.pop();
        }

        if (lastPageElement)
            insertPoint = lastPageElement.nextSibling ||
                lastPageElement.parentNode.appendChild(doc.createTextNode(' '));
        return insertPoint;
    },
    setValue: function(doc, id, value) {
        let realID = 'vimperator-nextlink-value-'+id;
        let [input] = doc.getElementById(realID);
        if(!input) {
            input = doc.createElementNS(HTML_NAMESPACE, 'input');
        }
        input.value = value;
    },
    getValue: function(doc, id) {
        let realID = 'vimperator-nextlink-value-'+id;
        let [input] = doc.getElementById(realID);
        if(!input) return false;
        return input.value;
    },
};//}}}

var FollowLink = function() {};//{{{
FollowLink.prototype = {
    nextLink: function(context, count) {
        let win = window.content;
        let doc = win.document;
        let url = doc.location.href;
        function followXPath(xpath) {
            let [elem] = $U.getNodesFromXPath(xpath, doc);
            if(elem) {
                if (elem.tagName == 'LINK') {
                    liberator.open(elem.href);
                } else {
                    buffer.followLink(elem, liberator.CURRENT_TAB);
                }
                return true;
            }
            return false;
        }

        if(count < 0) {
            let xpath = ['link', 'a'].map(function(e)
                '//' + e + '[translate(normalize-space(@rel), "PREV", "prev")="prev"]')
                .join(' | ');

            if(followXPath(xpath)) return;
            buffer.followDocumentRelationship("previous");
        } else {
            let xpath = ['link', 'a'].map(function(e)
                '//' + e + '[translate(normalize-space(@rel), "NEXT", "next")="next"]')
                .join(' | ');
            if(followXPath(xpath)) return;

            let cache = context.cache[url] || context.onLoad(win);
            if(cache) {
                if(followXPath(cache.xpath)) return;
            }
            buffer.followDocumentRelationship("next");
        }
    },
};//}}}

var instance = new NextLink((isFollowLink ? new FollowLink() : new Autopager()));
return instance;

})();
// vim: set fdm=marker sw=4 ts=4 sts=0 et:

