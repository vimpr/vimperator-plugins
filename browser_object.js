// Vimperator plugin: 'Map behave like text-object'
// Version: 0.3
// Last Change: 27-Apr-2008. Jan 2008
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
//      Scopes:
//          'l' : Left
//          'r' : Right
//          'a' : All
//          'c' : Current
//          'o' : Other
//          's' : Same host
//      Target:
//          't' : Tabs
(function(){
    function Tab(){}
    Tab.prototype = {
        close: function(ary){
            for each(var i in ary)
                i.close();
        },
        yank: function(ary){
            var copyStrings = [];
            for each(var i in ary)
                copyStrings.push(i.document.location.href);
            liberator.copyToClipboard(copyStrings.join(", "));
        },
        reload: function(ary){
            for each(var i in ary)
                i.document.location.reload();
        },

        //default function
        active: function() Application.activeWindow.activeTab.index ,
        identify: function(i){try{return i.document.location.host}catch(e){}},
        collection: function() Application.activeWindow.tabs ,
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
