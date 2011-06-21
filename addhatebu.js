// INFO //
var INFO =
<plugin name="addhatebu.js" version="0.2"
        summary="Add Hatena Bookmark"
        href="http://github.com/vimpr/vimperator-plugins/blob/master/addhatebu.js"
        xmlns="http://vimperator.org/namespaces/liberator">
  <author email="mitsugu.oyama@gmail.com">Mitsugu Oyama</author>
  <license href="http://opensource.org/licenses/mit-license.php">MIT</license>
  <project name="Vimperator" minVersion="2.3"/>
  <p>Add contents to Hatena Bookmarks. </p>
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
  function(args){
    let contents=gBrowser.selectedBrowser.contentDocument;
    if(args[0]==undefined||args[0]=='add'){
      let d=new Date;
      let s=contents.createElement('script');
      s.charset='UTF-8';
      s.src='http://b.hatena.ne.jp/js/Hatena/Bookmark/let.js?'
        +d.getFullYear()
        +d.getMonth()
        +d.getDate();
      (contents.getElementsByTagName('head')[0]||contents.body).appendChild(s);
    }else if(args[0]=='cancel'){
      contents.location.reload();
    }else{
      liberator.echoerr('Invalid Parameter');
      return false;
    }
  },{
    completer : function(context, args){
      context.completions=[
        ['add','Add Hatena Bookmark'],
        ['cancel','Cancel add Hatena Bookmark']
      ];
    },
    argCount  : 0,
    hereDoc   : false,
    bang      : false,
    count     : false,
    literal   : false
  },
  true
);
