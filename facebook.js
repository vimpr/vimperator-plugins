// INFO {{{
let INFO =
<>
  <plugin name="facebook" version="0.1.7"
          href="http://github.com/vimpr/vimperator-plugins/blob/master/facebook.js"
          summary="[facebook.js] コマンドラインからfacebookを操作するプラグイン"
          lang="ja"
          xmlns="http://vimperator.org/namespaces/liberator">
    <author email="ninja.tottori@gmail.com">ninjatottori</author>
	<license>MIT License</license>
    <project name="Vimperator" minVersion="3.0"/>
    <p>
	コマンドラインからfacebookをあれこれするプラグインです。<br />
	</p>
	<h3 tag="facebook-setup">Setup(初期設定)</h3>
    <item>
		<tags>:facebook -getAuth</tags>
		<tags>:facebook -setAccessToken</tags>
		<spec>:fa<oa>cebook</oa> <a>-getAuth</a></spec>
		<spec>:fa<oa>cebook</oa> <a>-setAccessToken</a></spec>
		<description>
			<p>facebookアプリの認証を行います。
			facebookにログインした状態で :fa -getAuth するとfacebookのアプリ認証ページに飛びます。
			認証ページで承認を行うと結果ページが開きますので、そのままの状態で :fa -setAccessToken して下さい。
			一度設定すれば以後は不要です。(自動的にサブコマンドから消えます）
			</p>
		</description>
    </item>
	<h3 tag="facebook-options">Options(rcファイルへの設定)</h3>
    <item>
		<tags>g:facebook_auto_load</tags>
		<spec>let g:facebook_auto_load = <a>0 or 1</a></spec>
		<description>
			<p>
			wallデータの自動更新を設定します。1で有効です。デフォルトは無効になっています。
			取得したデータはキャッシュされて、コメントやいいねに利用されるので有効にしておく事をおすすめします。
			</p>
		</description>
    </item>
    <item>
		<tags>g:facebook_auto_load_interval</tags>
		<spec>let g:facebook_auto_interval = <a>msec</a></spec>
		<description>
			<p>
			wallデータの自動更新間隔を設定します。デフォルトは60000(1分)です。
			</p>
		</description>
    </item>
	<h3 tag="facebook-post-command">Post(投稿)</h3>
    <item>
		<tags>:facebook </tags>
		<spec>:fa<oa>cebook</oa> text <a>-link</a> url <a>-group</a> id</spec>
		<description>
			<p>:fa hogehoge とするとfacebookへ「hogehoge」と投稿します。
			-link オプションを選ぶと補完リストに開いているURLが出てくるので選択して投稿できます。
			-group オプションを選ぶと補完リストにグループidが出てくるので選択して投稿するとそのグループにのみ投稿ができます。
			</p>
		</description>
    </item>
	<h3 tag="facebook-open-command">Open</h3>
    <item>
		<tags>:facebook <a>open</a></tags>
		<spec>:fa<oa>cebook</oa> <a>open</a></spec>
		<description>
			<p>選択されたアイテムをタブに開きます。
			リンクが指定されていないデータ（単純なステータス表示など）はその投稿ページを開くだけです。
			</p>
		</description>
    </item>
	<h3 tag="facebook-get-command">Get(ウォールデータのMOWへの出力)</h3>
    <item>
		<tags>:facebook <a>get</a></tags>
		<spec>:fa<oa>cebook</oa> <a>get</a></spec>
		<description>
			<p>facebookのウォールデータを取得してMOWに出力します。
			また、同時にlocal strage(デフォルトでは~/vimperator/info/default/facebook)にキャッシュを入れます。
			後述するコメントやlike(いいね)はこのキャッシュされているデータにのみ行う仕様になっています。
			</p>
		</description>
    </item>
	<h3 tag="facebook-comment-command">Comment(コメントの投稿)</h3>
    <item>
		<tags>:facebook <a>comment</a> <a>id</a> text</tags>
		<spec>:fa<oa>cebook</oa> <a>comment</a> <a>id</a> text</spec>
		<description>
			<p>:fa comment&lt;Space&gt;すると補完リストにキャッシュされているウォールデータが補完リストに表示されます。
			&lt;Tab&gt;でidを補完してコメントを入力して実行すると対象にコメントを投稿します。
			</p>
		</description>
    </item>
	<h3 tag="facebook-like-command">Like(いいねの投稿)</h3>
    <item>
		<tags>:facebook <a>like</a> <a>id</a></tags>
		<spec>:fa<oa>cebook</oa> <a>like</a> <a>id</a></spec>
		<description>
			<p>:fa like&lt;Space&gt;すると補完リストにキャッシュされているウォールデータが補完リストに表示されます。
			&lt;Tab&gt;でidを補完して実行すると対象にlike(いいね)をポストします。
			また、現時点ではlikeの取り消しはできません。
			</p>
		</description>
    </item>
	<h3 tag="facebook-checkin-command">Check In</h3>
    <item>
		<tags>:facebook <a>checkin</a> <a>id</a> text</tags>
		<spec>:fa<oa>cebook</oa> <a>checkin</a> <a>id</a> text</spec>
		<description>
			<p>:fa checkin&lt;Space&gt;すると補完リストに最近チェックインした場所が表示されます。
			&lt;Tab&gt;でidを補完して実行すると対象にチェックインします。
			対象を選んだ後に&lt;Space&gt;textでチェックインコメントを投稿します。
			</p>
		</description>
    </item>
  </plugin>
</>;
// }}}

(function(){

function presetup(){ // access_token取得前 {{{

	commands.addUserCommand(["facebook","fa"],	"facebook util",
		function(args){
			if (args["-getAuth"]) {
						FB.get_auth();
			} else if (args["-setAccessToken"]) {
				FB.set_access_token();
			}
		},
		{
        options: [
          [["-getAuth"], commands.OPTION_NOARG],
          [["-setAccessToken"], commands.OPTION_NOARG]
        ],
		},
		true
	);
} // }}}

function setup(){ // access_token取得後 {{{

	FB.set_friends();
	FB.set_groups();

	commands.addUserCommand(["facebook","fa"],	"facebook util",
		function(args){
			if(args[0] || args["-link"])FB.post_to_wall(args);
		},
		{
			options:[
				[["-link","-l"],commands.OPTION_STRING,null,tablist],
				[["-group","-g"],commands.OPTION_STRING,null,grouplist],
			],
			subCommands: [
				new Command(["get"], "get walldata from facebook to MOW",
					function (args) {
						FB.view_wall_data(args)
					},{
						literal:0,
						completer:friends_completer,
					}
				),
				new Command(["checkin"], "check in",
					function (args) {
						FB.check_in(args);
					},{
						literal:0,
						completer:checkins_completer,
					}
				),
				new Command(["comment"], "comment",
					function (args) {
						FB.comment(args);
					},{
						literal:0,
						completer:function(context){
							feed_completer(context);
							context.completions = feed_complations();
						},
					}
				),
				new Command(["like"], "like",
					function (args) {
						FB.like(args);
					},{
						literal:0,
						completer:function(context){
							feed_completer(context);
							context.completions = feed_complations();
						},
					}
				),
				new Command(["open"], "open in background tab",
					function (args) {
						liberator.open(args[0],liberator.NEW_BACKGROUND_TAB)
					},{
						literal:0,
						completer:function(context){
							feed_completer(context);
							context.completions = feed_complations("open");
						},
					}
				),
			],
		},
		true
	);

	function checkins_completer(context){

		context.title = ["id","name"]
		context.filters = [CompletionContext.Filter.textDescription]; 
		context.compare = void 0;
		context.anchored = false;
		context.incomplete = true;
		let url = FB.graph + "me/checkins?access_token=" + FB.access_token;
		FB.request(url,function(data){
			res = libly.$U.evalJson(data.responseText)["data"];
			let checkins = [];
			for each(let l in res){
				checkins.push([l["place"]["id"] + "," + l["place"]["location"]["latitude"] + "," + l["place"]["location"]["longitude"] ,l["place"]["name"] + " " + l["place"]["location"]["street"]])
			}
			context.completions = checkins;
			context.incomplete = false;
		});
	}

	function friends_completer(context){
		context.title = ["id","name"]
		context.filters = [CompletionContext.Filter.textDescription]; 
		context.compare = void 0;
		context.anchored = false;

		let store = storage.newMap("facebook",{store:true}).get("friends");
		let friends = [];
		for (let d in store){
			friends.push([store[d]["id"],store[d]["name"]]);
		}
		context.completions = friends;
		context.incomplete = false;
	}

	function feed_completer(context){ 

		context.title = ["feed"];
		context.filters = [statusObjectFilter]; 
		context.compare = void 0;
		context.anchored = false;
		context.createRow = function(item, highlightGroup){
		
			// タイトル
			if (highlightGroup === 'CompTitle') {
				return <div highlight={highlightGroup} style="white-space: nowrap">
					<li highlight="CompDesc">{item}</li>
				</div>;
			}

			let [value, info] = item.item;
			return <div highlight="CompItem" style="white-space: nowrap">
				<li highlight="CompDesc">
					<img src={info.user_icon} style="height:24px;"/>
					<img src={info.icon}/>
					{info.user_name} 
					: {info.name} {info.story} {info.message} <u>{info.link}</u> {info.description}
					<span style="color:red;">{info.likes}</span>
					<span style="color:yellow;">{info.comments}</span>
				</li>
			</div>;
		
		};

		context.incomplete = false;

		function statusObjectFilter(item)
			let (desc = item.description)
			(this.match(desc.user_name) || this.match(desc.message) || this.match(desc.link) || this.match(desc.description));

	}

	function feed_complations(command) {
		let store = storage.newMap("facebook",{store:true}).get("feed_cache");
		let feeds = [];
		for each(let d in store){
			feeds.push([
				(command === "open") ? (d["link"] || (d["actions"] ? d["actions"][0]["link"] : FB.www)) : d["id"] ,
				{
					type:d["type"],
					icon:d["icon"],
					user_name:d["from"]["name"],
					message:(d["message"] || ''),
					user_icon:FB.graph + d["from"]["id"] + "/picture/" ,
					link:(d["link"] || ''),
					likes:d["likes"] ? d["likes"]["count"] + ' likes' : '' ,
					comments:(d["comments"]["count"] > 0) ? d["comments"]["count"] + ' comments' : '' ,
					name:(d["name"] || ''),
					story:(d["story"] || ''),
					description:(d["description"] || ''),
				}
			]);
		}
		return feeds;
	
	}

	function tablist(){
		let tablist = [];
		for each([i,tab] in tabs.browsers){
			tablist.push([tab.currentURI.spec,tabs.getTab(i).label]);
		}
		return tablist;
	}

	function grouplist(){
		let store = storage.newMap("facebook",{store:true}).get("groups");
		let grouplist = [];
		for each(let d in store){
			grouplist.push([d["id"],d["name"]])
		}
		return grouplist;
	}


} // }}}

	let FB = { /// {{{
		access_token : storage.newMap("facebook",{store:true}).get("access_token"),
		www : "http://www.facebook.com/",
		https_www : "https://www.facebook.com/",
		graph : "https://graph.facebook.com/",
		get_auth : function(){ // get_auth {{{
			let app_id = "149105991809432";
			let auth_url = this.https_www + "/dialog/oauth?" 
							+ "client_id=" + app_id 
							+ "&redirect_uri=https://www.facebook.com/connect/login_success.html"
							+ "&scope=offline_access,publish_stream,read_stream,user_groups,user_checkins,friends_checkins,publish_checkins"
							+ "&response_type=token";
			liberator.open(auth_url,liberator.NEW_BACKGROUND_TAB);
		}, // }}}

		set_access_token : function(){ // set_access_token {{{
			commandline.input("Paste URL",
					function(res){
						let store = storage.newMap("facebook",{store:true});
						let token = res.match(/^https:\/\/.*access_token\=(.*)\&.*$/)[1];
						if(token){
							store.set('access_token',token);
							store.save();
							FB.access_token = token;
							e("[facebook.js]:set access_token!");
							setup();
						}
					},{
						completer : function(context){
							context.title = ['location', 'name street'];
							context.filters = [CompletionContext.Filter.textDescription];
							context.completions = (function(){
													let tablist = [];
													for each([,tab] in tabs.browsers){
														if(tab.currentURI.host == "www.facebook.com" && tab.currentURI.path.match(/\/connect\/.*/))
															tablist.push([tab.currentURI.spec,tab.currentURI.host]);
													}
													return tablist;
												})();
							context.incomplete = false;
						},
					}
					);
		}, // }}}

		post_to_wall : function(data) { // post {{{

			let url = this.graph + (data["-group"] || "me") + "/feed";

			let post_data = getParameterMap({
				access_token : this.access_token,
				message : data.join(' ') || '',
				link : data["-link"] || '',
			});

			FB.request(url,function(data) echo("[facebook.js]:post success"),true,post_data);
			   
	   }, // }}} 

		get_wall_data : function() { // set to local storage 'feed_cache' {{{ 

			let url = FB.graph + "/me/home?access_token=" + FB.access_token;

			FB.request(url,function(data){
				res = libly.$U.evalJson(data.responseText);

				let store = storage.newMap("facebook",{store:true});
				store.set('feed_cache',res["data"]);
				store.save();

			});

	   }, // }}}

		view_wall_data : function(data) { // view wall data on MOW {{{ 

			let url = data[0] ? this.graph + data[0] + "/feed?access_token=" + this.access_token : this.graph + "/me/home?access_token=" + this.access_token;

			FB.request(url,function(data){
				res = libly.$U.evalJson(data.responseText);

				let store = storage.newMap("facebook",{store:true});
				store.set('feed_cache',res["data"]);
				store.save();


				viewWallData(res);

				function viewWallData(data){
					let buff = "";
					for each(let d in data["data"]){

						if(d["type"] == "status"){
							buff += <div><img src={icon_path(d)} width="30px" /> {d["type"]}：{d["message"] || ''}　{like_count(d)}{comment_count(d)} <br />  <hr /></div>
						}else if(d["type"] == "link"){
							buff += <div><img src={icon_path(d)} width="30px" /> {d["type"]}：{d["message"] || ''}　<a href={d["link"]} >{d["link"]}</a>　{like_count(d)}{comment_count(d)}<br /><hr /> </div>
						}else if(d["type"] == "photo"){
							buff += <div><img src={icon_path(d)} width="30px" /> {d["type"]}：{d["message"] || ''}　{like_count(d)}{comment_count(d)} <br /><img src={d["picture"]} /> <br /><hr /> </div>
						}else if(d["type"] == "checkin"){
							buff += <div><img src={icon_path(d)} width="30px" /> {d["type"]}：{d["message"] || ''} {d["name"]}　{like_count(d)}{comment_count(d)} <br />  <hr /></div>;
						}else{
							buff += <div>unknown post : {d["type"]}</div>
						}

					liberator.echo(buff);

					}

					function icon_path(data) FB.graph + data["from"]["id"] + "/picture/"; 

					function comment_count(data) { 
						if(!data["comments"]["data"]) return "";
						return <span style="color:red">({data["comments"]["count"]} comments) </span>;
					}

					function like_count(data) {
						if(!data["likes"]) return "";
						return <span style="color:yellow">({data["likes"]["count"]} Likes) </span>;
					}

				}
			});

			   


	   }, // }}}

		set_friends : function(data) { // store friends data {{{ 

			let url = this.graph + "/me/friends?access_token=" + this.access_token;

			FB.request(url,function(data){
				res = libly.$U.evalJson(data.responseText)
				let store = storage.newMap("facebook",{store:true});
				store.set('friends',res["data"]);
				store.save();
			})

		}, // }}}

		set_groups : function(data) { // store groups data {{{ 

			let url = this.graph + "/me/groups?access_token=" + this.access_token;

			FB.request(url,function(data){
				res = libly.$U.evalJson(data.responseText)
				let store = storage.newMap("facebook",{store:true});
				store.set('groups',res["data"]);
				store.save();
			})

		}, // }}}
		request : function(url,callback,type,post_data){ // get or post requester. def:get {{{

			let req = new libly.Request(
				url , //url
				null, //headers
				{ // options
					asynchronous:true,
					postBody:post_data,
				}
			);

			req.addEventListener("success",function(data){
				callback(data);
			});

			req.addEventListener("failure",function(data){
				e(data.responseText)
				liberator.echoerr(data.responseText);
			});

			req.addEventListener("exception",function(data){
				e(data.responseText)
				liberator.echoerr(data.responseText);
			});
			   
			!type ? req.get() : req.post();

		}, // }}}

		check_in : function(data){ // check in {{{
			
			if(!data[0]) return;

			let url = this.graph + "me/checkins";

			let p = data[0].split(' ')[0].split(',');
			let place_id = p[0];
			let latitude = p[1];
			let longitude = p[2];
			let message = data[0].split(' ').slice(1,undefined).join(' ');

			let post_data = getParameterMap({
				access_token : this.access_token,
				place:place_id,
				coordinates:'{"latitude":' + latitude + ',"longitude":"' + longitude + '"}',
				message : message || ''
			});

			FB.request(url,function(data) echo("[facebook.js]:checkin success"),true,post_data);


		}, // }}}

		comment : function(data) { // comment {{{ 

			if(!data[0]) return;

			let target = data[0].split(' ')[0];
			let message = data[0].split(' ').slice(1,undefined).join(' ');

			let url = this.graph + target + "/comments";
			let post_data = getParameterMap({
				access_token : this.access_token,
				message : message
			});

			FB.request(url,function(data) echo("[facebook.js]:post success"),true,post_data);

		}, // }}}

		like : function(data) { // like {{{ 

			if(!data[0]) return;

			let url = this.graph + data[0] + "/likes";
			let post_data = getParameterMap({
				access_token : this.access_token,
			});

			FB.request(url,function(data) echo("[facebook.js]:post success"),true,post_data);

		}, // }}}



		
	} /// }}}


// wall data update timer
let timer={id:0,active:false};

if(storage.newMap("facebook",{store:true}).get("access_token")){
	setup();
	if(liberator.globalVariables.facebook_auto_load == 1){
		timer.id = setInterval(FB.get_wall_data,liberator.globalVariables.facebook_auto_load_interval || 60000);
		timer.active = true;
		e("[facebook.js]start getting wall data");
	}
}else{
	presetup();
}


	function getParameterMap(parameters){  
		let map = "";
		for (let key in parameters){
			if (map) map += "&";
			map += key + "=" + parameters[key];
		}
		return map
	}  

	// for debug {{{
	function e(v,c){ 
		if(c) util.copyToClipboard(v);
		liberator.log(v,-1)
	}  

	function echo(v){ 
		liberator.echo(v)
	} // }}}


})();


