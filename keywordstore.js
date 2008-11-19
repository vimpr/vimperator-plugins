/**
 * ==VimperatorPlugin==
 * @name			KeywordStore.js
 * @description			Store the keywords when ":open" or ":tabopen" launched
 * @author			Y. Maeda (clouds.across.the.moon@gmail.com)
 * @link			
 * @version			0.1
 * ==/VimperatorPlugin==
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Usage:
 *  :kssearch <str>
 * if <str> is nothing, incremental search starts by last keyword used by ":open" or ":tabopen".
 * <str> can be completed by using history of keywords.
 * 
 * Tested on:
 *	Firefox version: 3.0.3
 *	Vimperator version: 1.2
 *		URL: https://addons.mozilla.org/firefox/addon/4891
 */
(function (){
var queue = [];

function push(strs){
	for(let i = strs.length; i-- > 0;){
//		if((strs[i] != "") && !(queue.some(function(s){return s==strs[i]} ))){
		if(strs[i] != "" && queue[0] != strs[i]){
			queue.unshift(strs[i]);
		}
	}
}

function search(str){
	str = str || queue[0];
	liberator.commandline.open("/", str, modes.SEARCH_FORWARD);
}

function suggestions(str){
	return queue
		  .filter(function(i) i.indexOf(str) == 0)
		   .map(function(i) [i, "Stored Keyword"]);
}

function completer(str){
		return [0, suggestions(str)];
}


/* 元のwindow.getShortcutOrURIを退避しておく。*/
var __getShortcutOrURI;
if(!plugins["keywordStore"] || !plugins.keywordStore["__getShortcutOrURI"]){
	__getShortcutOrURI = window.getShortcutOrURI;
}else{
	__getShortcutOrURI = plugins.keywordStore.__getShortcutOrURI;
}

/* ":open"等が呼ばれたときに、キーワードをキューに入れるようにwindow.getShortcutOrURIを置き換える */
window.getShortcutOrURI = function(aURL, aPostDataRef){
	push(aURL.split(/[ \t\r\n]+/).slice(1));
	return __getShortcutOrURI(aURL, aPostDataRef);
};

/***  User Command ***/
commands.addUserCommand(['kssearch'], 'KeywordStore search',
	search,
	{completer: completer}, true);

/***  外からも使えるように ***/
liberator.plugins.keywordStore = {
	push:		push,
	search:		search,
	suggestions:	suggestions,
	completer:	completer,
	queue:		queue,

	/* 元のwindow.getShortcutOrURIの退避先 */
	__getShortcutOrURI:	__getShortcutOrURI
};

})();
