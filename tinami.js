// INFO //
var INFO = 
<plugin name="tinami.js" version="0.1"
        summary="tinami.js"
        href="http://gist.github.com/635799"
        xmlns="http://vimperator.org/namespaces/liberator">
  <author email="mitsugu.oyama@gmail.com">Mitsugu Oyama</author>
  <license href="http://opensource.org/licenses/mit-license.php">MIT</license>
  <project name="Vimperator" minVersion="2.3"/>
  <p>
    You can save image from TINAMI by this plugin.
  </p>
  <item>
    <tags>'TINAMI'</tags>
    <spec>:tinami</spec>
    <description>
      <p>You can save image from <link topic="http://www.tinami.com/">TINAMI</link> by this plugin.</p>
      <p>You must login tinami, and must display image page.(ex. http://www.tinami.com/view/??????)</p>
      <p>Not supported manga page and novel page.</p>
    </description>
  </item>
</plugin>;

commands.addUserCommand(
  ['tinami'],
  'Save Image File from tinami',
  function(){
    let Cc=Components.classes;
    let Ci=Components.interfaces;

    let contents=gBrowser.selectedBrowser.contentDocument;
    if(contents.domain!="www.tinami.com"){
      liberator.echoerr('This page is not tinami.');
      return false;
    }
    if(contents.URL.search(/view/i)==-1){
      liberator.echoerr("This page is not tinami's image page.");
      return false;
    }

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

    const baseInfo="http://www.tinami.com/view/original/";
    let id=contents.URL.substr(contents.URL.lastIndexOf('/')+1);
    let cookie=contents.cookie;
    let xhrImgInfo;
    let xhrImg;
    let savePath=directoryPicker();
    if(savePath.length<1) return;
    let imgUrl;

    let trueTinamiImg=function(){
      let fileName=imgUrl.substr(imgUrl.lastIndexOf('/'));
      savePath=savePath+fileName;
      let instream=xhrImg.responseText;
      let aFile=Cc["@mozilla.org/file/local;1"]
        .createInstance(Ci.nsILocalFile);
      aFile.initWithPath(savePath);
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

    let falseTinamiImg=function(){
      liberator.echoerr("Image file accept error.");
      return false;
    };

    let saveImag=function(){
      xhrImg=Cc["@mozilla.org/xmlextras/xmlhttprequest;1"]
        .createInstance();
      xhrImg.QueryInterface(Ci.nsIDOMEventTarget);
      xhrImg.addEventListener("load",trueTinamiImg,false);
      xhrImg.addEventListener("error",falseTinamiImg,false);
      xhrImg.QueryInterface(Ci.nsIXMLHttpRequest);
      xhrImg.open("GET",imgUrl,true);
      xhrImg.overrideMimeType('text/plain;charset=x-user-defined');
      xhrImg.setRequestHeader('Referer',contents.URL);
      xhrImg.setRequestHeader('Cookie',cookie);
      xhrImg.send(null);
    };

    let getDOMHtmlDocument=function(str){
      let doc;
      let range;
      try{
        if(document.implementation.createHTMLDocument){
          doc=document.implementation.createHTMLDocument('');
          range=doc.createRange();
          range.selectNodeContents(doc.documentElement);
          range.deleteContents();
          doc.documentElement.appendChild(range.createContextualFragment(str));
        }else{
          doc=document.implementation.createDocument(null,'html',null);
          range=document.createRange();
          range.selectNodeContents(document.documentElement);
          let content=doc.adoptNode(range.createContextualFragment(str));
          doc.documentElement.appendChild(content);
        }
      }catch(e){
        doc=null;
      }
      return doc;
    };

    let getImageUrl=function(pageContents){
      let url;
      let htmldoc=getDOMHtmlDocument(pageContents);
      if(htmldoc){
        if(0<htmldoc.getElementsByTagName('img').length)
          url=htmldoc.getElementsByTagName('img').item(0).getAttribute('src');
        else
          url='';
      }else{
        let s=pageContents.indexOf('src="')+5;
        let e=pageContents.indexOf('"',s);
        url=pageContents.substr(s,e-s);
      }
      return url;
    };

    let trueImgInfo=function(){
      imgUrl=getImageUrl(xhrImgInfo.responseText);
      if(-1!=imgUrl.search(/http:\/\/img.tinami.com\/illust\/img\//i)){
        saveImag();
      }else{
        liberator.echoerr("You should login TINAMI :<");
      }
    };

    let falseImgInfo=function(){
      liberator.echo("Image Infomation page accept error.");
      return false;
    };

    if(0<contents.getElementsByClassName('bigger').length){
      xhrImgInfo=Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance();
      xhrImgInfo.QueryInterface(Ci.nsIDOMEventTarget);
      xhrImgInfo.addEventListener("load",trueImgInfo,false);
      xhrImgInfo.addEventListener("error",falseImgInfo,false);
      xhrImgInfo.QueryInterface(Ci.nsIXMLHttpRequest);
      xhrImgInfo.open("GET",baseInfo+id,true);
      xhrImgInfo.setRequestHeader('Referer',contents.URL);
      xhrImgInfo.setRequestHeader('Cookie',cookie);
      xhrImgInfo.send(null);
    }else{
      imgUrl=contents.getElementsByClassName('draggable_img').item(0)
              .firstChild.getAttribute('src');
      saveImag();
    }
  }
);
