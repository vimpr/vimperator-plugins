/*
 * ==VimperatorPlugin==
 * @name            googledocs.js
 * @description     extended-hints modes for Google Docs.
 * @description-ja  Google Docs 用 extended-hints mode 詰め合わせ。
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
 *  hit ';d' on top-page of Google Docs: in default setting.
 *  setting is available to change the variable 'googledocs_mapping'
 *
 *      let googledocs_mapping='g'
 *
 * */

( function () {
hints.addMode(
    liberator.globalVariables.googledocs_mapping || 'd',
    'operate google doc',
    function (element) {
        if (element.localName.toLowerCase() === 'div') {
            let mousedown = document.createEvent('MouseEvent');
            mousedown.initMouseEvent(
                'mousedown', true, true,
                window.content.document.defaultView, 1,
                0, 0, 0, 0,
                false, false, false, false,
                0, null
            );
            let mouseup = document.createEvent('MouseEvent');
            mouseup.initMouseEvent(
                'mouseup', true, true,
                window.content.document.defaultView, 1,
                0, 0, 0, 0,
                false, false, false, false,
                0, null
            );
            element.dispatchEvent(mousedown);
            element.dispatchEvent(mouseup);
        }
        else {
            let click = document.createEvent('MouseEvent');
            click.initMouseEvent(
                'click', true, true,
                window.content.document.defaultView, 1,
                0, 0, 0, 0,
                false, false, false, false,
                0, null
            );
            element.dispatchEvent(click);
        }
    },
    function () {
        if (!/http:\/\/docs\.google\.com\//.test(buffer.URL)) return;
        const divClassNames = [
            'goog-listitem-content',
            'goog-listheaderitem-content',
            'goog-toolbar-button',
            'goog-toolbar-popup-button',
            'goog-toolbar-menu-button',
            'detroit-menuitem',
        ].map(function (c) 'contains(concat(" ", @class, " "), " ' + c + ' ")').join(' or ');
        const spanClassNames = [
            'goog-listheaderitem-zippy',
            'actionstatusbox-undo',
        ].map(function (c) 'contains(concat(" ", @class, " "), " ' + c + ' ")').join(' or ');
        return [
            '//div['  + divClassNames  + ']',
            '//span[' + spanClassNames + ']',
        ].join(' | ');
    }
);
} )();

// vim: set sw=4 ts=4 et;
