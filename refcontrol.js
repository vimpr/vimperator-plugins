var PLUGIN_INFO =
<VimperatorPlugin>
  <name>refcontrol</name>
  <description>control referrer</description>
  <description lang="ja">リファラー制御</description>
  <version>0.1.0a</version>
  <author homepage="http://d.hatena.ne.jp/pekepekesamurai/">pekepeke</author>
  <minVersion>2.0pre</minVersion>
  <maxVersion>2.0pre</maxVersion>
  <updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/refcontrol.js</updateURL>
  <detail><![CDATA[
== コマンド ==
:togglerefcontrol:
  有効/無効のトグルです。(ステータスバーのアイコンクリックでも切り替え可能)
:addref:
  リファラー設定追加(再起動すると消えます)

== .vimperatorrrc 設定例 ==
>||
let g:refcontrol_enabled = "true"
javascript <<EOM
liberator.globalVariables.refcontrol={
 [domain]     : [param],
 '@DEFAULT'   : '@FORGE',
 'tumblr.com' : '@FORGE',
 'del.icio.us': '@NORMAL',
};
EOM
||<

domain:
 '@DEFAULT' はデフォルト設定を指します。
param:
  @NORMAL:
    通常の動作です。
  @FORGE:
    ドメインのルートをリファラにセットします。
  '':
    リファラーを送信しません
  url:
    指定したURLでリファラーを送信します。
  ]]></detail>
</VimperatorPlugin>;

liberator.plugins.RefControl = (function() {

const Cc = Components.classes;
const Ci = Components.interfaces;

const ENABLE_ICON = 'data:image/png;base64,'
      + 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAABnRSTlMA/wAAAP+JwC+QAAAB'
      + 'qklEQVR4nI1RPWgUYRSct/stexc3xvX8udV4BhPUiI1RUsnVglgJCh52aaxs0llrpZVNWhVr'
      + 'wdZCFGwsohCRJKAmqLnoheDd5X52v2+/sUiEzfoTh6mGmfeY94RgVK3tGd537MKV8plJ1/Ow'
      + 'HbTpt7k3S8+eNBaX6i8fS7l6bWL60d6DSbC74DoAc36IICV6Hf39qzt797rqfZnjj8Xg6Enb'
      + 'h7Ug824A4qCoPM+s6PVl5YfRQCkyCWjzs7ctEQyWDvhhpEQUqEySn/07jBHHKyhLGk2jd3AD'
      + 'MJokFUmjrf7PgKUCJE2Z7hQgkRpYQqW60++2/cIuEedXx5wXAEmbJInpt5QfDm+sfx7aH5m+'
      + '2fqCiEAgApLg5jVc3201PvVWPwrBofHzp6cfhpURagcAjEVs0kRDBBAn8N0BadZX3t+/sfb6'
      + 'qRAEMDh6Lhg9G4xMQOT4xaluzKKTmk7cWquXxsbeztzc+DDbXHgFYCuQRVStxZ125ertsDLe'
      + 'XV2en5lqzj/PVuIfWTx86kjt3uSDuHzpVlb/a2CTwYnqoct3soqDf6K98MI23mWVn59g+pcs'
      + 'KKOSAAAAAElFTkSuQmCC';

const DISABLE_ICON = 'data:image/png;base64,'
      + 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAABnRSTlMA/wAAAP+JwC+QAAAB'
      + 'kklEQVR4nIVSzWoiQRCu/hkdHRh7dfxZNmGH5CasV0/eosx75OL7+AI+wZK8hDcvySQkgouQ'
      + 'Q0RwMpdo07ZdOTRpREP2o/noqvq+ruqmCQLyYvn3r5+9Xi+KomKxSAhhjJVKJc/zdrvder3O'
      + 'smwymcxfXtV7ToCQ/tXVcDgMw5BSaow5ZQCQUo7H4783t/z87GwwGPi+r5SytSM4Z5IkaZpS'
      + 'IUSr1TLGSCkBQCl1xDZvjBFCCCG4LZzqvmRCCLVuKaWU0m6+YQCgxhg3vc26SZzOCpRSiEjd'
      + 'O7gbu8McnGe73XL5CUqpUxyF1q+U0lrz/X6/Wq2q1ap9DYtCoXAYAoDv+8vlkjHGsrfs+uU6'
      + 'juN6vc45Z4x5nqe11lojIiISQoIg4JyPRqOn5yeCgADQ+dMRQlQqlXK5jIi1Wq3ZbIZhuNls'
      + 'ZrPZYrHI8/w+TRENtx3v7u9c98uLyyAIkiSJoijP8+l0+vD44Kr89C/M/80BoAOdOI673W6j'
      + '0YDHgzICfrPa7Xa/3z/M/MeAgCz4cRh+AOxEaXXUX/5aAAAAAElFTkSuQmCC';

var sites;
var _isEnable = false;

const completer_params = [['', 'send referrer:nothing'],
    ['@FORGE', 'send referrer:top domain URL'],
    ['@NORMAL', 'send referrer:normal']];

// icon manager object
var Class = function() function() {this.initialize.apply(this, arguments);};
var RefControl = new Class();

RefControl.prototype = {
  initialize : function() {
    this.panel = this.createPanel();
    this.isEnable = eval(liberator.globalVariables.refcontrol_enabled) || false;
  },
  createPanel: function() {
    var self = this;
    var panel = document.getElementById('refcontrol-status-panel');
    if (panel) {
      let parent = panel.parentNode;
      parent.removeChild(panel);
    }
    panel = document.createElement('statusbarpanel');
    panel.setAttribute('id', 'refcontrol-status-panel');
    panel.setAttribute('class', 'statusbarpanel-iconic');
    panel.setAttribute('src', self.isEnable ? ENABLE_ICON : DISABLE_ICON);
    panel.addEventListener('click', function(e) { self.isEnable = !self.isEnable; }, false);
    document.getElementById('status-bar').insertBefore(
      panel, document.getElementById('security-button').nextSibling);
    return panel;
  },
  get isEnable() _isEnable,
  set isEnable(val) {
    this.panel.setAttribute('src', val ? ENABLE_ICON : DISABLE_ICON);
    _isEnable = val;
  },
};

// some utilities
var init = function() {
  // read settings
  sites = liberator.globalVariables.refcontrol;
  if (typeof sites == 'undefined') sites = new Object();
  if (typeof sites['@DEFAULT'] == 'undefined') sites['@DEFAULT'] = '@NORMAL';
};

var dump = function(obj) {
  var m = '';
  for (let key in obj) {
    m+=key+':'+obj[key]+'\n';
  }
  return m;
};

init();
var manager = new RefControl();

// add user command
commands.addUserCommand(['addref'], 'add referrer control setting', function(args) {
  var domain = args[0];
  var perf = args[1] || '';
  if (!domain || /[:\/]/.test(domain)) {
    liberator.echo(dump(sites)+'usage: addref [domain] [@NORMAL or @FORGE or empty]');
    return;
  }
  sites[domain] = perf;
  }, {
    completer: function(context, args) {
      //var last = context.contextList.slice(-1)[0];
      var list;
      var pos = 0;
      if (args.length == 2) {
        context.title = ['Params', 'Description'];
        list = completer_params;
        //pos = 1;
      } else if (args.length <= 1) {
        context.title = ['URL', 'Description'];
        list = [['@DEFAULT', 'default preference'], [window.content.location.host, '']];
      }
      context.completions = list;
      context.advance(pos);
    }
  }
);

commands.addUserCommand(['togglerefcontrol'], 'toggle referrer control on/off',
  function() {
    manager.isEnable = !manager.isEnable;
  }, {}
);

// register refcontrol
var adjustRef = function(http, site) {
  var sRef, refAction;
  try {
    refAction = sites[site];
    if (refAction == undefined) return false;
    if (refAction.charAt(0) == '@') {
      switch (refAction) {
        case '@NORMAL':
          return true;
        case '@FORGE':
          sRef = http.URI.scheme + '://' + http.URI.hostPort + '/';
          break;
        default:
          return false;
      }
    } else if (refAction.length > 0) sRef = refAction;

    http.setRequestHeader('Referer', sRef, false);
    if (http.referrer)
      http.referrer.spec = sRef;
    return true;
  } catch (e) {}
  return false;
};

Cc['@mozilla.org/observer-service;1'].getService(Ci.nsIObserverService).addObserver({
  observe: function(subject, topic, data) {
    if (topic != 'http-on-modify-request') return;
    if (!_isEnable) return;
    var http = subject.QueryInterface(Ci.nsIHttpChannel);
    for (let s = http.URI.host; s != ''; s = s.replace(/^[^.]*(?:\.|$)/, ''))
      if (adjustRef(http, s)) return;
    adjustRef( http, '@DEFAULT');
  }
}, 'http-on-modify-request', false);

return manager;

})();
