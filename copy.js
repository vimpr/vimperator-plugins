/**
 * vimperator plugin
 * Add `copy' command
 * For vimperator 0.6pre
 * @author teramako teramako@gmail.com
 * @version 0.1
 *
 * Usage:
 * :copy {copyString}         -> copy the argument replaced some certain string
 * :copy! {expr}              -> evaluate the argument and copy the result
 *
 * ex)
 * :copy %TITLE%              -> copied the title of the current page
 * :copy title                -> same as `:copy %TITLE%' by default
 * :copy! liberator.version  -> copy the value of liberator.version
 *
 * If non-argument, used `default'
 *
 * Change the value by `set' command. (only the current session)
 * :set copy_{label}=....
 *  or
 * :set {label}=...
 */

(function(){
/*
 * label: template name which is command argument
 * copy:  copy string
 *    the certian string is replace to ...
 *        %TITTLE%  -> to the title of the current page
 *        %URL%     -> to the URL of the current page
 *        %SEL%     -> to the string of selection
 *        %HTMLSEL% -> to the html string of selection
 */
const templates = [
	{ label: 'titleAndURL',    value: '%TITLE%\n%URL%' },
	{ label: 'title',          value: '%TITLE%' },
	{ label: 'anchor',         value: '<a href="%URL%">%TITLE%</a>' },
	{ label: 'selanchor',      value: '<a href="%URL%" title="%TITLE%">%SEL%</a>' },
	{ label: 'htmlblockquote', value: '<blockquote cite="%URL%" title="%TITLE%">%HTMLSEL%</blockquote>' }
];
// used when argument is none
const defaultValue = templates[0].label;
liberator.commands.addUserCommand(['copy'],'Copy to clipboard',
	function(arg, special){
		var copyString = '';
		var isError = false;
		if (special && arg){
			try {
				copyString = window.eval('with(vimperator){' + arg + '}');
				switch (typeof copyString){
					case 'object':
						copyString = copyString === null ? 'null' : copyString.toSource();
						break;
					case 'function':
						copyString = copyString.toString();
						break;
					case 'number':
					case 'boolean':
						copyString = '' + copyString;
						break;
					case 'undefined':
						copyString = 'undefined';
						break;
				}
			} catch(e){
				isError = true;
				copyString = e.toString();
			}
		} else {
			if (!arg){ arg = defaultValue; }
			var str = getCopyTemplate(arg) || arg;
			copyString = replaceVariable(str);
		}
		liberator.copyToClipboard(copyString);
		if (isError){
			liberator.echoerr('CopiedErrorString: `' + copyString + "'");
		} else {
			liberator.echo('CopiedString: `' + liberator.util.escapeHTML(copyString) + "'");
		}
	},{
		completer: function(filter){
			if ( liberator.commands.parseCommand(liberator.commandline.getCommand())[2] ){
				return liberator.completion.javascript(filter);
			}
			var templates = [];
			for (var option in liberator.options){
				if ( option.name.indexOf('copy_') == 0 ){
					templates.push([option.names[1], option.value]);
				}
			}
			if (!filter){ return templates; }
			var candidates = [];
			templates.forEach(function(template){
				if (template[0].indexOf(filter) == 0 || ('copy_'+template[0]).indexOf(filter) == 0){
					candidates.push(template);
				}
			});
			return [0, candidates];
		}
	}
);
function getCopyTemplate(label){
	for (var option in liberator.options){
		if ( option.hasName('copy_'+label) || option.hasName(label) ){
			return option.value;
		}
	}
	return null;
}
function replaceVariable(str){
	if (!str) return;
	var win = new XPCNativeWrapper(window.content.window);
	var sel = '',htmlsel = '';
	if (str.indexOf('%SEL%') >= 0 || str.indexOf('%HTMLSEL%') >= 0){
		sel = win.getSelection().getRangeAt(0);
	}
	if (str.indexOf('%HTMLSEL%') >= 0){
		var serializer = new XMLSerializer();
		htmlsel = serializer.serializeToString(sel.cloneContents());
	}
	return str.replace(/%TITLE%/g,liberator.buffer.title)
	          .replace(/%URL%/g,liberator.buffer.URL)
	          .replace(/%SEL%/g,sel.toString())
	          .replace(/%HTMLSEL%/g,htmlsel);
}

templates.forEach(function(template){
	liberator.options.add(['copy_'+template.label, template.label],
		'Copy template: `' + liberator.util.escapeHTML(template.value) + "'", 'string',template.value,
		{});
});
//liberator.completion.exTabCompletion = function (str) {
//	var [count, cmd, special, args] = liberator.commands.parseCommand(str);
//	var completions = [];
//	var start = 0;
//	var matches = str.match(/^:*\d*(?=\w*$)/);
//	if (matches) {
//		completions = this.command(cmd);
//		start = matches[0].length;
//	} else {
//		var command = liberator.commands.get(cmd);
//		if (command && command.completer) {
//			matches = str.match(/^:*\d*\w+!?\s+/);
//			start = matches ? matches[0].length : 0;
//			if (command.hasName("open") || command.hasName("tabopen") || command.hasName("winopen")) {
//				var skip = args.match(/^(.*,\s+)(.*)/);
//				if (skip) {
//					start += skip[1].length;
//					args = skip[2];
//				}
//			} else if (command.hasName("echo") || command.hasName("echoerr") ||
//			           command.hasName("javascript") || command.hasName("copy")) {
//				var skip = args.match(/^.*?(?=\w*$)/);
//				if (skip)
//					start += skip[0].length;
//			}
//			completions = command.completer.call(this, args);
//		}
//	}
//	return [0, [start, completions]];
//};
})();

// vim: set fdm=marker sw=4 ts=4 et:
