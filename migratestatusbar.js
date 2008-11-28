/*
 * ==VimperatorPlugin==
 * @name            migratestatusbar.js
 * @description     migrate specified elements to status bar.
 * @description-ja  指定した要素をステータスバーに移動する。
 * @author          janus_wel <janus_wel@fb3.so-net.ne.jp>
 * @version         0.10
 * @minversion      2.0pre
 * @maxversion      2.0pre
 * ==/VimperatorPlugin==
 *
 * LICENSE
 *  New BSD License
 *
 * USAGE
 *  this script do not effect in default.
 *  you should set liberator.globalVariables.migrate_elements.
 *  it is the ARRAY has objects like below:
 *
 *      {
 *          id:    id of the target element,
 *          dest:  id of the destination element - this is marker. in fine tuning, used 'after',
 *          after: boolean that show insert position is after 'dest' element.
 *      }
 *
 *  refer: http://d.hatena.ne.jp/janus_wel/20081127/1227807826
 *
 * EXAMPLE
 *  in .vimperatorrc
 *
 *  javascript <<EOM
 *      liberator.globalVariables.migrate_elements = [
 *          {
 *              // star button of awesome bar
 *              id:    'star-button',
 *              dest:  'security-button',
 *              after: true,
 *          },
 *          {
 *              // icon that show the existence of RSS and Atom on current page
 *              id:    'feed-button',
 *              dest:  'security-button',
 *              after: true,
 *          },
 *          {
 *              // favicon of awesome bar
 *              id:    'page-proxy-stack',
 *              dest:  'liberator-statusline',
 *              after: false,
 *          },
 *      ];
 *  EOM
 *
 * ACKNOWLEDGMENT
 *  refer: http://vimperator.org/trac/ticket/17
 *  thanks teramako.
 *
 * */

(function() {

const style = [
    'padding:    1px;',
    'margin:     0;',
    'border:     none;',
    'max-height: 18px;',
    'max-width:  18px;',
].join('');

function migrateElements(elements) {
    const doc = window.document;
    let master = doc.createElement('statusbarpanel');
    master.setAttribute('style', style);

    for (let [, e] in Iterator(elements)) {
        let base = doc.getElementById(e.id);
        let dest = doc.getElementById(e.dest);
        if (!dest || !base) {
            liberator.log('id "' + e.id + '" or "' + e.dest + '" is not exist.', 0);
            continue;
        }

        base.setAttribute('style', style);
        let panel = master.cloneNode(false);
        panel.setAttribute('id', 'panel-' + e.id);
        panel.appendChild(base);
        e.after
            ? insertNodeAfterSpecified(panel, dest)
            : insertNodeBeforeSpecified(panel, dest);
    }
}

// node control
function insertNodeBeforeSpecified(inserted, specified) {
    return specified.parentNode.insertBefore(inserted, specified);
}
function insertNodeAfterSpecified(inserted, specified) {
    var next = specified.nextSibling;
    if(next) {
        return specified.parentNode.insertBefore(inserted, next);
    }
    else {
        return specified.parentNode.appendChild(inserted);
    }
}

// main
let elements = liberator.globalVariables.migrate_elements;
if (elements) migrateElements(elements);

})();

// vim: set sw=4 ts=4 et;
