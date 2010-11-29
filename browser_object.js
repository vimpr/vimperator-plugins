// PLUGIN_INFO {{{
let PLUGIN_INFO =
<VimperatorPlugin>
  <name>{NAME}</name>
  <description>Map behave like text-object</description>
  <version>0.6.1</version>
  <author mail="trapezoid.g@gmail.com" homepage="http://unsigned.g.hatena.ne.jp/Trapezoid">Trapezoid</author>
  <license>New BSD License</license>
  <updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/browser_object.js</updateURL>
  <minVersion>2.2pre</minVersion>
  <maxVersion>2.2pre</maxVersion>
  <detail><![CDATA[
    == Variables ==
      g:browser_object_prefix:
        default: ''
        usage: let g:browser_object_prefix = ','
    == Mappings ==
      dd:
        Delete current tab (when prefix is '' only)
      {motion}/:
        {motion} pattern matched tabs
      {motion}{scope}{target}:
        Motions:
          d:
           Delete
          r:
           Reload
          m{register}:
           Quick Mark
          y:
           Yank
          e:
           Set Pin
          E:
           Unset Pin
        Scopes:
          l:
           Left
          r:
           Right
          a:
           All
          c:
           Current
          o:
           Other
          s:
           Same host
          p:
            Pinned
        Target:
          t:
            Tabs
  ]]></detail>
</VimperatorPlugin>;
// }}}

// Vimperator plugin: 'Map behave like text-object'
// Version: 0.5
// Last Change: 26-Dec-2008. Jan 2008
// License: New BSD License
// Maintainer: Trapezoid <trapezoid.g@gmail.com> - http://unsigned.g.hatena.ne.jp/Trapezoid

