// Vimperator plugin: Relative Move
// Version: 0.3
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
        var _r;
        var res = (_r = url.match(/^.*(?=\?)/)) ? _r[0] : url;
        res = (_r = res.match(/^https?:\/\/.*(?=https?:\/\/)/)) ? _r[0] : res;
        res = (_r = url.match(/^.*(?=#)/)) ? _r[0] : res;
        return res;
    }

    function open_path(path, tab){
        var win = window.content.window;
        var loc = win.location;
        var splited_path = path.toString().split(/\/+/);
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

        var url, base;
        switch(up){
            case -2: // "/hoge"
                base = loc.protocol + "//" + loc.hostname;
                url = base + path;
                break;
            case -1: // "./hoge"
                base = trim_query(loc.href);
                path = path.toString().substring(2);
                if(base[base.length-1] == "/")
                    url = base + path;
                else
                    url = base + "/" + path;
                break;
            case 0: // "hoge"
                url = loc.href + path;
                break;
            default: // "../../hoge"
                base = trim_query(loc.href);
                let c = 0;
                while(c < up){
                    if(c > 0) base = base.substr(0, base.length-1);
                    [base] = base.match(/^.*\/(?=[^\/]*$)/);
                    path = path.toString().substring(3);
                    c++;
                }
                url = base + path;
            break;
        }
        liberator.open(url, tab);
    }

    commands.addUserCommand(
        ["ro[pen]"],
        "Open relative URL in the current tab",
        open_path
    );

    commands.addUserCommand(
        ["rt[abopen]"],
        "Open relative URL in a new tab",
        function(path){
            open_path(path, liberator.NEW_TAB);
        }
    );
})();
