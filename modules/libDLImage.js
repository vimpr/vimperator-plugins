//
// libDLImage.js
//
//   libDLImage.js is code for download image data.
//   libDLImage.js is ran on ChromeWorker thread.
//
//
//   accept message:
//     {
//       'imageUrl'  :string,
//       'savePath'  :string,
//       'refererUrl':string,
//       'cookie'    :string
//     }
//
//     imageUrl   : remote image URL
//     savePath   : full path on local strage
//     refererUrl : referer string (optional)
//     cookie     : cookie string (optional)
//
//
//   send message:
//     {
//       'status'  :string,
//       'message' :JSObject,
//       'savePath':string
//     }
//
//     status   : 'normarl' or 'error'
//     message  : error message (string) or image data (binary)
//     savePath : full path on local strage
//                ( only success and same savePath on the accept message )
//
var JSONMessage;
var xhrImg;

function trueImage(){
  var instream=xhrImg.responseText;
  self.postMessage(
    {'status':'normal','message':instream,'savePath':JSONMessage.savePath}
  );
  return;
};

function falseImage(){
  self.postMessage({'status':'error','message':'IMAGE FILE ACCEPT ERROR!!'});
  return false;
};

function downloadImage(){
  xhrImg=new XMLHttpRequest();
  xhrImg.addEventListener("load",trueImage,false);
  xhrImg.addEventListener("error",falseImage,false);
  xhrImg.open("GET",JSONMessage.imageUrl,false);
  xhrImg.overrideMimeType('text/plain;charset=x-user-defined');
  if(0<JSONMessage.refererUrl.length){
    xhrImg.setRequestHeader('Referer',JSONMessage.refererUrl);
  };
  if(0<JSONMessage.cookie){
    xhrImg.setRequestHeader('Cookie',JSONMessage.cookie);
  };
  xhrImg.send(null);
};

addEventListener("message",function(event){
  JSONMessage=JSON.parse(event.data);
  if(JSONMessage.imageUrl===undefined||JSONMessage.savePath===undefined){
    self.postMessage({'status':'error','message':'PARAMETA ERROR!!'});
    return false;
  }
  downloadImage();
}, false);
