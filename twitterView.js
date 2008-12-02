// Vimperator plugin: 'Statusbar Twitter'
// Last Change: 02-Dec-2008
// License: Creative Commons
// Maintainer: Trapezoid <trapezoid.g@gmail.com> - http://unsigned.g.hatena.ne.jp/Trapezoid
//
// show Twitter on statusesbar script for Vimperator 2.0pre

(function(){
    const checkTime = 90 * 1000;
    const updateTime = 10 * 1000;

    var lastestStatus;

    var statuses = [];
    liberator.plugins.statuses = statuses;

    var passwordManager = Cc["@mozilla.org/login-manager;1"].getService(Ci.nsILoginManager);
    var password; var username;
    try{
        var logins = passwordManager.findLogins({},'http://twitter.com','https://twitter.com',null);
        if(logins.length)
            [username,password] = [logins[0].username,logins[0].password];
        else
            liberator.echoerr("Twitter: account not found");
    }
    catch(ex){
    }

    var hbox = document.createElement('hbox');
    var iconPanel = document.createElement('image');
    var statusPanel = document.createElement('label');

    var commandline = document.getElementById('liberator-commandline');

    iconPanel.setAttribute('id','statusbar-twitter-timeline-icon');
    iconPanel.style.width = "16px";
    iconPanel.style.height = "16px";

    statusPanel.setAttribute('id','statusbar-twitter-timeline-status');
    statusPanel.setAttribute('class','plain');

    hbox.appendChild(iconPanel);
    hbox.appendChild(statusPanel);

    hbox.setAttribute('id','statusbar-twitter-timeline');

    commandline.style.overflow = "hidden";
    commandline.insertBefore(hbox,document.getElementById('liberator-commandline-command'));

    document.getElementById('liberator-commandline-command').style.textAlign = "right";
    document.getElementById('liberator-commandline-command').addEventListener("focus",function(e){
        hbox.hidden = true;
        document.getElementById('liberator-commandline-command').style.textAlign = "left";
    },true);
    document.getElementById('liberator-commandline-command').addEventListener("blur",function(e){
        hbox.hidden = false;
        document.getElementById('liberator-commandline-command').style.textAlign = "right";
    },true);

    checkTimeline();
    updateTimeline();
    setInterval(function() checkTimeline(Date.now() - checkTime - 3),checkTime);
    setInterval(updateTimeline,updateTime);

    function favoriteStatus(id){
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function(){
            if(xhr.readyState == 4 && xhr.status != 200)
                liberator.echoerr("Twitter Viewer: faild to favorite");
        };
        xhr.open("GET","http://twitter.com/favourings/create/" + id,true,username,password);
        xhr.send(null);
    }
    function checkTimeline(since){
        var req = "http://twitter.com/statuses/friends_timeline.json";
        if(typeof since == "number") since = new Date(since);
        if(since){
          req += "?since=" + encodeURIComponent(since.toUTCString());
        }
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function(){
            if(xhr.readyState != 4) return;
            if(xhr.status != 200){
                liberator.echoerr("Twitter Viewer: failed");
            }
            var response = window.eval(xhr.responseText);
            liberator.plugins.statuses = statuses =
                statuses.concat(response.filter(function(r)
                    !statuses.some(function(status)
                        status.id == r.id)));
        };
        //xhr.setRequestHeader("X-Twitter-Client","Vimperator");
        //xhr.setRequestHeader("X-Twitter-Client-Version","");
        //xhr.setRequestHeader("X-Twitter-Client-URL","");
        //xhr.setRequestHeader("If-Modified-Since","");
        xhr.open("GET",req,true,username,password);
        xhr.send(null);
    }
    function updateTimeline(){
        if(statuses.length > 0 && !hbox.hidden){
            lastestStatus = statuses.shift();
            statusPanel.value = lastestStatus.user.screen_name + " : " + lastestStatus.text;
            statusPanel.setAttribute('tooltiptext',lastestStatus.user.screen_name + " : " + lastestStatus.text);
            iconPanel.setAttribute('src',lastestStatus.user.profile_image_url);
            iconPanel.setAttribute('tooltiptext',lastestStatus.user.screen_name);
        }
    }

    liberator.modules.mappings.add([liberator.modules.modes.NORMAL],[",r"],
        "Reply to current user",
        function (){ liberator.modules.commandline.open(":","twitter @" + lastestStatus.user.screen_name + " ",liberator.modules.modes.EX); });
    liberator.modules.mappings.add([liberator.modules.modes.NORMAL],[",f"],
        "Favorite to current user",
        function (){ favoriteStatus(lastestStatus.id); });
})();
// vim: fdm=marker sw=4 ts=4 et:
