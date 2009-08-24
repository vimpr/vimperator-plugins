// Vimperator plugin: "Show Hatena Bookmark Comments"
// Last Change: Mon Feb  9 21:36:06     2009
// License: Creative Commons
// Maintainer: Trapezoid <trapezoid.g@gmail.com> - http://unsigned.g.hatena.ne.jp/Trapezoid
//
// show Hatena Bookmark comments script for Vimperator 2.0pre

(function(){
    function showComments(url){
        const endPoint = "http://b.hatena.ne.jp/entry/jsonlite/";
        var xhr = new XMLHttpRequest();
        var tagString,showString = "<div>";
        xhr.open("GET",endPoint + url.replace(/#/,"%23"),false);
        xhr.send(null);
        var response;
            if(!(response = window.eval("("+xhr.responseText+")"))){
            liberator.echoerr("Does not exists!!");return;
        }
        var bookmarks = response["bookmarks"];
        showString += response["count"] + " users : " + response["title"] + "<dl>";

        bookmarks.forEach(function(bookmark){
            tagString = bookmark.tags.length ? "[" + bookmark.tags.join("][") + "]":"";
            showString += '<dt style="float:left;clear:both;width:10%;margin:0;">' + bookmark.user + "</dt>";
            showString += '<dd style="margin:0 0 0 10%;width:90%;border-left:1px solid;"> '
            showString += tagString + (bookmark.tags.length > 0 && bookmark.comment ? "<br/> ":"") + bookmark.comment + "</dd>";
        });
        showString += "</dl></div>";
        liberator.modules.commandline.echo(showString,liberator.modules.commandline.HL_NORMAL,liberator.modules.commandline.FORCE_MULTILINE);
    }
    liberator.modules.commands.addUserCommand(["hbinfo"],"show Hatena Bookmark comments",
        function(args){
            var clipboard = readFromClipboard();
            var url = args.literalArg;
            if(args.bang)
                url = window.content.document.getSelection() || clipboard;
            showComments(url ? encodeURIComponent(url): liberator.modules.buffer.URL);
        },{
          literal: 0,
          completer: function (context, args) liberator.modules.completion.url(context),
          bang: true
        },
        true
    );
    liberator.modules.mappings.addUserMap([liberator.modules.modes.VISUAL],[",h"],"show Hatena Bookmark comments",
        function(count){
            showComments(window.content.document.getSelection());
        },{ noremap: true }
    );
})();
