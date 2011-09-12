// INFO {{{
let INFO =
<>
  <plugin name="atnd" version="0.1.0"
          href="http://github.com/vimpr/vimperator-plugins/blob/master/atnd.js"
          summary="Atndのイベント検索"
          lang="ja"
          xmlns="http://vimperator.org/namespaces/liberator">
    <author email="ninja.tottori@gmail.com">ninjatottori</author>
    <license>New BSD License</license>
    <project name="Vimperator" minVersion="3.0"/>
    <p>Event search on Atnd</p>
    <item>
      <tags>:atnd</tags>
      <description>
        <p>search on atnd</p>
		<p>:atnd keyword で補完リストにkeywordで取得したイベントを補完します。<br />
		補完リストを使わず、:atnd keyword &lt;Enter&gt; するとMOWに表示します
		</p>
      </description>
    </item>
  </plugin>
</>;
// }}}


(function(){
	commands.addUserCommand(['atnd','atend'],	'atnd.org', 
		function(args){
			if(args.length == 1) {
				Atnd.get_events(args);
			} else {
				liberator.open(args[args.length-1], liberator.NEW_BACKGROUND_TAB);
			}
		},
		{
			options : [],
			completer : listCompleter,
		},
		true
	);

	function listCompleter(context,args){ // {{{

		context.title = ["url","title"]
		context.filters = [CompletionContext.Filter.textDescription];
		context.compare = void 0;
		context.anchored = false;
		context.incomplete = true;
		Atnd.get_event2(context,args);

	} //}}}

	let Atnd = { //{{{

		base_url : "http://api.atnd.org/",
		get_events : function(args){ //{{{

			let keyword = args.join(",");
			if(!keyword) return;
			let count = (liberator.globalVariables.atnd_get_count) ? liberator.globalVariables.atnd_get_count : 10 ;

			let req = new libly.Request(
				this.base_url + "events/?keyword=" + keyword + "&format=json&count=" + count , //url
				null, //headers
				{ // options
					asynchronous:true,
				}
			);

			req.addEventListener("success",function(data){
				let res = libly.$U.evalJson(data.responseText);
				if(res.results_returned == 0){
					liberator.echo("keyword: " + keyword + " was no result");
					return;
				}

				let res_events = res.events.filter(isEnded,new Date())
				let html,div = "";
				html = <style type="text/css"><![CDATA[
						div.head{font:medium Arial;font-weight:bold;text-decoration:underline;color:#EA1F00;padding-left:0.3em;padding-bottom:0.3em;}
						div.result{padding:0.3em 2em;}
						.result a{color:#7fff00;}
						.result a:hover{color:#ff1493;}
					]]></style> + 
					<div class="head" >
						{res_events.length + "/" + res.results_available + " events matched(include ended events)"}
					</div>;
				for (let i = 0 ; i < res_events.length ; i++) {
					let r = res_events[i]
					div += <div class="result">
							<a href={r.event_url} >
								{r.title} 
								{" - " + r.started_at} 
							</a>
								{" - " + r.catch} 
								{" - " + r.address} 
						</div>;
				};
				liberator.echo(html + div)

				function isEnded(elements,index,array){
					return ((this - new Date(elements.started_at)) < 0)
				}
			});

			req.addEventListener("failure",function(data){
				liberator.echoerr(data.statusText);
			});
			
			req.get();
		
		}, //}}}
		get_event2 : function(context,args){ //{{{
			let keyword = args.join(",");
			//if(!keyword) return;
			let count = (liberator.globalVariables.atnd_get_count) ? liberator.globalVariables.atnd_get_count : 10 ;


			let req = new libly.Request(
				this.base_url + "events/?keyword=" + keyword + "&format=json&count=" + count , //url
				null, //headers
				{ // options
					asynchronous:true,
				}
			);
			req.addEventListener("success",function(data){
				let res = libly.$U.evalJson(data.responseText);
				if(res.results_returned == 0){
					return ;
				}

				let event_data = [];
				let res_events = res.events.filter(isEnded,new Date());
				for (let i = 0 ; i < res_events.length ; i++) {
					let r = res_events[i];
					event_data.push([r.event_url,r.title + " " + r.started_at + " " + r.catch + " " + r.address]);
				};
				context.incomplete = false;
				context.completions = event_data;

				function isEnded(elements,index,array){
					return ((this - new Date(elements.started_at)) < 0)
				}
			});

			req.addEventListener("failure",function(data){
				context.incomplete = false;
				liberator.echoerr(data.statusText);
			});
			req.get();
		}, // }}}


	} // }}}


	// for debug
	function e(v,c){ // {{{
		if(c) util.copyToClipboard(v);
		liberator.log(v,-1)
	} // }}}

})();

