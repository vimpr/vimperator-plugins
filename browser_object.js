// Vimperator plugin: 'Map behave like text-object'
// Version: 0.1
// Last Change: 04-Apr-2008. Jan 2008
// License: Creative Commons
// Maintainer: Trapezoid <trapezoid.g@gmail.com> - http://unsigned.g.hatena.ne.jp/Trapezoid
//
// Map behave like text-object for vimperator0.6.*
//
// Mappings:
//  {motion}{scope}{target}
//      Motions:
//          'd' : Delete
//          'y' : Yank
//      Scopes:
//          'l' : Left
//          'r' : Right
//          'a' : All
//          'o' : Other
//      Target:
//          't' : Tabs
(function(){
    function Tab(){
        return {
            close: function(ary){
                for each(var i in ary)
                    i.close();
            },
            yank: function(ary){
                var copyStrings = [];
                for each(var i in ary)
                    copyStrings.push(i.document.title);
                liberator.copyToClipboard(copyStrings.join(", "));
            },

            //default function
            active: function(){
                return Application.activeWindow.activeTab.index;
            },
            collection: function(){
                return Application.activeWindow.tabs;
            },
        }
    }

    function Motions(){
        var motions = {};
        function iterator(){
            for(let i in motions)
                yield motions[i];
            throw StopIteration;
        }
        return {
            __iterator__:function(){
                return iterator();
            },
            add: function(id,handlerName){
                motions[id] = {
                    id: id,
                    handler: handlerName,
                };
            },
            get: function(i){
                return motions[id];
            },
            getAll: function(){
                return motions;
            }
        }
    }
    function Scopes(){
        var scopes = {};
        function iterator(){
            for(let i in scopes)
                yield scopes[i];
            throw StopIteration;
        }
        return {
            __iterator__: function(){
                return iterator();
            },
            add: function(id,handler){
                scopes[id] = {
                    id: id,
                    handler: handler,
                };
            },
            get: function(id){
                return scopes[id];
            },
            getAll: function(){
                return scopes;
            }
        }
    }
    function Targets(){
        var targets = {};
        function iterator(){
            for(var i in motions)
                yield targets[i];
            throw StopIteration;
        }
        return {
            __iterator__: function(){
                return iterator();
            },
            add: function(id,handler){
                targets[id] = {
                    id: id,
                    handler: handler,
                };
            },
            get: function(id){
                return targets[id];
            },
        }
    }

    var browserObject = {};
    browserObject.motions = new Motions();
    browserObject.scopes = new Scopes();
    browserObject.targets = new Targets();

    browserObject.motions.add('d','close');
    browserObject.motions.add('y','yank');

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
        liberator.log([i for (i in ary) if (i != active)]);
        return [ary[i] for (i in ary) if (i != active)];
    });
    browserObject.scopes.add('i',function(ary){
        return [ary[this.active()]];
    });
    browserObject.scopes.add('a',function(ary){
        return ary;
    });

    browserObject.targets.add('t',new Tab());
    for (let m in browserObject.motions){
        for (let s in browserObject.scopes){
            let motion = m;
            let scope = s;
            liberator.log(motion.id + scope.id);

            liberator.mappings.addUserMap([liberator.modes.NORMAL], [motion.id + scope.id],
                "Browser Object Mapping",
                function (arg) {
                    var target = browserObject.targets.get(arg);
                    var targetCollection = target.handler.collection();

                    targetCollection = scope.handler.call(target.handler,targetCollection);
                    target.handler[motion.handler].call(target.handler,targetCollection);
                },
                { flags: liberator.Mappings.flags.ARGUMENT});
        }
    }
    liberator.mappings.addUserMap([liberator.modes.NORMAL], ["dd"],
        "Delete current buffer",
        function (count) { liberator.tabs.remove(getBrowser().mCurrentTab, count, false, 0); },
        { flags: liberator.Mappings.flags.COUNT });
})();
