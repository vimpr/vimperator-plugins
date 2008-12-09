var PLUGIN_INFO =
<VimperatorPlugin>
<name>{NAME}</name>
<description>Manage Vimperator Plugin</description>
<description lang="ja">Vimpeatorプラグインの管理</description>
<author mail="teramako@gmail.com" homepage="http://d.hatena.ne.jp/teramako/">teramako</author>
<version>0.2</version>
<minVersion>2.0pre</minVersion>
<maxVersion>2.0pre</maxVersion>
<detail><![CDATA[
これはVimperatorプラグインの詳細情報orヘルプを表示するためのプラグインです。
== Command ==
:plugin[help] [pluginName] [-v]:
	{pluginName}を入れるとそのプラグインの詳細を表示します。
	省略すると全てのプラグインの詳細を表示します。
	オプション -v はより細かなデータを表示します

== for plugin Developer ==
プラグインの先頭に
 var PLUGIN_INFO = ... とE4X形式でXMLを記述してください
 各要素は下記参照

== 要素 ==
name:
	プラグイン名
description:
	簡易説明
	属性langに"ja"などと言語を指定するとFirefoxのlocaleに合わせたものになります。
author:
	製作者名
	属性mailにe-mail、homepageにURLを付けるとリンクされます
license:
	ライセンスについて
	属性documentにURLを付けるとリンクされます
version:
	プラグインのバージョン
maxVersion:
	プラグインが使用できるVimperatorの最大バージョン
minVersion:
	プラグインが使用できるVimperatorの最小バージョン
detail:
	ここにコマンドやマップ、プラグインの説明
	CDATAセクションにwiki的に記述可能

== wiki書式 ==
* == title == でh1
* definition: (最後に":")で定義リストのdt
  後続が空行でない、かつ、最後が":"でないならば、定義リストのdd
* mailto: ... , http:// ... , https:// ...  はリンクになります

== ToDo ==
* 更新通知 と アップデート機能
* wiki書式の追加

]]></detail>
</VimperatorPlugin>;

liberator.plugins.pluginManager = (function(){

function id (value) value;
var lang = window.navigator.language;
var tags = {
	name: function(info) fromUTF8Octets(info.toString()),
	author: function(info) {
		var xml = <>{info.toString()}</>;
		if (info.@homepage.toString() != '')
			xml += <><span> </span>{makeLink(info.@homepage.toString())}</>;
		if (info.@mail.toString() != '')
			xml += <><span> </span>({makeLink("mailto:"+info.@mail)})</>;
		return xml;
	},
	description: function(info) makeLink(fromUTF8Octets(info.toString())),
	license: function(info) {
		var xml = <>{info.toString()}</>;
		if (info.@document.toString() != '')
			xml += <><span> </span>{makeLink(info.@document.toString())}</>;
		return xml;
	},
	version: id,
	maxVersion: id,
	minVersion: id,
	detail: function(info){
		if (info.* && info.*[0] && info.*[0].nodeKind() == 'element')
			return info.*;

		var text = fromUTF8Octets(info.*.toString());
		var lines = text.split(/\r\n|[\r\n]/);
		var xml = <></>;
		var ite = Iterator(lines);
		var num, line;
		try {
		while ([num, line] = ite.next()){
			if (!line) continue;
			if (/^\s*==(.*)==\s*$/.test(line)){
				xml += <h1 style="font-weight:bold;font-size:medium;">{makeLink(RegExp.$1)}</h1>;
				continue;
			}
			let reg = /^\s*(.*)\s*:\s*$/;
			if (reg.test(line)){
				let dl = <dl><dt>{makeLink(RegExp.$1)}</dt></dl>;
				try {
				while ([num, line] = ite.next()){
					if (!line) break;
					if (reg.test(line)){
						dl.* += <dt>{makeLink(RegExp.$1)}</dt>;
					} else {
						dl.* += <dd>{makeLink(line.replace(/^\s+|\s+$/g, ""))}</dd>;
					}
				}
				} catch (e){}
				xml += dl;
				continue;
			}
			xml += <>{makeLink(line)}<br/></>;
		}
		} catch (e){}
		return xml;
	}
};
function chooseByLang (elems) {
	if (!elems)
		return null;
	function get (lang) {
		for (let i=elems.length(); i-->1;){
			if (elems[i].@lang == lang)
				return elems[i];
		}
	}
	return get(lang) || get(lang.split('-', 2).shift()) || elems[0] || elems;
}
for (let it in Iterator(tags)) {
	let [name, value] = it;
	tags[name] = function (info) {
		if (!info[name])
			return null;
		return value.call(tags, chooseByLang(info[name]));
	};
}
function makeLink(str){
	return XMLList(str.replace(/(?:https?:\/\/|mailto:)\S+/g, '<a href="#" highlight="URL">$&</a>'));
}
function fromUTF8Octets(octets){
	return decodeURIComponent(octets.replace(/[%\x80-\xFF]/g, function(c){
		return "%" + c.charCodeAt(0).toString(16);
	}));
}
function getPlugins(){
	var list = [];
	var contexts = liberator.plugins.contexts;
	for (let path in contexts){
		let context = contexts[path];
		let info = context.PLUGIN_INFO || null;
		let plugin = [
			["path", path]
		];
		plugin["name"] = context.NAME;
		if (info){
			for (let tag in tags){
				let value = tags[tag](info);
				if (value.toString().length > 0)
					plugin.push([tag, value]);
			}
		}
		list.push(plugin);
	}
	return list;
}
function itemFormater(plugin, showDetail){
	if (showDetail)
		return template.table(plugin.name, plugin);

	var data = plugin.filter(function($_) $_[0] != 'detail');
	return template.table(plugin.name, data);
}
commands.addUserCommand(['plugin[help]'], 'list Vimperator plugins',
	function(args){
		liberator.plugins.pluginManager.list(args[0], args['-verbose']);
	}, {
		argCount: "*",
		options: [
			[['-verbose', '-v'], commands.OPTION_NOARG],
		],
		completer: function(context){
			var all = getPlugins().map(function(plugin){
				let desc = '-';
				for (let i=plugin.length; i-->0;){
					if (plugin[i][0] == 'description'){
						desc = plugin[i][1];
						break;
					}
				}
				return [plugin.name, desc];
			});
			context.title = ['PluginName', 'Description'];
			context.completions = all.filter(function(row) row[0].toLowerCase().indexOf(context.filter.toLowerCase()) >= 0);

		}
	}, true);
var public = {
	list: function(name, showDetail){
		var xml = <></>;
		var plugins = getPlugins();
		if (name){
			let plugin = plugins.filter(function(plugin) plugin.name == name)[0];
			if (plugin){
				xml = itemFormater(plugin, showDetail);
			}
		} else {
			plugins.forEach(function(plugin) xml += itemFormater(plugin, showDetail));
		}
		liberator.echo(xml, true);
	}
};
return public;
})();

