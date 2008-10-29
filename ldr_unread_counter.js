/**
 * ==VimperatorPlugin==
 * @name            LDR unread counter
 * @description     Display the unread count of LDR to the statusbar
 * @description-ja  ステータスバーにLDRの未読件数を表示
 * @version         0.1b
 * @author          teramako teramako@gmail.com
 * ==/VimperatorPlugin==
 *
 * まず最初に
 * let livedoor_id = "<livedoor ID>"
 * とユーザIDを設定してください。
 */

liberator.plugins.ldrUnreadCounter = (function(){

const defaultNameSpace = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
const gIntervalName = "ldr_check_intervals";
const userIdName = "livedoor_id";

var statusPanel, canvas;
var icon_image = new Image();
icon_image.src = "data:image/png;base64," +
                 "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAQ5JREFUOMul" +
                 "kz1OAzEQhT87hihN2kUU3opjRELaiCYVgstQIKXLEdJT09IgrVJwi4SG7ehIgbR/Zik2WLblCCn7" +
                 "JMuemeenmbFHALDsOk7BUghx+Xji5QPUpGEQVOjYrUyUePUwivqlqTvcNdVzG5zqubV3K0PINXWH" +
                 "+mqFn9LtBjDOGWuHXABl6uP1hbEYV5bVcYH92rBfG1tOtAcAZQXJd7+7guPkxp4vrjc27vJl2kLa" +
                 "wofq97R15Be5Fdk+GRt3+fYZ/y6+OwJNCWS5baKLtO25gjv/J/48+2R5P+LsLaP6fPV8AJxHPpJb" +
                 "NwCznGaWM04yz6dLKAChF8NmQTIQAuC/LIpDW3QwDsWLEL8RGH9NPOjBNQAAAABJRU5ErkJggg==";

/**
 * initial function
 */
function init(){
	createStatusButton();
	manager.start();
}

/**
 * create Status Icon to status line
 */
function createStatusButton(){
	function createElement(localName, attrs, namespace){
		var elm = document.createElementNS(namespace ? namespace : defaultNameSpace, localName);
		for (let name in attrs) elm.setAttribute(name, attrs[name]);
		return elm;
	}
	// FIXME: onclick時にLDRを開くように要修正
	statusPanel = createElement("statusbarpanel", {
		id: "ldr_unread_count_panel",
		tooltiptext: "Count: " });
	canvas = createElement("canvas", {
		id: "ldr_unread_count_image",
		width: "24", height: "16"
	},"http://www.w3.org/1999/xhtml");
	statusPanel.appendChild(canvas);

	// Iconだけ最初に描画がしておく
	var ctx = canvas.getContext("2d");
	icon_image.onload=function(){ ctx.drawImage(icon_image,0,0); };
	//ctx.drawImage(icon_image,0,0);

	document.getElementById("status-bar").insertBefore(statusPanel,
		document.getElementById("security-button").nextSibling);
}
function updateTooltip(str){
	statusPanel.setAttribute("tooltiptext",str);
}
/**
 * Update StatusIcon
 * @param {String|Number} count
 */
function updateCanvasCount(count){
	count = "" + count;

	var ctx = canvas.getContext("2d");
	ctx.clearRect(0,0,24,16);
	ctx.save();

	// LDR Icon の描画
	ctx.drawImage(icon_image,0,0);

	var width = ctx.canvas.width;
	var height = ctx.canvas.height;
	var len = ctx.mozMeasureText(count);

	// 未読件数の背景を暗くする
	// XXX: もっと良い色募集
	ctx.save();
	ctx.fillStyle = "rgba(48,48,48,0.75)";
	ctx.fillRect(width-len-1,4,len+1,12);
	ctx.restore();

	// 未読件数の描画
	// XXX: もっと良い色募集
	ctx.fillStyle = "Cyan";
	ctx.mozTextStyle = "12px sans-serif";
	ctx.translate(width - len-1, height-1);
	ctx.mozDrawText(count);
	ctx.restore();
}
/**
 * Draw Stop mark
 */
function canvasDrawStop(){
	var ctx = canvas.getContext("2d");
	ctx.clearRect(0,0,24,16);
	ctx.drawImage(icon_image,0,0);
	ctx.save();
	//禁止マークの描画
	ctx.strokeStyle = "Red";
	ctx.lineWidth = "2";
	ctx.beginPath();
	ctx.arc(17,9,6,0,Math.PI*2,false);
	ctx.stroke();
	ctx.translate(17,9);
	ctx.rotate(Math.PI/4);
	ctx.beginPath();
	ctx.moveTo(-6,0);
	ctx.lineTo(6,0);
	ctx.stroke();
	ctx.restore();
}

var unreadCount = 0;
function setCount(count){
	unreadCount = count;
	updateTooltip("Unread: " + count);
	updateCanvasCount(count);
}

function checkCount(id){
	var xhr;
	try {
		xhr = new XMLHttpRequest();
		xhr.mozBackgroundRequest = true;
		xhr.open("GET", "http://rpc.reader.livedoor.com/notify?user=" + id, false);
		xhr.send(null);
		setCount(xhr.responseText.split("|")[1]);
	} catch (e){
		liberator.log(e,0);
		liberator.echoerr("LDR Unread Counter: " + e.message);
	}
}
var timer = null;
function startup(id){
	setTimeout(function(){
		checkCount(id);
		timer = setTimeout(arguments.callee, manager.interval);
	}, 1000);
}
// ---------------------------------------------------
// PUBLIC
// ---------------------------------------------------
var manager = {
	get user_id(){
		return liberator.globalVariables[userIdName];
	},
	get interval(){
		var interval = liberator.globalVariables[gIntervalName];
		if (interval){
			interval = parseInt(interval,10);
		}
		return (isNaN(interval) ? 120 : interval) * 1000;
	},
	set interval(value){
		value = parseInt(value,10);
		if (isNaN(value)) return null;

		liberator.globalVariables[gIntervalName] = value;
		return value;
	},
	get count(){
		return unreadCount;
	},
	start: function(){
		if (!this.user_id){
			liberator.echoerr("LDR Unread Counter: Please :let " + userIdName + " = <livedoor ID>");
			// FIXME: なんかエラーが出る。原因が良く分からん
			//this.stop();
			return;
		}
		if (timer === null)
			startup(this.user_id);
		else
			liberator.echoerr("LDR Unread Counter has already started");
	},
	stop: function(){
		window.clearTimeout(timer);
		timer = null;
		canvasDrawStop();
		updateTooltip("LDR Unread Counter: stoped");
	},
	open: function(){
		liberator.open(["http://reader.livedoor.com/reader/"]);
	}
};

init();
return manager;
})();

// vim: sw=4 ts=4:
