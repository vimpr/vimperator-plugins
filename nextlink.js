// PLUGIN_INFO//{{{
var PLUGIN_INFO =
<VimperatorPlugin>
    <name>nextlink</name>
    <description>mapping "[[", "]]" by Autopagerize XPath.</description>
    <description lang="ja">Autopagerize 用の XPath より "[[", "]]" をマッピングします。</description>
    <author mail="suvene@zeromemory.info" homepage="http://zeromemory.sblo.jp/">suVene</author>
    <version>0.2.0</version>
    <minVersion>2.0</minVersion>
    <maxVersion>2.0pre</maxVersion>
    <detail><![CDATA[
== NEEDS LIBLARY ==
_libly.js(ver.0.1.8)
  @see http://coderepos.org/share/browser/lang/javascript/vimperator-plugins/trunk/_libly.js

== Option ==
let g:nextlink_followlink = "true"
と設定することにより、"[[", "]]" の動作は、カレントのタブに新しくページを読み込むようになります。

== Command ==
:nextlink
  autocmd によって呼び出されます。

== TODO ==
- microformats prev 対応.
- document cache clear.
  ]]></detail>
</VimperatorPlugin>;
//}}}
liberator.plugins.nextlink = (function() {
    if (!liberator.plugins.libly) {
        liberator.log('nextlink: needs _libly.js');
        return;
    }

    var libly = liberator.plugins.libly;
    var $U = libly.$U;
    var logger = $U.getLogger('nextlink');

    var isFollowLink = typeof liberator.globalVariables.nextlink_followlink == 'undefined' ?
                       false : $U.eval(liberator.globalVariables.nextlink_followlink);

    var pageNaviCss =
            <style type="text/css"><![CDATA[
                .vimperator-nextlink-page {
                    background-color: #333;
                    color: #fff;
                    opacity: .85;
                    filter: alpha(opacity = 85);
                    zoom: 1;
                    padding: 10px;
                    margin-top: 5px;
                    margin-bottom: 5px;
                    font-weight: bold;
                    text-align: left;
                    -moz-border-radius: 5px;
                    -webkit-border-radius: 5px;
                }
                .vimperator-nextlink-page a:link {
                    color: #EF6D29;
                }
                .vimperator-nextlink-page a:visited {
                    color: #A5000;
                }
            ]]></style>;

    var NextLink = function() {//{{{
        this.initialize.apply(this, arguments);
    };
    NextLink.prototype = {
        initialize: function(pager) {

            this.WEDATA_AUTOPAGERIZE = 'http://wedata.net/databases/Autopagerize/items.json';
            this.initialized = false;
            this.isCurOriginalMap = true;
            this.siteinfo = [];
            this.cache = {}; // {url: {xpath: xpath, next: element, prev: url}} or null
            this.pager = pager;

            var req = new libly.Request(this.WEDATA_AUTOPAGERIZE);
            req.addEventListener('onSuccess', $U.bind(this,
                function(res) {
                    var json = $U.evalJson(res.responseText);
                    if (!json) return;
                    this.siteinfo = json.map(function(item) item.data)
                                    .sort(function(a, b) b.url.length - a.url.length); // sort url.length desc
                    this.initialized = true;
                }
            ));
            req.get();
            /* // for debug
            this.initialized = true;
            this.siteinfo = [{
                url: 'http:\/\/192\.168\.',
                nextLink: 'id("next")',
                pageElement: '//*'
            }];
            */

            commands.addUserCommand(['nextlink'], 'map ]] by Autopagerize XPath.',
                $U.bind(this, function(args) { this.handler(args); }), null, true
            );
            var loadEvent = autocommands["DOMLoad"] || "PageLoad"; // for 1.2
            liberator.execute(':autocmd! ' + loadEvent + ' .* :nextlink onLoad');
            liberator.execute(':autocmd! LocationChange .* :nextlink onLocationChange');
        },
        handler: function(args) {
            event = args.string || args;
            this[event](buffer.URL);
            commandline.echo('');
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
                if (url.match(this.siteinfo[i].url)) {
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
                mappings.remove(config.browserModes, "[[");

            if (!next)
                mappings.remove(config.browserModes, "]]");

            this.pager.customizeMap(context, url, prev, next);
        },
        restorOrginalMap: function() {

            if (this.isCurOriginalMap) return;
            mappings.remove(config.browserModes, "[[");
            mappings.remove(config.browserModes, "]]");
            this.isCurOriginalMap = true;
        },
        setCache: function(key, subKeys, values) {

            if (!this.cache[key]) this.cache[key] = {};
            subKeys = [].concat(subKeys);
            values = [].concat(values);
            for (let i = 0, len = subKeys.length; i < len; i++) this.cache[key][subKeys[i]] = values[i];
        }
    }//}}}

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
                                      lastPageElement.parentNode.appendChild(doc.createTextNode(' '))

                let css = util.xmlToDom(pageNaviCss, doc);
                doc.body.appendChild(util.xmlToDom(pageNaviCss, doc));

                $U.getNodesFromXPath(cache.xpath, doc, function(item) elem = item, this);

                context.setCache(url,
                    ['prev', 'next', 'curPage', 'insertPoint', 'terminate', 'lastReqUrl', 'loadedURLs', 'mark'],
                    [[], [elem], 1, insertPoint, 0, null, {}, []]
                );
            }
        },
        customizeMap: function(context, url, prev, next) {

            var cache = context.cache[url];
            var doc = cache.doc;
             
            mappings.addUserMap(config.browserModes, ["[["], "customize by nextlink.js",
                $U.bind(this, function(count) {
                    if (cache.curPage == 1) {
                        return;
                    } else {
                        cache.curPage--;
                        if (cache.curPage == 1) {
                            window.content.scrollTo(0, 0);
                        } else {
                            this.focusPagenavi(context, url, cache.curPage);
                        }
                    }
                }),
                { flags: Mappings.flags.count });

            mappings.addUserMap(config.browserModes, ["]]"], "customize by nextlink.js",
                $U.bind(this, function(count) {
                    var reqUrl, lastReqUrl;
                    reqUrl = $U.pathToURL(cache.next[cache.curPage - 1], doc);
                    lastReqUrl = cache.lastReqUrl;

                    if (!reqUrl || cache.curPage == cache.terminate) {
                        return;
                    }
                    if (cache.loadedURLs[reqUrl]) {
                        cache.curPage++;
                        this.focusPagenavi(context, url, cache.curPage);
                        return;
                    }
                    context.setCache(url, 'lastReqUrl', reqUrl);
                    var req = new libly.Request(
                                    //reqUrl + '?' + new Date(), null,
                                    reqUrl, null,
                                    { asynchronous: false, encoding: doc.characterSet,
                                      context: context, url: url }
                                  );
                    req.addEventListener('onSuccess', $U.bind(this, this.onSuccess));
                    req.addEventListener('onFailure', $U.bind(this, this.onFailure));
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
            var page, htmlDoc, prev, next;

            page = res.getHTMLDocument(cache.siteinfo.pageElement);
            htmlDoc = res.doc;
            prev = cache.next[cache.curPage];
            next = $U.getNodesFromXPath(cache.xpath, htmlDoc);

            cache.loadedURLs[res.req.url] = true;

            if (!page || page.length < 1) {
                context.setCache(url, 'terminate', cache.curPage);
                return;
            }
             
            cache.curPage++;
            if (next && next.length) {
                cache.prev.push(prev);
                cache.next.push(next);
            } else {
                context.setCache(url, 'terminate', cache.curPage);
            }

            this.addPage(context, htmlDoc, url, page, res.req.url);
            this.focusPagenavi(context, url, cache.curPage);
        },
        addPage: function(context, doc, url, page, reqUrl) {
     
            var cache = context.cache[url];
            //var doc = cache.doc;
            var HTML_NAMESPACE = 'http://www.w3.org/1999/xhtml';
            var hr = doc.createElementNS(HTML_NAMESPACE, 'hr');
            var p = doc.createElementNS(HTML_NAMESPACE, 'p');

            if (page[0] && page[0].tagName == 'TR') {
                let insertParent = cache.insertPoint.parentNode;
                let colNodes = getElementsByXPath('child::tr[1]/child::*[self::td or self::th]', insertParent);

                let colums = 0
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
            } else {
                cache.insertPoint.parentNode.insertBefore(hr, cache.insertPoint);
                cache.insertPoint.parentNode.insertBefore(p, cache.insertPoint);
            }

            hr.id = 'vimperator-nextlink-' + cache.curPage;
            p.innerHTML = 'page: <a href="' + reqUrl + '">' + cache.curPage + '</a>';
            p.className = 'vimperator-nextlink-page';
            cache.mark.push(p);

            return page.map(function(i) {
                var pe = doc.importNode(i, true);
                cache.insertPoint.parentNode.insertBefore(pe, cache.insertPoint);
                return pe;
            });
        },
        onFailure: function(res) {
            res.res.options.context.setCache(res.req.options.url, 'terminate', cache.curPage);
        },
        focusPagenavi: function(context, url, page) {
           try {
               var elem = context.cache[url].mark[page - 2];
               var p = $U.getElementPosition(elem);
               window.content.scrollTo(0, p.top);
           } catch (e) {
               logger.log('focusPagenavi: err ' + page + ' ' + e);
           }
       }
    }//}}}

    var FollowLink = function() {};//{{{
    FollowLink.prototype = {
        onLocationChange: function(context, url, isCallerLoaded) {

            var cache = context.cache[url];
            var doc = cache.doc;
            var elem;

            //var matches = buffer.evaluateXPath(this.cache[url]);
            //for each (let match in matches) elem = match;
            $U.getNodesFromXPath(cache.xpath, doc, function(item) elem = item, this);

            var nextUrl = $U.pathToURL(elem, doc);
            context.setCache(nextUrl, 'prev', url);
            context.setCache(url, 'next', elem);
        },
        customizeMap: function(context, url, prev, next) {

            var cache = context.cache[url];
            var doc = cache.doc;

            if (prev)
                mappings.addUserMap(config.browserModes, ["[["], "customize by nextlink.js",
                    function(count) { liberator.open(prev, liberator.CURRENT_TAB); },
                    { flags: Mappings.flags.count });

            if (next)
                mappings.addUserMap(config.browserModes, ["]]"], "customize by nextlink.js",
                    function(count) { buffer.followLink(next, liberator.CURRENT_TAB); },
                    { flags: Mappings.flags.COUNT });
        }
    }//}}}

    var instance = new NextLink((isFollowLink ? new FollowLink() : new Autopager()));
    return instance;

})();
// vim: set fdm=marker sw=4 ts=4 sts=0 et:

