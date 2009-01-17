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
    <version>0.2.10</version>
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
        this.isCurOriginalMap = true;
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

        commands.addUserCommand(['nextlink'], 'map ]] by AutoPagerize XPath.',
            $U.bind(this, function(args) { this.handler(args); }), null, true
        );
        var loadEvent = autocommands['DOMLoad'] || 'PageLoad'; // for 1.2
        liberator.execute(':autocmd ' + (this.is2_0later ? 'DOMLoad' : 'PageLoad') + ' .* :nextlink onLoad');
        liberator.execute(':autocmd LocationChange .* :nextlink onLocationChange');
    },
    handler: function(args) {
        event = args.string || args;
        this[event](buffer.URL);
    },
    onLoad: function(url) {
        if (!this.initialized) return;
        if (this.cache[url] &&
            this.cache[url].hasOwnProperty('xpath')) {
            this.cache[url].doc = window.content.document;
            this.onLocationChange(url, true);
            return;
        }

        for (let i = 0, len = this.siteinfo.length; i < len; i++) {
            if (url.match(this.siteinfo[i].url) && this.siteinfo[i].url != '^https?://.') {
                window.content.addEventListener('unload', $U.bind(this,
                            function() { this.cache[url] = null; }), false);
                this.setCache(url,
                    ['doc', 'xpath', 'siteinfo'],
                    [window.content.document, this.siteinfo[i].nextLink, this.siteinfo[i]]
                );
                this.onLocationChange(url, true);
                return;
            }
        }
        this.setCache(url, ['doc', 'xpath', 'prev', 'next'], [null, null, null, null]);
    },
    onLocationChange: function(url, isCallerLoaded) {

        if (!this.initialized ||
            !this.cache[url] ||
            !this.cache[url].hasOwnProperty('xpath')) return;

        if (this.cache[url]['xpath'] == null) {
            this.restorOrginalMap();
            return;
        }

        this.pager.onLocationChange(this, url, isCallerLoaded);
        this.customizeMap(this, url);
        this.isCurOriginalMap = false;
    },
    customizeMap: function(context, url) {

        var cache = this.cache[url];
        var prev = cache.prev;
        var next = cache.next;

        if (!prev)
            this.removeMap('[[');

        if (!next)
            this.removeMap(']]');

        this.pager.customizeMap(context, url, prev, next);
    },
    restorOrginalMap: function() {

        if (this.isCurOriginalMap) return;
        this.removeMap('[[');
        this.removeMap(']]');
        this.isCurOriginalMap = true;
    },
    setCache: function(key, subKeys, values) {
        if (!this.cache[key]) this.cache[key] = {};
        values = [].concat(values);
        [].concat(subKeys).forEach($U.bind(this, function(subKey, i) {
            this.cache[key][subKey] = values[i];
        }));
    },
    removeMap: function(cmd) {
        try {
            if (mappings.hasMap(this.browserModes, cmd)) {
                mappings.remove(this.browserModes, cmd);
            }
            return true;
        } catch (e) {
            return false;
        }
    }
};//}}}

