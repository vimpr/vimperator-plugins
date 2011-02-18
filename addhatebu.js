// INFO //
var INFO =
<plugin name="addhatebu.js" version="0.1"
        summary="Add Hatena Bookmark"
        href="http://github.com/vimpr/vimperator-plugins/blob/master/addhatebu.js"
        xmlns="http://vimperator.org/namespaces/liberator">
  <author email="mitsugu.oyama@gmail.com">Mitsugu Oyama</author>
  <license href="http://opensource.org/licenses/mit-license.php">MIT</license>
  <project name="Vimperator" minVersion="2.3"/>
  <p>Toggle login box of <link topic="http://www.pixiv.net/">pixiv</link> by this plugin. </p>
  <item>
    <tags>'addhatebu'</tags>
    <spec>:addhatebu</spec>
    <description>
      <p>Add Hatena Bookmark</p>
    </description>
  </item>
</plugin>;

commands.addUserCommand(
  ['addhatebu'],
  'Add Hatena Bookmark',
  function(){
    let contents=gBrowser.selectedBrowser.contentDocument;
    let d=new Date;
    let s=contents.createElement('script');
    s.charset='UTF-8';
    s.src='http://b.hatena.ne.jp/js/Hatena/Bookmark/let.js?'
      +d.getFullYear()
      +d.getMonth()
      +d.getDate();
    (contents.getElementsByTagName('head')[0]||contents.body).appendChild(s);
  }
);
