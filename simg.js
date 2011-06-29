// INFO //
var INFO =
<plugin name="simg.js" version="0.3"
        summary="Save image on contents area"
        href="http://github.com/vimpr/vimperator-plugins/blob/master/simg.js"
        xmlns="http://vimperator.org/namespaces/liberator">
  <author email="mitsugu.oyama@gmail.com">Mitsugu Oyama</author>
  <license href="http://opensource.org/licenses/mit-license.php">MIT</license>
  <project name="Vimperator" minVersion="2.3"/>
  <p>
    You can save image on the currnet context area by this plugin.
  </p>
  <item>
    <tags>'simg'</tags>
    <spec>:simg</spec>
    <description>
      <p>You can save image on the currnet context area by this plugin.</p>
    </description>
  </item>
</plugin>;

commands.addUserCommand(
  ['simg'],
  'Save Image File current page',
  function(){
    let contents=gBrowser.selectedBrowser.contentDocument;
    let Cc=Components.classes;
    let Ci=Components.interfaces;
    let cookie=contents.cookie;
    let xhrImg;

    let directoryPicker=function() {
      let path;
      let fp=Cc["@mozilla.org/filepicker;1"].createInstance(Ci.nsIFilePicker);
      fp.init(window,'Select Directory',Ci.nsIFilePicker.modeGetFolder);
      let result=fp.show();
      switch(result){
        case Ci.nsIFilePicker.returnOK:
          path=fp.file.path;
          break;
        default:
        case Ci.nsIFilePicker.returnCancel:
          return '';
      }
      return path;
    };

    let saveDirectory=directoryPicker();
    if(saveDirectory.length<1) return;
    let imgURL=contents.URL;
    let savePath;

    let trueCurrntImg=function(){
      let fileName=imgURL.substr(imgURL.lastIndexOf('/'));
      if (-1!=fileName.indexOf('?')){
        fileName=fileName.substr(0,fileName.indexOf('?'));
      }
      savePath=saveDirectory+fileName;
      let instream=xhrImg.responseText;
      let aFile=Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
      aFile.initWithPath(savePath);
      if(true===aFile.exists()){
        let value=window.prompt('すでに同じ名前のファイルがあります。デフォルトファイル名を変更してください。',fileName.substr(1));
        if(null===value){
          return false;
        }
        fileName='/'+value;
        savePath=saveDirectory+fileName;
        aFile.initWithPath(savePath);
      }
      let outstream=Cc["@mozilla.org/network/safe-file-output-stream;1"]
        .createInstance(Ci.nsIFileOutputStream);
      outstream.init(aFile,0x02|0x08|0x20,0664,0);
      outstream.write(instream,instream.length);
      if (outstream instanceof Ci.nsISafeOutputStream) {
        outstream.finish();
      }else{
        outstream.close();
      }
    };
    let falseCurrntImg=function(){
      liberator.echo("Image file accept error.");
      return false;
    };

    xhrImg=Cc["@mozilla.org/xmlextras/xmlhttprequest;1"]
      .createInstance();
    xhrImg.QueryInterface(Ci.nsIDOMEventTarget);
    xhrImg.addEventListener("load",trueCurrntImg,false);
    xhrImg.addEventListener("error",falseCurrntImg,false);
    xhrImg.QueryInterface(Ci.nsIXMLHttpRequest);
    xhrImg.open("GET",imgURL,true);
    xhrImg.overrideMimeType('text/plain;charset=x-user-defined');
    xhrImg.setRequestHeader('Referer',contents.URL);
    xhrImg.setRequestHeader('Cookie',cookie);
    xhrImg.send(null);
  }
);