var Autopager = function() {};//{{{
Autopager.prototype = {
    onLocationChange: function(context, url, isCallerLoaded) {

        var cache = context.cache[url];
        var doc = cache.doc;
        var elems = cache.next;
        var elem;

        if (isCallerLoaded) {
            let insertPoint, lastPageElement;

            if (cache.insertBefore)
                insertPoint = $U.getNodesFromXPath(cache.siteinfo.insertBefore, doc);

            if (!insertPoint)
                lastPageElement = $U.getNodesFromXPath(cache.siteinfo.pageElement, doc).pop();
                if (lastPageElement)
                    insertPoint = lastPageElement.nextSibling ||
                                  lastPageElement.parentNode.appendChild(doc.createTextNode(' '));

            if (context.is2_0later) {
                let css = $U.xmlToDom(pageNaviCss, doc);
                let node = doc.importNode(css, true);
                doc.body.insertBefore(node, doc.body.firstChild);
                //doc.body.appendChild(css);
            }

            $U.getNodesFromXPath(cache.xpath, doc, function(item) elem = item, this);

            context.setCache(url,
                ['prev', 'next', 'curPage', 'insertPoint', 'terminate', 'lastReqUrl', 'loadedURLs', 'mark'],
                [[], [elem], 1, insertPoint, 0, null, {}, []]
            );
            cache.loadedURLs[url] = true;
        }
    },
    customizeMap: function(context, url, prev, next) {

        var cache = context.cache[url];
        var doc = cache.doc;

        mappings.addUserMap(context.browserModes, ['[['], 'customize by nextlink.js',
            $U.bind(this, function(count) {
                if (cache.curPage == 1) {
                    return;
                } else if (--cache.curPage == 1) {
                    window.content.scrollTo(0, 0);
                } else {
                    this.focusPagenavi(context, url, cache.curPage);
                }
            }),
            { flags: Mappings.flags.COUNT });

        mappings.addUserMap(context.browserModes, [']]'], 'customize by nextlink.js',
            $U.bind(this, function(count) {
                var reqUrl, lastReqUrl;
                reqUrl = $U.pathToURL(cache.next[cache.curPage - 1], url, doc);
                lastReqUrl = cache.lastReqUrl;

                if (cache.isLoading) {
                    logger.echo('loading now...');
                    return;
                }

                if (!reqUrl || cache.curPage == cache.terminate) {
                    logger.echo('end of pages.');
                    return;
                }
                if (cache.loadedURLs[reqUrl]) {
                    this.focusPagenavi(context, url, ++cache.curPage);
                    return;
                }
                context.setCache(url, ['lastReqUrl', 'isLoading'], [reqUrl, true]);
                var req = new libly.Request(
                                reqUrl, null,
                                { asynchronous: true, encoding: doc.characterSet,
                                  context: context, url: url }
                              );
                req.addEventListener('onSuccess', $U.bind(this, this.onSuccess));
                req.addEventListener('onFailure', $U.bind(this, this.onFailure));
                req.addEventListener('onException', $U.bind(this, this.onFailure));
                req.get();
            }),
            { flags: Mappings.flags.COUNT }
        );
    },
    onSuccess: function(res) {

        var context = res.req.options.context;
        var url = res.req.options.url;
        var cache = context.cache[url];
        var doc = cache.doc;
        var page = res.getHTMLDocument(cache.siteinfo.pageElement);
        var htmlDoc = res.doc;
        var prev = cache.next[cache.curPage];
        var next = $U.getNodesFromXPath(cache.xpath, htmlDoc);

        cache.isLoading = false;
        cache.loadedURLs[res.req.url] = true;

        if (!page || page.length < 1)
            page = res.getHTMLDocument('//*[contains(@class, "autopagerize_page_element")]');

        if (!page || page.length < 1) {
            context.setCache(url, 'terminate', cache.curPage);
            return;
        }

        cache.curPage++;
        if (next && next.length) {
            cache.prev.push(prev);
            cache.next.push(next[0]);
        } else {
            context.setCache(url, 'terminate', cache.curPage);
        }

        this.addPage(context, htmlDoc, url, page, res.req.url);
        this.focusPagenavi(context, url, cache.curPage);
    },
    addPage: function(context, doc, url, page, reqUrl) {

        var cache = context.cache[url];
        var HTML_NAMESPACE = 'http://www.w3.org/1999/xhtml';
        //var hr = doc.createElementNS(HTML_NAMESPACE, 'hr');
        var p = doc.createElementNS(HTML_NAMESPACE, 'p');
        var tagName;

        if (page[0] && page[0].tagName)
            tagName = page[0].tagName.toLowerCase();

        if (tagName == 'tr') {
            let insertParent = cache.insertPoint.parentNode;
            let colNodes = getElementsByXPath('child::tr[1]/child::*[self::td or self::th]', insertParent);

            let colums = 0;
            for (let i = 0, l = colNodes.length; i < l; i++) {
                let col = colNodes[i].getAttribute('colspan');
                colums += parseInt(col, 10) || 1;
            }
            let td = doc.createElement('td');
            // td.appendChild(hr);
            td.appendChild(p);
            let tr = doc.createElement('tr');
            td.setAttribute('colspan', colums);
            tr.appendChild(td);
            insertParent.insertBefore(tr, cache.insertPoint);
        } else if (tagName == 'li') {
            let li = doc.createElementNS(HTML_NAMESPACE, 'li');
            cache.insertPoint.parentNode.insertBefore(li, cache.insertPoint);
            li.appendChild(p);
        } else {
            //cache.insertPoint.parentNode.insertBefore(hr, cache.insertPoint);
            cache.insertPoint.parentNode.insertBefore(p, cache.insertPoint);
        }

        p.id = 'vimperator-nextlink-' + cache.curPage;
        p.innerHTML = 'page: <a href="' + reqUrl + '">' + cache.curPage + '</a>';
        p.className = 'vimperator-nextlink-page';
        cache.mark.push(p);

        $H.addURI(makeURI(reqUrl), false, true, makeURI(url));

        return page.map(function(elem) {
            var pe = doc.importNode(elem, true);
            cache.insertPoint.parentNode.insertBefore(pe, cache.insertPoint);
            return pe;
        });
    },
    onFailure: function(res) {
        logger.log('onFailure');
        var context = res.req.options.context;
        var url = res.req.options.url;
        var cache = context.cache[url];
        cache.isLoading = false;
        logger.echoerr('nextlink: loading failed. ' + '[' + res.status + ']' + res.statusText + ' > ' + res.req.url);
        res.req.options.context.setCache(res.req.options.url, 'terminate', cache.curPage);
    },
    focusPagenavi: function(context, url, page) {
       var elem, p;
       try {
           elem = context.cache[url].mark[page - 2];
           p = $U.getElementPosition(elem);
           window.content.scrollTo(0, p.top);
       } catch (e) {
           logger.log('focusPagenavi: err ' + page + ' ' + e);
       }
   }
};//}}}

var FollowLink = function() {};//{{{
FollowLink.prototype = {
    onLocationChange: function(context, url, isCallerLoaded) {

        var cache = context.cache[url];
        var doc = cache.doc;
        var elem;

        //var matches = buffer.evaluateXPath(this.cache[url]);
        //for each (let match in matches) elem = match;
        $U.getNodesFromXPath(cache.xpath, doc, function(item) elem = item, this);

        var nextURL = $U.pathToURL(elem, doc);
        var xpath = ['a', 'link'].map(function(e)
                                 '//' + e + '[translate(normalize-space(@rel), "PREV", "prev")="prev"]')
                                 .join(' | ');
        var prev = $U.getNodesFromXPath(xpath, doc);
        if (prev.length)
            context.setCache(url, 'prev', prev[0]);
        context.setCache(nextURL, 'prev', url);
        context.setCache(url, 'next', elem);
    },
    customizeMap: function(context, url, prev, next) {

        var cache = context.cache[url];
        var doc = cache.doc;

        if (prev)
            mappings.addUserMap(context.browserModes, ['[['], 'customize by nextlink.js',
                function(count) {
                    if (prev.href) {
                        buffer.followLink(prev, liberator.CURRENT_TAB);
                    } else {
                        liberator.open(prev, liberator.CURRENT_TAB);
                    }
                },
                { flags: Mappings.flags.COUNT });

        if (next)
            mappings.addUserMap(context.browserModes, [']]'], 'customize by nextlink.js',
                function(count) { buffer.followLink(next, liberator.CURRENT_TAB); },
                { flags: Mappings.flags.COUNT });
    }
};//}}}

var instance = new NextLink((isFollowLink ? new FollowLink() : new Autopager()));
return instance;

})();
// vim: set fdm=marker sw=4 ts=4 sts=0 et:

