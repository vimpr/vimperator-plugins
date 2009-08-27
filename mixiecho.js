// Vimperator plugin: "Update mixi echo"
// Last Change: 21-Oct-2008. Jan 2008
// License: Creative Commons
// Maintainer: mattn <mattn.jp@gmail.com> - http://mattn.kaoriya.net/

(function(){
	var ucnv = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"]
		.createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
	ucnv.charset = "EUC-JP";
	function sprintf(format){
		var i = 1, re = /%s/, result = "" + format;
		while (re.test(result) && i < arguments.length) result = result.replace(re, arguments[i++]);
		return result;
	}
	function parseHTML(str, ignoreTags) {
		var exp = "^[\\s\\S]*?<html(?:\\s[^>]*)?>|</html\\s*>[\\S\\s]*$";
		if (ignoreTags) {
			if (typeof ignoreTags == "string") ignoreTags = [ignoreTags];
			var stripTags = [];
			ignoreTags = ignoreTags.filter(function(tag) tag[tag.length - 1] == "/" || !stripTags.push(tag))
			                       .map(function(tag) tag.replace(/\/$/, ""));
			if (stripTags.length > 0) {
				stripTags = stripTags.length > 1
						  ? "(?:" + stripTags.join("|") + ")"
						  : String(stripTags);
				exp += "|<" + stripTags + "(?:\\s[^>]*|/)?>|</" + stripTags + "\\s*>";
			}
		}
		str = str.replace(new RegExp(exp, "ig"), "");
		var res = document.implementation.createDocument(null, "html", null);
		var range = document.createRange();
		range.setStartAfter(window.content.document.body);
		res.documentElement.appendChild(res.importNode(range.createContextualFragment(str), true));
		if (ignoreTags) ignoreTags.forEach(function(tag) {
			var elements = res.getElementsByTagName(tag);
			for (var i = elements.length, el; el = elements.item(--i); el.parentNode.removeChild(el));
		});
		return res;
	}
	function getElementsByXPath(xpath, node){
		node = node || document;
		var nodesSnapshot = (node.ownerDocument || node).evaluate(xpath, node, null,
				XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
		var data = [];
		for(var i = 0, l = nodesSnapshot.snapshotLength; i < l;
				data.push(nodesSnapshot.snapshotItem(i++)));
		return (data.length > 0) ? data : null;
	}
	function getFirstElementByXPath(xpath, node){
		node = node || document;
		var result = (node.ownerDocument || node).evaluate(xpath, node, null,
				XPathResult.FIRST_ORDERED_NODE_TYPE, null);
		return result.singleNodeValue ? result.singleNodeValue : null;
	}
	function showFollowersStatus(){
		var xhr = new XMLHttpRequest();
		xhr.open("GET", "http://mixi.jp/recent_echo.pl", false);
		xhr.send(null);
		var nodes = getElementsByXPath('id("echo")//div[@class="archiveList"]//tr', parseHTML(xhr.responseText, ['script']));
		var statuses = [];
		if (nodes && nodes.length) nodes.forEach(function(node) {
			var img = getFirstElementByXPath('.//img', node).src;
			var name = getFirstElementByXPath('.//*[@class="nickname"]', node).textContent.replace(/(?:\r?\n|\r)[ \t]*/g, "");
			var c = getFirstElementByXPath('.//*[@class="comment"]', node).childNodes;
			var text = '';
			for (var n = 0; n < c.length; n++) {
				if (c[n].nodeName.toUpperCase() == 'SPAN') break;
				text += c[n].textContent.replace(/^\s+|\s+$/g, '').replace(/&/g, '&amp;').replace(/>/g, '&gt;').replace(/</g, '&lt;');
				if (c[n].nodeName.toUpperCase() == 'A') text += ' ';
			}
			statuses.push({
				user : {
					profile_image_url : img,
					name : name,
					screen_name : name
				},
				text : text
			});
		});
		var html = <style type="text/css"><![CDATA[
			span.twitter.entry-content a { text-decoration: none; }
			img.twitter.photo { border; 0px; width: 16px; height: 16px; vertical-align: baseline; }
		]]></style>.toSource()
				   .replace(/(?:\r?\n|\r)[ \t]*/g, " ") +
			statuses.map(function(status)
				<>
					<img src={status.user.profile_image_url}
						 alt={status.user.screen_name}
						 title={status.user.screen_name}
						 class="twitter photo"/>
					<strong>{status.user.name}&#x202C;</strong>
				</>.toSource()
				   .replace(/(?:\r?\n|\r)[ \t]*/g, " ") +
					sprintf(': <span class="twitter entry-content">%s&#x202C;</span>', status.text))
						.join("<br/>");
		//liberator.log(html);
		liberator.echo(html, true);
	}
	function sayEcho(text){
		var xhr = new XMLHttpRequest();
		xhr.open("GET", "http://mixi.jp/recent_echo.pl", false);
		xhr.send(null);
		var form = getFirstElementByXPath('//form[@action="add_echo.pl"]', parseHTML(xhr.responseText, ['script']));
		var input = getFirstElementByXPath('.//textarea', form);
		input.value = text;
		var params = [];
		var inputs = getElementsByXPath('.//*[contains(" INPUT TEXTAREA SELECT ", concat(" ", local-name(), " "))]', form);
		inputs.forEach(function(input) { if (input.name.length) params.push(input.name + '=' + escape(ucnv.ConvertFromUnicode(input.value))); });
		xhr.open("POST", "http://mixi.jp/add_echo.pl", false);
		xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		xhr.send(params.join('&'));
	}
	commands.addUserCommand(["mixiecho"], "Change mixi echo",
		function(arg){
			if (arg.bang || arg.string.length == 0)
				showFollowersStatus()
			else
				sayEcho(arg.string);
		},{
			bang: true
		}
	);
})();
