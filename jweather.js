// INFO //
var INFO = 
<plugin name="jweather.js" version="0.1"
        summary="jweather.js"
        xmlns="http://vimperator.org/namespaces/liberator">
  <author email="mitsugu.oyama@gmail.com">Mitsugu Oyama</author>
  <license href="http://opensource.org/licenses/mit-license.php">MIT</license>
  <project name="Vimperator" minVersion="2.3"/>
  <p>You can check Japanese Weather Report by this plugin.</p>
  <item>
    <tags>'jweather'</tags>
    <spec>:jw<oa>eather</oa> <a>region</a></spec>
    <description>
      <p>You can check Japanese Weather Report by this plugin.</p>
      <p>See. <link topic="http://www.weathermap.co.jp/hitokuchi_rss/">http://www.weathermap.co.jp/hitokuchi_rss/</link></p>
    </description>
  </item>
</plugin>;

commands.addUserCommand(
	['jw[eather]'],
	'display japanese weather report',
	function(args){
    if(1!=args.length){
      liberator.echoerr('argument error');
      return false;
    }
    let region={
      'souya':'1100',
      'kamikawa':'1200',
      'rumoi':'1300',
      'ishikari':'1400',
      'sorachi':'1500',
      'shiribeshi':'1600',
      'abashiri':'1710',
      'kitami':'1720',
      'monbetsu':'1730',
      'nemuro':'1800',
      'kushiro':'1900',
      'tokachi':'2000',
      'iburi':'2100',
      'hidaka':'2200',
      'oshima':'2300',
      'hiyama':'2400',

      'chiba_hokusei':'4510',
      'chiba_hokutou':'4520',
      'chiba_nanbu':'4530',

      'shiga_nanbu':'6010',
      'shiga_hokubu':'6020',
      'kyoto_hokubu':'400',
      'kyoto_nanbu':'6100',
      'osaka':'6200',
      'nara_hokubu':'6410',
      'nara_nanbu':'6420',
      'wakayama_hokubu':'6510',
      'wakayama_nanbu':'6520',
      'hyogo_nanbu':'6310',
      'hyogo_hokubu':'6320',

      'yonaguni':'9500'
    };
    if(!region[args[0]]){
      liberator.echoerr('nothing region');
      return false;
    }
		let rssUrl="http://feedproxy.google.com/hitokuchi_"+region[args[0]];
		let rssDoc;

		let getProb=function(){
			let ret="";
			let non="--";
			let prob=rssDoc.getElementsByTagName("wm:rainfall").item(0).
				getElementsByTagName("wm:prob");
			let probNo=prob.length;
			if(probNo<4){
				let maxNon=4-probNo;
				for(let i=0;i<maxNon;i++) ret=ret+non+"/";
			}
			for(let i=0;i<probNo;i++){
				if(i!=(probNo-1))
					ret=ret+prob.item(i).childNodes.item(0).nodeValue+"/";
				else
					ret=ret+prob.item(i).childNodes.item(0).nodeValue;
			}
			return ret;
		};

		let getTemp=function(){
			let ret;
			let unit=rssDoc.getElementsByTagName("wm:temperature")
				.item(0).getAttribute("unit");
			let max=rssDoc.getElementsByTagName("wm:max")
				.item(0).childNodes.item(0).nodeValue;
			if(max!="--") max=max+unit;
			let min=rssDoc.getElementsByTagName("wm:min")
				.item(0).childNodes.item(0).nodeValue;
			if(min!="--") min=min+unit;
			return max+"/"+min+" ";
		};

		let dispWeather=function(){
			let prefecture=rssDoc.getElementsByTagName("wm:prefecture")
				.item(0).childNodes.item(0).nodeValue;
			let region=rssDoc.getElementsByTagName("wm:region")
				.item(0).childNodes.item(0).nodeValue;
			let weather=rssDoc.getElementsByTagName("wm:weather")
				.item(0).childNodes.item(0).nodeValue;
			liberator.echo(
				prefecture+
				"("+region+") "+
				weather+" "+
				getTemp()+" "+
				getProb()
			);
			util.copyToClipboard(
				prefecture+
				"("+region+") "+
				weather+" "+
				getTemp()+" "+
				getProb(),
				true
			);
		};

		let getWeatherRss=function(){
			let xhr=new XMLHttpRequest();
			xhr.open("GET",rssUrl,true);
			xhr.onreadystatechange=function(aEvt){  
				if(xhr.readyState==4){
					if(xhr.status==200){
						rssDoc=xhr.responseXML;  
						dispWeather();
					}else{  
						liberator.echo("RSS data recieve error!!");  
					}
				}
			}
			xhr.send(null);
		};
		getWeatherRss();
	},
  {
    completer: function(context,arg){
      context.title=['region'];
      context.ignoreCase=true;
      context.anchored=false;
      let allSuggestions=[
        ["souya","\u5b97\u8c37\u5730\u65b9"],
        ["kamikawa","\u4e0a\u5ddd\u5730\u65b9"],
        ["rumoi","\u7559\u840c\u5730\u65b9"],
        ["ishikari","\u77f3\u72e9\u5730\u65b9"],
        ["sorachi","\u7a7a\u77e5\u5730\u65b9"],
        ["shiribeshi","\u5f8c\u5fd7\u5730\u65b9"],
        ["abashiri","\u7db2\u8d70\u5730\u65b9"],
        ["kitami","\u5317\u898b\u5730\u65b9"],
        ["monbetsu","\u7d0b\u5225\u5730\u65b9"],
        ["nemuro","\u6839\u5ba4\u5730\u65b9"],
        ["kushiro","\u91e7\u8def\u5730\u65b9"],
        ["tokachi","\u5341\u52dd\u5730\u65b9"],
        ["iburi","\u80c6\u632f\u5730\u65b9"],
        ["hidaka","\u65e5\u9ad8\u5730\u65b9"],
        ["oshima","\u6e21\u5cf6\u5730\u65b9"],
        ["hiyama","\u6a9c\u5c71\u5730\u65b9"],

        ["chiba_hokusei","\u5343\u8449\u770c\u5317\u897f\u90e8"],
        ["chiba_hokutou","\u5343\u8449\u770c\u5317\u6771\u90e8"],
        ["chiba_nanbu","\u5343\u8449\u770c\u5357\u90e8"],

        ["shiga_nanbu","\u6ecb\u8cc0\u770c\u5357\u90e8"],
        ["shiga_hokubu","\u6ecb\u8cc0\u770c\u5317\u90e8"],
        ["kyoto_hokubu","\u4eac\u90fd\u5e9c\u5317\u90e8"],
        ["kyoto_nanbu","\u4eac\u90fd\u5e9c\u5357\u90e8"],
        ["osaka","\u5927\u962A"],
        ["nara_hokubu","\u5948\u826f\u770c\u5317\u90e8"],
        ["nara_nanbu","\u5948\u826f\u770c\u5357\u90e8"],
        ["wakayama_hokubu","\u548c\u6b4c\u5c71\u770c\u5317\u90e8"],
        ["wakayama_nanbu","\u548c\u6b4c\u5c71\u770c\u5357\u90e8"],
        ["hyogo_nanbu","\u5175\u5eab\u770c\u5357\u90e8"],
        ["hyogo_hokubu","\u5175\u5eab\u770c\u5317\u90e8"],

        ["yonaguni","\u4e0e\u90a3\u56fd\u5cf6"]
      ];
      context.completions = allSuggestions;
    },
    argCount: 0,
    hereDoc: false,
    bang: false,
    count: true,
    literal: true
  },
  true
);
