// INFO //
var INFO = 
<plugin name="gbmark.js" version="0.2"
        summary="Add Google Bookmark."
        href="http://github.com/vimpr/vimperator-plugins/blob/master/gbmark.js"
        xmlns="http://vimperator.org/namespaces/liberator">
  <author email="mitsugu.oyama@gmail.com">Mitsugu Oyama</author>
  <license href="http://opensource.org/licenses/mit-license.php">MIT</license>
  <project name="Vimperator" minVersion="2.3"/>
  <p>Add Google Bookmark.</p>
  <item>
    <tags>'gbmark.js'</tags>
    <spec>:gbmark</spec>
    <description>
      <p>Add Google Bookmark.</p>
    </description>
  </item>
</plugin>;

(function(){
  commands.addUserCommand(
    ['gbmark'],
    'Add Google Bookmark.',
    function(){
      let Cc=Components.classes;
      let Ci=Components.interfaces;
      let doc=gBrowser.selectedBrowser.contentDocument;
      let strEndPoint='http://www.google.com/bookmarks/mark?op=add&bkmk=';
      let strUrl=doc.URL;
      let strTitle=doc.title;
      let strSelect=doc.defaultView.getSelection().toString();
      let strUri;
      if(1<strSelect.length){
        strUri=strEndPoint+encodeURIComponent(strUrl)
          +'&title='+encodeURIComponent(strTitle)
          +'&annotation='+encodeURIComponent(strSelect)+'&hl=ja';
      }else{
        strUri=strEndPoint+encodeURIComponent(strUrl)
          +'&title='+encodeURIComponent(strTitle)+'&hl=ja';
      }
      gBrowser.addTab(strUri);
    }
  );
})();
