// Vimperator plugin: 'Cooperation LDRize Mappings'
// Version: 0.09
// Last Change: 21-Mar-2008. Jan 2008
// License: Creative Commons
// Maintainer: Trapezoid <trapezoid.g@gmail.com> - http://unsigned.g.hatena.ne.jp/Trapezoid
//
// Cooperation LDRize Mappings for vimperator0.6.*
(function(){
    var scrollCount = 3;
    var programInfo = [
        //{
        //    pattern: "http://www.nicovideo.jp/*",
        //    program: "c:\\usr\\SmileDownloader\\SmileDownloader.exe",
        //    wait: 5000
        //},
        //{
        //    program: "C:\\usr\\irvine\\irvine.exe",
        //},
    ];

    programInfo.forEach(function(x){
        x.include = typeof x.include != "undefined"
            ? typeof x.include == "string" ? new RegExp(x.include) : new RegExp(x.include[0],x.include[1])
            : typeof x.pattern != "undefined"
                ? new RegExp("^"+String(x.pattern).replace(/\s+/g,"").replace(/[\\^$.+?|(){}\[\]]/g,"\\$&")
                    .replace(/(?=\*)/g,".")+"$","i")
                : /(?:)/;
        delete x.pattern;
    });

    var LDRize = {getSiteinfo: function(){return undefined;}};
    var Minibuffer;

    var isEnable = true;

    function addAfter(target,name,after) {
        var original = target[name];
        target[name] = function() {
            var tmp = original.apply(target,arguments);
            after.apply(target,arguments);
            return tmp;
        };
    }

    var GreasemonkeyService = Cc["@greasemonkey.mozdev.org/greasemonkey-service;1"].getService().wrappedJSObject;
    addAfter(GreasemonkeyService,'evalInSandbox',function(code,codebase,sandbox){
        if(sandbox.window.LDRize != undefined && sandbox.window.Minibuffer != undefined){
            sandbox.window.addEventListener("focus",function(){
                liberator.plugins.LDRize = LDRize = window.eval("self",sandbox.LDRize.getSiteinfo);
                liberator.plugins.Minibuffer = Minibuffer = window.eval("command",sandbox.Minibuffer.addCommand);
            },false);
            sandbox.window.addEventListener("load",function(){
                if(window.content.wrappedJSObject == sandbox.unsafeWindow){
                    liberator.plugins.LDRize = LDRize = window.eval("self",sandbox.LDRize.getSiteinfo);
                    liberator.plugins.Minibuffer = Minibuffer = window.eval("command",sandbox.Minibuffer.addCommand);
                }
            },false);
        }
    });

    var feedPanel = document.createElement('statusbarpanel');
    const DISABLE_ICON = 'data:image/png;base64,'
        +'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAACXBIWXMAAA7E'
        +'AAAOxAGVKw4bAAACL0lEQVR4nF2Sy0tUYRjGf9+Z4/HMjJfjBUZEMM2MSDII'
        +'REjSVtVecBFZi6Bdi4RW/SFBq2oR0R8gSaUJhVJIBkEEMZOWl5kuM+fqnPN9'
        +'52sxQ4kPv837Pu+zel4xMjkz/3h5p87pbhyDw4o1mzUOkubYbvLo2kVx+4Pe'
        +'rAKMdTGQ5YgiWK/8z+QT3yyVUTFAzaBXHQ0IONPKOxepAH65dUOGSB/pM9LC'
        +'whjyy/sg4DB3TjGZbjVuVIihQhKfxGdzmzhhNBvGXhr7NDiRY+fr573ibmtC'
        +'4pN4GNJDukiXusvbIuMnh9K9YujSYKKPl6vrZu+EI5EuyheG9JEe0qPusfSR'
        +'4cGBbPA98og8LMlAPlor2ZEvVIT0kD6G9EhcEpfY58c+xbKYHBaRl4Ye432s'
        +'rqyo7pnQo/qTxEW62gy2CKoAbheu4mGGm5eHgsViOTh+5Sp37+2X4gJQC0gU'
        +'Otb0j2hhaCG06NfC0K22/radzs6uTM3ojY1SobDcdHNaCC2Mimn2YZmQggEd'
        +'kPJ0UczfyOzVWHr1xnVmrS5I0R6pgTC1mXdoUwB2Jj5QFvDsBc8fTCkpL82l'
        +'uW6rWWEPQBoL07JwCgAaywbgd8ynIrultTB3wWk73LtWdS3OXtd/fBwH2+Yg'
        +'xM4R14kqrzMZzM5pO9dcNlQrl832wTSoGiEok84eOrK0ZGB0+shTJYpyFUv7'
        +'In/s/LlbTyq+/ufZFlkTK4MhAJKUMCGs6x473rg/9xe9wS0xVA1n/AAAAABJ'
        +'RU5ErkJggg==';
    const ENABLE_ICON = 'data:image/png;base64,'
        +'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAACXBIWXMAAAsT'
        +'AAALEwEAmpwYAAACI0lEQVR4nGWSzU7yQBSGp84UKalDY0MkLsSdYWtCIok3'
        +'4YKV7tx7MWy9A6/ABZDgHbhghdFqU9M0FpH57cyUcdFA8Pue3fl5T07Oe5zz'
        +'8/PhcEgpbbfbtVoN7LBer9M01VpX4f7+/t3dnfP4+JimKQDg6OgIYwz+UpZl'
        +'HMdbjbUWZVkmpQQAEEJc1wX/EYZhHMdlWQIAKKV7cgPG+PLy8uPjg/+l3+/7'
        +'vl/1KKVQURRCCABAFEVa6yAIOOeO41Tjj4+PoyiK49h1XSkl53xPbOCcz+fz'
        +'bre7WCzYhpOTk+l0GoYhhFAIIaXck1JuNc/Pz51OpyiKahkAAMb49fVVCKGU'
        +'qgTw4uKCUqq1RggZY05PT8uyTJJEa312dvby8rJcLq21y+WSUiqlhN1uN89z'
        +'xpgxJs9zQkiv1xuNRlmWXV9f39/ff39/53meZRmllBCCZrNZkiTWWowxIWQ6'
        +'nV5dXRFCGGOfn59PT0+MMWut67pa6/V6jZrNpjHGWus4TqPRsNaORqPBYCCE'
        +'GI/Hvu/7vm+trc4KAEC+71dGQggrdyaTyXA4NMbc3NxsvW82mwCAoihQrVY7'
        +'PDzctVYIEUXR29tbo9GAEO6WpJTO7e0tIQRjXK/XhRCe5ymlsiyDEAZB4Hle'
        +'lawEX19fqNVqVS/kOE6r1fI8DyHU6XT++ShjzM/Pz8HBAXx/f+/3+9X2WmvO'
        +'uVKq3GCMUUoxxlarVb1ef3h4+AWNW50eXTIBjgAAAABJRU5ErkJggg==';
    feedPanel.setAttribute('id','ldrizecopperation-status');
    feedPanel.setAttribute('class','statusbarpanel-iconic');
    feedPanel.setAttribute('src',ENABLE_ICON);
    feedPanel.addEventListener("click",function(e){
            switchLDRizeCooperation(isEnable ? false : true);
    },false);
    document.getElementById('status-bar').insertBefore(feedPanel,document.getElementById('security-button'));

    function switchLDRizeCooperation(value){
            isEnable = value;
            feedPanel.setAttribute("src",value ? DISABLE_ICON : ENABLE_ICON);
    }
    function sendRawKeyEvent(keyCode,charCode){
        var evt = window.content.wrappedJSObject.document.createEvent("KeyEvents");
        evt.initKeyEvent("keypress",true,true,window.content.wrappedJSObject,false,false,false,false,keyCode,charCode);
        window.content.wrappedJSObject.document.dispatchEvent(evt);
    }
    function isEnableLDRize(){ return isEnable && LDRize.getSiteinfo() != undefined; }
    function getPinnedLinks(){
        var xpath = LDRize.getSiteinfo()['link'];
        return LDRize.getPinnedItems().map(function(i){return i.XPath(xpath)});
    }
    function downloadLinksByProgram(links){
        var count = 0;
        links.forEach(function(link){
            for(let i=0;i<programInfo.length;i++)
                if(programInfo[i].include.test(link)){
                    setTimeout(function(){
                        liberator.io.run(programInfo[i].program,[link],false);
                    },programInfo[i].wait != undefined ? programInfo[i].wait * count++ : 0);
                    return;
                }
            liberator.echoerr("LDRize Cooperation: download pattern not found!!");
        });
    }

    //Mappings
    liberator.mappings.addUserMap([liberator.modes.NORMAL], ["j", "<Down>", "<C-e>"],
        "Scroll document down",
        function(){isEnableLDRize() ? sendRawKeyEvent(74,106):liberator.buffer.scrollLines(scrollCount);} ,{});
    liberator.mappings.addUserMap([liberator.modes.NORMAL], ["k", "<Up>", "<C-y>"],
        "Scroll document up",
        function(){isEnableLDRize() ? sendRawKeyEvent(75,107):liberator.buffer.scrollLines(-scrollCount);} ,{});
    liberator.mappings.addUserMap([liberator.modes.NORMAL], ["o"],
        "Open a message",
        function(){isEnableLDRize() ? sendRawKeyEvent(79,111):liberator.commandline.open(":","open ",liberator.modes.EX);},{});
    liberator.mappings.addUserMap([liberator.modes.NORMAL], ["p"],
        "Open (put) a URL based on the current clipboard contents in the current buffer",
        function(){isEnableLDRize() ? sendRawKeyEvent(80,112):liberator.open(readFromClipboard());} ,{});

    liberator.mappings.addUserMap([liberator.modes.NORMAL], [",f"],
        "Focus on search field by LDRize",
        function(){LDRize.bindFocus();} ,{});

    //Commands
    liberator.commands.addUserCommand(["pin"], "LDRize Pinned Links",
        function(){
            var links = getPinnedLinks();
            var showString = links.length + " Items<br/>";
            links.forEach(function(link){
                showString += link + "<br/>";
            });
            liberator.commandline.echo(showString, liberator.commandline.HL_NORMAL, liberator.commandline.FORCE_MULTILINE);
        } ,{});
    liberator.commands.addUserCommand(["mb","m","minibuffer"], "Execute Minibuffer",
        function(arg){Minibuffer.execute(arg)},
        {
            completer: function(filter){
                var completionList = [];
                var command = liberator.plugins.Minibuffer.command;
                var alias = liberator.plugins.Minibuffer.alias_getter();
                var tokens = filter.split("|").map(function(str){return str.replace(/\s+/g,"")});
                var exp = new RegExp("^" + tokens.pop());
                for(let i in command) if(exp.test(i))completionList.push([tokens.concat(i).join(" | "),"MinibufferCommand"]);
                for(let i in alias) if(exp.test(i))completionList.push([i,"MinibufferAlias"]);
                return [0,completionList];
            }
        });
    liberator.commands.addUserCommand(["pindownload"], "Download pinned links by any software",
        function(arg){ downloadLinksByProgram(getPinnedLinks());} ,{});
    liberator.commands.addUserCommand(["toggleldrizecooperation","toggleldrc"], "Toggle LDRize Cooperation",
        function(arg){ switchLDRizeCooperation(!isEnable);}, {});

    //Options
    liberator.options.add(['ldrc','ldrizecooperation'],'LDRize cooperation','boolean',isEnable,
        {
            setter: function(value){
                switchLDRizeCooperation(value);
            },
            getter: function(){
                return isEnable;
            }
        }
    );
})();
