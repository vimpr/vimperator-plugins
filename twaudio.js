// INFO //
var INFO = 
<plugin name="twaudio.js" version="0.1"
        summary="twaud.io player controller"
        href="http://github.com/vimpr/vimperator-plugins/blob/master/twaudio.js"
        xmlns="http://vimperator.org/namespaces/liberator">
  <author email="mitsugu.oyama@gmail.com">Mitsugu Oyama</author>
  <license href="http://opensource.org/licenses/mit-license.php">MIT</license>
  <project name="Vimperator" minVersion="2.3"/>
  <p>twaud.io player controller.</p>
  <item>
    <tags>'twaudio'</tags>
    <spec>:twp<oa>lay</oa></spec>
<!--
    実装するか未定。jQueryが許さないかも。
    <spec>:twv<oa>olume</oa> <oa>level</oa></spec>
-->
    <description>
      <p>twaud.io player controller.</p>
    </description>
  </item>
</plugin>;

commands.addUserCommand(
  ['twp[lay]'],
  'toggle to play button',
  function(){
    let contents=gBrowser.selectedBrowser.contentDocument;
    // twaud.ioのjQueryの使い方によりマウス・イベントをエミュレート
    // するしかないっぽい。
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
    let btnPlay=contents.getElementById('play0');
    if(null==btnPlay.getAttribute('style')){ // for twaud.io's bug
      contents.location.reload();
    }else if('display: block;'==btnPlay.getAttribute('style')){
      btnPlay.dispatchEvent(evt);
    }else{
      let btnPause=contents.getElementById('pause0');
      btnPause.dispatchEvent(evt);
    }
  },
  {
    literal: false
  },
  true
);

/*
実装するか未定。jQueryが許さないかも。
commands.addUserCommand(
  ['twv[olume]'],
  'set volume of twaud.io player.',
  function(args){
    if(1!=args.length){
      liberator.echoerr('argument error');
      return false;
    }
  },
  {
    literal: false
  },
  true
);
*/
