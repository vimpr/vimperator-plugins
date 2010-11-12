// INFO //
var INFO =
<plugin name="feedtwitpic.js" version="0.1"
        summary="Emulate push anchor of Next or Prev for twitpic."
        href="http://github.com/vimpr/vimperator-plugins/blob/master/feedtwitpic.js"
        xmlns="http://vimperator.org/namespaces/liberator">
  <author email="mitsugu.oyama@gmail.com">Mitsugu Oyama</author>
  <license href="http://opensource.org/licenses/mit-license.php">MIT</license>
  <project name="Vimperator" minVersion="2.3"/>
  <p>Toggle login box of <link topic="http://www.pixiv.net/">pixiv</link> by this plugin. </p>
  <item>
    <tags>'FeedTwitpic'</tags>
    <spec>:FeedTwitpic</spec>
    <description>
      <p>Emulate push anchor of Next or Prev for twitpic.</p>
    </description>
  </item>
</plugin>;

commands.addUserCommand(
  ['FeedTwitpic'],
  'Emulate push anchor of Next or Prev for twitpic.',
  function(args){
    if(1!=args.length){
      liberator.echoerr('Usage: FeedTwitpic next|prev');
      return false;
    }
    let contents=gBrowser.selectedBrowser.contentDocument;
    if(contents.domain!="twitpic.com"){
      liberator.echoerr('This page is not twitpic.');
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
    let targets;
    if(args[0]=='next'){
      targets=contents.getElementsByClassName('comment_pagination_next');
      if(targets.length<1){
        liberator.echoerr('Not found Next anchor.');
        return false;
      }
    }else if(args[0]=='prev'){
      targets=contents.getElementsByClassName('comment_pagination_prev');
      if(targets.length<1){
        liberator.echoerr('Not found Prev anchor.');
        return false;
      }
    }else{
      liberator.echoerr('Usage: FeedTwitpic next|prev');
      return false;
    }
    targets.item(0).dispatchEvent(evt);
  },
  {
    literal: false
  },
  true
);
