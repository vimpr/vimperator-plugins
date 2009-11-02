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
    <version>0.21</version>
    <minversion>2.3pre</minversion>
    <maxversion>2.3pre</maxversion>
    <detail><![CDATA[
== USAGE ==
Extended-hints mode ';m' to yank image URL and ';M' to save image are
available. These are default settings. You can change these by below
settings.

Ex-command ':downimageall' is also available. This is to download all
images of current page, but it effects heavy load to the server, you must
use carefully. We are NOT RESPONSIBLE for result of this command.

Additionally, following modes are available if you installed Image Zoom
add-on ( https://addons.mozilla.org/firefox/addon/139 ). These feature
were provided by Frank Blendinger. Thanks !!

- ';i' to zoom in image
- ';x' to zoom out image
- ';X' to zoom reset image
- ';z' to zoom fit image
- ';Z' to custom zoom image

== SETTING ==
:image_extender_yank_key:
The key to yank image URL(default: 'm').
:image_extender_save_key:
The key to save image(default: 'M').
:image_extender_zoom_in_key:
The key to zoom in image(default: 'i').
:image_extender_zoom_out_key:
The key to zoom out image(default: 'x').
:image_extender_zoom_reset_key:
The key to zoom reset image(default: 'X').
:image_extender_zoom_fit_key:
The key to zoom fit image(default: 'z').
:image_extender_zoom_custom_key:
The key to custom zoom image(default: 'Z').
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
画像の URL をヤンクする ';m' と 画像を保存する ';M' という拡張ヒントモードが使えるようになります。
これらはデフォルト設定です。後述する設定でキーを変更できます。

':downimageall' という ex コマンドも使えるようになります。
これは現在のページの画像をすべて保存するものですが、サーバに大きな負荷がかかるため注意して使ってください。
このコマンドの使用による結果は一切の責任を負いかねます。

さらに、 Image Zoom ( https://addons.mozilla.org/firefox/addon/139 ) アドオンをインストールしている場合以下のモードが使えるようになります。
この機能は Frank Blendinger さんによって提供されました。ありがとう !!

- 画像を拡大する ';i'
- 画像を縮小する ';x'
- 画像の拡大縮小を元に戻す ';X'
- 画像を画面にあわせて表示する ';z'
- 画像をカスタムズームさせる ';Z'

== SETTING ==
:image_extender_yank_key:
画像 の URL をヤンクするキーです (デフォルト: 'm') 。
:image_extender_save_key:
画像を保存するキーです (デフォルト: 'M') 。
:image_extender_zoom_in_key:
画像を拡大するキーです (デフォルト: 'i') 。
:image_extender_zoom_out_key:
画像を縮小するキーです (デフォルト: 'x') 。
:image_extender_zoom_reset_key:
画像の拡大縮小を元に戻すキーです (デフォルト: 'X') 。
:image_extender_zoom_fit_key:
画像を画面にあわせて拡大縮小するキーです (デフォルト: 'z') 。
:image_extender_zoom_custom_key:
画像をカスタムズームさせるキーです (デフォルト: 'Z') 。
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
const yankKey       = liberator.globalVariables.image_extender_yank_key         || 'm';
const saveKey       = liberator.globalVariables.image_extender_save_key         || 'M';
const zoomInKey     = liberator.globalVariables.image_extender_zoom_in_key      || 'i';
const zoomOutKey    = liberator.globalVariables.image_extender_zoom_out_key     || 'x';
const zoomResetKey  = liberator.globalVariables.image_extender_zoom_reset_key   || 'X';
const zoomFitKey    = liberator.globalVariables.image_extender_zoom_fit_key     || 'z';
const zoomCustomKey = liberator.globalVariables.image_extender_zoom_custom_key  || 'Z';

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
if (window.izImage) {
    // to zoom in image
    hints.addMode(
        zoomInKey,
        'Zoom in image',
        function (element) {
            var oizImage = new izImage(element);
            oizImage.zoom(nsIPrefBranchObj.getIntPref("zoomvalue")/100);
            reportStatus(oizImage);
        },
        function () query
    );
    // to zoom out image
    hints.addMode(
        zoomOutKey,
        'Zoom out image',
        function (element) {
            var oizImage = new izImage(element);
            oizImage.zoom(100/nsIPrefBranchObj.getIntPref("zoomvalue"));
            reportStatus(oizImage);
        },
        function () query
    );
    // to zoom reset image
    hints.addMode(
        zoomResetKey,
        'Zoom reset image',
        function (element) {
            var oizImage = new izImage(element);
            oizImage.setZoom(100);
            reportStatus(oizImage);
        },
        function () query
    );
    // to zoom fit image
    hints.addMode(
        zoomFitKey,
        'Zoom fit image',
        function (element) {
            var oizImage = new izImage(element);
            oizImage.fit(nsIPrefBranchObj.getBoolPref("autocenter"));
            reportStatus(oizImage);
        },
        function () query
    );
    // to custom zoom image
    hints.addMode(
        zoomCustomKey,
        'Custom zoom image',
        function (element) {
            var oizImage = new izImage(element);
            openDialog("chrome://imagezoom/content/customzoom.xul", "", "chrome,modal,centerscreen", "Image", oizImage);
            reportStatus(oizImage);
        },
        function () query
    );
}
commands.addUserCommand(
    ['downimageall'],
    'download all images of current page',
    function () {
        // refer: http://d.hatena.ne.jp/amachang/20071108/1194501306
        let images = util.evaluateXPath(query);
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
