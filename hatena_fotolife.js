/*
 * LICENSE
 *  The MIT License: http://www.opensource.org/licenses/mit-license.php
 *
 * Copyright (c) 2011, janus_wel<janus.wel.3@gmailcom>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 * */

let PLUGIN_INFO =
<VimperatorPlugin>
    <name>{NAME}</name>
    <description>Generates and yanks thumbnail tags in Hatena Fotolife</description>
    <description lang="ja">はてなフォトライフでサムネイル表示用の要素を生成する</description>
    <author mail="janus.wel.3@gmail.com" homepage="http://d.hatena.ne.jp/janus_wel">janus_wel</author>
    <license document="http://www.opensource.org/licenses/mit-license.php">New BSD License</license>
    <version>0.10</version>
    <minversion>2.3.1</minversion>
    <maxversion>2.3.1</maxversion>
    <detail><![CDATA[
== USAGE ==
';H' to generate and yank thumbnail tags

== SETTING ==
:hatena_fotolife_hint_key:
The key to generate and yank thumbnail tags(default: 'H').

== EXAMPLE ==
In .vimperatorrc

>||
hatena_fotolife_hint_key='f'
||<

]]></detail>
    <detail lang="ja"><![CDATA[
== USAGE ==
サムネイル表示のための要素群を生成・ヤンクする ';H'

== SETTING ==
:hatena_fotolife_hint_key:
サムネイル表示のための要素群を生成・ヤンクするキー(デフォルト: 'H')。

== EXAMPLE ==
.vimperatorrc の中で、

>||
image_extender_yank_key='f'
||<
]]></detail>
</VimperatorPlugin>;

( function () {

default xml namespace = "";
const hintkey = liberator.globalVariables.hatena_fotolife_hint_key || 'H';
const query = '//ul[contains(concat(" ", @class, " "), " fotolist ")]/li';

hints.addMode(
    hintkey,
    'Generate and yank thumbnail tags',
    function (element) {
        var li = element;
        var anchor = li.firstChild;
        var image = anchor.firstChild;
        var tags = <a href={anchor.href}>
                <img src={image.src} class="thumbnail" />
            </a>;

        util.copyToClipboard(tags.toXMLString(), true);
    },
    function () query
);

} )();
