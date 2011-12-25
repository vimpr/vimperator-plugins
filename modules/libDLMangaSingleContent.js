//
// libDLMangaSingleContent.js
//
//   libDLMangaSingleContent.js is code for download content of Manga's
//   single page.
//   libDLMangaSingleContent.js is ran on ChromeWorker thread.
//
//
//   accept message:
//     {
//       'pageUrl'   :string,
//       'refererUrl':string,
//       'cookie'    :string
//     }
//
//     pageUrl    : Manga Single Content URL
//     refererUrl : referer string
//     cookie     : cookie string
//
//
//   send message:
//     {
//       'status'  :string,
//       'message' :string,
//       'refererUrl':string,
//     }
//
//     status   : 'normarl' or 'error'
//     message  : error message (string) or content text data (HTML)
//     refererUrl : referer string
//
var JSONMessage;
var xhr;

function trueContent(){
  let content=xhr.responseText;
  self.postMessage(
    {'status':'normal','message':content,'refererUrl':JSONMessage.pageUrl}
  );
  return;
};

function falseContent(){
  self.postMessage({'status':'error','message':'MANGA CONTENT FILE ACCEPT ERROR!!'});
  return false;
};

function downloadContent(){
  xhr=new XMLHttpRequest();
  xhr.addEventListener("load",trueContent,false);
  xhr.addEventListener("error",falseContent,false);
  xhr.open("GET",JSONMessage.pageUrl,false);
  if(0<JSONMessage.refererUrl.length){
    xhr.setRequestHeader('Referer',JSONMessage.refererUrl);
  };
  if(0<JSONMessage.cookie.length){
    xhr.setRequestHeader('Cookie',JSONMessage.cookie);
  };
  xhr.send(null);
};

addEventListener("message",function(event){
  JSONMessage=JSON.parse(event.data);
  if(JSONMessage.pageUrl===undefined
    ||JSONMessage.refererUrl===undefined
    ||JSONMessage.cookie===undefined){
    self.postMessage({'status':'error','message':'PARAMETA ERROR!!'});
    return false;
  }
  downloadContent();
}, false);
