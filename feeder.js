/**
 * ==VimperatorPlugin==
 * @name           feeder.js
 * @description    This plugin allows you to give feed to some feed reader.
 * @description-ja 指定した feed reader にフィードを追加
 * @author         janus_wel <janus_wel@fb3.so-net.ne.jp>
 * @version        0.10
 * @minVersion     2.0pre
 * ==/VimperatorPlugin==
 *
 * LICENSE
 *   New BSD License
 *
 * Usage:
 *  in all case, when option 'newtab' is 'all',
 *  subscribe page is opened in new tab.
 *
 *  :feedgooglereader, :fgr
 *      -> feed Google Reader
 *         http://www.google.com/reader
 *
 *  :feedfastladder, :ffl
 *      -> feed Fastladder
 *         http://fastladder.com
 *
 *  :feedlivedoorreader, :fldr
 *      -> feed LiveDoor Reader
 *         http://reader.livedoor.com/
 *
 * HISTORY
 *  2008/11/10  ver 0.10    - initial written
 *
 * */

( function () {

// for Google Reader
commands.addUserCommand(
    ['feedgooglereader', 'fgr'],
    'feed current site url to Google Reader',
    function () {
        let doc = content.document;
        let b = doc.body;
        let GR________bookmarklet_domain = 'http://www.google.com';
        if (b && ! doc.xmlVersion){
            z = doc.createElement('script');
            z.src = 'http://www.google.com/reader/ui/subscribe-bookmarklet.js';
            b.appendChild(z);
        }
        else {
            liberator.open(
                'http://www.google.com/reader/view/feed/' + encodeURIComponent(liberator.modules.buffer.URL),
                (options['newtab'] && options.get('newtab').has('all'))
                    ? liberator.NEW_TAB
                    : liberator.CURRENT_TAB
            );
        }
    },
    {}
);

// for Fastladder
commands.addUserCommand(
    ['feedfastladder', 'ffl'],
    'feed current site url to Fastladder',
    function () {
        liberator.open(
            'http://fastladder.com/subscribe/' + liberator.modules.buffer.URL,
            (options['newtab'] && options.get('newtab').has('all'))
                ? liberator.NEW_TAB
                : liberator.CURRENT_TAB
        );
    },
    {}
);

// for LiveDoor Reader
/* plz check this code!!
commands.addUserCommand(
    ['feedlivedoorreader', 'fldr'],
    'feed current site url to LiveDoor Reader',
    function () {
        liberator.open(
            'http://reader.livedoor.com/subscribe/' + liberator.modules.buffer.URL,
            (options['newtab'] && options.get('newtab').has('all'))
                ? liberator.NEW_TAB
                : liberator.CURRENT_TAB
        );
    },
    {}
);
*/
})();
// vim:sw=4 ts=4 et:
