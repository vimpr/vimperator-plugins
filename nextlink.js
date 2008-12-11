// PLUGIN_INFO//{{{
var PLUGIN_INFO =
<VimperatorPlugin>
    <name>nextlink</name>
    <description>mapping "[[", "]]" by Autopagerize XPath.</description>
    <description lang="ja">Autopagerize 用の XPath より "[[", "]]" をマッピングします。</description>
    <author mail="suvene@zeromemory.info" homepage="http://zeromemory.sblo.jp/">suVene</author>
    <version>0.1.0</version>
    <minVersion>2.0</minVersion>
    <maxVersion>2.0pre</maxVersion>
    <detail><![CDATA[
== NEEDS LIBLARY ==
_libly.js(ver.0.1.7)
  @see http://coderepos.org/share/browser/lang/javascript/vimperator-plugins/trunk/_libly.js

== Command ==
:nextlink
  autocmd によって呼び出されます。
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
                       true : $U.eval(liberator.globalVariables.nextlink_followlink);

    var NextLink = function() {//{{{
        this.initialize.apply(this, arguments);
    };
    NextLink.prototype = {
        initialize: function() {

            this.WEDATA_AUTOPAGERIZE = 'http://wedata.net/databases/Autopagerize/items.json';
            this.initialized = false;
            this.isCurOriginalMap = true;
            this.siteinfo = [];
            this.cache = {}; // {url: {xpath: xpath, next: element, prev: url}} or null

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

            commands.addUserCommand(['nextlink'], 'map ]] by Autopegrize XPath.',
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
                this.onLocationChange(url);
                return;
            }

            for (let i = 0, len = this.siteinfo.length; i < len; i++) {
                if (url.match(this.siteinfo[i].url)) {
                    this.setCache(url, 'xpath', this.siteinfo[i].nextLink)
                    this.onLocationChange(url);
                    return;
                }
            }
            this.setCache(url, ['xpath', 'next', 'prev'], [null, null, null]);
        },
        onLocationChange: function(url) {

            if (!this.initialized ||
                !this.cache[url] ||
                !this.cache[url].hasOwnProperty('xpath')) return;

            if (this.cache[url]['xpath'] == null) {
                this.restorOrginalMap();
                return;
            }
            if (this.cache[url].next) this.cache[url].next.style.backgroundColor = '#F00';

            var elem;
            //var matches = buffer.evaluateXPath(this.cache[url]);
            //for each (let match in matches) elem = match;
            $U.getNodesFromXPath(this.cache[url].xpath, window.content.document,
                function(item) elem = item, this);

            var nextUrl = $U.pathToURL(elem, window.content.document);
            this.setCache(url, 'next', elem);
            this.setCache(nextUrl, 'prev', url);
            this.customizeMap(elem, url, this.cache[url].prev, (nextUrl || null));
        },
        customizeMap: function(elem, url, prevUrl, nextUrl) {

            if (!prevUrl) {
                mappings.remove(config.browserModes, "[[");
            } else {
                if (isFollowLink) {
                    mappings.addUserMap(config.browserModes, ["[["], "customize by nextlink.js", 
                        function(count) { liberator.open(prevUrl, liberator.CURRENT_TAB); }, 
                        { flags: Mappings.flags.count });
                } else {
                }
            }

            if (!nextUrl) {
                mappings.remove(config.browserModes, "]]");
            } else {
                if (isFollowLink) {
                    mappings.addUserMap(config.browserModes, ["]]"], "customize by nextlink.js",
                        function(count) { buffer.followLink(elem, liberator.CURRENT_TAB); },
                        { flags: Mappings.flags.COUNT });
                } else {
                    // TODO: pagirize!
                }
            }

            this.isCurOriginalMap = false;
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

    var instance = new NextLink();
    return instance;

})();
// vim: set fdm=marker sw=4 ts=4 sts=0 et:

