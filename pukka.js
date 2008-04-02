/*
 * liberator plugin
 * Add `pukka' http://codesorcery.net/pukka/ command to Bookmark del.icio.us
 * For liberator 0.6pre
 * @author otsune (based on teramako)
 * @version 0.1
 */

(function(){
liberator.commands.addUserCommand(['pukka','pu'], 'Post to Pukka',
function(args){
    if (!liberator.buffer.title || !liberator.buffer.URL || liberator.buffer.URL=='about:blank'){
        return false;
    }
    var str = "pukka:";
    var title = encodeURIComponent(liberator.buffer.title);
    var url = encodeURIComponent(liberator.buffer.URL);
    if (args){
        url = encodeURIComponent(args);
    }
    liberator.open(str + "url=" + url + "&title=" + title);
},{
    usage: ['pukka [url] ','pu [url]'],
    completer: function(filter){
        return [0, [getNormalizedPermalink(liberator.buffer.URL), "Normalize URL"]];
    }
}
);

liberator.mappings.addUserMap([liberator.modes.NORMAL], 
['<C-z>'], 'Post to Pukka', 
function() {
    liberator.commandline.open(
        ':',
        'pukka ' + getNormalizedPermalink(liberator.buffer.URL),
        liberator.modes.EX
    );
},{
}
);

// copied from trapezoid's direct-hb.js
function getNormalizedPermalink(url){
    var xhr = new XMLHttpRequest();
    xhr.open("GET","http://api.pathtraq.com/normalize_url?url=" + url,false);
    xhr.send(null);
    if(xhr.status != 200){
        liberator.echoerr("Pathtraq: URL normalize faild!!");
        return url;
    }
    return xhr.responseText;
}
})();
