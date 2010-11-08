// INFO //
var INFO = 
<plugin name="watchizu.js" version="0.1"
        summary="Get Watchizu URL of current machine location"
        href="http://github.com/vimpr/vimperator-plugins/blob/master/watchizu.js"
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
      <p>You can get <link topic="http://watchizux.gsi.go.jp/index.html">Watchizu</link> URL of current machine location by this plugin.</p>
    </description>
  </item>
</plugin>;

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
