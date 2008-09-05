/**
 * shuppoppo.js
 *
 * 元ネタ:
 * JavaScriptでSLを走らせる「SL.JS」を作りました ::: creazy photograph
 * http://creazy.net/2008/02/sl_js.html
 *
 * VARIABLES:
 * let g:sl_speed = "100"
 * let g:sl_pitch = "15"
 * let g:sl_fg_color = "#FFFFFF"
 * let g:sl_bg_color = "#000000"
 *
 * OPTION
 * set [no]slbeep
 */
//:js (function(){echo('\n\n\n\n\n\n\n\n\n\n\n\n\n',true);var f=$('liberator-multiline-output');var d=f.contentDocument,s=d.createElement('script');s.src="http://labs.creazy.net/sl/bookmarklet.js";d.body.appendChild(s);})()

liberator.plugins.sl = (function(){
// COMMAND
liberator.commands.addUserCommand(['sl'],'キータイプを矯正します。',
	function(){
		sl();
	},{},true);
// OPTION
liberator.options.add(['slbeep'],'beepをSLに変更します','boolean',false);

var f = document.getElementById('liberator-multiline-output');
var d = f.contentDocument;
var data = [ // {{{
	'var sl_steam=[];' ,
	'sl_steam[0]="                      (@@) (  ) (@)  ( )  @@    ()    @     O     @     O      @<br>                 (   )<br>             (@@@@)<br>          (    )<br><br>        (@@@)<br>";' ,
	'sl_steam[1]="                      (  ) (@@) ( )  (@)  ()    @@    O     @     O     @      O<br>                 (@@@)<br>             (    )<br>          (@@@@)<br><br>        (   )<br>";',
	'var sl_body' ,
	'	="      ====        ________                ___________ <br>"' ,
	'	+"  _D _|  |_______/        \\__I_I_____===__|_________| <br>"',
	'	+"   |(_)---  |   H\\________/ |   |        =|___ ___|      _________________         <br>"',
	'	+"   /     |  |   H  |  |     |   |         ||_| |_||     _|                \\_____A  <br>"',
	'	+"  |      |  |   H  |__--------------------| [___] |   =|                        |  <br>"',
	'	+"  | ________|___H__/__|_____/[][]~\\_______|       |   -|                        |  <br>"',
	'	+"  |/ |   |-----------I_____I [][] []  D   |=======|____|________________________|_ <br>";',
	'var sl_wheels = [];',
	'sl_wheels[0]' ,
	'	="__/ =| o |=-O=====O=====O=====O \\ ____Y___________|__|__________________________|_ <br>"' ,
	'	+" |/-=|___|=    ||    ||    ||    |_____/~\\___/          |_D__D__D_|  |_D__D__D_|   <br>"',
	'	+"  \\_/      \\__/  \\__/  \\__/  \\__/      \\_/               \\_/   \\_/    \\_/   \\_/    <br>";',
	'sl_wheels[1]' ,
	'	="__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__|__________________________|_ <br>"',
	'	+" |/-=|___|=O=====O=====O=====O   |_____/~\\___/          |_D__D__D_|  |_D__D__D_|   <br>"',
	'	+"  \\_/      \\__/  \\__/  \\__/  \\__/      \\_/               \\_/   \\_/    \\_/   \\_/    <br>";',
	'sl_wheels[2]' ,
	'	="__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__|__________________________|_ <br>"',
	'	+" |/-=|___|=    ||    ||    ||    |_____/~\\___/          |_D__D__D_|  |_D__D__D_|   <br>"',
	'	+"  \\_/      \\O=====O=====O=====O_/      \\_/               \\_/   \\_/    \\_/   \\_/    <br>";',
	'sl_wheels[3]' ,
	'	="__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__|__________________________|_ <br>"',
	'	+" |/-=|___|=    ||    ||    ||    |_____/~\\___/          |_D__D__D_|  |_D__D__D_|   <br>"',
	'	+"  \\_/      \\_O=====O=====O=====O/      \\_/               \\_/   \\_/    \\_/   \\_/    <br>";',
	'sl_wheels[4]' ,
	'	="__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__|__________________________|_ <br>"',
	'	+" |/-=|___|=   O=====O=====O=====O|_____/~\\___/          |_D__D__D_|  |_D__D__D_|   <br>"',
	'	+"  \\_/      \\__/  \\__/  \\__/  \\__/      \\_/               \\_/   \\_/    \\_/   \\_/    <br>";',
	'sl_wheels[5]' ,
	'	="__/ =| o |=-~O=====O=====O=====O\\ ____Y___________|__|__________________________|_ <br>"',
	'	+" |/-=|___|=    ||    ||    ||    |_____/~\\___/          |_D__D__D_|  |_D__D__D_|   <br>"',
	'	+"  \\_/      \\__/  \\__/  \\__/  \\__/      \\_/               \\_/   \\_/    \\_/   \\_/    <br>";',
	"sl_steam  = sl_steam.map(function(s) s.replace(/ /g, '&nbsp;'));",
	"sl_body   = sl_body.replace(/ /g,'&nbsp;');",
	"sl_wheels = sl_wheels.map(function(s) s.replace(/ /g, '&nbsp;'));",
	'var sl_patterns = [0, 0, 0, 1, 1, 1];',
	'sl_patterns = sl_patterns.map(function(p, i) sl_steam[p] + sl_body + sl_wheels[i]);',
	'var sl_counter  = 0;',
	'var sl_position = 0;',
	'var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;',
	'var windowWidth = window.innerWidth;',
	"var sl_style_base ='display: block;position: absolute;text-align: left;overflow: visible;white-space: pre;font: 12px/12px monospace;';",
	"var sl_style_main =sl_style_base +'top: '+(scrollTop+0)+'px;' +'left: '+windowWidth+'px;' +'padding: 20px;' +'z-index: 999;' +'color: '+sl_tx_color+';';",
	"document.body.innerHTML += '<div id=\"__sl_main__\" style=\"'+sl_style_main+'\">'+sl_patterns[0]+'</div>';",
	'var sl_w = document.getElementById("__sl_main__").clientWidth;',
	'var sl_h = document.getElementById("__sl_main__").clientHeight;',
	"var sl_style_background =sl_style_base +'top: '+(scrollTop+0)+'px;' +'left: 0px;' +'width: '+windowWidth+'px;' +'height: '+sl_h+'px;' +'z-index: 998;' +'background-color: '+sl_bg_color+';' +'filter: alpha(opacity=0);' +'-moz-opacity: 0.0;' +'opacity: 0.0;';",
	"document.body.innerHTML += '<div id=\"__sl_background__\" style=\"'+sl_style_background+'\"><br></div>';",
	'var sl_bg_counter = 0;',
	'sl_open = function() {',
	'	var oid = "__sl_background__";',
	'	var op  = sl_bg_counter;',
	'	var ua  = navigator.userAgent',
	"	document.getElementById(oid).style.filter = 'alpha(opacity=' + (op * 10) + ')';",
	'	document.getElementById(oid).style.MozOpacity = op / 10;',
	'	document.getElementById(oid).style.opacity = op / 10;',
	'	if ( sl_bg_counter < 8 ) {',
	'		sl_bg_counter++;',
	"		setTimeout('sl_open()',100);",
	'	} else {',
	'		sl_run();',
	'	}}',
	'sl_run = function() {',
	'	document.getElementById("__sl_main__").innerHTML = sl_patterns[sl_counter];',
	'	document.getElementById("__sl_main__").style.left = windowWidth - sl_position + "px";',
	'	if (sl_counter < 5) {sl_counter++;} else {sl_counter=0;}',
	'	sl_position += sl_pitch;',
	'	if ( sl_w + (windowWidth - sl_position) < 0 ) {',
	'		sl_counter  = 0;',
	'		sl_position = 0;',
	'		document.body.removeChild(document.getElementById("__sl_main__"));',
	'		sl_close();',
	'	} else {',
	"		setTimeout('sl_run()',sl_speed);",
	'	}}',
	'sl_close = function() {',
	'	var oid = "__sl_background__";',
	'	var op  = sl_bg_counter;',
	'	var ua  = navigator.userAgent',
	'	document.getElementById(oid).style.MozOpacity = op / 10;',
	'	if ( sl_bg_counter > 0 ) {',
	'		sl_bg_counter--;',
	"		setTimeout('sl_close()',100);",
	'	} else {',
	'		document.body.removeChild(document.getElementById(oid));',
	'	}}',
	'sl_open();'].join('\n'); //}}}
function sl(){
	//'var sl_speed=100,sl_pitch=15,sl_tx_color="#FFFFFF",sl_bg_color="#000000",sl_steam=[];' ,
	var option = {
		sl_speed : 100,
		sl_pitch : 15,
		sl_fg_color : "#FFFFFF",
		sl_bg_color : "#000000"
	};
	for (let v in option){
		if (liberator.globalVariables[v]) option[v] = liberator.globalVariables[v];
	}
	var option_code = "var sl_speed=" + option.sl_speed +
	                  ",sl_pitch=" + option.sl_pitch +
					  ",sl_tx_color=\"" + option.sl_fg_color + "\"" +
					  ",sl_bg_color=\"" + option.sl_bg_color + "\";\n";
	var script = d.createElement('script');
	script.setAttribute('type','application/javascript');
	var cdata = document.createCDATASection(option_code + data);
	//var cdata = d.createComment(data);
	script.appendChild(cdata);
	liberator.echo('\n\n\n\n\n\n\n\n\n\n\n\n\n',true);
	d.body.appendChild(script);
};
var orig_beep = liberator.beep;
liberator.beep = function(){
	if (liberator.options.sl_beep)
		sl();
	else
		orig_beep();
};
return sl;
})();

