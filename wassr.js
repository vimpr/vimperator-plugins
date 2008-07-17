// Vimperator plugin: "Update Wassr"
// Last Change: 17-Jul-2008. Jan 2008
// License: Creative Commons
// Maintainer: mattn <mattn.jp@gmail.com> - http://mattn.kaoriya.net/
// Based On: twitter.js by Trapezoid
//
// The script allows you to update Wassr status from Vimperator 0.6.*.

(function(){
    var evalFunc = window.eval;
    try {
        var sandbox = new Components.utils.Sandbox(window);
        if (Components.utils.evalInSandbox("true", sandbox) === true) {
            evalFunc = function(text) {
                return Components.utils.evalInSandbox(text, sandbox);
            }
        }
    } catch(e) { liberator.log('warning: wassr.js is working with unsafe sandbox.'); }

    var passwordManager = Cc["@mozilla.org/login-manager;1"].getService(Ci.nsILoginManager);

    function emojiConv(str){
        return str.replace(/[^*+.-9A-Z_a-z-]/g,function(s){
            var c = s.charCodeAt(0);
            return (0xE001 <= c && c <= 0xF0FC) ? '<img src="http://wassr.jp/img/pictogram/' + c.toString(16).toUpperCase() + '.gif"/>' : s;
        })
    }
    function sayWassr(username, password, stat){
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "http://api.wassr.jp/statuses/update.json", false, username, password);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.send("status=" + encodeURIComponent(stat) + "&source=" + encodeURIComponent("vimperator/wassr.js"));
    }
    function sprintf(format){
        var i = 1, re = /%s/, result = "" + format;
        while (re.test(result) && i < arguments.length) result = result.replace(re, arguments[i++]);
        return result;
    }
    function showFollowersStatus(username, password, target){
        var xhr = new XMLHttpRequest();
        var endPoint = target ? "http://api.wassr.jp/user_timeline.json?id=" + target
            : "http://api.wassr.jp/statuses/friends_timeline.json?id=" + username;
        xhr.open("GET", endPoint, false, username, password);
        // for debug
        //xhr.open("GET", "http://api.wassr.jp/statuses/user_timeline/otsune.json", false, username, password);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.send(null);
        var statuses = evalFunc(xhr.responseText);

        var html = <style type="text/css"><![CDATA[
            span.wassr.entry-content a { text-decoration: none; }
            img.wassr.photo { border; 0px; width: 16px; height: 16px; vertical-align: baseline; }
        ]]></style>.toSource()
                   .replace(/(?:\r?\n|\r)[ \t]*/g, " ") +
            statuses.map(function(status)
                <>
                    <img src={"http://wassr.jp/user/" + status.user_login_id + "/profile_img.png.32"}
                         alt={status.user.screen_name}
                         title={status.user.screen_name}
                         class="wassr photo"/>
                    <strong>{status.user_login_id}&#x202C;</strong>
                </>.toSource()
                   .replace(/(?:\r?\n|\r)[ \t]*/g, " ") +
                    sprintf(': <span class="wassr entry-content">%s&#x202C;</span>', emojiConv(status.text)))
                        .join("<br/>");

        liberator.echo(html, true);
    }
    function todoAction(username, password, arg){
        var xhr = new XMLHttpRequest();
        if (arg.match(/\+ (.*)/)) {
            xhr.open("POST", "http://api.wassr.jp/todo/add.json", false, username, password);
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xhr.send("body=" + encodeURIComponent(RegExp.$1));
        } else
        if (arg.match(/- (.*)/)) {
            xhr.open("POST", "http://api.wassr.jp/todo/delete.json", false, username, password);
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xhr.send("todo_rid=" + encodeURIComponent(RegExp.$1));
        } else
        if (arg.match(/\* (.*)/)) {
            xhr.open("POST", "http://api.wassr.jp/todo/start.json", false, username, password);
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xhr.send("todo_rid=" + encodeURIComponent(RegExp.$1));
        } else
        if (arg.match(/\/ (.*)/)) {
            xhr.open("POST", "http://api.wassr.jp/todo/stop.json", false, username, password);
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xhr.send("todo_rid=" + encodeURIComponent(RegExp.$1));
        } else
        if (arg.match(/! (.*)/)) {
            xhr.open("POST", "http://api.wassr.jp/todo/done.json", false, username, password);
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xhr.send("todo_rid=" + encodeURIComponent(RegExp.$1));
        }

        xhr.open("GET", "http://api.wassr.jp/todo/list.json", false, username, password);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.send(null);
        var todos = evalFunc(xhr.responseText);

        var html = <style type="text/css"><![CDATA[
            span.wassr.entry-content a { text-decoration: none; }
            img.wassr.icon { border; 0px; width: 16px; height: 16px; vertical-align: baseline; }
        ]]></style>.toSource()
                   .replace(/(?:\r?\n|\r)[ \t]*/g, " ") +
            todos.map(function(todo)
                <>
                    <img src="http://wassr.jp/img/icn-balloon.gif"
                         alt="todo"
                         title="todo"
                         class="wassr icon"/>
                    <strong>{todo.todo_rid}</strong>
                </>.toSource()
                   .replace(/(?:\r?\n|\r)[ \t]*/g, " ") +
                    sprintf(': <span class="wassr entry-content">%s</span>', todo.body))
                        .join("<br/>");

        liberator.echo(html, true);
    }
    function footmarkAction(username, password){
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "http://api.wassr.jp/footmark/recent.json", false, username, password);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.send(null);
        var footmarks = evalFunc(xhr.responseText);

        var html = <style type="text/css"><![CDATA[
            img.wassr.photo { border; 0px; width: 16px; height: 16px; vertical-align: baseline; }
        ]]></style>.toSource()
                   .replace(/(?:\r?\n|\r)[ \t]*/g, " ") +
            footmarks.map(function(footmark)
                <>
                    <img src={"http://wassr.jp/user/" + footmark.login_id + "/profile_img.png.32"}
                         alt={footmark.nick}
                         title={footmark.nick}
                         class="wassr photo"/>
                    <strong>{footmark.login_id}&#x202C;</strong>
                </>.toSource()
                   .replace(/(?:\r?\n|\r)[ \t]*/g, " ")).join("<br/>");

        liberator.echo(html, true);
    }
    function footmarkAction(username, password){
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "http://api.wassr.jp/footmark/recent.json", false, username, password);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.send(null);
        var footmarks = evalFunc(xhr.responseText);

        var html = <style type="text/css"><![CDATA[
            img.wassr.photo { border; 0px; width: 16px; height: 16px; vertical-align: baseline; }
        ]]></style>.toSource()
                   .replace(/(?:\r?\n|\r)[ \t]*/g, " ") +
            footmarks.map(function(footmark)
                <>
                    <img src={"http://wassr.jp/user/" + footmark.login_id + "/profile_img.png.32"}
                         alt={footmark.nick}
                         title={footmark.nick}
                         class="wassr photo"/>
                    <strong>{footmark.login_id}&#x202C;</strong>
                </>.toSource()
                   .replace(/(?:\r?\n|\r)[ \t]*/g, " ")).join("<br/>");

        liberator.echo(html, true);
    }
    liberator.commands.addUserCommand(["wassr"], "Change wassr status",
        function(arg, special){
            var password;
            var username;
            try {
                var logins = passwordManager.findLogins({}, "http://wassr.jp", "http://wassr.jp", null);
                if (logins.length)
                    [username, password] = [logins[0].username, logins[0].password];
                else
                    throw "Wassr: account not found";
            }
            catch (ex){
                liberator.echoerr(ex);
            }

            arg = arg.replace(/%URL%/g, liberator.buffer.URL)
                .replace(/%TITLE%/g, liberator.buffer.title);

            if (special || arg.length == 0)
                showFollowersStatus(username, password, arg);
            else
            if (arg.match(/^-todo(.*)/))
                todoAction(username, password, RegExp.$1);
            else
            if (arg.match(/^-footmark$/))
                footmarkAction(username, password);
            else
                sayWassr(username, password, arg);
        },
    {
        args: [
            [['-todo'], commands.OPTION_STRING],
            [['-footmark'], null]
        ],
        completer: function(filter) {
            candidates = [];
            if (filter.match(/{emoji:$/)) {
            } else
            if (filter.match(/-todo$/)) {
                candidates = [
                    ['-todo+', 'add todo'],
                    ['-todo-', 'delete todo'],
                    ['-todo*', 'start todo'],
                    ['-todo/', 'stop todo'],
                    ['-todo!', 'done todo'],
                ];
            } else
            if (filter.match(/-todo[^\+].*/)) {
                var password;
                var username;
                try {
                    var logins = passwordManager.findLogins({}, "http://wassr.jp", "http://wassr.jp", null);
                    if (logins.length)
                        [username, password] = [logins[0].username, logins[0].password];
                    else
                        throw "Wassr: account not found";
                    var xhr = new XMLHttpRequest();
                    xhr.open("GET", "http://api.wassr.jp/todo/list.json", false, username, password);
                    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                    xhr.send(null);
                    var todos = evalFunc(xhr.responseText);
                    for(let i in todos) candidates.push([filter + ' ' + todos[i].todo_rid, todos[i].body]);
                }
                catch (ex){
                    liberator.echoerr(ex);
                }
            } else {
                candidates = [
                    ['-todo', 'todo'],
                    ['-footmark', 'footmark'],
                ];
            }
            return [0,candidates];
        }
    });
})();
// vim:sw=4 ts=4 et:
