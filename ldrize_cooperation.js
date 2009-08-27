// Vimperator plugin: 'Cooperation LDRize Mappings'
// Version: 0.25
// Last Change: 12-Jun-2009. Jan 2008
// License: Creative Commons
// Maintainer: Trapezoid <trapezoid.g@gmail.com> - http://unsigned.g.hatena.ne.jp/Trapezoid
//
// Cooperation LDRize Mappings for Vimperator
//
// Variables:
//  g:ldrc_captureMapping
//      Specifies keys that capture by LDRize
//      usage: let g:ldrc_captureMappings = "['j','k','p','o','?']"
//  g:ldrc_enable
//      LDRize Cooperation be Enable by default or not
//      usage: let g:ldrc_enable = "false"
//      default: true
//  g:ldrc_hints
//      Narrows "hinttags" based on Siteinfo.
//      usage: let g:ldrc_hints = "true"
//      default: false
//  g:ldrc_intelligence_bind
//      More inteligence cooperation bind
//      usage: let g:ldrc_intelligence_bind = "true"
//      default: false
//  g:ldrc_skip
//      length in which paragraph is skipped (use by inteligence bind mode)
//      usage: let g:ldrc_hints = "true"
//      default: 0.5
// Mappings:
//      Mappings for LDRize
//      default: 'j','k','p','o'
// Commands:
//  'm' or 'mb' or 'minibuffer':
//      Execute args as Minibuffer Command
//      usage: :minibuffer pinned-link | open | clear-pin
//  'pin':
//      View pinned link list
//      usage: :pin
//  'pindownload':
//      Download View pinned link by handler function or outer promgram. please see 'handlerInfo' also
//      usage: :pindownload
//  'ldrc' or 'toggleldrizecooperation':
//      Toggle LDRize Cooperation
//      usage: :toggleldrizecooperation
// Hints:
//  ';l':
//      narrow down the candidates to LDRize paragraphes
//  ',L':
//      narrow down the candidates to LDRize paragraphes (in a new tab)
// Options:
//  'ldrc'
//      Enable LDRize Cooperation
//      usage: :set ldrc
//  'noldrc'
//      Disable LDRize Cooperation
//      usage: :set noldrc
//
//  'ldrchints'
//      Enable "Narrows Hinttags based on Siteinfo"
//      usage: :set ldrchints
//  'noldrchints'
//      Disable "Narrows Hinttags based on Siteinfo"
//      usage: :set noldrchints
if (liberator.plugins.LDRizeCooperation == undefined) (function(){
    //pattern: wildcard
    //include: [regexp,option] or regexp
    //handler: [programPath,[args]] or programPath or function(url,title)
    var handlerInfo = [
        //{
        //    pattern: "http://www.nicovideo.jp/*",
        //    handler: {
        //      download: ["c:\\usr\\SmileDownloader\\SmileDownloader.exe",["%URL%"]]
        //    },
        //    wait: 5000
        //},
        //{
        //    handler: ["C:\\usr\\irvine\\irvine.exe",["%URL%"]],
        //},
    ];
    const DISABLE_ICON = "data:image/png;base64,"
        +"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAACXBIWXMAAA7E"
        +"AAAOxAGVKw4bAAACL0lEQVR4nF2Sy0tUYRjGf9+Z4/HMjJfjBUZEMM2MSDII"
        +"REjSVtVecBFZi6Bdi4RW/SFBq2oR0R8gSaUJhVJIBkEEMZOWl5kuM+fqnPN9"
        +"52sxQ4kPv837Pu+zel4xMjkz/3h5p87pbhyDw4o1mzUOkubYbvLo2kVx+4Pe"
        +"rAKMdTGQ5YgiWK/8z+QT3yyVUTFAzaBXHQ0IONPKOxepAH65dUOGSB/pM9LC"
        +"whjyy/sg4DB3TjGZbjVuVIihQhKfxGdzmzhhNBvGXhr7NDiRY+fr573ibmtC"
        +"4pN4GNJDukiXusvbIuMnh9K9YujSYKKPl6vrZu+EI5EuyheG9JEe0qPusfSR"
        +"4cGBbPA98og8LMlAPlor2ZEvVIT0kD6G9EhcEpfY58c+xbKYHBaRl4Ye432s"
        +"rqyo7pnQo/qTxEW62gy2CKoAbheu4mGGm5eHgsViOTh+5Sp37+2X4gJQC0gU"
        +"Otb0j2hhaCG06NfC0K22/radzs6uTM3ojY1SobDcdHNaCC2Mimn2YZmQggEd"
        +"kPJ0UczfyOzVWHr1xnVmrS5I0R6pgTC1mXdoUwB2Jj5QFvDsBc8fTCkpL82l"
        +"uW6rWWEPQBoL07JwCgAaywbgd8ynIrultTB3wWk73LtWdS3OXtd/fBwH2+Yg"
        +"xM4R14kqrzMZzM5pO9dcNlQrl832wTSoGiEok84eOrK0ZGB0+shTJYpyFUv7"
        +"In/s/LlbTyq+/ufZFlkTK4MhAJKUMCGs6x473rg/9xe9wS0xVA1n/AAAAABJ"
        +"RU5ErkJggg==";
    const ENABLE_ICON = "data:image/png;base64,"
        +"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAACXBIWXMAAAsT"
        +"AAALEwEAmpwYAAACI0lEQVR4nGWSzU7yQBSGp84UKalDY0MkLsSdYWtCIok3"
        +"4YKV7tx7MWy9A6/ABZDgHbhghdFqU9M0FpH57cyUcdFA8Pue3fl5T07Oe5zz"
        +"8/PhcEgpbbfbtVoN7LBer9M01VpX4f7+/t3dnfP4+JimKQDg6OgIYwz+UpZl"
        +"HMdbjbUWZVkmpQQAEEJc1wX/EYZhHMdlWQIAKKV7cgPG+PLy8uPjg/+l3+/7"
        +"vl/1KKVQURRCCABAFEVa6yAIOOeO41Tjj4+PoyiK49h1XSkl53xPbOCcz+fz"
        +"bre7WCzYhpOTk+l0GoYhhFAIIaXck1JuNc/Pz51OpyiKahkAAMb49fVVCKGU"
        +"qgTw4uKCUqq1RggZY05PT8uyTJJEa312dvby8rJcLq21y+WSUiqlhN1uN89z"
        +"xpgxJs9zQkiv1xuNRlmWXV9f39/ff39/53meZRmllBCCZrNZkiTWWowxIWQ6"
        +"nV5dXRFCGGOfn59PT0+MMWut67pa6/V6jZrNpjHGWus4TqPRsNaORqPBYCCE"
        +"GI/Hvu/7vm+trc4KAEC+71dGQggrdyaTyXA4NMbc3NxsvW82mwCAoihQrVY7"
        +"PDzctVYIEUXR29tbo9GAEO6WpJTO7e0tIQRjXK/XhRCe5ymlsiyDEAZB4Hle"
        +"lawEX19fqNVqVS/kOE6r1fI8DyHU6XT++ShjzM/Pz8HBAXx/f+/3+9X2WmvO"
        +"uVKq3GCMUUoxxlarVb1ef3h4+AWNW50eXTIBjgAAAABJRU5ErkJggg==";

    var Class = function() function(){this.initialize.apply(this,arguments)};

    var _isEnable;

    function replaceMap (mode,key,desc,aroundFunc,extra){
      var old = liberator.modules.mappings.getDefault(mode,key);
      var oldAction = old.action;
      old.description = desc;
      old.action = function()
                      let (self = this,args = arguments)
                        aroundFunc(function() oldAction.apply(self,args));
    }

    var LDRizeCooperation = new Class();
    LDRizeCooperation.prototype = {
        initialize: function(){
            var self = this;
            this.LDRize = {getSiteinfo: function() undefined};
            this.Minibuffer = null;
            this.handlerInfo = handlerInfo;

            this.LDRizeCooperationPanel = this.setupStatusbarPanel();

            this.isEnable = liberator.globalVariables.ldrc_enable != undefined ?
                window.eval(liberator.globalVariables.ldrc_enable) : true ;
            this.isIntelligenceBind = liberator.globalVariables.ldrc_intelligence_bind != undefined ?
                window.eval(liberator.globalVariables.ldrc_intelligence_bind) : false ;
            this.isModHints = liberator.globalVariables.ldrc_hints != undefined ?
                window.eval(liberator.globalVariables.ldrc_hints) : false ;
            this.captureMappings = window.eval(liberator.globalVariables.ldrc_captureMappings) || ["j","k","p","o"];
            this.skipHeight = liberator.globalVariables.ldrc_skip != undefined ?
                window.eval(liberator.globalVariables.ldrc_skip) : 0.5 ;

            this.convertHandlerInfo(this.handlerInfo);
            this.hookGreasemonkey();
            this.initLDRizeCaptureKeys(this.captureMappings);
            this.initLDRizeCooperationFuture();


            if(liberator.plugins.LDRizeCooperationPlugins != undefined){
                liberator.plugins.LDRizeCooperationPlugins.forEach(function(func){
                    func.apply(self,arguments);
                });
                delete liberator.plugins.LDRizeCooperationPlugins;
            }
        },
        setupStatusbarPanel: function(){
            var self = this;
            var LDRizeCooperationPanel = document.createElement("statusbarpanel");
            LDRizeCooperationPanel.setAttribute("id","ldrizecopperation-status");
            LDRizeCooperationPanel.setAttribute("class","statusbarpanel-iconic");
            LDRizeCooperationPanel.setAttribute("src",this.isEnable ? ENABLE_ICON : DISABLE_ICON);
            LDRizeCooperationPanel.addEventListener("click",function(e){
                    self.isEnable = !self.isEnable;
            },false);
            document.getElementById("status-bar").insertBefore(LDRizeCooperationPanel,document.getElementById("security-button").nextSibling);

            return LDRizeCooperationPanel;
        },
        hookGreasemonkey: function(){
            var self = this;
            var GreasemonkeyService;
            try{
                GreasemonkeyService = Cc["@greasemonkey.mozdev.org/greasemonkey-service;1"].getService().wrappedJSObject;
                this.addAfter(GreasemonkeyService,"evalInSandbox",function(code,codebase,sandbox){
                    if(sandbox.window.LDRize != undefined && sandbox.window.Minibuffer != undefined){
                        sandbox.window.addEventListener("focus",function(){
                            self.LDRize = liberator.eval("self",sandbox.LDRize.getSiteinfo);
                            self.Minibuffer = liberator.eval("command",sandbox.Minibuffer.addCommand);
							if (typeof self.LDRize.getSiteinfo != 'function') self.LDRize = sandbox.LDRize;
							if (typeof self.Minibuffer.addCommand != 'function') self.Minibuffer = sandbox.Minibuffer.command;
                        },false);
                        if(window.content.wrappedJSObject == sandbox.unsafeWindow){
                            self.LDRize = liberator.eval("self",sandbox.LDRize.getSiteinfo);
                            self.Minibuffer = liberator.eval("command",sandbox.Minibuffer.addCommand);
							if (typeof self.LDRize.getSiteinfo != 'function') self.LDRize = sandbox.LDRize;
							if (typeof self.Minibuffer.addCommand != 'function') self.Minibuffer = sandbox.Minibuffer.command;
                        }
                    }
                });
            }catch(e){
                liberator.log(e);
            }
        },
        initLDRizeCaptureKeys: function(keys){
            var self = this;
            keys.forEach(function(x){
                    var map = liberator.modules.mappings.get(null,x) || liberator.modules.mappings.getDefault(null,x);
                    var oldAction = map.action;
                    var getter = "getPrev";
                    switch(x){
                        case "j":   getter = "getNext";
                        case "k":   map.action = function(){
                                        self.isEnableLDRizeCooperation() ?
                                            self.isIntelligenceBind && self.isScrollOrBind(getter) ?
                                                oldAction.apply(this,arguments)           // scroll
                                                : self.sendRawKeyEvent(0,x.charCodeAt(0)) // bind
                                            : oldAction.apply(this,arguments);
                                    };
                                    break;
                        case "J":
                        case "K":   map.action = function(){
                                        self.isEnableLDRizeCooperation()
                                            ? self.sendRawKeyEvent(0,x.charCodeAt(0) + 32)
                                            : oldAction.apply(this,arguments);
                                    };
                                    break;
                        default:    map.action = function(){
                                        self.isEnableLDRizeCooperation()
                                            ? self.sendRawKeyEvent(0,x.charCodeAt(0))
                                            : oldAction.apply(this,arguments);
                                    };
                                    break;
                    }
            });
        },
        initLDRizeCooperationFuture: function(){
            var self = this;

            //Hints
            [
                ["l","LDRize paragraphes",liberator.CURRENT_TAB],
                ["L","LDRize paragraphes (in a new tab",liberator.NEW_TAB]
            ].forEach(function([mode,prompt,target]){
                liberator.modules.hints.addMode(mode,prompt,
                        function(elem) liberator.modules.buffer.followLink(elem,target),
                        function(){
                            var siteinfo = self.LDRize.getSiteinfo();
                            return siteinfo.paragraph + "/" + siteinfo.link;
                        });

            });

            //Commands
            liberator.modules.commands.addUserCommand(["pin"],"LDRize Pinned Links",
                function(){
                    var links = self.getPinnedItems();
                    var showString = links.length + " Items<br/>";
                    links.forEach(function(link){
                        showString += link + "<br/>";
                    });
                    liberator.modules.commandline.echo(showString,liberator.modules.commandline.HL_NORMAL,liberator.modules.commandline.FORCE_MULTILINE);
                },{});
            liberator.modules.commands.addUserCommand(["mb","m","minibuffer"],"Execute Minibuffer",
                function(arg){ self.Minibuffer.execute(arg.string.replace(/\\+/g,"")) },
                {
                    completer: function(context,arg){
                        var filter = context.filter;
                        var completionList = [];
                        var command = self.Minibuffer.command;
                        var alias = self.Minibuffer.alias_getter();
                        var tokens = filter.split("|").map(function(str) str.replace(/\s+/g,""));
                        var exp = new RegExp("^" + tokens.pop());
                        for(let i in command) if(exp.test(i))completionList.push([tokens.concat(i).join(" | "),"MinibufferCommand"]);
                        for(let i in alias) if(exp.test(i))completionList.push([i,"MinibufferAlias"]);
                        context.title = ["Minibuffer Command","Description"];
                        context.completions = completionList;
                    }
                });
            liberator.modules.commands.addUserCommand(["pindownload"],"Download pinned links by any software",
                function(arg){ self.downloadLinksByProgram("download",self.getPinnedItems());},{});
            liberator.modules.commands.addUserCommand(["pindo"],"Do external command, with pinned links",
                function(arg){ self.downloadLinksByProgram(arg.string, self.getPinnedItems());},{});
            liberator.modules.commands.addUserCommand(["toggleldrizecooperation","toggleldrc"],"Toggle LDRize Cooperation",
            function(arg){ self.isEnable = !self.isEnable},{});
            //Options
            liberator.modules.options.add(["ldrc","ldrizecooperation"],"LDRize cooperation","boolean",this.isEnable,
                {
                    setter: function(value){ self.isEnable = value; },
                    getter: function() self.isEnable
                }
            );
            liberator.modules.options.add(["ldrchints"],"mod hinttags for LDRize","boolean",this.isModHints,
                {
                    setter: function(value){ self.isModHints = value; },
                    getter: function() self.isModHints
                }
            );
        },
        convertHandlerInfo: function(handlerInfoArray){
            handlerInfoArray.forEach(function(x){
                x.include = typeof x.include != "undefined"
                    ? typeof x.include == "string" ? new RegExp(x.include) : new RegExp(x.include[0],x.include[1])
                    : typeof x.pattern != "undefined"
                        ? new RegExp("^"+String(x.pattern).replace(/\s+/g,"").replace(/[\\^$.+?|(){}\[\]]/g,"\\$&")
                            .replace(/(?=\*)/g,".")+"$","i")
                        : /(?:)/;
                delete x.pattern;
            });
        },

        get isEnable() _isEnable,
        set isEnable(value){
            this.LDRizeCooperationPanel.setAttribute("src",value ? DISABLE_ICON : ENABLE_ICON);
            _isEnable = value;
        },
        isEnableLDRize: function() this.LDRize.getSiteinfo() != undefined,
        isEnableLDRizeCooperation: function() /^https?:$/.test(content.location.protocol) && this.isEnable && this.isEnableLDRize(),

        //Pin
        getPinnedItems: function(){
            var linkXpath = this.LDRize.getSiteinfo()["link"];
            var viewXpath = this.LDRize.getSiteinfo()["view"] || linkXpath + "/text()";
            return this.LDRize.getPinnedItems().map(function(i){
                var linkResult = i.XPath(linkXpath),viewResult = i.XPath(viewXpath);
                return [linkResult,viewResult ? viewResult.textContent : null];
            });
        },
        downloadLinksByProgram: function(command, links){
            var self = this;
            var count = 0;
            links.forEach(function([url,title]){
                for each(let x in self.handlerInfo){
                    if(x.include.test(url)){
                        setTimeout(function(){
                            if(typeof x.handler[command] == "object"){
                                let args = x.handler[command][1].map(function(s) s.replace(/%URL%/g,url).replace(/%TITLE%/g,title));
                                liberator.modules.io.run(x.handler[command][0],args,false);
                            }else if(typeof x.handler[command] == "string"){
                                liberator.modules.io.run(x.handler[command],[url],false);
                            }else if(typeof x.handler[command] == "function"){
                                x.handler[command](url.toString(),title);
                            }
                        },x.wait != undefined ? x.wait * count++ : 0);
                        return;
                    }
                }
                liberator.echoerr("LDRize Cooperation: download pattern not found!!");
            });
        },
        isScrollOrBind: function(getter){
            var self = this;
            var paragraphes,paragraph,current,next,innerHeight,scrollY,limit,p,np,cp;
            try{
                paragraphes = this.LDRize.getParagraphes();
                paragraph = paragraphes[getter]();
                current = paragraphes.current;
                next = paragraphes.getNext();

                innerHeight = window.content.innerHeight;
                scrollY = window.content.scrollY;

                limit = window.content.innerHeight * (self.skipHeight + 0.5);

                if(paragraph.paragraph == undefined) return true;                                 // scroll
                if(current.paragraph == undefined) return false;                                  // bind
                if(current.paragraph.y - window.content.scrollY == this.LDRize.getScrollHeight()
                        && getter == "getPrev") return false;                                     // bind

                p = this.getClientPosition(paragraph.paragraph.node);
                np = next && next.paragraph.node != undefined ?
                    this.getClientPosition(next.paragraph.node) :
                    {top: window.content.scrollMaxY + window.content.innerHeight,left: 0};
                cp = this.getClientPosition(current.paragraph.node);

                /*
                 *log(p);
                 *log(np);
                 *log(cp);
                 */

                //check current paragraph
                if(!(scrollY < np.top && cp.top < scrollY + innerHeight)) return false;           // bind
                //check next/prev paragraph
                if(Math.abs(p.top - (scrollY + innerHeight/2)) < innerHeight * 0.5) return false; // bind
                if(Math.abs(p.top - (scrollY + innerHeight/2)) > limit) return true;              // scroll
                return false;                                                                     // bind
            }catch(e){
                liberator.log(e);
            }
        },

        //Utils
        addAfter: function(target,name,after){
            var original = target[name];
            target[name] = function(){
                var tmp = original.apply(target,arguments);
                after.apply(target,arguments);
                return tmp;
            };
        },
        getClientPosition: function(elem){
            var position;
            try{
                position = elem.getBoundingClientRect();
            }catch(e){
                position = elem.parentNode.getBoundingClientRect();
            }
            return {
                left: Math.round(window.content.scrollX+position.left),
                top:  Math.round(window.content.scrollY+position.top)
            };
        },
        sendRawKeyEvent: function(keyCode,charCode){
            var evt = window.content.wrappedJSObject.document.createEvent("KeyEvents");
            evt.initKeyEvent("keypress",true,true,window.content.wrappedJSObject,false,false,false,false,keyCode,charCode);
            window.content.wrappedJSObject.document.dispatchEvent(evt);
        },
    };

    liberator.plugins.LDRizeCooperation = new LDRizeCooperation();
})();
