// PLUGIN_INFO//{{{
var PLUGIN_INFO =
<VimperatorPlugin>
    <name>{NAME}</name>
    <description>simple takahashi-method presentation tool</description>
    <author mail="konbu.komuro@gmail.com" homepage="http://d.hatena.ne.jp/hogelog/">hogelog</author>
    <version>0.1</version>
    <minVersion>2.0a1</minVersion>
    <maxVersion>2.0a1</maxVersion>
    <detail><![CDATA[

== COMMANDS ==
presentation:
   start presentation
== HOWTO ==
open html file includes <pre id="page">...</pre> and <div id="text">...</pre>.
start :presentation.
     ]]></detail>
</VimperatorPlugin>;
//}}}
(function() {
    plugins.presentation = {};
    let keys = [
        ['<Right>', 'next page', function() nextPage()],
        ['<Left>', 'prev page', function() prevPage()],
        ['^', 'first page', function() loadPage(0)],
        ['$', 'last page', function() loadPage(pages.length-1)],
        ['.', 'last page', function(count) loadPage(count?count-1:0), {flags: Mappings.flags.COUNT}],
    ];
    let win;
    let doc;
    let pages = [];
    let curpage = 0;
    let pre;
    let div;
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
        head.innerHTML = (page+1)+'/'+pages.length;
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
        if(/:backgroundImage:(.+)\n/.test(text)) {
            doc.body.style.backgroundImage = RegExp.$1;
            doc.body.style.backgroundRepeat = 'repeat';
        }
        text = text.replace(/:.+\n/g, '');
        return text.split('----').map(function(txt) txt.replace(/^\n/, '').replace(/\n$/, ''));
    }
    function start() {
        options.fullscreen = true;
        options.guioptions = "";
        win = window.content;
        doc = win.document;
        let text = buffer.evaluateXPath('//div[@id="text"]').snapshotItem(0);
        pages = parsePages(text.innerHTML);
        addKeys();

        div = doc.createElement('div');
        head = doc.createElement('div');
        head.style.textAlign = 'right';
        doc.body.appendChild(head);

        pre = buffer.evaluateXPath('//pre[@id="page"]').snapshotItem(0);
        pre.style.fontSize = fontSize+'px';
        pre.style.margin = '0px';

        loadPage(0);
    }

    commands.add(['presentation'], 'start presentation', //{{{
        function(args) {
                stop();
        },
        {
            argCount: '0',
        }); //}}}

})();
// vim: fdm=marker sw=4 ts=4 et:
