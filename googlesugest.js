// Vimperator plugin: 'Completion by Google Suggest'
// Last Change: 02-Mar-2008. Jan 2008
// License: Creative Commons
// Maintainer: Trapezoid <trapezoid.g@gmail.com> - http://unsigned.g.hatena.ne.jp/Trapezoid
//
// search word completion using google suggest script for vimperator0.6.*

vimperator.commands.addUserCommand(['google'],"Search web sites with google suggest",
    function(arg){
        const endpoint = "http://www.google.co.jp/search?q=";
        //vimperator.open(endpoint + encodeURIComponent(arg));
        vimperator.open(endpoint + encodeURIComponent(arg),vimperator.NEW_TAB);
    },
    {
        completer: function (filter) {
            const endPoint = "http://suggestqueries.google.com/complete/search?output=firefox&client=firefox&hl=ja&qu="
            var xhr = new XMLHttpRequest();
            var completionList = [];

            xhr.open("GET",endPoint + encodeURIComponent(filter),false);
            xhr.send(null);
            var response = window.eval(xhr.responseText)[1];

            for each (var r in response)
                completionList.push([r,"Suggests"]);
            return [0,completionList];
        }
    }
);
