// INFO //
var INFO =
<plugin name="pixiv.js" version="0.6"
        summary="Download image from pixiv"
        href="http://github.com/vimpr/vimperator-plugins/blob/master/pixiv.js"
        xmlns="http://vimperator.org/namespaces/liberator">
  <author email="mitsugu.oyama@gmail.com">Mitsugu Oyama</author>
  <license href="http://opensource.org/licenses/mit-license.php">MIT</license>
  <project name="Vimperator" minVersion="2.3"/>
  <p>
    You can save image from pixiv by this plugin.
  </p>
  <item>
    <tags>'pixiv'</tags>
    <spec>:pixiv</spec>
    <description>
      <p>You can save image from <link topic="http://www.pixiv.net/">pixiv</link> by this plugin.</p>
      <p>You must login pixiv.</p>
    </description>
  </item>
</plugin>;

commands.addUserCommand(
  ['pixiv'],
  'Save Image File from pixiv',
  function(){
    let contents=gBrowser.selectedBrowser.contentDocument;
    if(contents.domain!="www.pixiv.net"){
      liberator.echoerr('This page is not pixiv.');
      return false;
    }
    if(contents.URL.search(/medium&illust_id=/i)==-1){
      liberator.echoerr("This page is not pixiv's image page.");
      return false;
    }

    let Cc=Components.classes;
    let Ci=Components.interfaces;

    let id;
    if(-1==contents.URL.search(/\&from_sid=/i)){
      id=contents.URL.substr(contents.URL.lastIndexOf('=')+1);
    }else{
      let st=contents.URL.search(/illust_id=/i)+'illust_id='.length;
      let end=contents.URL.lastIndexOf('&');
      id=contents.URL.substr(st,end-st);
    }

    let baseInfo;
    let scroll;
    let type=contents.getElementsByClassName('works_display').item(0)
              .firstChild.getAttribute('href');
    if(-1!=type.search(/big&illust_id=/i)){
      baseInfo="http://www.pixiv.net/member_illust.php?mode=big&illust_id=";
      scroll='';
    }else if(-1!=type.search(/manga&illust_id=/i)){
      baseInfo="http://www.pixiv.net/member_illust.php?mode=manga&illust_id=";
      scroll='&type=scroll';
    }else{
      liberator.echoerr("This page is not image page and not manga page.");
      return false;
    }
    let cookie=contents.cookie;

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
          let doctype=document.implementation.createDocumentType(
                      'html',
                      '-//W3C//DTD HTML 4.01 Transitional//EN',
                      'http://www.w3.org/TR/html4/loose.dtd'
          );
          doc=document.implementation.createDocument(null,'html',doctype);
          range=doc.createRange();
          range.selectNodeContents(doc.documentElement);
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

    let imgUrl;

    let truePixivImg=function(){
      let fileName=imgUrl.substr(imgUrl.lastIndexOf('/'));
      if (-1!=fileName.indexOf('?')){
        fileName=fileName.substr(0,fileName.indexOf('?'));
      }
      let tmpPath=saveDirectory+fileName;
      let instream=xhrImg.responseText;
      let aFile=Cc["@mozilla.org/file/local;1"]
        .createInstance(Ci.nsILocalFile);
      aFile.initWithPath(tmpPath);
      if(true===aFile.exists()){
        let value=window.prompt('すでに同じ名前のファイルがあります。デフォルトファイル名を変更してください。',fileName.substr(1));
        if(null===value){
          return false;
        }
        fileName='/'+value;
        tmpPath=saveDirectory+fileName;
        aFile.initWithPath(tmpPath);
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

    let falsePixivImg=function(){
      liberator.echoerr("Image file accept error.");
      return false;
    };

    let saveImage=function(){
      xhrImg=Cc["@mozilla.org/xmlextras/xmlhttprequest;1"]
        .createInstance();
      xhrImg.QueryInterface(Ci.nsIDOMEventTarget);
      xhrImg.addEventListener("load",truePixivImg,false);
      xhrImg.addEventListener("error",falsePixivImg,false);
      xhrImg.QueryInterface(Ci.nsIXMLHttpRequest);
      xhrImg.open("GET",imgUrl,false);
      xhrImg.overrideMimeType('text/plain;charset=x-user-defined');
      xhrImg.setRequestHeader('Referer',contents.URL);
      xhrImg.setRequestHeader('Cookie',cookie);
      xhrImg.send(null);
    };

    let saveImageFile=function(){
      imgUrl=getImageUrl(xhrImgInfo.responseText);
      if(0<imgUrl.length){
        saveImage();
      }else{
        liberator.echoerr("You should login pixiv :<");
      }
    };

    let getImageUrls=function(pageContents){
      const BIG='_big';
      let url=[];
      let strScript;
      let fst,snd;
      let strFst='';
      let strSnd='';
      let tblElm;
      let i;
      let htmldoc=getDOMHtmlDocument(pageContents);
      if(htmldoc){
        let max=htmldoc.getElementsByClassName('image-container').length;
        for(i=0;i<max;i++){
          strScript=htmldoc.getElementsByClassName('image-container').item(i)
            .getElementsByTagName('script').item(0)
            .childNodes.item(0).nodeValue;
          fst=strScript.search(/unshift/i)+'unshift'.length+2;
          snd=strScript.lastIndexOf('_');
          strFst=strScript.substr(fst,snd-fst);

          fst=snd;
          snd=strScript.indexOf("'",fst);
          strSnd=strScript.substr(fst,snd-fst);
          
          url.push(strFst+BIG+strSnd);
        }
      }else{
        url.length=0;
      }
      return url;
    };

    let imgUrls;
    let saveMangaFiles=function(){
      imgUrls=getImageUrls(xhrImgInfo.responseText);
      if(0<imgUrls.length){
        let i;
        let max=imgUrls.length;
        for(i=0;i<max;i++){
          imgUrl=imgUrls[i];
          pnt=imgUrl.lastIndexOf('?');
          if(-1!=pnt){
            imgUrl=imgUrl.substr(0,pnt);
          }
          saveImage();
        }
      }else{
        liberator.echoerr("Not found image data on the manga page.");
      }
    };

    let trueImgInfo=function(){
      if(-1!=type.search(/big&illust_id=/i)){
        saveImageFile();
      }else if(-1!=type.search(/manga&illust_id=/i)){
        saveMangaFiles();
      }else{
        liberator.echoerr("This page is not image page and not manga page.");
        return false;
      }
    };

    let falseImgInfo=function(){
      liberator.echo("Image Infomation page accept error.");
      return false;
    };

    let xhrImgInfo;
    xhrImgInfo=Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance();
    xhrImgInfo.QueryInterface(Ci.nsIDOMEventTarget);
    xhrImgInfo.addEventListener("load",trueImgInfo,false);
    xhrImgInfo.addEventListener("error",falseImgInfo,false);
    xhrImgInfo.QueryInterface(Ci.nsIXMLHttpRequest);
    xhrImgInfo.open("GET",baseInfo+id+scroll,true);
    xhrImgInfo.setRequestHeader('Referer',contents.URL);
    xhrImgInfo.setRequestHeader('Cookie',cookie);
    xhrImgInfo.send(null);

  },
  {},
  true
);
