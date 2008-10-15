// Vimperator plugin: gmail-biff
// Maintainer: mattn <mattn.jp@gmail.com> - http://mattn.kaoriya.net
(function(){
    const ICON1 = 'data:image/png;base64,'+
        'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQEAIAAADAAbR1AAAACXBIWXMAAABIAAAASABGyWs+AAAA'+
        'CXZwQWcAAAAQAAAAEABcxq3DAAAEXklEQVQ4y7WUXUxTdxyG33/bU6gIY5VSa8WkXSUu6hyDKMkM'+
        'S1TAuSUQl10sMtAsGnQKs64Vq5KAGWNxas1E/GJ1YHQJjMT4FdEZIqgJBkRnZA7mV0uFCuLgcNpz'+
        '2vP/7UKz7GLJrnwu3svn5k0eRkREhNeGDiFswzYMUiVVIpmtYqtgww7sANCABgAxxP7XUoxiPMU5'+
        'nMNT8pAHZraVbYUVdajD+OKzj84+Cma7FrsWD3+8q3dXr/zjXcNdA5EUlsJEk/ZJO5EYESNEoiIq'+
        'RKIsykSTwqRAJMmSHCt/Yntie/bcO9M7M5jmvOO889TQpDapkhSZEpmikz99kPAgQWxt97f70Udl'+
        'VCa3DNQM1KR8Uq6UKwY1oyKjAm/iEA4BaEQjgIVYCECBokgPpYfSyOa6kbqRydYOZ4cTnbEDsQMT'+
        'C+ROuZMXLr239J6GbdHe1N5Ei/a09rTwTVp5Wnl0dLBosGjYVS1Xy+JvV+ZdmQcPP8qPAuhGN0Jg'+
        'YOFbt/pv9Q9bqpZULQlf6antqY0T0y+kX2AufbO+WW1CGcq4jVu4RQOOcYyjlfIob8rPWY4sh+mU'+
        '64TrBH7iZ/iZ0PHaYG3wxWcty1qWUYK0V9o7IbTVtNUML68qqiqK1g5Zh6ym0k0FmwoSVy83Ljfy'+
        'jZRO6dSOgzgIO5vFZule3TRBbdSGY7q1urWJ/tyruVd126cFpvmfzffO8FpGN9Qfrj8s2a55r3kj'+
        'G/vQB21icl5ynrnDOcc5J0HOCeeEXxxpvt58nc+nVErlH1AlVWIAbrg1pAIAogAACY/xGBbmYz7D'+
        'zsy3Mh3TS9we9w/xMftD+4PJ32/subFHaJxunm42n3Sfd59P8OXk5+TjLzjgoFJ+jB+LvsO7ebfq'+
        'IpVUGKGFVof9YGCUDwaGD2GHHRrexbtgfJ7zPFe/Oik1yZQaqFhfsV5Uu/xdgYS6rJ6sHv1dw5hh'+
        'DL+EskPZEExTTVPVNdRIjfI4ZVBGtJpyKRdvQICgQy9kKBhjK9gKOidnypkkBD4PFMMsfCdUQzMj'+
        'd8ZSHQlFwpZkcXbD7AaMwAormWO9sV5kj64cXYn2gBSQ1AGpTCpTWvgavkZ10n26j07EIU5HfdiN'+
        'L/hMWknFfFDeKX/L25JKk0phStyY+CXAClgBhlRFjWEME5gAwz7sg8yy2SK0pmSkvEenpFFpNJoS'+
        'bgo3Rf/k6/g6/jaVUAmmIh/5uuju2OVYn+yJxkWNkQXCImGu5GZO9jUziZfEywBKUAKG27gNBgaG'+
        'l1nRwI8A3cR93Ma7zMYskSf6An2hauMn+UmaSyqpCGIIQzql2njReP3ZR2l/pPWPlIxL42OBLW3u'+
        'i+XYDgfLBv5R4lUy7gEA+gEwvA8NJOrB99imbAh6gnVhv3WzdbP2K6PH6NHEs3pWz6T9ok/0DXmD'+
        'jqBDzlGuKh2YYD7mA6AB+4/uRP+1HACDAD3ikEe/0iVYUIjCuOPxarxq6bGGrCH2umuqeX3ql/wN'+
        'QBozxfxKbAIAAAAASUVORK5CYII=';

    const ICON2 = 'data:image/png;base64,'+
        'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQEAAAAABqCHz+AAAACXBIWXMAAABIAAAASABGyWs+AAAA'+
        'CXZwQWcAAAAQAAAAEABcxq3DAAABvUlEQVQoz2P4TwAw/J/13/x/9f87/6f/n4IErwHFTf73ARUc'+
        't5zOskjjvtvPVT+Sfrj8cAVC359rXv5bPWGq9w7O79sZ1uam1aXeaFt26/n/zf83/s//P/X//+cc'+
        'U5PSJ6Yc6yh4lsqwviXTo0axqKS65eyrv7eBlvbfOtMWlv+hRTTjUQfHk0aG9VXpvxZPPLWp8nQx'+
        'x77qH+KnflVZlzgcWrVrVvrF9rgnC0AKji5T/G9xM6Blad7zSSHFDnUfL5z9/2zfzbSKttInixjW'+
        'V6YfXsbxf/3//3f/d3Km7WyVv9H+//3/33vTUgxaNj5ZxbA+Ir136cu/rz8ueXnsCe+u/EcrX616'+
        'v+lfyR7WhPNNdU+2MKx3TV+54Oersre7fn/4v+l/5v8Vf6a9F311bPOa2BMNa57sY1g3LW3K7Luf'+
        'nf9s/PPyz+Q/LUC48k/V14DVz6KZ6k89Ocyw6lei65yMjz4f7T6afDT7aA6Elh95P85Y+z2iq+78'+
        'k9UMW8vzxTtMN0ZvrATDio05GxM3hm/cMvFrhlvno2dxDF9Nbh+9Gn/19NUzUHj66kkgPH91y1WH'+
        'O1e/yzEQjk0CAAARc29gwOvTnwAAAABJRU5ErkJggg==';

    var gmailBiffIntervals = parseInt(liberator.globalVariables.gmbf_check_intervals || 30) * 1000;

    var gmailBiffIcon = document.createElement('statusbarpanel');
    gmailBiffIcon.setAttribute('id','gmail-biff-icon');
    gmailBiffIcon.setAttribute('class','statusbarpanel-iconic');
    gmailBiffIcon.setAttribute('src', ICON2);
    gmailBiffIcon.setAttribute('tooltip', 'gmail-biff-tip');
    gmailBiffIcon.addEventListener("click",function(e){
        liberator.open("https://mail.google.com/", liberator.NEW_TAB);
    },false);

    var gmailBiffTip = document.createElement('tooltip');
    gmailBiffTip.setAttribute('id','gmail-biff-tip');
    var gmailBiffText = document.createElement('description');
    gmailBiffText.setAttribute('id','gmail-biff-text');
    gmailBiffTip.appendChild(gmailBiffText);

    document.getElementById('status-bar')
            .insertBefore(gmailBiffIcon,document.getElementById('security-button').nextSibling);
    document.getElementById('status-bar').appendChild(gmailBiffTip);

    setTimeout(function() {
        try {
            var form = ['https://www.google.com', 'https://www.google.com', null];
            var passwordManager = Cc["@mozilla.org/login-manager;1"].getService(Ci.nsILoginManager);
            var logins = passwordManager.findLogins({}, form[0], form[1], form[2]);
            if(logins.length)
                var [gmailUser, gmailPassword] = [logins[0].username, logins[0].password];
            else {
                liberator.echoerr("Gmail Biff: account not found");
                var promptSvc = Cc["@mozilla.org/embedcomp/prompt-service;1"]
                    .getService(Ci.nsIPromptService);
                var user = { value : null };
                var pass = { value : null };
                var ret = promptSvc.promptUsernameAndPassword(
                    window, form[0], "GMail Biff Login", user, pass, null, {});
                if(ret){
                    var nsLoginInfo = new Components.Constructor("@mozilla.org/login-manager/loginInfo;1",
                            Ci.nsILoginInfo,
                            "init");
                    [gmailUser, gmailPassword] = [user.value, pass.value];
                    var formLoginInfo = new nsLoginInfo(
                        form[0], form[1], form[2],
                        gmailUser, gmailPassword, '', '');
                    passwordManager.addLogin(formLoginInfo);
                }
                return;
            }

            const feed_url = 'https://mail.google.com/mail/feed/atom';
            var xhr = new XMLHttpRequest();
            xhr.mozBackgroundRequest = true;
            xhr.open("GET", feed_url, false, gmailUser, gmailPassword);
            xhr.send(null);

            var count = parseInt(xhr.responseXML.getElementsByTagName('fullcount')[0].childNodes[0].nodeValue);
            gmailBiffIcon.setAttribute('src', count > 0 ? ICON1 : ICON2);
            gmailBiffText.setAttribute('value', count > 0 ? 'You have new mail (' + count + ')' : 'No new mail');
            setTimeout(arguments.callee, gmailBiffIntervals);
        } catch(e) {
            liberator.log(e);
            liberator.echoerr("Gmail Biff: " + e);
        }
    }, 1000);
})();
// vim:sw=4 ts=4 et:
