/**
 * gmperator - vimperator plugin for Greasemonkey
 * For vimperator 0.6pre
 * @author teramako teramako@gmail.com
 * @version 0.2a
 *
 * Usage:
 *
 * :gmli[st] {filter}                -> show user scripts matches {filter}
 * :gmli[st]!                        -> show all user scripts
 * :gmli[st] full                    -> same as :gmli[st]!
 *
 * :gmlo[ad] {name|filename}         -> load the user script to the current page
 *                                      but, don't dispatch load event
 *                                      so maybe you should edit the scripts before load
 *
 * :gmset!                           -> toggle enable/disable greasemonkey
 * :gmset! {filename}                -> toogle enable/disable the script
 * :gmset {filename} {options}
 *   {options}:
 *       -n[ame] {value}              -> change name to {value}
 *       -i[nclude] {expr[,expr,...]} -> change includes to expr list ("," demiliter)
 *       -e[xclude] {expr[,expr,...]} -> change excludes to expr list ("," demiliter)
 *
 * Caution:
 * The change is permanent, not only the session.
 * And cannot get back.
 *
 * ex)
 * :gmset! {filename} -n fooScriptName -i http://*,https://* -e http://example.com/*
 *   toggle enable or disable,
 *   name to "fooScriptName",
 *   includes to "http://*" and "https://*",
 *   and excludes to "http://example.com/*"
 */
(function(){
commands.addUserCommand(['gmli[st]','lsgm'], 'list Greasemonkey scripts',
	function(arg,special){
		var str = '';
		var scripts = getScripts();
		var reg;
		if (special || arg == 'full'){
			reg = new RegExp('.*');
		} else if( arg ){
			reg = new RegExp(arg,'i');
		}
		if (reg){
			for (var i=0; i<scripts.length; i++){
				if ( reg.test(scripts[i].name) || reg.test(scripts[i].filename) ) {
					str += scriptToString(scripts[i]) + '\n\n';
				}
			}
		} else {
			for (var i=0; i<scripts.length; i++){
				if (scripts[i].enabled){
					str += '<span style="font-weight:bold;">'+ scripts[i].name + '</span>'
				} else {
					str += scripts[i].name;
				}
				str += ' (' + scripts[i].filename + ')\n'
			}
		}
		echo(str);
		function scriptToString(script){
			return [
				'<span class="hl-Title">' + script.name + '</span>::',
				'<span style="font-weight:bold;">fileName</span>: ' + script.filename,
				'<span style="font-weight:bold;">nameSpace</span>: ' + script.namespace,
				'<span style="font-weight:bold;">description</span>: ' + script.description,
				'<span style="font-weight:bold;">includes</span>:',
				'  ' + script.includes.join('\n  '),
				'<span style="font-weight:bold;">excludes</span>:',
				'  ' + script.excludes.join('\n  '),
				'<span style="font-weight:bold;">enabled</span>: ' + script.enabled
			].join('\n');
		}
	}
);
commands.addUserCommand(['gmlo[ad]'], 'load Greasemonkey script',
	function(arg){
		if (!arg) return;
		var scripts = getScripts();
		var script;
		for (var i=0; i<scripts.length; i++){
			if (scripts[i].filename == arg || scripts[i].name == arg){
				script = scripts[i];
				break;
			}
		}
		if (!script) {
			echoerr('Usage: :gmlo[ad] {name|filename}');
			return;
		} else {
			echo('load: ' +script.filename);
		}
		try {
			var href = vimperator.buffer.URL;
			var unsafewin = window.content.document.defaultView.wrappedJSObject;
			GM_BrowserUI.gmSvc.wrappedJSObject.injectScripts([script],href,unsafewin,window);
		} catch(e){
			log(e);
		}
		/*
		// do you have idea how to dispatch load event to only the script ?
		window.setTimeout(function(){
			var loadEvent = document.createEvent('Event');
			loadEvent.initEvent('load',true,true, window.content.document,1);
			window.content.document.dispatchEvent(loadEvent);
		},100);
		*/
	},{
		args: ['{name|filename}'],
		completer: function(filter){
			return scriptsCompleter(filter,true);
		}
	}
);
commands.addUserCommand(['gmset'], 'change setting a greasemonkey script',
	function(arg, special){
        var res = liberator.commands.parseArgs(arg, this.args);
		if (!res) {
            if (special) GM_setEnabled(!GM_getEnabled()); // toggle enable/disable greasemonkey
			return;
		}
		var filename = res.args[0];
		var config = new Config();
		config.load();
		var script;
		for (var i=0; i<config.scripts.length; i++){
			if (config.scripts[i].filename == filename){
				script = config.scripts[i];
				break;
			}
		}
		if (!script) return;
		if (special){ // toggle enable/disable the script if {filename} is exist
			script.enabled = !script.enabled;
		}
        if (res.opts.length > 0){
            script.name     = liberator.commands.getOption(res.opts, '-name',    script.name);
            script.includes = liberator.commands.getOption(res.opts, '-include', script.includes);
            script.excludes = liberator.commands.getOption(res.opts, '-exclude', script.excludes);
        }
		config.save();
	},{
		args: [
			[['-name','-n'], liberator.commands.OPTION_STRING],
			[['-include','-i'], liberator.commands.OPTION_LIST],
			[['-exclude','-e'], liberator.commands.OPTION_LIST]
		],
		shortHelp: 'change setting a greasemonkey script',
		help: [
			'toggle enable/disable with "!", if <code>{filename}</code> is exist, if not toggle greasemonkey',
			'<dl><dt>-n<br/>-name</dt><dd>change the name</dd>',
			'<dt>-i<br/>-include</dt><dd>change the inclue list ("," demiliter)</dd>',
			'<dt>-e<br/>-exclude</dt><dd>change the exclude list ("," demiliter)</dd></dl>',
			'Caution: the change is permanent, not the only session.<br/>And cannot get back.'
		].join(''),
		completer: function(filter){
            return scriptsCompleter(filter, false);
		}
	}
);
function getScripts(){
	var config = new Config();
	config.load();
	return config.scripts;
}
function scriptsCompleter(filter,flag){
	var candidates = [];
	var scripts = getScripts();
	var isAll = false;
	if (!filter) isAll=true;
	if (flag){
		for (var i=0; i<scripts.length; i++){
			if (isAll || scripts[i].name.toLowerCase().indexOf(filter) == 0 ||
				scripts[i].filename.indexOf(filter) == 0)
			{
				candidates.push([scripts[i].name, scripts[i].description]);
				candidates.push([scripts[i].filename, scripts[i].description]);
			}
		}
	} else {
		for (var i=0; i<scripts.length; i++){
			if (isAll || scripts[i].filename.indexOf(filter) == 0)
			{
				candidates.push([scripts[i].filename, scripts[i].description]);
			}
		}
	}
	return [0,candidates];
}

})();

// vim: set fdm=marker sw=4 ts=4 et:
