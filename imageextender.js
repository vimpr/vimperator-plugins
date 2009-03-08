/*
 * LICENSE
 *  New BSD License: http://opensource.org/licenses/bsd-license.php
 *
 *  Copyright (c) 2008-2009, janus_wel<janus.wel.3@gmailcom>
 *  All rights reserved.
 *
 *  Redistribution and use in source and binary forms, with or without
 *  modification, are permitted provided that the following conditions are
 *  met:
 *
 *      * Redistributions of source code must retain the above copyright
 *        notice, this list of conditions and the following disclaimer.
 *      * Redistributions in binary form must reproduce the above copyright
 *        notice, this list of conditions and the following disclaimer in
 *        the documentation and/or other materials provided with the
 *        distribution.
 *      * Neither the name of the <ORGANIZATION> nor the names of its
 *        contributors may be used to endorse or promote products derived
 *        from this software without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
 *  IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
 *  TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
 *  PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER
 *  OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 *  PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 *  PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 *  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 *  SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 * */

let PLUGIN_INFO =
<VimperatorPlugin>
    <name>{NAME}</name>
    <description>extend image operation.</description>
    <description lang="ja">画像操作特集。</description>
    <author mail="janus_wel@fb3.so-net.ne.jp" homepage="http://d.hatena.ne.jp/janus_wel">janus_wel</author>
    <license document="http://www.opensource.org/licenses/bsd-license.php">New BSD License</license>
    <version>0.11</version>
    <minversion>2.0pre</minversion>
    <maxversion>2.0pre</maxversion>
    <detail><![CDATA[
== USAGE ==
Extended-hints mode ';m' to yank image URL and ';i' to save image are
available. These are default settings. You can change these by below
settings.

Ex-command ':downimageall' is also available. This is to download all
images of current page, but it effects heavy load to the server, you must
use carefully. We are NOT RESPONSIBLE for result of this command.

== SETTING ==
:image_extender_yank_key:
The key to yank image URL(default: 'm').
:image_extender_save_key:
The key to save image(default: 'i').
:image_extender_skip_prompt:
If this setted 'true', skip prompt to locate and name. Changing this value
will reflect dynamically. ':downimageall' command ignore this
setting(default: 'false').

== EXAMPLE ==
In .vimperatorrc

>||
image_extender_yank_key='g'
image_extender_save_key='e'
image_skip_prompt='true'
||<

In this settings, ';g' start extended-hints mode to yank image URL.  ';e'
start it to save image, and prompt is not displayed at save operation.
]]></detail>
    <detail lang="ja"><![CDATA[
== USAGE ==
画像の URL をヤンクする ';m' と 画像を保存する ';i' という拡張ヒントモードが使えるようになります。
これらはデフォルト設定です。後述する設定でキーを変更できます。

':downimageall' という ex コマンドも使えるようになります。
これは現在のページの画像をすべて保存するものですが、サーバに大きな負荷がかかるため注意して使ってください。
このコマンドの使用による結果は一切の責任を負いかねます。

== SETTING ==
:image_extender_yank_key:
画像 の URL をヤンクするキーです (デフォルト: 'm') 。
:image_extender_save_key:
画像を保存するキーです (デフォルト: 'i') 。
:image_extender_skip_prompt:
この値が 'true' の場合、保存する場所や名前を指定するダイアログは表示されません。
この値の変更は即座に反映されます。
':downimageall' コマンドはこの設定を無視します (デフォルト: 'false') 。

== EXAMPLE ==
.vimperatorrc の中で、

>||
image_extender_yank_key='g'
image_extender_save_key='e'
image_skip_prompt='true'
||<

と設定すると、 ';g' で画像の URL をヤンクする拡張ヒントモードが開始されます。
';e' で画像を保存しますが、その際ダイアログは表示されません。
]]></detail>
</VimperatorPlugin>;

( function () {

// default settings
const yankKey = liberator.globalVariables.image_extender_yank_key || 'm';
const saveKey = liberator.globalVariables.image_extender_save_key || 'i';

// common settings
const query = '//img[@src and not(starts-with(@src, "data:"))]';
const interval = 200; // 5 images per second

// extended-hints mode
// to yank image URL
hints.addMode(
    yankKey,
    'Yank image URL',
    function (element) util.copyToClipboard(element.src, true),
    function () query
);
// to save image
hints.addMode(
    saveKey,
    'Save image',
    function (element) {
        let skipPrompt = stringToBoolean(liberator.globalVariables.image_extender_skip_prompt, false);

        try       { saveImage(element, skipPrompt); }
        catch (e) { liberator.echoerr(e); }
    },
    function () query
);
commands.addUserCommand(
    ['downimageall'],
    'download all images of current page',
    function () {
        // refer: http://d.hatena.ne.jp/amachang/20071108/1194501306
        let images = buffer.evaluateXPath(query);
        let l = images.snapshotLength;
        let i = 0;
        setTimeout ( function a() {
            if (!(i < l)) return;
            try       { saveImage(images.snapshotItem(i), true); }
            catch (e) { liberator.echoerr(e); }
            ++i;
            setTimeout(a, interval);
        }, interval);
    },
    {}
);

// stuff function
function stringToBoolean(str, defaultValue) {
    return !str                          ? (defaultValue ? true : false)
         : str.toLowerCase() === 'false' ? false
         : /^\d+$/.test(str)             ? (parseInt(str) ? true : false)
         :                                 true;
}

function saveImage(imgElement, skipPrompt) {
    let doc = imgElement.ownerDocument;
    let url = imgElement.src;
    let filename = url.split(/\/+/g).pop();

    urlSecurityCheck(url, doc.nodePrincipal);
    // we always want to save that link relative to the current working directory
    options.setPref("browser.download.lastDir", io.getCurrentDirectory().path);
    saveImageURL(url, filename, null, true, skipPrompt, makeURI(url, doc.characterSet));
}
} )();

// vim: sw=4 sts=4 ts=4 et
