// ==VimperatorPlugin==
// @name           Stat Stat
// @description    Show information on statusline.
// @description-ja ステータスラインに情報を表示
// @license        Creative Commons Attribution-Share Alike 3.0 Unported
// @version        1.0
// @author         anekos (anekos@snca.net)
// @minVersion     2.0pre
// @maxVersion     2.0pre
// ==/VimperatorPlugin==
//
// Usage:
//    :statstat <JS_EXPRESSION>
//
// Usage-ja:
//    :statstat <JS_EXPRESSION>
//
// Links:
//    http://d.hatena.ne.jp/nokturnalmortum/20081202/1228218135
// License:
//    http://creativecommons.org/licenses/by-sa/3.0/


(function () {

  let stat = liberator.plugins.statstat;
  let defaultExpression = liberator.globalVariables.statstat_expression;
  let defaultInterval = liberator.globalVariables.statstat_interval;
  let autorun = s2b(liberator.globalVariables.statstat_autorun, false);

  function s2b (s, d) (!/^(\d+|false)$/i.test(s)|parseInt(s)|!!d*2)&1<<!s;
  function e2a (e) function () liberator.eval(e);

  // Initialize
  if (stat) {
    let e = stat.panel;
    if (e && e.parentNode)
      e.parentNode.removeChild(e);
    if (stat.handle) {
      clearInterval(stat.handle);
      stat.handle = null;
    }
  }

  {
    let panel = this.panel = document.createElement('statusbarpanel');
    panel.setAttribute('id', 'ank-stat-stat-panel');
    let label = document.createElement('label');
    label.setAttribute('value', '-----');
    panel.appendChild(label);
    let stbar = document.getElementById('status-bar');
    stbar.insertBefore(panel, document.getElementById('liberator-statusline').nextSibling);

    stat = liberator.plugins.statstat = {
      panel: panel,
      label: label,
      interval: 1000,
      set text (value) this.label.setAttribute('value', '<- ' + value + ' ->'),
      action: function () new Date().toLocaleString(),
      execute: function () (this.text = this.action.apply(this, arguments)),
      run: function () {
        let self = this;
        Array.slice(arguments).forEach(function (v) {
          if (v instanceof Function)
            self.action = v;
          else if (typeof v == 'string')
            self.action = function () liberator.eval(v);
          else if (typeof v == 'number')
            self.interval = v;
        });
        this.handle = setInterval(function () self.execute(), this.interval);
      },
      handle: null
    };
  }

  // set default
  if (defaultExpression)
    stat.action = e2a(defaultExpression);
  if (defaultInterval)
    stat.interval = parseInt(defaultInterval);
  if (autorun)
    stat.run();

  commands.addUserCommand(
    ['statstat'],
    'Run statstat',
    function (arg) {
      if (stat.handle)
        clearInterval(stat.handle);
      let interval = arg.count ? arg.count * 100 : 100;
      stat.action = e2a(arg.string);
      stat.handle = setInterval(function () stat.execute(), interval);
    },
    {
      completer: function (context) completion.javascript(context),
      argCount: '*',
      count: true
    },
    true
  );

})();

// vim:sw=2 ts=2 et si fdm=marker:
