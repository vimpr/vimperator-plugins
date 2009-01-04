var PLUGIN_INFO =
<VimperatorPlugin>
  <name>UserAgentSwitcherLite</name>
  <description>switch user agent</description>
  <description lang='ja'>user agent 切り替え</description>
  <version>0.1.0</version>
  <author homepage='http://d.hatena.ne.jp/pekepekesamurai/'>pekepeke</author>
  <minVersion>2.0pre</minVersion>
  <maxVersion>2.0pre</maxVersion>
  <detail lang='ja'><![CDATA[
 == Commands
  :ua [uaname]       - User Agent を切り替えます。
  :ua                - User Agent を表示します。

 == .vimperatorrrc
javascript <<EOM
liberator.globalVariables.useragent_list = [
{
  description: 'Internet Explorer 7 (Windows Vista)',
  useragent: 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0)',
  appname: 'Microsoft Internet Explorer',
  appversion: '4.0 (compatible; MSIE 7.0; Windows NT 6.0)',
  platform: 'Win32',
}, {
  description: 'Netscape 4.8 (Windows Vista)',
  useragent: 'Mozilla/4.8 [en] (Windows NT 6.0; U)',
  appname: 'Netscape',
  appversion: '4.8 [en] (Windows NT 6.0; U)',
  platform: 'Win32',
}, {
  description: 'Google',
  useragent: 'Googlebot/2.1 (+http://www.google.com/bot.html)',
}];
EOM
  ]]></detail>
</VimperatorPlugin>;


liberator.plugins.UserAgentSwitcherLite = (function(){

const USER_AGENT = 'general.useragent.override';
const APP_NAME = 'general.appname.override';
const APP_VERSION = 'general.appversion.override';
const PLATFORM = 'general.platform.override';
const VENDOR = 'general.useragent.vendor';
const VENDOR_SUB = 'general.useragent.vendorSub';
const DEFAULT = 'Default';

var global = liberator.globalVariables;
global.useragent_list = global.useragent_list ? global.useragent_list : [
  {
    description: 'Internet Explorer 7 (Windows Vista)',
    useragent: 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0)',
    appname: 'Microsoft Internet Explorer',
    appversion: '4.0 (compatible; MSIE 7.0; Windows NT 6.0)',
    platform: 'Win32',
    vendor: '',
    vendorSub: ''
  }, {
    description: 'Netscape 4.8 (Windows Vista)',
    useragent: 'Mozilla/4.8 [en] (Windows NT 6.0; U)',
    appname: 'Netscape',
    appversion: '4.8 [en] (Windows NT 6.0; U)',
    platform: 'Win32',
    vendor: '',
    vendorSub: ''
  }, {
    description: 'Opera 9.25 (Windows Vista)',
    useragent: 'Opera/9.25 (Windows NT 6.0; U; en)',
    appname: 'Opera',
    appversion: '9.25 (Windows NT 6.0; U; en)',
    platform: 'Win32',
  }
];

var Class = function(){ return function(){ this.initialize.apply(this, arguments); }};

var UASwitcherLite = new Class();
UASwitcherLite.prototype = {
  initialize: function(){
    // init
    this.completer = [];
    this.switcher = {
      __noSuchMethod__: function(arg) liberator.echoerr('cannot switch useragent "'+arg+'"'),
      '':function(){
        var ua = options.getPref(USER_AGENT);
        liberator.echo('Current User Agent : ' + (ua ? ua : DEFAULT) );
      }
    };
    var self = this;

    // default values
    this.completer.push([DEFAULT , '']);
    this.switcher[DEFAULT] = function() self.switch();
    
    // expand setting
    global.useragent_list.forEach( function(item){
      let desc = item.description;
      let userAgent = item.useragent;
      let appName = item.appname;
      let appVersion = item.appversion;
      let platform = item.platform;
      let vendor = item.vendor;
      let vendorSub = item.vendorSub;
      self.completer.push([desc, userAgent]);
      self.switcher[desc] = function() self.switch(appName, appVersion, platform, userAgent, vendor, vendorSub);
    });
    this.registerCommand();
  },
  switch: function(appName, appVersion, platform, userAgent, vendor, vendorSub){
    if (!userAgent && !options.getPref(USER_AGENT)) return;
    let setter = userAgent ? options.setPref : options.resetPref;
    setter(APP_NAME, decodeURIComponent(appName || ''));
    setter(APP_VERSION, decodeURIComponent(appVersion || ''));
    setter(PLATFORM, decodeURIComponent(platform || ''));
    setter(USER_AGENT, decodeURIComponent(userAgent || ''));
    setter(VENDOR, decodeURIComponent(vendor || ''));
    setter(VENDOR_SUB, decodeURIComponent(vendorSub || ''));

  },
  registerCommand: function(){
    var self = this;
    commands.addUserCommand(['ua'], 'Switch User Agent',
      function(arg) 
        self.switcher[ arg.string ? arg.string.replace(/\\/g,''): (arg+'').replace(/\\/g,'') ](),
      {
        completer: function(context, args, special){
          let filter = context.filter;
          context.title = ['Description', 'User Agent'];
          if (!filter) {
            context.completions = self.completer;
            return;
          }
          filter = filter.toLowerCase();
          context.completions = self.completer.filter( function(el) el[0].toLowerCase().indexOf(filter) == 0 );
        }
    } );
  }
};
return new UASwitcherLite();
})();
