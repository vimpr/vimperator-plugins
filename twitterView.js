// Vimperator plugin: 'Statusbar Twitter'
// Last Change: 24-Mar-2008. Jan 2008
// License: Creative Commons
// Maintainer: Trapezoid <trapezoid.g@gmail.com> - http://unsigned.g.hatena.ne.jp/Trapezoid
//
// show twitter on statusesbar script for vimperator0.6.*

(function(){
    var checkTime = 90 * 1000;
    var updateTime = 10 * 1000;
    var maxWidth = '500px';

    var lastestId = 0;

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
    var statusPanel = document.createElement('textbox');

    hbox.style.overflow = "hidden";

    iconPanel.setAttribute('id','statusbar-twitter-timeline-icon');
    iconPanel.style.width = "16px";
    iconPanel.style.height = "16px";

    statusPanel.setAttribute('id','statusbar-twitter-timeline-status');
    statusPanel.setAttribute('class','plain');
    statusPanel.style.width = maxWidth;

    hbox.appendChild(iconPanel);
    hbox.appendChild(statusPanel);

    hbox.setAttribute('id','statusbar-twitter-timeline');
    //document.getElementById('status-bar').insertBefore(hbox,document.getElementById('statusbar-display'));
    document.getElementById('liberator-commandline').appendChild(hbox);
    document.getElementById('liberator-commandline').addEventListener("focus",function(e){
        hbox.hidden = true;
    },true);
    document.getElementById('liberator-commandline').addEventListener("blur",function(e){
        hbox.hidden = false;
    },true);

    checkTimeline();
    updateTimeline();

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

        setTimeout(arguments.callee ,checkTime);
    }
    function updateTimeline(){
        if(statuses.length > 0 && !hbox.hidden){
            var s = statuses.shift();
            statusPanel.value = s.user.screen_name + " : " + s.text;
            statusPanel.setAttribute('tooltiptext',s.user.screen_name + " : " + s.text);
            iconPanel.setAttribute('src',s.user.profile_image_url);
            iconPanel.setAttribute('tooltiptext',s.user.screen_name);
        }

        setTimeout(arguments.callee ,updateTime);
    }
})();
