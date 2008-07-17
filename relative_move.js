// Vimperator plugin: Relative Move
// Version: 0.1
//
// Usage:
//   If you stay "http://example.com/aaa/bbb/ccc"
//
//   :ropen ddd
//     move to http://example.com/aaa/bbb/cccddd
//   :ropen ./ddd
//     move to http://example.com/aaa/bbb/ccc/ddd
//   :ropen ../ddd
//     move to http://example.com/aaa/bbb/ddd
//   :ropen ../../ddd
//     move to http://example.com/aaa/ddd
//   :ropen /fuga
//     move to http://example.com/ddd


(function (){
    function trim_query(url){
        var res = (_r = url.match(/^(.*)\?/)) ? _r[1] : url;
        res = (_r = res.match(/^(http.*)http/)) ? _r[1] : res;
        res = (_r = url.match(/^(.*)#/)) ? _r[1] : res;
        return res;
    }

    function open_path(path, tab){
        var win = window.content.window;
        var loc = win.location;
        var splited_path = path.split("/");
        var up = 0;

        if(!tab){
            tab = liberator.CURRENT_TAB;
        }

        switch(splited_path[0]){
            case ".":
                up = -1;
                break;
            case "..":
                while(splited_path[up] == "..") up++;
                break;
            case "":
                up = -2;
                break;
            default:
                break;
        }

        switch(up){
            case -2: // "/hoge"
                var base = loc.protocol + "//" + loc.hostname;
                var url = base + path;
                break;
            case -1: // "./hoge"
                var _r = null;
                var base = trim_query(loc.href);
                path = path.substring(2);
                if(base[base.length-1] == "/")
                    var url = base + path;
                else
                    var url = base + "/" + path;
                break;
            case 0: // "hoge"
                var url = loc.href + path;
                break;
            default: // "../../hoge"
                var base = trim_query(loc.href);
                var c = 0;
                while(c < up){
                    if(c > 0) base = base.substr(0, base.length-1);
                    base = base.match(/^(.*\/)[^\/]*$/)[1];
                    path = path.substring(3);
                    c++;
                }
                var url = base + path;
            break;
        }
        liberator.open(url, tab);
    }

    liberator.commands.addUserCommand(
        ["ro[pen]"],
        "Open relative URL in the current tab",
        function(path){
            open_path(path);
        }
    );

    liberator.commands.addUserCommand(
        ["rt[abopen]"],
        "Open relative URL in a new tab",
        function(path){
            open_path(path, liberator.NEW_TAB);
        }
    );
})();
