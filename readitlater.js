/*
 * readitlater.js
 * read it later apiをたたく
 * API Reffernce : http://readitlaterlist.com/api/docs/
 * 
*/

let PLUGIN_INFO =
<VimperatorPlugin>
  <name>readitlater</name>
  <description lang="ja">read it later の apiをたたく</description>
  <version>0.0.1</version>
  <minVersion>3.0</minVersion>
  <maxVersion>3.0</maxVersion>
  <author mail="ninja.tottori@gmail.com" homepage="http://twitter.com/ninja_tottori">ninja.tottori</author>
  <updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/readitlater.js</updateURL>
  <detail lang="ja"><![CDATA[
	ReadItLaterに追加したりするプラグインです。

	注意1.
	  パスワードマネージャに依存してるので、ReadItLaterのID/PWをパスワードマネージャに登録しておく必要があります。

	注意2.
	  API Key を使うので
	  http://readitlaterlist.com/api/signup/
	  から自分のAPI Keyを取得して
	  rcファイルに let g:readitlater_api_key = "api key" と書いておいた方が良いと思います。
	  デフォルトではあらかじめ私が取得したAPI Key使ってますが、一定時間内のリクエスト数などに制限があるみたいです。
	  同じキーで1時間に10000回コールするとアレされるそうなので、チームotsuneの方達などは独自で取った方がいいかと思います。



    == Command ==
	:ril 
		今見ているページのurlとtitleを登録します
	:ril add	
		rilした時と同じです。
		オプションとして url , title が選べるので適当に編集して登録もできます。
	
	:ril get
		登録されてるページの情報を取得してバッファにechoします。
		マウスでクリックするもよし、;oするもよし。
		オプションとして num , readed , tags が指定できます。
			num => 数字を入れるとその数だけリストを取得します。
			　:ril get num 3
			とか

			readed => 指定すると既読のものだけ取得します。
			  :ril get readed
			みたいな

			tags => 指定するとtagがついているものだけ取得します。

	:ril stats
		since, list, unread, readed の情報がとれます


  ]]></detail>
</VimperatorPlugin>;




commands.addUserCommand(['ril','readitlater'],	'read it late plugin', 
  function(args){

	ReadItLater.add(args);

  },
  {
	options : [],
	subCommands: [ 
	  new Command(["add"], "Add a page to a user's list", 
		  function (args) {
			  ReadItLater.add(args);
		  },{
			options : [
			  [["url","u"],commands.OPTION_STRING,null,
				  [[ buffer.URL ,"target url"]]
			  ],

			  [["title","t"],commands.OPTION_STRING,null,
				  [[ buffer.title ,"title"]]
			  ],
			],
		  }
	  ),

	  new Command(["get"], "Retrieve a user's reading list", 
		  function (args) {
			  ReadItLater.get(args);
		  },{
			options : [
			  [["num"],commands.OPTION_INT],
			  [["readed","-r"],commands.OPTION_NOARG],
			  [["tags","-t"],commands.OPTION_NOARG],
			  //[["myAppOnly"],commands.OPTION_NOARG],
			],
		  }
	  ),

	  new Command(["stats"], "Retrieve information about a user's list", 
		  function (args) {
			  ReadItLater.stats();
		  },{}
	  ),
	  /*
	  new Command(["test"], "Return stats / current rate limit information about your API key", 
		  function () {
			  ReadItLater.apiTest();
		  },{}
	  ),
	  */
	],


  },
  true
);


let ReadItLater = {
  api_key : (liberator.globalVariables.readitlater_api_key) ? liberator.globalVariables.readitlater_api_key : "966T6ahYgb081icU10d44byL31p5bF20" ,

  text : function(){ // {{{

	let req = new libly.Request(
	  "https://text.readitlaterlist.com/v2/text" , // url
	  null, // headers
	  { // options
		  asynchronous:true,
		  postBody:getParameterMap(
			  {
				  apikey		: this.api_key,
				  url			: buffer.URL,
				  mode		: "less",
				  images		: 0,
			  }
		  )
	  }
			
	);

	req.addEventListener("onSuccess",function(data){
	  e(data.responseText)
	});

	req.addEventListener("onFailure",function(data){
	  liberator.echoerr(data.statusText);
	  liberator.echoerr(data.responseText);
	});

	req.post();
  
  }, // }}}



  get : function(args){ // {{{
	// document => http://readitlaterlist.com/api/docs#get

	let manager = Components.classes["@mozilla.org/login-manager;1"].getService(Components.interfaces.nsILoginManager);
	let logins = manager.findLogins({},"http://readitlaterlist.com","",null);

	let req = new libly.Request(
	  "https://readitlaterlist.com/v2/get" , // url
	  null, // headers
	  { // options
		asynchronous:true,
		postBody:getParameterMap(
		  {
			apikey		: this.api_key,
			username	: encodeURIComponent(logins[0].username),
			password	: encodeURIComponent(logins[0].password),
			format 		: "json",
			count 		: (args["num"]? args["num"] : 30 ),
			state		: (args["readed"]) ? "read" : "unread",  
			tags		: (args["tags"]) ? 1 : 0,  
			myAppOnly	: (args["myAppOnly"]) ? 1 : 0,  
		  }
		)
	  }
			
	);

	req.addEventListener("onSuccess",function(data){
	  let res = libly.$U.evalJson(data.responseText);
	  liberator.echo(
		<style type="text/css"><![CDATA[
			div.result{color:gold;padding-left:1em;line-height:1.5em;}
			.result a{text-decoration:none;}
			.result a:hover{text-decoration:underline;}
		]]></style> +
		<div>#ReadItLater Your List</div> 
	  );
	  for (let key in res.list){
		liberator.echo(
		  <div class="result">
			<a href={res.list[key].url}>
			  {res.list[key].title} 
			</a>
		  </div>
		);
	  }
	});

	req.addEventListener("onFailure",function(data){
	  liberator.echoerr(data.statusText);
	  liberator.echoerr(data.responseText);
	});

	req.post();
  
  }, // }}}




  add : function(args){ // {{{

	let manager = Components.classes["@mozilla.org/login-manager;1"].getService(Components.interfaces.nsILoginManager);
	let logins = manager.findLogins({},"http://readitlaterlist.com","",null);

	let req = new libly.Request(
	  "https://readitlaterlist.com/v2/add" , // url
	  null, // headers
	  { // options
		asynchronous:true,
		postBody:getParameterMap(
		  {
			apikey		: this.api_key,
			username	: encodeURIComponent(logins[0].username),
			password	: encodeURIComponent(logins[0].password),
			url			: encodeURIComponent((args["url"]) ? (args["url"]) : buffer.URL),
			title		: encodeURIComponent((args["title"]) ? args["title"] : buffer.title),
		  }
		)
	  }
			
	);

	req.addEventListener("onSuccess",function(data){
	  liberator.echo("[ReadItLater] OK.")
	});

	req.addEventListener("onFailure",function(data){
	  liberator.echoerr(data.statusText);
	  liberator.echoerr(data.responseText);
	});

	req.post();
  
  }, // }}}




  stats : function(){ // {{{

	let manager = Components.classes["@mozilla.org/login-manager;1"].getService(Components.interfaces.nsILoginManager);
	let logins = manager.findLogins({},"http://readitlaterlist.com","",null);

	let req = new libly.Request(
	  "https://readitlaterlist.com/v2/stats" , // url
	  null, // headers
	  { // options
		asynchronous:true,
		postBody:getParameterMap(
		  {
			apikey		: this.api_key,
			username	: encodeURIComponent(logins[0].username),
			password	: encodeURIComponent(logins[0].password),
			format		: "json",
		  }
		)
	  }
			
	);

	req.addEventListener("onSuccess",function(data){
	  let res = libly.$U.evalJson(data.responseText);
	  liberator.echo(
		<style type="text/css"><![CDATA[
			div.stats{font-weight:bold;text-decoration:underline;color:gold;padding-left:1em;line-height:1.5em;}
		]]></style> + 
		<div>#ReadItLater Stats</div> + 
		<div class="stats">
		  since : {unixtimeToDate(res.user_since)} <br />
		  list : {res.count_list} <br />
		  unread : {res.count_unread} <br />
		  readed : {res.count_read} <br />
		</div>
	  );
	});

	req.addEventListener("onFailure",function(data){
	  liberator.echoerr(data.statusText);
	  liberator.echoerr(data.responseText);
	});

	req.post();
  
  }, // }}}



  apiTest : function(){ // {{{

	let req = new libly.Request(
	  "https://readitlaterlist.com/v2/api" , // url
	  null, // headers
	  { // options
		asynchronous:true,
		postBody:getParameterMap(
		  {
			apikey	: this.api_key,
		  }
		)
	  }
			
	);

	req.addEventListener("onSuccess",function(data){
	  liberator.echo(
		<div>
			X-Limit-User-Limit : {data.transport.getResponseHeader("X-Limit-User-Limit")} <br />
			X-Limit-User-Remaining : {data.transport.getResponseHeader("X-Limit-User-Remaining")} <br />
			X-Limit-User-Reset : {data.transport.getResponseHeader("X-Limit-User-Reset")} <br />
			X-Limit-Key-Limit : {data.transport.getResponseHeader("X-Limit-Key-Limit")} <br />
			X-Limit-Key-Remaining : {data.transport.getResponseHeader("X-Limit-Key-Remaining")} <br />
			X-Limit-Key-Reset : {data.transport.getResponseHeader("X-Limit-Key-Reset")} <br />
		
		</div>
		);
	});

	req.addEventListener("onFailure",function(data){
	  liberator.echoerr(data.statusText);
	  liberator.echoerr(data.responseText);
	});

	req.post();
  
  }, // }}}



}




function unixtimeToDate(ut) { 
  var t = new Date( ut * 1000 ); 
  t.setTime( t.getTime() + (60*60*1000 * 9) ); // +9は日本のタイムゾーン
  return t; 
}


function getParameterMap(parameters){
  let map = "";
  for (let key in parameters){
	if (map) map += "&";
	map += key + "=" + parameters[key];
  }
  return map
}


// for debug
function e(v,c){ 
  if(c) util.copyToClipboard(v);
  liberator.log(v,-1)
} 


