var PLUGIN_INFO = xml`
<VimperatorPlugin>
  <name>autoproxychanger</name>
  <description>setting proxy</description>
  <description lang="ja">proxyの設定・自動切り替え</description>
  <version>0.1.3</version>
  <author homepage="http://d.hatena.ne.jp/pekepekesamurai/">pekepeke</author>
  <minVersion>2.0pre</minVersion>
  <maxVersion>2.0pre</maxVersion>
  <updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/autoproxychanger.js</updateURL>
  <detail><![CDATA[
    == Usage ==
      :proxy [setting_name]:
        set proxy setting to setting_name
      :proxy!:
        set proxy setting to default setting
      :toggleautoproxy:
        proxy autochanger on/off toggle

      The proxy_settings is a string variable which can set on
      vimperatorrc as following.

      >||
      let autochanger_proxy_settings = "[{ name:'disable', usage: 'direct connection', proxy:{type:0} }]"
      let autochanger_proxy_enabled = "true"
      ||<

      or your can set it using inline JavaScript.

      >||
      liberator.globalVariables.autochanger_proxy_enabled = true;
      liberator.globalVariables.autochanger_proxy_settings = [{
          name  : 'disable',
          usage : 'direct connection',
          proxy :{
            type      :0,
          },
        },{
          name  : 'http',
          usage : 'localhost proxy',
          proxy :{
            type      : 1,
            http      : 'localhost',
            http_port : 8080,
          },
          url   : /http:\/\/www.nicovideo.jp/,
          run   : 'java.exe',
          args  : ['C:\Personal\Apps\Internet\NicoCacheNl\NicoCache_nl.jar'],
        }];
      EOM
      ||<
  ]]></detail>
</VimperatorPlugin>`;

