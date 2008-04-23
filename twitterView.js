// Vimperator plugin: 'Statusbar Twitter'
// Last Change: 23-Apr-2008. Jan 2008
// License: Creative Commons
// Maintainer: Trapezoid <trapezoid.g@gmail.com> - http://unsigned.g.hatena.ne.jp/Trapezoid
//
// show twitter on statusesbar script for vimperator0.6.*

(function(){
    var checkTime = 90 * 1000;
    var updateTime = 10 * 1000;

    var lastestId = 0;
    var lastestStatus;

    var statuses = [];
    liberator.plugins.statuses = statuses;

    var passwordManager = Cc["@mozilla.org/login-manager;1"].getService(Ci.nsILoginManager);
    var password; var username;
    try {
        var logins = passwordManager.findLogins({}, 'http://twitter.com',  'https://twitter.com', null);
        if(logins.length)
            [username, password] = [logins[0].username, logins[0].password];
        else
            liberator.echoerr("Twitter: account not found");
    }
    catch(ex) {
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
    setInterval(checkTimeline ,checkTime);
    setInterval(updateTimeline ,updateTime);

    function checkTimeline(){
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function(){
            if(xhr.readyState == 4){
                if(xhr.status == 200){
                    var encodedJson = window.eval(xhr.responseText);
                    for(var i = encodedJson.length;i>0;i--){
                        if(lastestId < encodedJson[i-1].id){
                            statuses.push(encodedJson[i-1]);
                            lastestId = encodedJson[i-1].id;
                        }
                    }
                }else{
                    liberator.echoerr("Twitter Viewer: faild");
                }
            }
        };
        xhr.open("GET","http://twitter.com/statuses/friends_timeline.json",true,username,password);
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

    liberator.mappings.addUserMap([liberator.modes.NORMAL], [",r"],
        "Reply to current user",
        function () { liberator.commandline.open(":", "twitter @" + lastestStatus.user.screen_name + " ", liberator.modes.EX); });
})();
