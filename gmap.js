// INFO //
var INFO = 
<plugin name="gmap.js" version="0.1"
        summary="Get google maps URL of current machine location."
        href="http://github.com/vimpr/vimperator-plugins/blob/master/gmap.js"
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
