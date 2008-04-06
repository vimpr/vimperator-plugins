// Vimperator plugin: 'Cooperation LDRize Mappings - Niconico Flv Fetchearg || liberator.buffer.URLr'
// Version: 0.4
// Last Change: 06-Apr-2008. Jan 2008
// License: Creative Commons
// Maintainer: Trapezoid <trapezoid.g@gmail.com> - http://unsigned.g.hatena.ne.jp/Trapezoid
//
// Cooperation LDRize Mappings - Niconico Flv Fetcher for vimperator0.6.*
// Require LDRize Cooperation ver 0.14
(function(){
    function NiconicoFlvHandler(url,title){
        const nicoApiEndPoint = "http://www.nicovideo.jp/api/getflv?v=";
        const nicoWatchEndPoint = "http://www.nicovideo.jp/watch/";
        var videoId = url.match(/\wm\d+/)[0];
        var fileName = title.replace(/[?\\\*\/:<>\|\"]/g,'_') + ".flv";
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
                    file.appendRelativePath(fileName);
                    var fileUri = makeFileURI(file);

                    var download = DownloadManager.addDownload(0, sourceUri, fileUri, fileName,
                            null, null, null, null, WebBrowserPersist);
                    WebBrowserPersist.progressListener = download;
                    WebBrowserPersist.saveURI(sourceUri, null, null, null, null, file);
                }catch(e){log(e);liberator.echoerr(e)}
            });
        });
    }

    function setupLDRizeCooperationNiconicoFlvFetcher(){
        var NiconicoFlvFetcher = {
            pattern: 'http://www.nicovideo.jp/watch/*',
            handler: NiconicoFlvHandler,
            wait: 5000
        }
        this.convertHandlerInfo([NiconicoFlvFetcher]);
        this.handlerInfo.unshift(NiconicoFlvFetcher);
    }

    if(liberator.plugins.LDRizeCooperation == undefined){
        liberator.plugins.LDRizeCooperationPlugins = liberator.plugins.LDRizeCooperationPlugins || [];
        liberator.plugins.LDRizeCooperationPlugins.push(setupLDRizeCooperationNiconicoFlvFetcher);
    }else{
        setupLDRizeCooperationNiconicoFlvFetcher.apply(liberator.plugins.LDRizeCooperation);
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
    liberator.commands.addUserCommand(['fetchflv'],'Download flv file from Nicovideo',
        function(arg){
            httpGET(arg || liberator.buffer.URL,function(responseText){
                var [,title] = responseText.match(/<title>(.*?)<\/title>/i);
                liberator.log(title);
                NiconicoFlvHandler(arg || liberator.buffer.URL,title);
            });
        },{}
    );
})();
