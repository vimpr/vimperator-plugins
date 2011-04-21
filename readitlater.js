/*
 * readitlater.js
 * read it later apiをたたく
 * API Reffernce : http://readitlaterlist.com/api/docs/
 * TODO:ADDにbufferからのリストを入れられるように
*/

let PLUGIN_INFO =
<VimperatorPlugin>
  <name>readitlater</name>
  <description lang="ja">Read it Later を快適に使うためのプラグインです</description>
  <version>0.1.2</version>
  <minVersion>3.0</minVersion>
  <maxVersion>3.0</maxVersion>
  <author mail="ninja.tottori@gmail.com" homepage="http://twitter.com/ninja_tottori">ninja.tottori</author>
  <updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/readitlater.js</updateURL>
  <detail lang="ja"><![CDATA[

	Q.これは何？
	A.Read it Later を快適に使うためのプラグインです

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
	:ril add
		今見ているページのurlとtitleを登録します
		オプションとして url , title が選べるので適当に編集して登録もできます。

	:ril get
		登録されてるページの情報を取得してキャッシュしときます。
		デフォルトは50件ですが
		let g:readitlater_get_count = 100
		とかで取得件数を変更できます。
		add , open , read された後に問答無用で同期かけに行ってますので、件数をやたらに増やさない方がいいかもしれません。

	:ril open
		<Space>で補完にreaditlaterのリストが出てくるので、任意のURLを選択(<Space>)して実行すると新しいタブに開きます。
		:ril open! と!をつけると既読のみ補完に表示されます。

		また、開くと同時に既読フラグを立てに行く事ができます。
		let g:readitlater_open_as_read = 1
		としてもらえれば大丈夫です。
		※初回はキャッシュにデータが入っていないと思うので自分で:ril getしてやる必要があります。

	:ril read 
		既読フラグを立てる為のサブコマンドです。
		openした時に既読にしたくないっていう人はこれを使って既読フラグを立てて下さい。

	:ril stats
		since, list, unread, read の情報がとれます


  ]]></detail>
</VimperatorPlugin>;


(function(){

	commands.addUserCommand(["ril","readitlater"],	"Read It Late plugin", 
	  function(args){
		  ReadItLater.add(args);
	  },
	  {
		subCommands: [ 
		  new Command(["add","a"], "Add a page to a user's list", 
			  function (args) {
				  ReadItLater.add(args);
			  },{
				options : [
				  [["url","u"],commands.OPTION_STRING,null,
		  			  (function(){
						  return [[ buffer.URL ,"target url"]]
					  })
				  ],

				  [["title","t"],commands.OPTION_STRING,null,
		  			  (function(){
						  return [[ buffer.title ,"title"]]
					  })
				  ],
				],
			  }
		  ),

		  new Command(["get","g"], "Retrieve a user's reading list", 
			  function (args) {
				  ReadItLater.get(args);
			  },{
				options : [
				  //[["num"],commands.OPTION_INT],
				  //[["read","-r"],commands.OPTION_NOARG],
				  //[["tags","-t"],commands.OPTION_NOARG],
				  //[["myAppOnly"],commands.OPTION_NOARG],
				],
			  }
		  ),

		  new Command(["open","o"], "Open url in new tab from RIL list.", 
			  function (args) {
				  ReadItLater.open(args);
			  },{
				  bang: true,
				  completer : list_completer,
			  }
		  ),

		  new Command(["read","r"], "Mark items as read.", 
			  function (args) {
				  ReadItLater.send(args);
			  },{
				  bang: true,
				  completer : list_completer,
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
					  mode			: "less",
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



	  get : function(args,silent){ // {{{
		// document => http://readitlaterlist.com/api/docs#get

		let manager = Components.classes["@mozilla.org/login-manager;1"].getService(Components.interfaces.nsILoginManager);
		let logins = manager.findLogins({},"http://readitlaterlist.com","",null);
		let store = storage.newMap("readitlater",{store:true});

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
				count 		: (liberator.globalVariables.readitlater_get_count? liberator.globalVariables.readitlater_get_count : 50 ),
				//state		: (args["read"]) ? "read" : "unread",  
				//tags		: (args["tags"]) ? 1 : 0,  
				//myAppOnly	: (args["myAppOnly"]) ? 1 : 0,  
			  }
			)
		  }
				
		);

		req.addEventListener("onSuccess",function(data){
		  let res = libly.$U.evalJson(data.responseText);
		  let cnt = 0;
		  for (let key in res.list){
			store.set(key,res.list[key]);
			cnt++;
		  }
		  if(!silent){liberator.echo("[ReadItLater] " + cnt + " found.")};
		  store.save();
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

		var ref = this;
		req.addEventListener("onSuccess",function(data){
		  liberator.echo("[ReadItLater] OK.")
		  ref.get(null,true);
		});

		req.addEventListener("onFailure",function(data){
		  liberator.echoerr(data.statusText);
		  liberator.echoerr(data.responseText);
		});

		req.post();
	  
	  }, // }}}

	  open : function(args){ //{{{

		liberator.open(args, liberator.NEW_BACKGROUND_TAB);
		if(liberator.globalVariables.readitlater_open_as_read == 1)	this.send(args);

	  }, // }}}

	  send : function(args) { //{{{
		// http://readitlaterlist.com/api/docs/#send

		let manager = Components.classes["@mozilla.org/login-manager;1"].getService(Components.interfaces.nsILoginManager);
		let logins = manager.findLogins({},"http://readitlaterlist.com","",null);

		function make_read_list(args){
			let o = {};
			for (let i = 0; i < args.length; i++) {
				o[i] = {"url":encodeURIComponent(args[i])};
			};
			return JSON.stringify(o);
		};

		let req = new libly.Request(
		  "https://readitlaterlist.com/v2/send" , // url
		  null, // headers
		  { // options
			asynchronous:true,
			postBody:getParameterMap(
			  {
				apikey		: this.api_key,
				username	: encodeURIComponent(logins[0].username),
				password	: encodeURIComponent(logins[0].password),
				read		: make_read_list(args),
			  }
			)
		  }
		);
		
		var ref = this;
		req.addEventListener("onSuccess",function(data){
		  liberator.echo("[ReadItLater] OK.")
		  ref.get(null,true);
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
			  read : {res.count_read} <br />
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

	function list_completer(context,args){ // {{{

		function sortDate(store){
			let ary = [];
			for (let s in store){
				ary.push([s[1].time_updated,s[1]]); // 更新日でソート
			}
			ary.sort(function(a,b){return -(a[0] - b[0])});
			return ary;
		}

		let store = storage.newMap("readitlater",{store:true});
		let list = sortDate(store);

		context.title = ["url","title"]
		context.filters = [CompletionContext.Filter.textDescription]; // titleも補完対象にする
		context.compare = void 0; 
		context.anchored = false;
		context.completions = (function(){
			let links = [];
			for(let i in list){
				let item = list[i][1];
				if(!args["bang"]){
					if(item.state == 0)	links.push([item.url,item.title]); // 既読のみ
				}else{
					if(item.state == 1)	links.push([item.url,item.title]); // 未読のみ
				}
			}
			return links;
		})();

	} //}}}




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

})();



