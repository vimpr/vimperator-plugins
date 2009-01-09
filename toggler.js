/**
 * ==VimperatorPlugin==
 * @name toggler
 * @version 0.2
 * @author teramako <teramako at gmail.com>
 * ==/VimperatorPlugin==
 *
 * 何かしらの設定をクルクル変更したい人へ
 *
 * まず、最初に以下の例ように.vimperatorrcに定義する
js <<EOM
liberator.globalVariables.toggler = {
  name: [ setting commands ]],
  go: ["set go=","set go=m","set go=b"],
  sb: ["sbclose","sbar Console"],
  go_and_sb: [
    ["set go=","sbclose"],
    ["set go=mTb","sbar Console"]
  ],
  //...
};
EOM
 *
 * 次に
 * :toggle go
 * とコマンドを実行するとsetting commands配列の次を実行する
 * 最後までいくと最初に戻る
 * つまり、最初に :toggle go をすると set go=m が実行される
 * もう一度実行すると、set go=b が実行される
 * もう一度すると、最初に戻って、set go= が実行される
 *
 * :map <F2> :toggle go<CR>
 * などとやっておくとボタン一つでクルクル替わる
 */
liberator.plugins.toggler = (function(){

var settings = {};
function Toggler(name, cmds){
	if (!cmds || cmds.length < 2) throw new Error("arguments are not enough");
	this.name = name;
	this.cmds = cmds;
	this.index = 0;
}
Toggler.prototype = {
	next: function(notUpdate){
		var index = this.index + 1;
		if (index >= this.cmds.length) index = 0;
		if (!notUpdate) this.index = index;
		return this.cmds[index];
	},
	previous: function(notUpdate){
		var index = this.index - 1;
		if (index < 0) index = this.cmds.length -1;
		if (!notUpdate) this.index = index;
		return this.cmds[this.index];
	},
	list: function() template.table(this.name, this.cmds.map(function(cmd, i) [i==this.index ? "*" : "", cmd], this))
};
var manager = {
	add: function(name, cmds){
		if (name in settings){
			liberator.echoerr(name + " is already exists");
			return;
		}
		settings[name] = new Toggler(name, cmds);
	},
	get: function(name){
		if (name in settings){
			return settings[name];
		}
		liberator.echoerr(name + " is not exists");
		return false;
	},
	toggle: function(name, isPrevious){
		var toggler = this.get(name);
		if (!toggler) return;
		var cmd = isPrevious ? toggler.previous() : toggler.next();
		if (cmd instanceof Array){
			cmd.forEach(liberator.execute);
		} else if (typeof cmd == "function"){
			cmd();
		} else {
			liberator.execute(cmd);
		}
	},
	reload: function(){
		if (liberator.globalVariables.toggler){
			settings = {};
			for (let [name, toggler] in Iterator(liberator.globalVariables.toggler))
				this.add(name, toggler);
		}
	},
	list: function(name){
		var xml = <></>;
		if (name && (name in settings)){
			xml += settings[name].list();
		} else {
			for each (let setting in settings){
				xml += setting.list();
			}
		}
		liberator.echo(xml, true);
	}
};

commands.addUserCommand(["toggle"],"setting toggler",
	function(args){
		if (args["-list"] || args.length == 0){
			if (args.length == 0)
				liberator.plugins.toggler.list();
			else
				args.forEach(liberator.plugins.toggler.list);
			return;
		}
		args.forEach(function(name){
			liberator.plugins.toggler.toggle(name, args.bang);
		});
	},{
		argCount: "*",
		bang: true,
		options: [
			[["-list","-l"], commands.OPTION_NOARG]
		],
		completer: function(context,args){
			var filter = args.length > 0 ? args[args.length-1] : "";
			var reg = new RegExp(filter ? "^" + filter : "");
			context.title= ["Name", args.bang ? "Previous" : "Next"];
			var list = [];
			for (let i in settings){
				let toggler = settings[i];
				if (reg.test(i.toLowerCase()) && !args.some(function(arg) arg==i))
					list.push([i, args.bang ? toggler.previous(true) : toggler.next(true)]);
			}
			context.completions = list;
		}
	},
	true);

manager.reload();
return manager;
})();

