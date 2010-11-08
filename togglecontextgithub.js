// INFO //
var INFO = 
<plugin name="togglecontextgithub.js" version="0.1"
        summary="Toggle context exchange box on github"
        href="http://github.com/vimpr/vimperator-plugins/blob/master/togglecontextgithub.js"
        xmlns="http://vimperator.org/namespaces/liberator">
  <author email="mitsugu.oyama@gmail.com">Mitsugu Oyama</author>
  <license href="http://opensource.org/licenses/mit-license.php">MIT</license>
  <project name="Vimperator" minVersion="2.3"/>
  <p>Toggle context exchange box of <link topic="https://github.com/">github</link> by this plugin. </p>
  <item>
    <tags>'togglecontextgithub'</tags>
    <spec>:togglecontextgithub</spec>
    <description>
      <p>Toggle context exchange box of <link topic="https://github.com/">github</link> by this plugin. </p>
    </description>
  </item>
</plugin>;

commands.addUserCommand(
  ['togglecontextgithub'],
  'Toggle contexte xchange box of github',
  function(){
    let contents=gBrowser.selectedBrowser.contentDocument;
    if(contents.domain!="github.com"){
      liberator.echoerr('This page is not github.');
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
    let targets=contents.getElementsByClassName('toggle');
    if(targets.length<1){
      liberator.echoerr('Not found toggle box.');
      return false;
    }
    targets.item(0).dispatchEvent(evt);
  }
);
