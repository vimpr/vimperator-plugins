// Vimperator plugin: 'Show Hatena Bookmark Comments'
// Last Change: 02-Mar-2008. Jan 2008
// License: Creative Commons
// Maintainer: Trapezoid <trapezoid.g@gmail.com> - http://unsigned.g.hatena.ne.jp/Trapezoid
//
// show hatena bookmark comments script for vimperator0.6.*

(function(){
    function showComments(url){
        const endPoint = "http://b.hatena.ne.jp/entry/json/";
        var xhr = new XMLHttpRequest();
        var tagString,showString = "<div>";
        xhr.open("GET",endPoint + url,false);
        xhr.send(null);
        var response;
        if(!(response = window.eval(xhr.responseText))){
            vimperator.echoerr("Does not exists!!");return;
        }
        var bookmarks = response["bookmarks"];
        showString += response["count"] + " users : " + response["title"] + "<dl>";

        for each (var bookmark in bookmarks){
            tagString = bookmark.tags.length ? "[" + bookmark.tags.join("][") + "]":"";
            showString += "<dt style=\"float:left;clear:both;width:10%;margin:0;\">" + bookmark.user + "</dt>";
            showString += "<dd style=\"margin:0 0 0 10%;width:90%;border-left:1px solid;\"> "
            showString += tagString + (bookmark.tags.length > 0 && bookmark.comment ? "<br/> ":"") + bookmark.comment + "</dd>";
        }
        showString += "</dl></div>";
        vimperator.commandline.echo(showString, vimperator.commandline.HL_NORMAL, vimperator.commandline.FORCE_MULTILINE);
    }
    vimperator.commands.addUserCommand(["hbinfo"], "show hatena bookmark comments",
        function(arg,special){
            var clipboard = readFromClipboard();
            if(special)
                arg = window.content.document.getSelection() || clipboard;
            showComments(arg?encodeURIComponent(arg):vimperator.buffer.URL);
        },{ completer: vimperator.completion.url }
    );
    vimperator.mappings.addUserMap([vimperator.modes.VISUAL], [",h"], "show hatena bookmark comments",
        function(count){
            showComments(window.content.document.getSelection());
        },{ noremap: true }
    );
})();
