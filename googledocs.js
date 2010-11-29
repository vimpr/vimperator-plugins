/*
 * LICENSE
 *  New BSD License: http://opensource.org/licenses/bsd-license.php
 *
 *  Copyright (c) 2008-2009, janus_wel<janus.wel.3@gmailcom>
 *  All rights reserved.
 *
 *  Redistribution and use in source and binary forms, with or
 *  without modification, are permitted provided that the following
 *  conditions are met:
 *
 *      * Redistributions of source code must retain the above
 *        copyright notice, this list of conditions and the
 *        following disclaimer.
 *      * Redistributions in binary form must reproduce the above
 *        copyright notice, this list of conditions and the following
 *        disclaimer in the documentation and/or other materials
 *        provided with the distribution.
 *      * Neither the name of the <ORGANIZATION> nor the names of its
 *        contributors may be used to endorse or promote products
 *        derived from this software without specific prior written
 *        permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND
 *  CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES,
 *  INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 *  MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 *  DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS
 *  BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 *  TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 *  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 *  ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 *  OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
 *  OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 *  POSSIBILITY OF SUCH DAMAGE.
 * */

// Last Change: 2009/01/14 22:14:16.
let PLUGIN_INFO = 
<VimperatorPlugin>
    <name>{NAME}</name>
    <description>provide extended-hints modes for Google Docs</description>
    <description lang="ja">Google Docs 用 extended-hints mode 詰め合わせ</description>
    <author mail="janus.wel.3@gmail.com">janus_wel</author>
    <license document="http://www.opensource.org/licenses/bsd-license.php">New BSD License</license>
    <version>0.20</version>
    <minVersion>2.0pre</minVersion>
    <maxVersion>2.0pre</maxVersion>
    <updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/googledocs.js</updateURL>
    <detail><![CDATA[
== USAGE ==
Hit ';d' on top-page of Google Docs ( http://docs.google.com/ ).
So, you can enter extended-hints mode to select, execute clickable menu.
The setting is available to change the variable 'googledocs_mapping'

== EXAMPLE ==
This example provide you the key sequense: ';g', to enter extended-hints mode.

>||
let googledocs_mapping='g'
||<
    ]]></detail>
    <detail lang="ja"><![CDATA[
== USAGE ==
Google Docs のトップページ ( http://docs.google.com/ ) で ';d' と押してください。
そうするとクリックすることのできるメニューを選択・実行することが可能な extended-hints モードが開始されます。
設定は 'googledocs_mapping' という変数を変更することで可能です。

== EXAMPLE ==
この例はキー ';g' で extended-hints モードを開始します。

>||
let googledocs_mapping='g'
||<
    ]]></detail>
</VimperatorPlugin>;


( function () {

// configuration ---
// enumerate clickable div and span classes
// plz FOLLOW latest edition of Google Docs
const divClasses = [
    'goog-listitem-content',
    'goog-listheaderitem-content',
    'goog-toolbar-button',
    'goog-toolbar-popup-button',
    'goog-toolbar-menu-button',
    'detroit-menuitem',
];
const spanClasses = [
    'goog-listheaderitem-zippy',
    'actionstatusbox-undo',
];

// build XPath expression
function classXPath(c) 'contains(concat(" ", @class, " "), " ' + c + ' ")';
const divXpath  = '//div['  + divClasses.map(classXPath).join(' or ')  + ']';
const spanXpath = '//span[' + spanClasses.map(classXPath).join(' or ') + ']';
const clickableXPath = [divXpath, spanXpath].join(' | ');


// main ---
// add extended-hints mode for buttons of Google Docs
hints.addMode(
    liberator.globalVariables.googledocs_mapping || 'd',
    'operate Google Docs',
    function (element) {
        let d = window.content.document;
        let v = d.defaultView;
        switch (element.localName.toLowerCase()) {
            case 'div':
                mouseDown(element, d, v);
                mouseUp(element, d, v);
                break;
            case 'span':
                mouseClick(element, d, v);
                break;
            default:
                break;
        }
    },
    function () {
        if (!/^https?:\/\/docs\.google\.com\//.test(buffer.URL)) return;
        return clickableXPath;
    }
);

// stuff ---
function mouseDown(target, document, view) {
    let mousedown = document.createEvent('MouseEvent');
    mousedown.initMouseEvent(
        'mousedown', true, true,
        view, 1,
        0, 0, 0, 0,
        false, false, false, false,
        0, null
    );
    target.dispatchEvent(mousedown);

    return true;
}
function mouseUp(target, document, view) {
    let mouseup = document.createEvent('MouseEvent');
    mouseup.initMouseEvent(
        'mouseup', true, true,
        view, 1,
        0, 0, 0, 0,
        false, false, false, false,
        0, null
    );
    target.dispatchEvent(mouseup);

    return true;
}
function mouseClick(target, document, view) {
    let click = document.createEvent('MouseEvent');
    click.initMouseEvent(
        'click', true, true,
        view, 1,
        0, 0, 0, 0,
        false, false, false, false,
        0, null
    );
    target.dispatchEvent(click);

    return true;
}
} )();

// vim: set sw=4 ts=4 et;
