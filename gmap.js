/* The MIT License {{{

Copyright (c) 2010 Mitsugu Oyama

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
}}} */

// INFO //
var INFO = 
<plugin name="gmap.js" version="0.1"
        summary="gmap.js"
        href="http://gist.github.com/635593"
        xmlns="http://vimperator.org/namespaces/liberator">
  <author email="mitsugu.oyama@gmail.com">Mitsugu Oyama</author>
  <license href="http://opensource.org/licenses/mit-license.php">MIT</license>
  <project name="Vimperator" minVersion="2.3"/>
  <p>
    You can get Google Maps URL of current machine location by this plugin.
  </p>
  <item>
    <tags>'GoogleMaps'</tags>
    <spec>:gmap</spec>
    <description>
      <p>You can get Google Maps URL of current machine location by this plugin.</p>
      <dl>
        <dt>See.</dt>
        <dd>
					<p><link topic="http://mozilla.jp/firefox/features/geolocation/">http://mozilla.jp/firefox/features/geolocation/</link> (Japanese)</p>
					<p><link topic="https://developer.mozilla.org/Ja/Using_geolocation">https://developer.mozilla.org/Ja/Using_geolocation</link> (Japanese)</p>
        </dd>
      </dl>
    </description>
  </item>
</plugin>;

// PLUGIN_INFO {{{
let PLUGIN_INFO =
<VimperatorPlugin>
  <name>gmap</name>
  <name lang="ja">gmap</name>
  <description>Get Google Map URL of current location</description>
  <description lang="ja">現在位置のGoogle Map上でのURLを取得します。</description>
  <version>0.1</version>
  <author mail="mitsugu.oyama@gmail.com" homepage="http://myscript.zouri.jp">mitsugu oyama</author>
  <license>MIT License (Please read the source code comments of this plugin)</license>
  <license lang="ja">MITライセンス (ソースコードのコメントを参照してください)</license>
  <minVersion>2.3.1</minVersion>
  <maxVersion>2.4pre</maxVersion>
  <detail lang="ja"><![CDATA[
		== Commands ==
			:gmap
				現在位置のGoogle Map上でのURLを取得しクリップボードにYankします。

		== Note ==
				詳細は以下のURLを参照してください。なおXPCOM経由でgeolocation機能を
				利用しているため、プライバシーの確認が行われません。御注意ください。
					http://mozilla.jp/firefox/features/geolocation/
					https://developer.mozilla.org/Ja/Using_geolocation

  ]]></detail>
</VimperatorPlugin>;
// }}}

(function(){
	commands.addUserCommand(
		['gmap'],
		'Get Google Map URL of current location',
		function(){
			let strURL='http://maps.google.com/maps?ie=UTF8&q=';
			let Cc=Components.classes;
			let Ci=Components.interfaces;
			let geolocation=Cc["@mozilla.org/geolocation;1"]
						.getService(Ci.nsIDOMGeoGeolocation);
			geolocation.getCurrentPosition(function(position){
				let strL=position.coords.latitude+','+position.coords.longitude;
				liberator.echo(strURL+strL);
				util.copyToClipboard(strURL+strL,true);
			});
		}
	);
})();