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
<plugin name="watchizu.js" version="0.1"
        summary="watchizu.js"
        href="http://gist.github.com/635595"
        xmlns="http://vimperator.org/namespaces/liberator">
  <author email="mitsugu.oyama@gmail.com">Mitsugu Oyama</author>
  <license href="http://opensource.org/licenses/mit-license.php">MIT</license>
  <project name="Vimperator" minVersion="2.3"/>
  <p>
    You can get Watchizu URL of current machine location by this plugin.
  </p>
  <item>
    <tags>'Watchizu'</tags>
    <spec>:watchizu</spec>
    <description>
      <p>You can get Watchizu URL of current machine location by this plugin.</p>
      <dl>
        <dt>Usage</dt>
        <dd>
          watchize
        </dd>
        <dt>Watchizu</dt>
        <dd>
					<link topic="http://watchizux.gsi.go.jp/index.html">http://watchizux.gsi.go.jp/index.html</link>
        </dd>
      </dl>
    </description>
  </item>
</plugin>;

// PLUGIN_INFO {{{
let PLUGIN_INFO =
<VimperatorPlugin>
  <name>watchizu</name>
  <name lang="ja">watchize</name>
  <description>Get Watchizu URL of current location</description>
  <description lang="ja">現在位置のウォッちず上でのURLを取得します。</description>
  <version>0.1</version>
  <author mail="mitsugu.oyama@gmail.com" homepage="http://myscript.zouri.jp">mitsugu oyama</author>
  <license>MIT License (Please read the source code comments of this plugin)</license>
  <license lang="ja">MITライセンス (ソースコードのコメントを参照してください)</license>
  <minVersion>2.3.1</minVersion>
  <maxVersion>2.4pre</maxVersion>
  <detail lang="ja"><![CDATA[
		== Commands ==
			:watchize
				現在位置のウォッちず上でのURLを取得しクリップボードにYankします。

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
		['watchize'],
		'Get Watchize URL of current location',
		function(){
			let form=function(v){
				let ret=String(v);
				if(ret.length<2)
					ret='0'+ret;
				return ret;
			};
			let conv=function(bl){
				let h=Math.floor(bl);
				let m=Math.floor((bl-h)*60);
				let s=Math.floor((bl-h-(m/60))*3600);
				return ''+h+form(m)+form(s);
			};
			let strURL='http://watchizu.gsi.go.jp/watchizu.aspx';
			let Cc=Components.classes;
			let Ci=Components.interfaces;
			let geolocation=Cc["@mozilla.org/geolocation;1"]
						.getService(Ci.nsIDOMGeoGeolocation);
			geolocation.getCurrentPosition(function(position){
				let strL='?b='+conv(position.coords.latitude)
								+'&l='+conv(position.coords.longitude);
				liberator.echo(strURL+strL);
				util.copyToClipboard(strURL+strL,true);
			});
		}
	);
})();