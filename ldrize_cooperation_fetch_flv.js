// Vimperator plugin: 'Cooperation LDRize Mappings - Niconico Flv Fetchearg || liberator.buffer.URLr'
// Version: 0.4
// Last Change: 22-Nov-2008. Jan 2008
// License: Creative Commons
// Maintainer: Trapezoid <trapezoid.g@gmail.com> - http://unsigned.g.hatena.ne.jp/Trapezoid
//
// Cooperation LDRize Mappings - Niconico Flv Fetcher for vimperator0.6.*
// Require LDRize Cooperation ver 0.14

( function () {

function NiconicoFlvHandler(url, title) {
    const nicoApiEndPoint = 'http://www.nicovideo.jp/api/getflv?v=';
    const nicoWatchEndPoint = 'http://www.nicovideo.jp/watch/';
    let videoId = url.match(/\w{2}\d+/)[0];
    let fileName = title.replace(/[?\\*\/:<>|"]/g, '_') + '.flv';

    httpGET(
        nicoApiEndPoint + videoId,
        function (apiResult) {
            let flvUrl = decodeURIComponent(apiResult.match(/url=(.*?)&/)[1]);

            httpGET(
                nicoWatchEndPoint + videoId,
                function (watchPage) {
                    try {
                        let DownloadManager = Cc['@mozilla.org/download-manager;1']
                            .getService(Ci.nsIDownloadManager);
                        let WebBrowserPersist = Cc['@mozilla.org/embedding/browser/nsWebBrowserPersist;1']
                            .createInstance(Ci.nsIWebBrowserPersist);

                        let sourceUri = makeURI(flvUrl, null, null);
                        let file = DownloadManager.userDownloadsDirectory;
                        file.appendRelativePath(fileName);
                        let fileUri = makeFileURI(file);

                        let download = DownloadManager.addDownload(
                            0, sourceUri, fileUri, fileName,
                            null, null, null, null, WebBrowserPersist
                        );
                        WebBrowserPersist.progressListener = download;
                        WebBrowserPersist.saveURI(sourceUri, null, null, null, null, file);
                    }
                    catch (e) {
                        log(e);
                        liberator.echoerr(e);
                    }
                } // function (watchPage)
            ); // httpGET
        } // function (apiResult)
    ); // httpGET
}

function setupLDRizeCooperationNiconicoFlvFetcher() {
    let NiconicoFlvFetcher = {
        pattern: 'http://www.nicovideo.jp/watch/*',
        handler: NiconicoFlvHandler,
        wait:    5000,
    };
    this.convertHandlerInfo([NiconicoFlvFetcher]);
    this.handlerInfo.unshift(NiconicoFlvFetcher);
}

if (liberator.plugins.LDRizeCooperation === undefined) {
    liberator.plugins.LDRizeCooperationPlugins = liberator.plugins.LDRizeCooperationPlugins || [];
    liberator.plugins.LDRizeCooperationPlugins.push(setupLDRizeCooperationNiconicoFlvFetcher);
}
else {
    setupLDRizeCooperationNiconicoFlvFetcher.apply(liberator.plugins.LDRizeCooperation);
}

function httpGET(uri, callback) {
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) callback.call(this,xhr.responseText);
            else throw new Error(xhr.statusText)
        }
    };
    xhr.open('GET', uri, true);
    xhr.send(null);
}

liberator.modules.commands.addUserCommand(
    ['fetchflv'],
    'Download flv file from Nicovideo',
    function (arg) {
        httpGET(
            arg.string || liberator.modules.buffer.URL,
            function (responseText) {
                let [, title] = responseText.match(/<title(?:[ \t\r\n][^>]*)?>([^<]*)<\/title[ \t\n\r]*>/i);
                liberator.log(title);
                NiconicoFlvHandler(arg.string || liberator.modules.buffer.URL, title);
            }
        );
    },
    {}
);

})();
