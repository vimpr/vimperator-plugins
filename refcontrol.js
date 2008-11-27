/**
 * ==VimperatorPlugin==
 * @name           refcontrol
 * @description    control referrer
 * @description-ja リファラー制御
 * @version        0.1.0
 * ==/VimperatorPlugin==
 *
 * Usage:
 *
 * :togglerefcontrol    - 有効/無効のトグルです。(ステータスバーのアイコンクリックでも切り替え可能)
 * :addref              - リファラー設定追加(再起動すると消えます)
 *
 * .vimperatorrc
 * g:localkeymode_enable : [true=有効/false=無効(デフォルト)]
 *
 *  .vimperatorrrc 設定例:
 * let g:refcontrol_enabled = "true"
 * javascript <<EOM
 * liberator.globalVariables.refcontrol={
 *  '@DEFAULT'   : '@FORGE',
 *  'tumblr.com' : '@FORGE',
 *  'del.icio.us': '@NORMAL',
 * //domain       : param,
 * };
 * EOM
 *
 * domain>
 *  '@DEFAULT' はデフォルト設定を指します。
 *
 * param>
 *  @NORMAL : 通常の動作です。
 *  @FORGE  : ドメインのルートをリファラにセットします。
 *  ''      : リファラーを送信しません
 *  url     : 指定したURLでリファラーを送信します。
 *
 *  備考:
 *
 */
liberator.plugins.RefControl = (function() {

const Cc = Components.classes;
const Ci = Components.interfaces;

const ENABLE_ICON = 'data:image/png;base64,'
      + 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAABnRSTlMA/wAAAP+JwC+QAAAB'
      + 't0lEQVR4nI1RTWsTURQ9d96bTJpMW8bY0pEspB80IBJtQzctkpWI4KrgHxAFQXDlxh8gKBTc'
      + 'uHXRje78Af6AoqCCVSjBfi9MGakyJiZ5X9dFFZPpIl7O5r17zj3vnkcMlkFhbvX29LWbU5eX'
      + 'hO9jsNjZo80Pe69fbb14pto/JJE3e/1O7f7jcCwvPIAzfJAQ5WqtNFu1lrx1X4xPX7x0d22y'
      + 'POU0XA9WDcBpWAVY5ITITVSSTxsyiOJCKTYK7LKz/5kQLGG0NBlEsSSSYGkU+NRjMmUMeX5e'
      + 'Omaj2eghbABGMzNLZjba6f8UOJYAWct2mIAZ1sAxpNXt7q+fQb5I5P3dMcMFwMxOKWW6qew0'
      + 'd1rHh+MTsemaP79ARCAQgZnBJ2mIQKTJbqe543WSw8bzB0myz5F0YeDCwAXSglWvp7TW2tq8'
      + 'jzO54/Sosf6wdfCZGAxgdKYWziyG5xdAVCzPR5WVEc+adi/99vX77tvW9pvW9vu0scHsTiwH'
      + 'QMKPFm9Un3ysv9RLT7+MVer9XXk6EGcV3qHQvHC2fiu+eq8wt4ytgQyyDv0I56+cW33UfzNE'
      + 'wGBRjPqPvwHSQByM8Fg+IQAAAABJRU5ErkJggg==';

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
  var domain = args.arguments[0];
  var perf = args.arguments[1] || '';
  if (!domain || /[:\/]/.test(domain)) {
    liberator.echo(dump(sites)+'usage: addref [domain] [@NORMAL or @FORGE or empty]');
    return;
  }
  sites[domain] = perf;
  }, {
    completer: function(context, arg, special) {
      //var last = context.contextList.slice(-1)[0];
      var args = arg.arguments;
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