(function(){
     var XMigemoCore, XMigemoTextUtils;
     try{
          XMigemoCore = Components.classes["@piro.sakura.ne.jp/xmigemo/factory;1"]
                                      .getService(Components.interfaces.pIXMigemoFactory)
                                      .getService("ja");
          XMigemoTextUtils = Components.classes["@piro.sakura.ne.jp/xmigemo/text-utility;1"]
                                           .getService(Components.interfaces.pIXMigemoTextUtils);
     }catch(ex){}
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
            for (var i = 0 ; i < ary.length; i++){
                let j = ary[i];
                window.setTimeout(function(){ j.linkedBrowser.contentWindow.close(); },0);
            }
        },
        yank: function(ary){
            var copyStrings = [];
            for (var i = 0 ; i < ary.length; i++)
                if(typeof ary[i] == "object")
                    copyStrings.push(ary[i].linkedBrowser.contentDocument.location.href);
            liberator.modules.util.copyToClipboard(copyStrings.join(", "));
        },
        mark: function(ary,arg){
            var markStrings = [];
            for (var i = 0 ; i < ary.length; i++)
                if(typeof ary[i] == "object")
                    markStrings.push(ary[i].linkedBrowser.contentDocument.location.href);
            liberator.modules.quickmarks.add(arg,markStrings.join(", "));
        },
        reload: function(ary){
            for (var i = 0 ; i < ary.length; i++)
                if(typeof ary[i] == "object")
                    ary[i].linkedBrowser.contentDocument.location.reload();
        },
        togglePin: function(ary){
            for (var i = 0 ; i < ary.length; i++){
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
                        ary[i].linkedBrowser.vimperatorBrowserObjectPinIcon.collapsed = true;
                        ary[i].linkedBrowser.vimperatorBrowserObjectPin = false;
                    }else{
                        ary[i].linkedBrowser.vimperatorBrowserObjectPinIcon.collapsed = false;
                        ary[i].linkedBrowser.vimperatorBrowserObjectPin = true;
                    }
            }
        },
        setPin: function(ary){
            for (var i = 0 ; i < ary.length; i++){
                if(typeof ary[i] == "object"){
                    ary[i].linkedBrowser.vimperatorBrowserObjectPin = true;
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
            for (var i = 0 ; i < ary.length; i++){
                if(typeof ary[i] == "object"){
                    if(ary[i].linkedBrowser.vimperatorBrowserObjectPin == true){
                        ary[i].linkedBrowser.vimperatorBrowserObjectPinIcon.collapsed = true;
                        ary[i].linkedBrowser.vimperatorBrowserObjectPin = false;
                    }
                }
            }
        },

        active: function() gBrowser.mTabContainer.selectedIndex,
        identify: function(i){try{return i.linkedBrowser.contentDocument.location.host}catch(e){}},
        href: function(i){try{return i.linkedBrowser.contentDocument.location.href}catch(e){}},
        title: function(i){try{return i.linkedBrowser.contentDocument.title}catch(e){}},
        pinned: function(i){
            if(typeof i == "object"){
                return i.linkedBrowser.vimperatorBrowserObjectPin
            }
            return false;
        },
        collection: function() window.gBrowser.mTabContainer.childNodes,
    };

    function Container(){
        var collections = {};
        function iterator(){
            for (let i in collections)
                yield collections[i];
            throw StopIteration;
        }
        return {
            __iterator__: function(){
                return iterator();
            },
            add: function(id,handler,options){
                options = options || {};
                collections[id] = {
                    id: id,
                    handler: handler,
                    options: options,
                };
            },
            get: function(id) collections[id],
        };
    }

    var browserObject = {};

    browserObject.motions = new Container();
    browserObject.scopes = new Container();
    browserObject.targets = new Container();

    browserObject.motions.add('d','close');
    browserObject.motions.add('y','yank');
    browserObject.motions.add('r','reload');
    browserObject.motions.add('m','mark',{arg: true});
    browserObject.motions.add('e','setPin');
    browserObject.motions.add('E','unsetPin');

    browserObject.scopes.add('l',function(ary){
        var active = this.active();
        return [ary[i] for (i in ary) if(i < active)];
    });
    browserObject.scopes.add('r',function(ary){
        var active = this.active();
        return [ary[i] for (i in ary) if(i > active)];
    });
    browserObject.scopes.add('o',function(ary){
        var active = this.active();
        return [ary[i] for (i in ary) if(i != active)];
    });
    browserObject.scopes.add('c',function(ary) [ary[this.active()]]);
    browserObject.scopes.add('a',function(ary) ary);
    browserObject.scopes.add('s',function(ary){
        var activeIdentify = this.identify(ary[this.active()]);
        return [ary[i] for (i in ary) if(this.identify(ary[i]) == activeIdentify)];
    });
    browserObject.scopes.add('p',function(ary){
        return [ary[i] for (i in ary) if(this.pinned(ary[i]) == true)];
    });

    browserObject.targets.add('t',new Tab());


    var prefix = liberator.globalVariables.browser_object_prefix || "";
    for (let it in browserObject.motions){
        let motion = it;
        for (let it in browserObject.scopes){
            let scope = it;
            for (let it in browserObject.targets){
                let target = it;
                liberator.modules.mappings.addUserMap([liberator.modules.modes.NORMAL], [prefix + motion.id + scope.id + target.id],
                    "Browser Object Mapping",
                    function (arg){
                        var targetCollection;
                        arg = arg || null;

                        if(!target){
                            liberator.echoerr("Browser: target not found");
                            return;
                        }

                        targetCollection = scope.handler.call(target.handler,target.handler.collection());
                        if(target.handler[motion.handler])
                            target.handler[motion.handler].call(target.handler,targetCollection,arg);
                        else
                            liberator.echoerr("Browser: motion handler not found");
                    }, motion.options);
            }
        }
        let map = liberator.modules.mappings.get(null,motion.id);
        if(!prefix && map){
            liberator.modules.mappings.addUserMap([liberator.modules.modes.NORMAL],
                [motion.id + motion.id], map.description, map.action,
            { flags: map.flags});
        }
        liberator.modules.mappings.addUserMap([liberator.modules.modes.NORMAL],
            [prefix + motion.id + "/"], "Browser Object Mappings",
            function (){
                liberator.modules.commandline.input("/",function(s){
                    var target = browserObject.targets.get("t");
                    var targetCollection = (function(ary){
                        var pattern;
                        if(XMigemoCore != undefined){
                            pattern = new RegExp(XMigemoTextUtils.sanitize(s) + "|" + XMigemoCore.getRegExp(s),"i");
                        }else{
                            pattern = new RegExp(s,"i");
                        }
                        return [ary[i] for (i in ary) if(pattern.test(this.title(ary[i]) || pattern.test(this.href(ary[i]))))];
                    }).call(target.handler,target.handler.collection());
                    target.handler[motion.handler].call(target.handler,targetCollection);
                },{completer: liberator.modules.completion.buffer});
            },
        {});
    }
})();
