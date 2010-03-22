// ==VimperatorPlugin==
// @name           XPCOM List
// @description    list XPCOM Components (for developers)
// @description-ja XPCOMコンポーネントを表示(開発者用)
// ==/VimperatorPlugin==
//
// クラスとインターフェースの組み合わせを表示するためのプラグイン
//
// :lscc {class} {interface}
//
// タブ補完で遊んでください
// 第一引数はComponents.classesから正規表現にひっかかるものを補完
// 第に引数はComponents.interfacesから(ry
//
// 完全なクラスとインターフェースを入力して実行すると、
// createInstance or getService して使えそうなメソッドやメンバーを表示します
//
// 未補完でも大丈夫。適当に使えそうな組み合わせを表示してくれます
//
// 注意：あまりに組み合わせの多いクラスとインターフェースを表示しようとするとFirefox, Thunderbirdごと落ちます(ぉ
// （だれか直してー）
//
liberator.XPCOM = (function(){
const Cc = Components.classes;
const Ci = Components.interfaces;

function XPClass(class){ //{{{
	this.name = class;
	var _interface;
	this.__defineGetter__('interface', function(){
		if (_interface) return _interface;
		_interface = {};
		var cl;
		try {
			cl = Cc[this.name].createInstance();
		} catch (e){
			try {
				cl = Cc[this.name].getService();
			} catch (ex){
				liberator.log(this.name);
				liberator.log(e);
				return _interface;
			}
		}
		for (let i in Ci){
			if (i == 'nsISupports' || i == 'IDispatch') continue;
			let obj;
			try {
				obj = cl.QueryInterface(Ci[i]);
			} catch (e){
				continue;
			}
			if (obj){
				_interface[i] = new XPInterface(this.name, i);
			}
		}
		return _interface;
	});
} //}}}
XPClass.prototype = { //{{{
	get number() Cc[this.name].number,
	has: function(filter){
		var flag = false;
		if (filter instanceof RegExp){
			for (let i in this.interface){
				if(flag = filter.test(i)) break;
			}
		} else {
			flag = (interface in this.interface);
		}
		return flag;
	},
	toString: function() this.name
}; //}}}
function XPInterface(c, i){ //{{{
	this.interface = Ci[i];
	this.class = Cc[c];
} //}}}
XPInterface.prototype = { //{{{
	get number() this.interface.number,
	get name() this.interface.name,
	get classNumber() this.class.number,
	get className() this.class.name,
	toString: function() this.name + ' of ' + this.className,
	create: function(){
		var instance;
		try {
			instance = this.class.createInstance(this.interface);
		} catch (e){
			try {
				instance = this.class.getService(this.interface);
			}catch (e){}
		}
		return instance;
	}
}; //}}}
function toKey(str) str.replace(/\W(.)/g, function(m, p) p.toUpperCase());
var tree = {};
for (let c in Cc){
	let key = toKey(c);
	tree[key] = new XPClass(c);
	tree[c] = tree[key];
}
// ----------------------------------------------
// Commands
// ----------------------------------------------
commands.addUserCommand(['lscc'], 'List XPCOM class',
	function(args){
		if (!args.length){
			liberator.echoerr('No arguments');
			return;
		}
		if (args.length == 1){
			liberator.echo(liberator.XPCOM.listClass(args[0], null, true), true);
		} else if (args[1] in Ci){
			let instance = tree[toKey(args[0])].interface[args[1]].create();
			liverator.echo(liberator.modules.util.objectToString(instance, true), true);
		} else {
			liberator.echo(liberator.XPCOM.listClass(args[0], args[1], true), true);
		}
	}, {
		completer: function(context, args){
			if (!args.length) return;
			var list = [];
			var position = 0;
			var reg;
			if (args.length == 1){
				reg = new RegExp(args[0], 'i');
				for (let c in Cc){
					if (reg.test(c)) list.push([Cc[c].name, Cc[c].number]);
				}
			} else if (args.length == 2 && args[0] in Cc){
				reg = new RegExp(args[1], 'i');
				for (let i in tree[toKey(args[0])].interface){
					if (reg.test(i)) list.push([Ci[i].name, Ci[i].number]);
				}
				position = args[0].length + 1;
			}
			context.title = ['Name', 'Number'];
			context.advance(position);
			context.completions = list;
		}
	}
);
var manager = {
	get all() tree,
	toKey: function(class) toKey(class),
	toHTML: function(list){
		var str = ['<dl>'];
		list.forEach(function(o){
			str.push('<dt>' + o.name + ' ' + o.number + '</dt>');
			if (o.interface){
				for (let i in o.interface){
					str.push('<dd>' + o.interface[i].name + ' ' + o.interface[i].number + '</dd>');
				}
			} else {
				for (let member in o){
					str.push('<dd>' + member + ': ' + o[member] + '</dd>');
				}
			}
		});
		str.push('</dl>');
		return str.join('');
	},
	listClass: function(cFilter, iFilter, format){
		var classes = {};
		if (!cFilter) return null;
		cReg = new RegExp(cFilter, 'i');
		iReg = new RegExp((iFilter ? iFilter : '.*'), 'i');
		for (let c in tree){
			if (cReg.test(tree[c].name) && tree[c].has(iReg)){
				classes[tree[c].name] = tree[c];
			}
		}
		var list =  [i for each (i in classes)];
		if (format) return this.toHTML(list);

		return list;
	},
	listInterface: function(iFilter, format){
		var list = [];
		if (!iFilter) return null;
		iReg = new RegExp(iFilter, 'i');
		for (let i in Ci){
			if (iReg.test(i)) list.push(Ci[i]);
		}
		if (format) return this.toHTML(list);

		return list;
	}
};
return manager;
})();

// vim: sw=4 ts=4 sts=0 fdm=marker noet:
