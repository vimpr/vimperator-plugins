// Vimperator plugin: 'Map behave like text-object'
// Version: 0.4
// Last Change: 15-Sep-2008. Jan 2008
// License: Creative Commons
// Maintainer: Trapezoid <trapezoid.g@gmail.com> - http://unsigned.g.hatena.ne.jp/Trapezoid
//
// Map behave like text-object for vimperator0.6.*
//
// Variables:
//  g:browser_object_prefix:
//      default: ''
//      usage: let g:browser_object_prefix = ','
// Mappings:
//  'dd'
//      Delete current tab (when prefix is '' only)
//  '{motion}{scope}{target}'
//      Motions:
//          'd' : Delete
//          'r' : Reload
//          'y' : Yank
//          'e' : Set Pin
//          'E' : Unset Pin
//      Scopes:
//          'l' : Left
//          'r' : Right
//          'a' : All
//          'c' : Current
//          'o' : Other
//          's' : Same host
//          'p' : Pinned
//      Target:
//          't' : Tabs
(function(){
     const PINNED_ICON = 'data:image/png;base64,'
     +'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgI'
     +'fAhkiAAAAAlwSFlzAAAN1wAADdcBQiibeAAAABl0RVh0U29mdHdhcmUAd3d3'
     +'Lmlua3NjYXBlLm9yZ5vuPBoAAAIlSURBVFiF7Za9a1RBEMB/KwcxipGQBIUo'
     +'UUGLIEi8StAyBCuDaEBUIgQPBIVgIQiCqa5QvDYo5JCkMRrxo1ALUYkKWoj+'
     +'B8aPeGg4LQQVdmfH4r13vJPT5O64i8Xbbubtzvx2Pt6sUVWWc61YVu8JQAKQ'
     +'ACQACcD/AJBqtsOXYjoVMsBx4GpTAZ5ZcwjIo6wMVZtMs8bxk18mDTwFWgEU'
     +'Cig7mhKBhz9MF8ptoDW8rgeO9K/WhYYDPPhuDDClsAGAgCC7t00fQROK0Apn'
     +'gIFIVpgFxiK5rhq4883sAdbta9eZSt9vfTW7CBymQjefgb79HVqoC+Bm0fQC'
     +'OZSB8PTuA536PL7nxoJpB14r9IQqAfqHuvRxfF/VKZj+YtLAC42fVYaBMgDr'
     +'yQM9Yc5ROH94fblzqOFPaIU2K6ScgBOwAtYzNFUwUW8z+cmccsKgE3AerOe+'
     +'E7KV7FUN4DyzzjPvfOA8BFnrhEGA/EfT54SLJTjhgxOODndXznXVAMe6Vaxw'
     +'2Ya3i0CskLnyzqxxwrT1tFhfgsuMbNTi3+zVVITjb00H8F5hVVyvyisgXZJh'
     +'5uQWPfgvWzVNwxObtWiFibI6CCKSjkXkpxNGF7NV8zh2npz1SCzUcRCcZ2J0'
     +'q843DOD0Np1zwnUXdAF/gDgrXFqKnboeJFa4EOuEOMj42V6dazjAue36xgn3'
     +'ovCHINecXzz30ap7GFnPCDCJ0gLkFO5mdy69tX4DuVQpJGsygDkAAAAASUVO'
     +'RK5CYII=';
    const PINNED_ICON_STYLE = "margin-top: 1px;"
    +"margin-start-value: 7px;"
    +"margin-left-ltr-source: logical;"
    +"margin-right-rtl-source: logical;"
    +"margin-end-value: 3px;"
    +"margin-right-ltr-source: logical;"
    +"margin-left-rtl-source: logical;"
    +"width: 16px;"
    +"height: 16px;"
    +"-moz-image-region: rect(0px, 16px, 16px, 0px);";

    function Tab(){}
    Tab.prototype = {
        close: function(ary){
            for(var i = 0 ; i < ary.length; i++){
                let j = ary[i];
                window.setTimeout(function(){ j.linkedBrowser.contentWindow.close(); },0);
            }
        },
        yank: function(ary){
            var copyStrings = [];
            for(var i = 0 ; i < ary.length; i++)
                if(typeof ary[i] == "object")
                    copyStrings.push(ary[i].linkedBrowser.contentDocument.location.href);
            liberator.util.copyToClipboard(copyStrings.join(", "));
        },
        reload: function(ary){
            for(var i = 0 ; i < ary.length; i++)
                if(typeof ary[i] == "object")
                    ary[i].linkedBrowser.contentDocument.location.reload();
        },
        togglePin: function(ary){
            for(var i = 0 ; i < ary.length; i++){
                if(typeof ary[i] == "object")
                    if(ary[i].linkedBrowser.vimperatorBrowserObjectPinIcon == undefined){
                        var image = document.createElement('image');
                        image.setAttribute('src',PINNED_ICON);
                        image.setAttribute('style',PINNED_ICON_STYLE);
                        ary[i].insertBefore(image,ary[i].firstChild);
                        ary[i].linkedBrowser.vimperatorBrowserObjectPinIcon = image;
                        ary[i].linkedBrowser.vimperatorBrowserObjectPin = true;
                        ary[i].linkedBrowser.vimperatorBrowserObjectPinIcon.collapsed = false;
                    }
                    else if(ary[i].linkedBrowser.vimperatorBrowserObjectPin){
                        ary[i].linkedBrowser.vimperatorBrowserObjectPinIcon.collapsed = true ;
                        ary[i].linkedBrowser.vimperatorBrowserObjectPin = false ;
                    }else{
                        ary[i].linkedBrowser.vimperatorBrowserObjectPinIcon.collapsed = false ;
                        ary[i].linkedBrowser.vimperatorBrowserObjectPin = true ;
                    }
            }
        },
        setPin: function(ary){
            for(var i = 0 ; i < ary.length; i++){
                if(typeof ary[i] == "object"){
                    ary[i].linkedBrowser.vimperatorBrowserObjectPin = true ;
                    if(ary[i].linkedBrowser.vimperatorBrowserObjectPinIcon == undefined){
                        var image = document.createElement('image');
                        image.setAttribute('src',PINNED_ICON);
                        image.setAttribute('style',PINNED_ICON_STYLE);
                        ary[i].insertBefore(image,ary[i].firstChild);
                        ary[i].linkedBrowser.vimperatorBrowserObjectPinIcon = image;
                    }
                    ary[i].linkedBrowser.vimperatorBrowserObjectPinIcon.collapsed = false;
                }
            }
        },
        unsetPin: function(ary){
            for(var i = 0 ; i < ary.length; i++){
                if(typeof ary[i] == "object"){
                    if(ary[i].linkedBrowser.vimperatorBrowserObjectPin == true){
                        ary[i].linkedBrowser.vimperatorBrowserObjectPinIcon.collapsed = true ;
                        ary[i].linkedBrowser.vimperatorBrowserObjectPin = false ;
                    }
                }
            }
        },

        active: function() gBrowser.mTabContainer.selectedIndex ,
        identify: function(i){try{return i.linkedBrowser.contentDocument.location.host}catch(e){}},
        pinned: function(i){
            if(typeof i == "object"){
                return i.linkedBrowser.vimperatorBrowserObjectPin
            }
            return false;
        },
        collection: function() window.gBrowser.mTabContainer.childNodes ,
    };

    function Container(){
        var collections = {};
        function iterator(){
            for(var i in collections)
                yield collections[i];
            throw StopIteration;
        }
        return {
            __iterator__: function(){
                return iterator();
            },
            add: function(id,handler){
                collections[id] = {
                    id: id,
                    handler: handler,
                };
            },
            get: function(id){
                return collections[id];
            },
        }
    }

    var browserObject = {};

    browserObject.motions = new Container();
    browserObject.scopes = new Container();
    browserObject.targets = new Container();

    browserObject.motions.add('d','close');
    browserObject.motions.add('y','yank');
    browserObject.motions.add('r','reload');
    browserObject.motions.add('e','setPin');
    browserObject.motions.add('E','unsetPin');

    browserObject.scopes.add('l',function(ary){
        var active = this.active();
        return [ary[i] for (i in ary) if (i < active)];
    });
    browserObject.scopes.add('r',function(ary){
        var active = this.active();
        return [ary[i] for (i in ary) if (i > active)];
    });
    browserObject.scopes.add('o',function(ary){
        var active = this.active();
        return [ary[i] for (i in ary) if (i != active)];
    });
    browserObject.scopes.add('c',function(ary) [ary[this.active()]]);
    browserObject.scopes.add('a',function(ary) ary);
    browserObject.scopes.add('s',function(ary){
        var activeIdentify = this.identify(ary[this.active()]);
        return [ary[i] for (i in ary) if (this.identify(ary[i]) == activeIdentify)];
    });
    browserObject.scopes.add('p',function(ary){
        return [ary[i] for (i in ary) if (this.pinned(ary[i]) == true)];
    });

    browserObject.targets.add('t',new Tab());


    var prefix = liberator.globalVariables.browser_object_prefix || "";
    for (let m in browserObject.motions){
        let motion = m;
        for (let s in browserObject.scopes){
            let scope = s;

            liberator.mappings.addUserMap([liberator.modes.NORMAL], [prefix + motion.id + scope.id],
                "Browser Object Mapping",
                function (arg) {
                    var target, targetCollection;

                    target = browserObject.targets.get(arg);
                    if(!target){
                        liberator.echoerr("BrowserObject: target not found");
                        return;
                    }

                    targetCollection = scope.handler.call(target.handler,target.handler.collection());
                    if(target.handler[motion.handler])
                        target.handler[motion.handler].call(target.handler,targetCollection);
                    else
                        liberator.echoerr("BrowserObject: motion handler not found");
                },
                { flags: liberator.Mappings.flags.ARGUMENT});
        }
        let map = liberator.mappings.get(null,motion.id);
        if(!prefix && map){
            liberator.mappings.addUserMap([liberator.modes.NORMAL],
                [motion.id + motion.id], map.description, map.action,
            {});
        }
    }
})();
