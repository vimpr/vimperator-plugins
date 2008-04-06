// Vimperator plugin: 'Map behave like text-object'
// Version: 0.2
// Last Change: 05-Apr-2008. Jan 2008
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
    browserObject.scopes.add('i',function(ary){
        return [ary[this.active()]];
    });
    browserObject.scopes.add('a',function(ary){
        return ary;
    });

    browserObject.targets.add('t',new Tab());

    var prefix = liberator.globalVariables.browser_object_prefix || "";
    for (let m in browserObject.motions){
        for (let s in browserObject.scopes){
            let motion = m;
            let scope = s;
            liberator.log(motion.id + scope.id);

            liberator.mappings.addUserMap([liberator.modes.NORMAL], [prefix + motion.id + scope.id],
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

    if(prefix == "")
        liberator.mappings.addUserMap([liberator.modes.NORMAL], ["dd"],
            "Delete current buffer",
            function (count) { liberator.tabs.remove(getBrowser().mCurrentTab, count, false, 0); },
            { flags: liberator.Mappings.flags.COUNT });
})();
