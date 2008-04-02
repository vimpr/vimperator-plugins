// Vimperator plugin: 'Cooperation LDRize Mappings - Niconico Flv Fetcher'
// Version: 0.1
// Last Change: 03-Apr-2008. Jan 2008
// License: Creative Commons
// Maintainer: Trapezoid <trapezoid.g@gmail.com> - http://unsigned.g.hatena.ne.jp/Trapezoid
//
// Cooperation LDRize Mappings - Niconico Flv Fetcher for vimperator0.6.*
//
(function(){
    function LDRizeCooperationNiconicoFlvFetcher(LDRizeCooperation){
        var NiconicoFlvFetcher = [
            {
                pattern: 'http://www.nicovideo.jp/watch/*',
                handler: function(url,title){
                    const nicoApiEndPoint = "http://www.nicovideo.jp/api/getflv?v=";
                    const nicoWatchEndPoint = "http://www.nicovideo.jp/watch/";
                    var videoId = url.match(/\wm\d+/)[0];
                    httpGET(nicoApiEndPoint + videoId,function(apiResult){
                        var flvUrl = decodeURIComponent(apiResult.match(/url=(.*?)&/)[1]);

                        httpGET(nicoWatchEndPoint + videoId,function(watchPage){
                            try{
                                var DownloadManager = Cc["@mozilla.org/download-manager;1"]
                                    .getService(Ci.nsIDownloadManager);
                                var WebBrowserPersist = Cc["@mozilla.org/embedding/browser/nsWebBrowserPersist;1"]
                                    .createInstance(Ci.nsIWebBrowserPersist);

                                var sourceUri = makeURI(flvUrl,null,null);
                                var file = DownloadManager.userDownloadsDirectory;
                                file.appendRelativePath(title + ".flv");
                                var fileUri = makeFileURI(file);

                                var download = DownloadManager.addDownload(0, sourceUri, fileUri, title + ".flv",
                                        null, null, null, null, WebBrowserPersist);
                                WebBrowserPersist.progressListener = download;
                                WebBrowserPersist.saveURI(sourceUri, null, null, null, null, file);
                            }catch(e){log(e);liberator.echoerr(e)}
                        });
                    });
                },
                wait: 5000
            }
        ]
        LDRizeCooperation.convertHandlerInfo(NiconicoFlvFetcher);
        LDRizeCooperation.handlerInfo.unshift(NiconicoFlvFetcher[0]);
    }

    if(liberator.plugins.LDRizeCooperation == undefined){
        liberator.plugins.watch('LDRizeCooperation',function(id,oldValue,newValue){
            liberator.plugins.unwatch('LDRizeCooperation');
            LDRizeCooperationNiconicoFlvFetcher(newValue);
            return newValue;
        });
    }else{
        LDRizeCooperationNiconicoFlvFetcher(liberator.plugins.LDRizeCooperation);
    }

    function httpGET(uri,callback){
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function(){
            if(xhr.readyState == 4){
                if(xhr.status == 200)
                    callback.call(this,xhr.responseText);
                else
                    throw new Error(xhr.statusText)
            }
        };
        xhr.open("GET",uri,true);
        xhr.send(null);
    }
})();
