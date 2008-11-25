/*
 * ==VimperatorPlugin==
 * @name            hidecritter.js
 * @description     hide specified elements.
 * @description-ja  指定した要素を隠す。
 * @author          janus_wel <janus_wel@fb3.so-net.ne.jp>
 * @version         0.11
 * @minversion      2.0pre 2008/10/16
 * ==/VimperatorPlugin==
 *
 * LICENSE
 *   New BSD License
 *
 * USAGE
 *   hit ';h'
 *
 * TODO
 *  use wedata.net... ?
 * */

( function () {
const localSITEINFO = [
    {
        name:   'はてなダイアリー',
        url:    'http://d.hatena.ne.jp/',
        xpath:  '( id("simple-header") | //div[contains(concat(" ", @class, " "), " header ")] | //div[contains(concat(" ", @class, " "), " sidebar ")])',
    }
];

const defaultSITEINFO = {
    name:   'default',
    url:    '.*',
    xpath:  '( //*[contains(@id, "header")] | //*[contains(@id, "footer")] | //*[contains(@id, "sidebar")] | //*[contains(@class, "header")] | //*[contains(@class, "footer")] | //*[contains(@class, "sidebar")] )',
};

hints.addMode(
    liberator.globalVariables.hidecritter_mapping || 'h',
    'hide look like header, footer, sidebar and so on',
    function (element) {
        element.style.display = 'none';
    },
    function () {
        let siteinfo;
        for (let [, s] in Iterator(localSITEINFO)) {
            if (buffer.URL.match(s.url)) {
                siteinfo = s;
                break;
            }
        }
        if (!siteinfo) siteinfo = defaultSITEINFO;

        return siteinfo.xpath;
    }
);
} )();

// vim: set sw=4 ts=4 et;
