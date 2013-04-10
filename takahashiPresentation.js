// PLUGIN_INFO//{{{
var PLUGIN_INFO = xml`
<VimperatorPlugin>
    <name>{NAME}</name>
    <description>simple takahashi-method presentation tool</description>
    <author mail="konbu.komuro@gmail.com" homepage="http://d.hatena.ne.jp/hogelog/">hogelog</author>
    <version>0.1.1</version>
    <minVersion>2.3pre</minVersion>
    <maxVersion>2.3pre</maxVersion>
    <updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/takahashiPresentation.js</updateURL>
    <date>2008/12/23 09:20:07</date>
    <detail><![CDATA[

== COMMANDS ==
presentation:
   start presentation
== HOWTO ==
open HTML file includes <pre id="page">...</pre> and <div id="text">...</div>.
start :presentation.
     ]]></detail>
</VimperatorPlugin>`;
//}}}
(function() {
    let keys = [
        ['<Right>', 'next page', function() nextPage()],
        ['<Left>', 'prev page', function() prevPage()],
        ['^', 'first page', function() loadPage(0)],
        ['$', 'last page', function() loadPage(pages.length-1)],
        ['.', 'last page', function(count) loadPage(count?count-1:0), {count: true}],
        ['q', 'stop presentation', function() stop()],
    ];
    let win;
    let doc;
    let pages = [];
    let curpage = 0;
    let pre;
    let header;
    let fontSize = 18.0;

    function addKeys() {
        keys.forEach(function([key, desc, action, extra])
            mappings.addUserMap([modes.NORMAL], [key], desc, action, extra));
    }
    function fitPage() {
        if(pre.innerHTML=='') return;
        pre.style.display = 'inline';
        let parentWidth = pre.parentNode.offsetWidth;
        let parentHeight = pre.parentNode.offsetHeight;
        let width = pre.offsetWidth;
        let height = pre.offsetHeight;
        let preRatio = width/height;
        let winRatio = parentWidth/parentHeight;
        if(preRatio>winRatio) {
            fontSize *= 0.9*(parentWidth-10)/width;
        } else {
            fontSize *= 0.9*(parentHeight-10)/height;
        }
        pre.style.fontSize = fontSize+'px';
        pre.style.display = 'block';
    }
    function loadPage(page) {
        let text = pages[page];
        pre.innerHTML = text;
        if(header) {
            header.innerHTML = (page+1)+'/'+pages.length;
        }
        fitPage();
    }
    function nextPage() {
        curpage = curpage>=pages.length-1 ? 0 : curpage+1;
        loadPage(curpage);
    }
    function prevPage() {
        curpage = curpage<=0 ? pages.length-1 : curpage-1;
        loadPage(curpage);
    }
    function parsePages(text) {
        return text.split('----')
                   .map(function(txt) txt.replace(/^(?:\r\n|[\r\n])|(?:\r\n|[\r\n])$/g, ''));
    }
    function save_setting(setting) {
        setting.fullscreen = options.fullscreen;
        setting.guioptions = options.guioptions;
        // TODO: save key mapping
        //setting.mappings = keys.map(function([key,]) {
        //    let mapping = mappings.get(modes.NORMAL, key);
        //    return [mapping.modes, key, mapping.description, mapping.action, mapping.extra];
        //});
    }
    function load_setting(setting) {
        options.fullscreen = setting.fullscreen;
        options.guioptions = setting.guioptions;
        // TODO: load key mapping
        //setting.mappings.forEach(function([modes, key, desc, action, extra]) {
        //    mappings.addUserMap(modes, [key], desc, action, extra);
        //});
    }
    let original_setting = {};
    function start() {
        save_setting(original_setting);

        options.fullscreen = true;
        options.guioptions = '';
        win = window.content;
        doc = win.document;
        let text = util.evaluateXPath('//div[@id="text"]').snapshotItem(0);
        pages = parsePages(text.innerHTML);
        addKeys();

        header = util.evaluateXPath('//*[@id="header"]').snapshotItem(0);

        pre = util.evaluateXPath('//pre[@id="page"]').snapshotItem(0);
        pre.style.fontSize = fontSize+'px';
        pre.style.margin = '0px';

        loadPage(0);
    }
    function stop() {
        load_setting(original_setting);
    }

    commands.add(['presentation'], 'start presentation', //{{{
        function(args) {
            start();
        },
        {
            argCount: '0',
        }); //}}}

})();
// vim: fdm=marker sw=4 ts=4 et:
