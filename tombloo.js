/**
 * ==VimperatorPlugin==
 * @name           tombloo.js
 * @description    Tombloo integrate plugin
 * @description-ja Tombloo経由で選択領域などをpostする
 * @author         Trapezoid
 * @version        0.1d
 * ==/VimperatorPlugin==
 *
 * Usage:
 *  :tombloo arg                    -> post by Tombloo (don't use prompt)
 *  :tombloo! arg                   -> post by Tombloo (use prompt)
 *  :tomblooAction arg              -> execute Tombloo's action in tool menu
 **/
var TomblooService = Components.classes['@brasil.to/tombloo-service;1'].getService().wrappedJSObject;
function update(target,src,keys){
    if(keys){
        keys.forEach(function(key){
            target[key] = src[key];
        });
    } else {
        for(let key in src)
            target[key] = src[key];
    }

    return target;
}

function getContext(){
    var doc = window.content.document;
    var win = window.content.wrappedJSObject;
    return update(update({
        document  : doc,
        window    : win,
        title     : ''+doc.title || '',
        selection : ''+win.getSelection(),
        target    : doc,
        //event     : event,
        //mouse     : mouse,
        //menu      : gContextMenu,
    },{}),win.location);
}

commands.addUserCommand(['tomblooAction'],'Execute Tombloo actions',
    function(arg){
        TomblooService.Tombloo.Service.actions[arg.string].execute();
    },{
        completer: function(context){
			context.title = ['Tombloo Actions'];
			context.completions = [[name,name] for(name in TomblooService.Tombloo.Service.actions)].filter(function($_){
				return this.test($_[0]);
			}, new RegExp(context.filter, 'i'));
        }
    }
);

commands.addUserCommand(['tombloo'],'Post by Tombloo',
    function(arg,special){
        TomblooService.Tombloo.Service.share(getContext(),TomblooService.Tombloo.Service.extractors[arg.string],special);
    },{
        bang: true,
        completer: function(context){
            var completionList = new Array();
            var exts = TomblooService.Tombloo.Service.check(getContext());
			context.title = ['Tombloo'];
			context.completions = [[exts[i].name, exts[i].name] for(i in exts)].filter(function($_) this.test($_[0]), new RegExp(context.filter, 'i'))
        }
    }
);
