// {{{ INFO
var INFO =xml`
<plugin name="jweather.js" version="0.1"
        summary="Get Japanese Weather Report"
        href="http://github.com/vimpr/vimperator-plugins/blob/master/jweather.js"
        xmlns="http://vimperator.org/namespaces/liberator">
  <author email="mitsugu.oyama@gmail.com">Mitsugu Oyama</author>
  <license href="http://opensource.org/licenses/mit-license.php">MIT</license>
  <project name="Vimperator" minVersion="2.3"/>
  <p>You can check Japanese Weather Report by this plugin.</p>
  <item>
    <tags>'jweather'</tags>
    <spec>:jw<oa>eather</oa> <a>region</a> <oa>1</oa></spec>
    <description>
      <p>You can check Japanese Weather Report by this plugin. If you add second parameter &quot;1&quot;, can take tomorrow weather report.</p>
      <p>See. <link topic="http://www.weathermap.co.jp/hitokuchi_rss/">http://www.weathermap.co.jp/hitokuchi_rss/</link></p>
    </description>
  </item>
</plugin>`;
// }}}

commands.addUserCommand(
	['jw[eather]'],
	'display japanese weather report',
	function(args){
    if(1>args.length){
      liberator.echoerr('argument error');
      return false;
    }
    const TODAY=0;
    const TOMORROW=1;
    let day=TODAY;
    if(args.length==2&&args[1]==1){
      day=TOMORROW;
    }
    let region={
      'hokkaido_souya':'1100',
      'hokkaido_kamikawa':'1200',
      'hokkaido_rumoi':'1300',
      'hokkaido_ishikari':'1400',
      'hokkaido_sorachi':'1500',
      'hokkaido_shiribeshi':'1600',
      'hokkaido_abashiri':'1710',
      'hokkaido_kitami':'1720',
      'hokkaido_monbetsu':'1730',
      'hokkaido_nemuro':'1800',
      'hokkaido_kushiro':'1900',
      'hokkaido_tokachi':'2000',
      'hokkaido_iburi':'2100',
      'hokkaido_hidaka':'2200',
      'hokkaido_oshima':'2300',
      'hokkaido_hiyama':'2400',
      'aomori_tsugaru':'3110',
      'aomori_shimokita':'3120',
      'aomori_sanpachikamikita':'3130',
      'akita_engan':'3210',
      'akita_nairiku':'3220',
      'iwate_nairiku':'3310',
      'iwate_engan_hokubu':'3320',
      'iwate_engan_nanbu':'3330',
      'yamagata_murayama':'3510',
      'yamagata_okitama':'3520',
      'yamagata_syounai':'3530',
      'yamagata_mogami':'3540',
      'miyagi_toubu':'3410',
      'miyagi_seibu':'3420',
      'fukushima_nakadori':'3610',
      'fukushima_hamadori':'3620',
      'fukushima_aizu':'3630',
      'ibaraki_hokubu':'4010',
      'ibaraki_nanbu':'4020',
      'tochigi_nanbu':'4110',
      'tochigi_hokubu':'4120',
      'gunma_nanbu':'4210',
      'gunma_hokubu':'4220',
      'saitama_nanbu':'4310',
      'saitama_hokubu':'4320',
      'saitama_chichibu':'4330',
      'tokyoto_tokyo':'4410',
      'tokyoto_izu_hokubu':'4420',
      'tokyoto_izu_nanbu':'4430',
      'tokyoto_ogasawara':'9600',
      'kanagawa_toubu':'4610',
      'kanagawa_seibu':'4620',
      'chiba_hokusei':'4510',
      'chiba_hokutou':'4520',
      'chiba_nanbu':'4530',
      'shizuoka_tyubu':'5010',
      'shizuoka_izu':'5020',
      'shizuoka_toubu':'5030',
      'shizuoka_seibu':'5040',
      'yamanashi_tyuseibu':'4910',
      'yamanashi_toubu_fujigoko':'4920',
      'nigata_kaetsu':'5410',
      'nigata_tyuetsu':'5420',
      'nigata_jouetsu':'5430',
      'nigata_sado':'5440',
      'nagano_hokubu':'4810',
      'nagano_tyubu':'4820',
      'nagano_nanbu':'4830',
      'toyama_toubu':'5510',
      'toyama_seibu':'5520',
      'ishikawa_kaga':'5610',
      'ishikawa_noto':'5620',
      'fukui_reihoku':'5710',
      'fukui_reinan':'5720',
      'gifu_mino':'5210',
      'gifu_hida':'5220',
      'aichi_seibu':'5110',
      'aichi_toubu':'5120',
      'mie_hokutyubu':'5310',
      'mie_nanbu':'5320',
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
      'okayama_nanbu':'6610',
      'okayama_hokubu':'6620',
      'tottori_toubu':'6910',
      'tottori_tyuseibu':'6920',
      'hiroshima_nanbu':'6710',
      'hiroshima_hokubu':'6720',
      'shimane_toubu':'6810',
      'shimane_seibu':'6820',
      'shimane_oki':'6830',
      'yamaguchi_seibu':'8110',
      'yamaguchi_tyubu':'8120',
      'yamaguchi_toubu':'8130',
      'yamaguchi_hokubu':'8140',
      'kagawa':'7200',
      'tokushima_hokubu':'7110',
      'tokushima_nanbu':'7120',
      'ehime_tyuyo':'7310',
      'ehime_touyo':'7320',
      'ehime_nanyo':'7330',
      'kouchi_tyubu':'7410',
      'kouchi_toubu':'7420',
      'kouchi_seibu':'7430',
      'fukuoka_fukuoka':'8210',
      'fukuoka_kitakyusyu':'8220',
      'fukuoka_chikuhou':'8230',
      'fukuoka_chikugo':'8240',
      'saga_nanbu':'8510',
      'saga_hokubu':'8520',
      'nagasaki_nanbu':'8410',
      'nagasaki_hokubu':'8420',
      'nagasaki_iki_tsushima':'700',
      'nagasaki_gotou':'800',
      'oita_tyubu':'8310',
      'oita_hokubu':'8320',
      'oita_seibu':'8330',
      'oita_nanbu':'8340',
      'kumamoto_kumamoto':'8610',
      'kumamoto_aso':'8620',
      'kumamoto_amakusa_ashikita':'8630',
      'kumamoto_kuma':'8640',
      'miyazaki_nanbuheiyabu':'8710',
      'miyazaki_hokubuheiyabu':'8720',
      'miyazaki_nanbuyamazoi':'8730',
      'miyazaki_hokubuyamazoi':'8740',
      'kagoshima_satsuma':'8810',
      'kagoshima_osumi':'8820',
      'kagoshima_tanegashima_yakushima':'8830',
      'kagoshima_amami':'1000',
      'okinawa_hontou_tyunanbu':'9110',
      'okinawa_hontou_hokubu':'9120',
      'okinawa_kumejima':'9130',
      'okinawa_daitoujima':'9200',
      'okinawa_miyakojima':'9300',
      'okinawa_ishigakijima':'9400',
      'okinawa_yonaguni':'9500'
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
			let prob=rssDoc.getElementsByTagName("wm:rainfall").item(day).
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
				.item(day).getAttribute("unit");
			let max=rssDoc.getElementsByTagName("wm:max")
				.item(day).childNodes.item(0).nodeValue;
			if(max!="--") max=max+unit;
			let min=rssDoc.getElementsByTagName("wm:min")
				.item(day).childNodes.item(0).nodeValue;
			if(min!="--") min=min+unit;
			return max+"/"+min+" ";
		};

		let dispWeather=function(){
			let prefecture=rssDoc.getElementsByTagName("wm:prefecture")
				.item(0).childNodes.item(0).nodeValue;
			let region=rssDoc.getElementsByTagName("wm:region")
				.item(0).childNodes.item(0).nodeValue;
			let weather=rssDoc.getElementsByTagName("wm:weather")
				.item(day).childNodes.item(0).nodeValue;
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
        ["hokkaido_souya","\u5317\u6d77\u9053\u5b97\u8c37\u5730\u65b9"],
        ["hokkaido_kamikawa","\u5317\u6d77\u9053\u4e0a\u5ddd\u5730\u65b9"],
        ["hokkaido_rumoi","\u5317\u6d77\u9053\u7559\u840c\u5730\u65b9"],
        ["hokkaido_ishikari","\u5317\u6d77\u9053\u77f3\u72e9\u5730\u65b9"],
        ["hokkaido_sorachi","\u5317\u6d77\u9053\u7a7a\u77e5\u5730\u65b9"],
        ["hokkaido_shiribeshi","\u5317\u6d77\u9053\u5f8c\u5fd7\u5730\u65b9"],
        ["hokkaido_abashiri","\u5317\u6d77\u9053\u7db2\u8d70\u5730\u65b9"],
        ["hokkaido_kitami","\u5317\u6d77\u9053\u5317\u898b\u5730\u65b9"],
        ["hokkaido_monbetsu","\u5317\u6d77\u9053\u7d0b\u5225\u5730\u65b9"],
        ["hokkaido_nemuro","\u5317\u6d77\u9053\u6839\u5ba4\u5730\u65b9"],
        ["hokkaido_kushiro","\u5317\u6d77\u9053\u91e7\u8def\u5730\u65b9"],
        ["hokkaido_tokachi","\u5317\u6d77\u9053\u5341\u52dd\u5730\u65b9"],
        ["hokkaido_iburi","\u5317\u6d77\u9053\u80c6\u632f\u5730\u65b9"],
        ["hokkaido_hidaka","\u5317\u6d77\u9053\u65e5\u9ad8\u5730\u65b9"],
        ["hokkaido_oshima","\u5317\u6d77\u9053\u6e21\u5cf6\u5730\u65b9"],
        ["hokkaido_hiyama","\u5317\u6d77\u9053\u6a9c\u5c71\u5730\u65b9"],
        ["aomori_tsugaru","\u9752\u68ee\u770c\u6d25\u8efd"],
        ["aomori_shimokita","\u9752\u68ee\u770c\u4e0b\u5317"],
        ["aomori_sanpachikamikita","\u9752\u68ee\u770c\u4e09\u516b\u4e0a\u5317"],
        ["akita_engan","\u79cb\u7530\u770c\u6cbf\u5cb8"],
        ["akita_nairiku","\u79cb\u7530\u770c\u5185\u9678"],
        ["iwate_nairiku","\u5ca9\u624b\u770c\u5185\u9678"],
        ["iwate_engan_hokubu","\u5ca9\u624b\u770c\u6cbf\u5cb8\u5317\u90e8"],
        ["iwate_engan_nanbu","\u5ca9\u624b\u770c\u6cbf\u5cb8\u5357\u90e8"],
        ["yamagata_murayama","\u5c71\u5f62\u770c\u6751\u5c71"],
        ["yamagata_okitama","\u5c71\u5f62\u770c\u7f6e\u8cdc"],
        ["yamagata_syounai","\u5c71\u5f62\u770c\u5e84\u5185"],
        ["yamagata_mogami","\u5c71\u5f62\u770c\u6700\u4e0a"],
        ["miyagi_toubu","\u5bae\u57ce\u770c\u6771\u90e8"],
        ["miyagi_seibu","\u5bae\u57ce\u770c\u897f\u90e8"],
        ["fukushima_nakadori","\u798f\u5cf6\u770c\u4e2d\u901a\u308a"],
        ["fukushima_hamadori","\u798f\u5cf6\u770c\u6d5c\u901a\u308a"],
        ["fukushima_aizu","\u798f\u5cf6\u770c\u4f1a\u6d25"],
        ["ibaraki_hokubu","\u8328\u57ce\u770c\u5317\u90e8"],
        ["ibaraki_nanbu","\u8328\u57ce\u770c\u5357\u90e8"],
        ["tochigi_nanbu","\u6803\u6728\u770c\u5357\u90e8"],
        ["tochigi_hokubu","\u6803\u6728\u770c\u5317\u90e8"],
        ["gunma_nanbu","\u7fa4\u99ac\u770c\u5357\u90e8"],
        ["gunma_hokubu","\u7fa4\u99ac\u770c\u5317\u90e8"],
        ["saitama_nanbu","\u57fc\u7389\u770c\u5357\u90e8"],
        ["saitama_hokubu","\u57fc\u7389\u770c\u5317\u90e8"],
        ["saitama_chichibu","\u57fc\u7389\u770c\u79e9\u7236\u5730\u65b9"],
        ["tokyoto_tokyo","\u6771\u4eac\u5730\u65b9"],
        ["tokyoto_izu_hokubu","\u4f0a\u8c46\u8af8\u5cf6\u5317\u90e8"],
        ["tokyoto_izu_nanbu","\u4f0a\u8c46\u8af8\u5cf6\u5357\u90e8"],
        ["tokyoto_ogasawara","\u5c0f\u7b20\u539f\u8af8\u5cf6"],
        ["kanagawa_toubu","\u795e\u5948\u5ddd\u770c\u6771\u90e8"],
        ["kanagawa_seibu","\u795e\u5948\u5ddd\u770c\u897f\u90e8"],
        ["chiba_hokusei","\u5343\u8449\u770c\u5317\u897f\u90e8"],
        ["chiba_hokutou","\u5343\u8449\u770c\u5317\u6771\u90e8"],
        ["chiba_nanbu","\u5343\u8449\u770c\u5357\u90e8"],
        ["shizuoka_tyubu","\u9759\u5ca1\u770c\u4e2d\u90e8"],
        ["shizuoka_izu","\u9759\u5ca1\u770c\u4f0a\u8c46"],
        ["shizuoka_toubu","\u9759\u5ca1\u770c\u6771\u90e8"],
        ["shizuoka_seibu","\u9759\u5ca1\u770c\u897f\u90e8"],
        ["yamanashi_tyuseibu","\u5c71\u68a8\u770c\u4e2d\u30fb\u897f\u90e8"],
        ["yamanashi_toubu_fujigoko","\u5c71\u68a8\u770c\u6771\u90e8\u30fb\u5bcc\u58eb\u4e94\u6e56"],
        ["nigata_kaetsu","\u65b0\u6f5f\u770c\u4e0b\u8d8a"],
        ["nigata_tyuetsu","\u65b0\u6f5f\u770c\u4e2d\u8d8a"],
        ["nigata_jouetsu","\u65b0\u6f5f\u770c\u4e0a\u8d8a"],
        ["nigata_sado","\u65b0\u6f5f\u770c\u4f50\u6e21"],
        ["nagano_hokubu","\u9577\u91ce\u770c\u5317\u90e8"],
        ["nagano_tyubu","\u9577\u91ce\u770c\u4e2d\u90e8"],
        ["nagano_nanbu","\u9577\u91ce\u770c\u5357\u90e8"],
        ["toyama_toubu","\u5bcc\u5c71\u770c\u6771\u90e8"],
        ["toyama_seibu","\u5bcc\u5c71\u770c\u897f\u90e8"],
        ["ishikawa_kaga","\u77f3\u5ddd\u770c\u52a0\u8cc0"],
        ["ishikawa_noto","\u77f3\u5ddd\u770c\u80fd\u767b"],
        ["fukui_reihoku","\u798f\u4e95\u770c\u5dba\u5317"],
        ["fukui_reinan","\u798f\u4e95\u770c\u5dba\u5357"],
        ["gifu_mino","\u5c90\u961c\u770c\u7f8e\u6fc3\u5730\u65b9"],
        ["gifu_hida","\u5c90\u961c\u770c\u98db\u9a28\u5730\u65b9"],
        ["aichi_seibu","\u611b\u77e5\u770c\u897f\u90e8"],
        ["aichi_toubu","\u611b\u77e5\u770c\u6771\u90e8"],
        ["mie_hokutyubu","\u4e09\u91cd\u770c\u5317\u4e2d\u90e8"],
        ["mie_nanbu","\u4e09\u91cd\u770c\u5357\u90e8"],
        ["shiga_nanbu","\u6ecb\u8cc0\u770c\u5357\u90e8"],
        ["shiga_hokubu","\u6ecb\u8cc0\u770c\u5317\u90e8"],
        ["kyoto_hokubu","\u4eac\u90fd\u5e9c\u5317\u90e8"],
        ["kyoto_nanbu","\u4eac\u90fd\u5e9c\u5357\u90e8"],
        ["osaka","\u5927\u962a\u5e9c"],
        ["nara_hokubu","\u5948\u826f\u770c\u5317\u90e8"],
        ["nara_nanbu","\u5948\u826f\u770c\u5357\u90e8"],
        ["wakayama_hokubu","\u548c\u6b4c\u5c71\u770c\u5317\u90e8"],
        ["wakayama_nanbu","\u548c\u6b4c\u5c71\u770c\u5357\u90e8"],
        ["hyogo_nanbu","\u5175\u5eab\u770c\u5357\u90e8"],
        ["hyogo_hokubu","\u5175\u5eab\u770c\u5317\u90e8"],
        ["okayama_nanbu","\u5ca1\u5c71\u770c\u5357\u90e8"],
        ["okayama_hokubu","\u5ca1\u5c71\u770c\u5317\u90e8"],
        ["tottori_toubu","\u9ce5\u53d6\u770c\u6771\u90e8"],
        ["tottori_tyuseibu","\u9ce5\u53d6\u770c\u4e2d\u897f\u90e8"],
        ["hiroshima_nanbu","\u5e83\u5cf6\u770c\u5357\u90e8"],
        ["hiroshima_hokubu","\u5e83\u5cf6\u770c\u5317\u90e8"],
        ["shimane_toubu","\u5cf6\u6839\u770c\u6771\u90e8"],
        ["shimane_seibu","\u5cf6\u6839\u770c\u897f\u90e8"],
        ["shimane_oki","\u5cf6\u6839\u770c\u96a0\u5c90"],
        ["yamaguchi_seibu","\u5c71\u53e3\u770c\u897f\u90e8"],
        ["yamaguchi_tyubu","\u5c71\u53e3\u770c\u4e2d\u90e8"],
        ["yamaguchi_toubu","\u5c71\u53e3\u770c\u6771\u90e8"],
        ["yamaguchi_hokubu","\u5c71\u53e3\u770c\u5317\u90e8"],
        ["kagawa","\u9999\u5ddd\u770c"],
        ["tokushima_hokubu","\u5fb3\u5cf6\u770c\u5317\u90e8"],
        ["tokushima_nanbu","\u5fb3\u5cf6\u770c\u5357\u90e8"],
        ["ehime_tyuyo","\u611b\u5a9b\u770c\u4e2d\u4e88"],
        ["ehime_touyo","\u611b\u5a9b\u770c\u6771\u4e88"],
        ["ehime_nanyo","\u611b\u5a9b\u770c\u5357\u4e88"],
        ["kouchi_tyubu","\u9ad8\u77e5\u770c\u4e2d\u90e8"],
        ["kouchi_toubu","\u9ad8\u77e5\u770c\u6771\u90e8"],
        ["kouchi_seibu","\u9ad8\u77e5\u770c\u897f\u90e8"],
        ["fukuoka_fukuoka","\u798f\u5ca1\u770c\u798f\u5ca1\u5730\u65b9"],
        ["fukuoka_kitakyusyu","\u798f\u5ca1\u770c\u5317\u4e5d\u5dde\u5730\u65b9"],
        ["fukuoka_chikuhou","\u798f\u5ca1\u770c\u7b51\u8c4a\u5730\u65b9"],
        ["fukuoka_chikugo","\u798f\u5ca1\u770c\u7b51\u5f8c\u5730\u65b9"],
        ["saga_nanbu","\u4f50\u8cc0\u770c\u5357\u90e8"],
        ["saga_hokubu","\u4f50\u8cc0\u770c\u5317\u90e8"],
        ["nagasaki_nanbu","\u9577\u5d0e\u770c\u5357\u90e8"],
        ["nagasaki_hokubu","\u9577\u5d0e\u770c\u5317\u90e8"],
        ["nagasaki_iki_tsushima","\u9577\u5d0e\u770c\u58f1\u5c90\u30fb\u5bfe\u99ac"],
        ["nagasaki_gotou","\u9577\u5d0e\u770c\u4e94\u5cf6"],
        ["oita_tyubu","\u5927\u5206\u770c\u4e2d\u90e8"],
        ["oita_hokubu","\u5927\u5206\u770c\u5317\u90e8"],
        ["oita_seibu","\u5927\u5206\u770c\u897f\u90e8"],
        ["oita_nanbu","\u5927\u5206\u770c\u5357\u90e8"],
        ["kumamoto_kumamoto","\u718a\u672c\u770c\u718a\u672c\u5730\u65b9"],
        ["kumamoto_aso","\u718a\u672c\u770c\u963f\u8607\u5730\u65b9"],
        ["kumamoto_amakusa_ashikita","\u718a\u672c\u770c\u5929\u8349\u30fb\u82a6\u5317\u5730\u65b9"],
        ["kumamoto_kuma","\u718a\u672c\u770c\u7403\u78e8\u5730\u65b9"],
        ["miyazaki_nanbuheiyabu","\u5bae\u5d0e\u770c\u5357\u90e8\u5e73\u91ce\u90e8"],
        ["miyazaki_hokubuheiyabu","\u5bae\u5d0e\u770c\u5317\u90e8\u5e73\u91ce\u90e8"],
        ["miyazaki_nanbuyamazoi","\u5bae\u5d0e\u770c\u5357\u90e8\u5c71\u6cbf\u3044"],
        ["miyazaki_hokubuyamazoi","\u5bae\u5d0e\u770c\u5317\u90e8\u5c71\u6cbf\u3044"],
        ["kagoshima_satsuma","\u9e7f\u5150\u5cf6\u770c\u85a9\u6469\u5730\u65b9"],
        ["kagoshima_osumi","\u9e7f\u5150\u5cf6\u770c\u5927\u9685\u5730\u65b9"],
        ["kagoshima_tanegashima_yakushima","\u9e7f\u5150\u5cf6\u770c\u7a2e\u5b50\u5cf6\u30fb\u5c4b\u4e45\u5cf6\u5730\u65b9"],
        ["kagoshima_amami","\u9e7f\u5150\u5cf6\u770c\u5944\u7f8e\u5730\u65b9"],
        ["okinawa_hontou_tyunanbu","\u6c96\u7e04\u770c\u4e2d\u5357\u90e8"],
        ["okinawa_hontou_hokubu","\u6c96\u7e04\u770c\u5317\u90e8"],
        ["okinawa_kumejima","\u6c96\u7e04\u770c\u4e45\u7c73\u5cf6"],
        ["okinawa_daitoujima","\u6c96\u7e04\u770c\u5927\u6771\u5cf6\u5730\u65b9"],
        ["okinawa_miyakojima","\u6c96\u7e04\u770c\u5bae\u53e4\u5cf6\u5730\u65b9"],
        ["okinawa_ishigakijima","\u6c96\u7e04\u770c\u77f3\u57a3\u5cf6\u5730\u65b9"],
        ["okinawa_yonaguni","\u6c96\u7e04\u770c\u4e0e\u90a3\u56fd\u5cf6\u5730\u65b9"]
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
