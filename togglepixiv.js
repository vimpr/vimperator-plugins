// INFO //
var INFO = 
<plugin name="togglepixiv.js" version="0.1"
        summary="Toggle pixiv's login box"
        href="http://github.com/vimpr/vimperator-plugins/blob/master/togglepixiv.js"
        xmlns="http://vimperator.org/namespaces/liberator">
  <author email="mitsugu.oyama@gmail.com">Mitsugu Oyama</author>
  <license href="http://opensource.org/licenses/mit-license.php">MIT</license>
  <project name="Vimperator" minVersion="2.3"/>
  <p>Toggle login box of <link topic="http://www.pixiv.net/">pixiv</link> by this plugin. </p>
  <item>
    <tags>'togglepixiv'</tags>
    <spec>:togglepixiv</spec>
    <description>
      <p>Toggle login box of <link topic="http://www.pixiv.net/">pixiv</link> by this plugin.</p>
    </description>
  </item>
</plugin>;

commands.addUserCommand(
  ['togglepixiv'],
  'Toggle login box of pixiv',
  function(){
    let contents=gBrowser.selectedBrowser.contentDocument;
    if(contents.domain!="www.pixiv.net"){
      liberator.echoerr('This page is not pixiv.');
      return false;
    }
    let evt=contents.createEvent("MouseEvents");
    evt.initMouseEvent(
      'click',
      true, // canBubble
      true, // cancelable
      window, // view
      0, // detail
      0, // screenX
      0, // screenY
      0, // clientX
      0, // clientY
      false, // ctrlKey
      false, // altKey
      false, // shiftKey
      false, // metaKey
      0, // button
      null //relatedTarget
    ); 
    let targets=contents.getElementsByClassName('trigger');
    if(targets.length<1){
      liberator.echoerr('Not found login form.');
      return false;
    }
    targets.item(0).dispatchEvent(evt);
  }
);
