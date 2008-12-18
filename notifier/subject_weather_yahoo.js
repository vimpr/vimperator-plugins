// PLUGIN_INFO//{{
var PLUGIN_INFO =
<VimperatorPlugin>
    <name>{NAME}</name>
    <description>yahoo weather forecast notice.</description>
    <description lang="ja">ヤフー天気予報通知。</description>
    <author mail="suvene@zeromemory.info" homepage="http://zeromemory.sblo.jp/">suVene</author>
    <version>0.1.1</version>
    <minVersion>2.0pre</minVersion>
    <maxVersion>2.0pre</maxVersion>
    <detail><![CDATA[
== Options ==
>||
liberator.globalVariables.subject_weather_yahoo_urls =  [url1, url2,…]
||<
- @see http://weather.yahoo.co.jp/weather/
    ]]></detail>
</VimperatorPlugin>;
//}}}
(function() {

var notifier = liberator.plugins.notifier;
if (!notifier) return;

var libly = notifier.libly;
var $U = libly.$U;
var logger = $U.getLogger('subject_weather_yahoo');

var URLs = liberator.globalVariables.subject_weather_yahoo_urls || [
    'http://weather.yahoo.co.jp/weather/jp/27/6200/27127/5300001.html',
    'http://weather.yahoo.co.jp/weather/jp/13/4410/13113/1500001.html'
];

URLs.forEach(function(url) {
    notifier.subject.register(notifier.SubjectHttp, {
        interval: 10,
        options: {
            url: url,
            headers: null,
            extra: { encoding: 'euc-jp' }
        },
        parse: function(res) {
            var parsed = res.getHTMLDocument(
                            'id("cat-pass") | id("yjw_pinpoint_today") | id("yjw_pinpoint_tomorrow")'
                         );
            if (!parsed.length) return;

            var now = new Date();
            var hours = now.getHours();
            var start = Math.floor(hours / 3) + 1;
            var yahooToday = $U.getFirstNodeFromXPath('descendant::h3/span/text()', parsed[1]);
            yahooToday = yahooToday.textContent.replace(/.*\u6708(\d+)\u65E5.*/, '$1'); // 月($1)日
            var source, cloneTable;


            if (yahooToday == now.getDate()) {
                source = parsed[1];
            } else {
                source = parsed[2];
            }

            var table = $U.getFirstNodeFromXPath('descendant::table', source);
            table.style.width = '95%';
            table.style.color = '#222';
            var cloneTable = table.cloneNode(false);
            this.cloneTable(cloneTable, table, start, start + 3, true);

            // concat tommorow
            if (start > 6)
                this.cloneTable(cloneTable,
                        $U.getFirstNodeFromXPath('descendant::table', parsed[2]),
                        1, (3 - (8 - start)), false);

            var next = new Date();
            next.setHours(now.getHours() + 1)
            next.setMinutes(0);
            next.setSeconds(0);
            this.interval = (next.getTime() - now.getTime()) / 1000;

            var df = window.content.document.createDocumentFragment();
            df.appendChild(parsed[0]);
            df.appendChild(cloneTable);
            return df;
        },
        cloneTable: function(source, table, start, end, withHead) {
            var rows = table.getElementsByTagName('tr');
            for (let r = 0, len = rows.length; r < len; r++) {
                let row = withHead ? rows[r].cloneNode(false) : source.getElementsByTagName('tr')[r];
                let cols = rows[r].getElementsByTagName('td');
                if (withHead)
                    source.appendChild(row);
                for (let c = 0, len2 = cols.length; c < len2; c++) {
                    if ((withHead && c == 0) || (start <= c && c < end)) {
                        row.appendChild(cols[c].cloneNode(true));
                    }
                }
            }
            return source;
        },
        buildMessages: function(diff) {
            return new notifier.Message('Weather forecast by Yahoo!', $U.xmlSerialize(diff), url);
        }
    });
});

})();
// vim: set fdm=marker sw=4 ts=4 sts=0 et:

