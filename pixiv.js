// {{{ INFO
var INFO =
<plugin name="pixiv.js" version="0.7.3"
        summary="Download image from pixiv"
        href="http://github.com/vimpr/vimperator-plugins/blob/master/pixiv.js"
        xmlns="http://vimperator.org/namespaces/liberator">
  <author email="mitsugu.oyama@gmail.com">Mitsugu Oyama</author>
  <license href="http://opensource.org/licenses/mit-license.php">MIT</license>
  <project name="Vimperator" minVersion="3.2"/>
  <p>
    You can save image from pixiv by this plugin.
  </p>
  <item>
    <tags>'pixiv'</tags>
    <spec>:pixiv</spec>
    <description>
      <p>You can save image from <link topic="http://www.pixiv.net/">pixiv</link> by this plugin.</p>
      <p>You need libDLImage.js and libDLMangaSingleContent.js under of plugin/modules.</p>
      <p>You must login pixiv.</p>
    </description>
  </item>
</plugin>;
// }}}

commands.addUserCommand(
  ['pixiv'],
  'Save Image File from pixiv',
  function(){
// {{{ environment
    let contents=gBrowser.selectedBrowser.contentDocument;
    if(contents.domain!="www.pixiv.net"){
      liberator.echoerr('This page is not pixiv.');
      return false;
    }
    if((contents.URL.search(/illust_id=/i)==-1)||
       (contents.URL.search(/mode=medium/i)==-1)){
      liberator.echoerr("This page is not pixiv's image page.");
      return false;
    }

    const Cc=Components.classes;
    const Ci=Components.interfaces;
    let cookie=contents.cookie;
// }}}

// {{{ convert to DOM Document from text
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
// }}}

// {{{ get image id
    let id;
    let idTmp=contents.URL.match(/illust_id=(\d+)/i);
    if(idTmp===null){
      liberator.echoerr("This page is not image page and not manga page.");
      return false;
    }else{
      id=idTmp[1];
    }
// }}}

// {{{ make ChromeWorker
    let createWorker=function(fileName){
      let ret;
      const resourceName="vimp-plugin";
      const ioService=Cc["@mozilla.org/network/io-service;1"]
                        .getService(Ci.nsIIOService); 
      const resProt=ioService.getProtocolHandler("resource")  
                      .QueryInterface(Ci.nsIResProtocolHandler);
      let pluginDirs=io.getRuntimeDirectories("plugin");
      if (pluginDirs.length === 0){
        return null;
      }
      resProt.setSubstitution(resourceName,ioService.newFileURI(pluginDirs[0]));
      try {
        worker=new ChromeWorker("resource://"+resourceName+"/modules/"+fileName);
      }catch(e){
        return null;
      }
      return worker;
    };
// }}}
// {{{ save image ChromeWorker process
    let workerImage=createWorker('libDLImage.js');
    if(workerImage==null){
      liberator.echoerr('plugin directory is not found');
      return false;
    }
    workerImage.addEventListener('message',function(event){
      if(event.data.status=='error'){
        liberator.echoerr(event.data.message);
        return false;
      };
      let instream=event.data.message;
      let savePath=event.data.savePath;
      let aFile=Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
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
    },false);
    workerImage.addEventListener('error',function(event){
      liberator.echoerr(event.data.status);
    },false);
// }}}
// {{{ Recieve Manga Contents ChromeWorker
    let workerManga=createWorker('libDLMangaSingleContent.js');
    workerManga.addEventListener('message',function(event){
      if(event.data.status=='error'){
        liberator.echoerr(event.data.message);
        return false;
      };
      let domContent=getDOMHtmlDocument(event.data.message);
      if(domContent){
        // DOM で画像 URL を取得して画像ファイルの取得リクエストを発行
        let imgUrl=domContent.getElementsByTagName('img')
                  .item(0).getAttribute('src');
        let destPath=getDestPath(imgUrl);
        if(destPath==null){
           return false;
        };
        saveImage(
          imgUrl,
          destPath.path,
          event.data.refererUrl,
          cookie
        );
      }
    },false);
    workerManga.addEventListener('error',function(event){
      liberator.echoerr(event.data.status);
    },false);
// }}}

// {{{ directory picker
    let directoryPicker=function() {
      let path;
      let fp=Cc["@mozilla.org/filepicker;1"].createInstance(Ci.nsIFilePicker);
      fp.init(window,'Select Directory',Ci.nsIFilePicker.modeGetFolder);
      let result=fp.show();
      if(result==Ci.nsIFilePicker.returnOK){
        return fp.file;
      }
      return null;
    };
    let saveDirectory=directoryPicker();
    if(saveDirectory==null) return false;
// }}}

// {{{ send request save image
    let saveImage=function(imgUrl,savePath,referer,cookie){
      let objMessage={
        imageUrl  :'',
        savePath  :'',
        refererUrl:'',
        cookie    :''
      };
      objMessage.imageUrl=imgUrl;
      objMessage.savePath=savePath;
      objMessage.refererUrl=referer;
      objMessage.cookie=cookie;
      let JSONmessage=JSON.stringify(objMessage);
      workerImage.postMessage(JSONmessage);
    };
// }}}

// {{{ get destnation fullpath name
    let getDestPath=function(url){
      let fname=url.substr(url.lastIndexOf('/')+1);
      if(fname.lastIndexOf('?')!=-1){
        fname=fname.substr(0,fname.lastIndexOf('?'));
      }
      let path=saveDirectory.clone();
      path.append(fname);
      let aFile=Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
      let newPath=path.clone();
      aFile.initWithFile(path);
      if(true===aFile.exists()){
        let value=window.prompt('すでに同じ名前のファイルがあります。デフォルトファイル名を変更してください。',fname);
        if(null===value){
          return null;
        };
        if(fname!=value){
          newPath=saveDirectory.clone();
          newPath.append(value);
        }
      }
      return newPath;
    };
// }}}

// {{{ save single image file
    let getImageUrl=function(pageContents){
      let url;
      let htmldoc=getDOMHtmlDocument(pageContents);
      if(htmldoc){
        if(0<htmldoc.getElementsByTagName('img').length)
          url=htmldoc.getElementsByTagName('img').item(0).getAttribute('src');
        else
          url='';
      }else{
        url=pageContents.match(/http:\/\/img[0-9]{2}\.pixiv\.net\/img\/[0-9a-z_]+\/[0-9]+\.jpg|http:\/\/img[0-9]{2}\.pixiv\.net\/img\/[0-9a-z_]+\/[0-9]+\.png/i);
      }
      return url;
    };

    let saveImageFile=function(){
      let imgUrl=getImageUrl(xhrImgInfo.responseText);
      if(0<imgUrl.length){
        let destPath=getDestPath(imgUrl);
        if(destPath==null){
          return false;
        };
        saveImage(
          imgUrl,
          destPath.path,
          contents.URL,
          cookie
        );
      }else{
        liberator.echoerr("You should login pixiv :<");
      };
    };
// }}}

// {{{ save manga image file
    let requestMangaSingleContent=function(url,ref){
      let objMessage={
        pageUrl  :'',
        refererUrl:'',
        cookie    :''
      };
      objMessage.pageUrl=url;
      objMessage.refererUrl=ref;
      objMessage.cookie=cookie;
      let JSONmessage=JSON.stringify(objMessage);
      workerManga.postMessage(JSONmessage);
    };

    let saveMangaFiles=function(){
      let htmldoc=getDOMHtmlDocument(xhrImgInfo.responseText);
      if(htmldoc){
        let max=htmldoc.getElementsByClassName('image-container').length;
        for(var i=0;i<max;i++){
          requestMangaSingleContent(
            url.replace('manga','manga_big').replace('type=scroll','page=')+i,
            url.replace('&type=scroll','')
          );
        }
      }
    };
// }}}

// {{{ first XMLHttpRequest
    let url;
    let type=contents.getElementsByClassName('works_display')
             .item(0).firstChild.getAttribute('href');
    if(-1!=type.search(/big&illust_id=/i)){
      url=contents.documentURI.replace('medium','big');
    }else if(-1!=type.search(/manga&illust_id=/i)){
      url=contents.documentURI.replace('medium','manga')+'&type=scroll';
    }else{
      liberator.echoerr("This page is not image page and not manga page.");
      return false;
    }

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
    xhrImgInfo.open("GET",url,true);
    xhrImgInfo.setRequestHeader('Referer',contents.URL);
    xhrImgInfo.setRequestHeader('Cookie',cookie);
    xhrImgInfo.send(null);
//  }}}
  },
  {},
  true
);