liberator.plugins.AutoProxyChanger = (function() {
var gVar = liberator.globalVariables;
var proxy_settings = gVar.autochanger_proxy_settings;
if (!proxy_settings) {
  proxy_settings = [{
    name  : 'disable',
    usage : 'direct connection',
    proxy : {
      type      : 0,
    },
  }, {
    name  : 'http',
    usage : 'localhost:8080',
    proxy : {
      type      : 1,
      http      : 'localhost',
      http_port : 8080,
    },
  }];
}

const ENABLE_ICON = 'data:image/png;base64,'
  + 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAABnRSTlMA/wAAAIBJekM9AAAB'
  + 'mElEQVR4nIWS3StDYRzHv895njOvaWy4WWPJcquE8nIrbSW54mrGjWsppbQtCuXajZd/QDKs'
  + 'UNxoLpYbKc1b2zm4mJ2NsGPNOC6OnHXGfO+eb8/neX6fp4e43aNWax3+iCgKK6uW3IZZrXXT'
  + '01OEkPzdiqL4fLPja04Al6H97aU3AAwAIcTmmMsHIoFJAIvDfgDja31Y8n8Dapw97cUGSilH'
  + 'CUlnshuB41+H1IDMJ5QsMb2cc3LMALha4fXOAPB6KIAKYcfroaIoaMBTKltaSqvlWGElDQgd'
  + 'nwBwtf6jxFRUXQDfYxRQYqIo+Hyz+eepSm/y+3MqI6czmvTVdbh/wGFvbBJuI2ZT9dbmbq4S'
  + '4w3l5ZTjOA1wOHuNxkrhNsIYLyXiOqX8MADBYFD3Gj9Kuh4AUeDJbUfcd4W/FhtbbEmfrT9+'
  + 'lJ0eBSJRl05JSsTNphop8WCrbwiHzw8O92j34EQtiZU1D7XZSpYtF51dHXa7XUrGGeNfUy8c'
  + 'x6XkV57xiaRUZawyFPFMTt4no9HHm2X1hvkFvZIuXyp4v/YfvuEoAAAAAElFTkSuQmCC';

const DISABLE_ICON = 'data:image/png;base64,'
  + 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAABnRSTlMA/wAAAIBJekM9AAAB'
  + 'i0lEQVR4nH2SwUoCURSG/7lzZwJxYWqtRItQwm3LbCkStol8gLAW9QzB4AgW9QIJWc8QgVBI'
  + '7RQ3bsOmQGdsY466aCZ1RGwxksNo/rt7uN+55ztcJpk89vsD+CeKIt/e+awV6vcHBOGMYZjZ'
  + '2+PxOJ3OZK+9ACqVyk3OB4ACYBgmGo3OAoVCAcDJaRNA9noLueYEMBOLxXieZ1mWEDIYDPL5'
  + '/Nwhp8BoNBoOh71er9/vA4hEIqIoAqyYYgGgqYopVlHkKaBpmsPhMAxDEIQFSlOgXC6bjRcr'
  + 'URM1DwBEUVysRBVFTqczlkasVUnXdU3TTKsJ8P5R3T+Ih4KbcqPm9aw83D9alSilTqeTEDIF'
  + '4nu7Ltey3KhRyqntlk1p/lqLxaJtG39KtjoAZoyUtXqU/Fz8tejFOS9JkmEYpVKpVj+0Kant'
  + 'ltezqra/1tc2qtXX55cnNpFIcBwXDoeDwWDO9xbZ2Q6FQmqnRSmn6d+EEP1H4yjX7qhul5tf'
  + '4mi3263X65IkmS9cXtmVbPkFaGbHAxyF/18AAAAASUVORK5CYII=';

var acmanager = [];

const prefkeys = ['ftp','gopher','http','ssl', 'socks'];
var prevSetting = null;
var _isEnable = false;
var exec = (function(){
  const Cc = Components.classes;
  const Ci = Components.interfaces;
  var getFile = function(){
    if (arguments.length <= 0) return null;
    var file = Cc['@mozilla.org/file/local;1'].createInstance(Ci.nsILocalFile);
    if (!file) return null;

    file.initWithPath(arguments[0]);
    for (var i=1; i<arguments.length; i++) file.append(arguments[i]);
    if (file.exists() && file.isFile) return file;
    return null;
  };
  var getPathSplitChar = function(){
    var os = Cc["@mozilla.org/xre/app-info;1"].createInstance(Ci.nsIXULRuntime).OS;
    if (os == "WINNT") return ";";
    return ":";
  };
  var run = function(file, arg, async){
    arg = arg || [];
    var process = Cc["@mozilla.org/process/util;1"].createInstance(Ci.nsIProcess);
    process.init(file);
    process.run(false, arg, arg.length);
    return process.exitValue;
  };
  const spchar = getPathSplitChar();
  return function(cmd, arg, async){
    var file;
    if ( (cmd.indexOf('/') >= 0 || cmd.indexOf('\\') >= 0) && (file=getFile(cmd)) ) return run(file, arg, async);

    var env = Cc["@mozilla.org/process/environment;1"].getService(Ci.nsIEnvironment);
    var exitValue = null;
    env.get('PATH').split(spchar).some(
      function(path){
        if (file=getFile( path, cmd)){
          exitValue = run(file, arg, async);
          return true;
        }
        return false;
      }
    );
    return exitValue;
  };
})();

var ProxyChanger = function() this.initialize.apply(this, arguments);
ProxyChanger.prototype = {
  initialize: function() {
    this.panel = this.createPanel();
  },
  createPanel: function() {
    var self = this;
    var panel = document.getElementById('proxychanger-status');
    if (panel) {
      let parent = panel.parentNode;
      parent.removeChild(panel);
    }
    panel = document.createElement('statusbarpanel');
    panel.setAttribute('id', 'proxychanger-status');
    panel.setAttribute('class', 'statusbarpanel-iconic');
    panel.setAttribute('src', self.isEnable ? ENABLE_ICON : DISABLE_ICON);
    panel.addEventListener('click', function(e) { self.isEnable = !self.isEnable; }, false);
    var statusbar = document.getElementById('status-bar');
    statusbar.insertBefore(
      panel, statusbar.firstChild);
    return panel;
  },
  get isEnable() _isEnable,
  set isEnable(val) {
    this.panel.setAttribute('src', val ? ENABLE_ICON : DISABLE_ICON);
    _isEnable = val;
  },
  autoApplyProxy : checkApplyProxy
};
var manager = new ProxyChanger();

function init() {
  if(typeof proxy_settings === 'string')
    proxy_settings=eval(proxy_settings)
  // initialize manager
  proxy_settings.forEach(function(s) {
    if (s.url instanceof RegExp && s.name)
      acmanager.push( {url: s.url, name: s.name, run: s.run || '', args: s.args || [] } );
  });

  proxy_settings.splice(0, 0, {name: 'default', usage: 'default setting', proxy: restore() });

  if (acmanager.length > 0) {
    autocommands.add("LocationChange", '.*', 'js liberator.plugins.AutoProxyChanger.autoApplyProxy()');
    window.addEventListener("unload", function() {
      if (prevSetting != null) applyProxy(prevSetting)
    }, false);
  }

  manager.isEnable = eval(gVar.autochanger_proxy_enabled) || false;
}
function restore() {
  var opt = new Object();
  opt['type'] = options.getPref('network.proxy.type', 0);
  prefkeys.forEach(function(key) {
    opt[key] = options.getPref('network.proxy.' + key, '');
    opt[key+'_port'] = options.getPref('network.proxy.' + key + '_port', 0);
  });
  return opt;
}
function dump(obj) {
  var m = '';
  for (let key in obj) m+=key+':'+obj[key]+'\n';
  return m;
}
function checkApplyProxy() {
  if (prevSetting != null) {
    applyProxy(prevSetting);
    prevSetting = null;
  }
  if (!_isEnable) return;
  acmanager.some( function( manager ) {
    if (manager.url.test(content.location.href)) {
      prevSetting = restore();
      try {
        if (manager.run) {
          if (exec(manager.run, manager.args, false) == null) throw "run process failed...";
          manager.run = null; manager.args = null;
        }
        applyProxyByName(manager.name);
        return true;
      } catch(e) {
        liberator.echoerr(e);
        return true;
      }
    }
    return false;
  });
}

function applyProxyByName( name ) {
  if (!name) {
    liberator.echo( dump(restore())+'usage:proxy [setting name]' );
    return;
  }
  proxy_settings.some( function(setting) {
    if (setting.name.toLowerCase() != name.toLowerCase()) return false;
    // delete setting
    prefkeys.forEach( function(key) {
      options.setPref('network.proxy.'+key, '');
      options.setPref('network.proxy.'+key+'_port', 0);
    });

    // apply proxy
    applyProxy(setting.proxy);
    return true;
  });
}

function applyProxy(proxy) {
  for (let key in proxy) {
    if (typeof proxy[key] != 'undefined')
      options.setPref('network.proxy.'+key, proxy[key]);
  }
}

commands.addUserCommand(['proxy'], 'Proxy settings',
  function(args) {
    if (args.bang) applyProxyByName('default');
    else applyProxyByName(args.string);
  }, {
    bang: true,
    completer: function(context, arg) {
      context.title = ['Name', 'Usage'];
      var list = context.filter ?
        proxy_settings.filter( function(el) this.test(el.name), new RegExp('^'+context.filter))
        : proxy_settings;
      context.completions = list.map( function(v) [v.name, v.usage] );
    }
});

commands.addUserCommand(['toggleautoproxy','aprxy'], 'Toggle auto proxy changer on/off',
  function() {
    manager.isEnable = !manager.isEnable
    liberator.echo('autoproxy:'+ manager.isEnable ? 'ON' : 'OFF');
  }, {}
);

init();
return manager;
})();
