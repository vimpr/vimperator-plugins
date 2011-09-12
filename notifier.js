/*** BEGIN LICENSE BLOCK {{{
  Copyright (c) 2008 suVene<suvene@zeromemory.info>

  distributable under the terms of an MIT-style license.
  http://www.opensource.jp/licenses/mit-license.html
}}}  END LICENSE BLOCK ***/
// PLUGIN_INFO//{{{
var PLUGIN_INFO =
<VimperatorPlugin>
  <name>{NAME}</name>
  <description>change notice framework.</description>
  <description lang="ja">変更通知フレームワーク。</description>
  <author mail="suvene@zeromemory.info" homepage="http://zeromemory.sblo.jp/">suVene</author>
  <version>0.1.7</version>
  <license>MIT</license>
  <minVersion>2.0pre</minVersion>
  <maxVersion>2.0pre</maxVersion>
  <updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/notifier.js</updateURL>
  <detail><![CDATA[
== Needs Library ==
- _libly.js(ver.0.1.9)
  @see http://coderepos.org/share/browser/lang/javascript/vimperator-plugins/trunk/_libly.js

== Commands ==
:notifierstart:
  変更通知をスタートします。
:notifierrestart:
  変更通知をリスタートします。
:notifierstop:
  変更通知をストップします。

== Observer ==
=== 概要 ===
通知された変更を扱うオブジェクトを定義します
Subject からの Message オブジェクトを解析し、何らかの動作を行います。
Observer ⇒ Subject への依存は高くて OK です。

=== 命名規約 ===
prefix に "observer_" を付け、"rumtimepath/plugin/notifier" の下にインストールして下さい。
e.g.)"${rumtimepath}/notifier/observer_XXX.js"

=== 登録方法 ===
liberator.plugins.notifier.observer.register(baseClass, extendsMethods)
baseClass:
  基底クラスとなります。現在以下の基底クラスが存在します。
  - liberator.plugins.notifier.Observer
extendsMethosd:
  基底クラスの拡張となるメソッドをハッシュ形式で渡します。
  実装するメソッドは基底クラスのルールに従って下さい。

=== 基底クラスの説明 ===
==== librator.plugins.notifier.Observer ====
Observerの基本クラスです。
initialize():
  必要の無い場合、実装しなくても OK です。
  インスタンス生成時に1度だけフレームワークによって呼び出されます。
  初期化処理など必要な処理を実装して下さい。
update(liberator.plugins.notifier.Message):
  必ず実装して下さい。
  Subject からの変更通知がなされた場合、引数 Message と共にフレームワークより呼び出されます。

== Subject ==
=== 概要 ===
変更を検知し Observer に通知します。
原則、observer との依存を少なくして下さい。
(Message の解析の役割は Observer にある)

=== 命名規約 ===
prefix に "subject_" を付け、"rumtimepath/plugin/notifier" の下にインストールして下さい。
e.g.)"${rumtimepath}/notifier/subject_XXX.js"

=== 登録方法 ===
liberator.plugins.notifier.subject.register(baseClass, extendsMethods)
baseClass:
  基底クラスとなります。現在以下の基底クラスが存在します。
  - liberator.plugins.notifier.Subject
  - liberator.plugins.notifier.SubjectHttp
extendsMethosd:
  基底クラスへの拡張をハッシュ形式で渡します。

=== 基底クラスの説明 ===
==== librator.plugins.notifier.Subject ====
Subject の基本クラスです。
interval:
  秒で変更チェックするインターバルを指定します。デフォルトは 60 です。
initialize():
  必要の無い場合、実装しなくても OK です。
  インスタンス生成時に1度だけフレームワークによって呼び出されます。
  初期化処理など必要な処理を実装して下さい。
check():
  必ず実装して下さい。
  指定したインターバルごとにフレームワークによって呼び出されます。
  変更を検知した場合、liberator.plugins.notifier.Message のインスタンスを引数に
  this.notify(message) を呼び出してください。
shutdown():
  必要の無い場合、実装しなくても OK です。
  変更通知フレームワークの終了時に呼ばれます。

==== librator.plugins.notifier.SubjectHttp ====
Httpを利用した変更検知の基底クラスです。
リクエスト内容をキャッシュします。
interval:
  秒で変更チェックするインターバルを指定します。デフォルトは 60 です。
options{}:
  url:
    URL を指定します。
  headers{}:
    リクエストに header が必要な場合ハッシュで指定します。
  extra{}:
    リクエストのオプションです。ハッシュで指定します。
    以下の key が有効です。
    asynchronous (false), encoding(default utf-8)
parse(liberator.pluginsnotifier.Request):
  必ず実装して下さい。
  リクエストを解析した結果を返却して下さい。
diff(cache, parsed):
  必要の無い場合、実装しなくても OK です。
  デフォルトの実装は cache を返却します。
  this.parse() による解析結果と、そのキャッシュとの差分を抽出して返却して下さい。
buildMessages(diff):
  必ず実装して下さい。
  this.diff() により抽出されたオブジェクトを元に、liberator.plugins.notifier.Message のインスタンス、
  または、その配列を返却して下さい。
  ]]></detail>
</VimperatorPlugin>;
//}}}
(function() {
if (!liberator.plugins.libly) {
  liberator.log("notifier: needs _libly.js");
  return;
}

if (liberator.plugins.notifier && liberator.plugins.notifier._self) {
  liberator.plugins.notifier._self.stop(function() { liberator.plugins.notifier._self = bootstrap(); });
} else {
  liberator.plugins.notifier = {};
  liberator.plugins.notifier._self = bootstrap();
}

function bootstrap() {

  var libly = liberator.plugins.libly;
  var $U = libly.$U;
  var logger = $U.getLogger("notifier");

  var Loader = function() {//{{{
    this.initialize.apply(this, arguments);
  };
  Loader.prototype = {
    initialize: function(name) {
      liberator.plugins.notifier[name] = this;
      this.name = name;
      this.plugins = [];
      this.load(name);
    },
    load: function(name) {
      io.getRuntimeDirectories("plugin/notifier").forEach(function(dir) {
        $U.readDirectory(io.expandPath(dir.path), "^" + name + "_", function(f) {
          try {
            io.source(f.path, true)
            logger.log("plugin load success: " + f.leafName);
          } catch (e) {
            logger.log("plugin load failed: " + f.leafName);
          }
        });
      });
    },
    register: function(baseClass, pluginExtends) {
      this.plugins.push(new baseClass(pluginExtends));
    },
    unregister: function(plugin) {
      var ret = [];
      this.plugins.forEach(function(p) { if (p != plugin) ret.push(p); });
      this.plugins = ret;
    },
    getPlugins: function() {
      return this.plugins;
    }
  };
  //}}}

  var Message = function() {//{{{
    this.initialize.apply(this, arguments);
  };
  Message.prototype = {
    initialize: function(title, message, link, options) {
      try {
        if (typeof title == "undefined" || title == null) throw "title is undefined.";
        if (typeof message == "undefined" || message == null) throw "message is undefined.";
        this.title = title;
        this.message = message;
        this.link = link;
        this.options = options;
      } catch (e) {
        logger.log("Message.initialize error: " + e);
        throw e;
      }
    }
  };//}}}

  var Observer = function() {//{{{
    this.__initialize__.apply(this, arguments);
  };
  Observer.prototype = {
    __initialize__: function(args) {
      $U.extend(this, args);
      if (typeof this.initialize == "function") this.initialize();
    },
    shutdown: function() {}
  };//}}}

  var Subject = function() {//{{{
    this.__initialize__.apply(this, arguments);
  };
  Subject.prototype = {
    __initialize__: function(args) {
      this.isActive = false;
      this.observers = [];
      this.interval = 60;
      this.__nextTime = new Date();
      $U.extend(this, args);
      if (typeof this.initialize == "function") this.initialize();
    },
    attach: function(observer) {
      this.observers.push(observer);
    },
    notify: function(message) {
      if (!message) return;
      this.observers.forEach(function(o) {
        if (!o || typeof o.update != "function") return;
        try {
          o.update(message);
        } catch (e) {
          logger.log(e);
        }
      });
    },
    check: function() { throw "needs override." },
    shutdown: function() {}
  };//}}}

  var SubjectHttp = Subject;//{{{
  $U.extend(SubjectHttp.prototype, {
    initialize: function() {
      this.preInitialized = true;
      this.initialized = false;
      this.count = 0;
      this.cache;

      if (typeof this.preInitialize == "function") this.preInitialized = this.preInitialize();
      if (!this.preInitialized) return;

      var req = new libly.Request(
        this.options.url,
        this.options.headers,
        $U.extend({ asynchronous: true }, this.options.extra)
      );
      req.addEventListener("success", $U.bind(this, function(res) {
        logger.log("initialized");
        if (typeof this.parse == "function") this.cache = this.parse(res);
        if (this.cache)
          this.initialized = true;
      }));
      req.addEventListener("failure", function(res) { logger.log(res); });
      req.addEventListener("exception", function(res) { logger.log(res); });
      if (this.method == "POST")
        req.post();
      else
        req.get();
    },
    check: function() {
      if (!this.initialized) return;

      this.count++;
      var req = new libly.Request(
        this.options.url,
        this.options.headers,
        $U.extend({ asynchronous: true }, this.options.extra)
      );
      req.addEventListener("success", $U.bind(this, function(res) {
        var parsed, diff;
        if (typeof this.parse == "function") parsed = this.parse(res);
        if (parsed && typeof this.diff == "function") diff = this.diff(this.cache, parsed);
        if (diff && (typeof diff.length == "undefined" || diff.length > 0)) {
          this.cache = parsed;
          if (typeof this.buildMessages == "function") {
            let messages = this.buildMessages(diff);
            [].concat(messages).forEach(function(m) {
              this.notify(m);
              liberator.sleep(1500);
            }, this);
          }
        }
      }));
      if (this.method == "POST")
        req.post();
      else
        req.get();
    },
    diff: function(cache, parsed) parsed
  });//}}}

  var Notifier = function() {//{{{
    this.initialize.apply(this, arguments);
  };
  Notifier.prototype = {
    initialize: function(args) {//{{{
      this.id = (new Date()).getTime();
      this.observers;
      this.subjects;
      this.timer = false;
      this.finallycallback;
      this.isBusy = false;
    },//}}}
    setup: function() {//{{{

      if (this.isBusy) {
        logger.log("busy." + this.id);
        return;
      }

      this.isBusy = true;

      commands.addUserCommand([ "notifierstart" ], "start the notifier",
        $U.bind(this, function(args) this.start()), null, true
      );
      commands.addUserCommand([ "notifierrestart" ], "restart the notifier",
        $U.bind(this, function(args) this.stop($U.bind(this, function() { this.start() }))),
        null, true
      );
      commands.addUserCommand([ "notifierstop" ], "stop the notifier",
        $U.bind(this, function(args) this.stop()), null, true
      );

      liberator.plugins.notifier.libly = libly;
      liberator.plugins.notifier.Observer = Observer;
      liberator.plugins.notifier.Subject = Subject;
      liberator.plugins.notifier.SubjectHttp = SubjectHttp;
      liberator.plugins.notifier.Message = Message;

      this.observers = new Loader("observer", function(args) new Observer(args));
      this.subjects = new Loader("subject", function(args) new Subject(args));

      this.observers.getPlugins().forEach($U.bind(this, function(o) {
        this.subjects.getPlugins().forEach(function(s) s.attach(o));
      }));

      liberator.registerObserver("shutdown", $U.bind(this, function() this.stop()));

      this.isBusy = false;
    },//}}}
    start: function() {//{{{

      if (this.timer) {
        logger.log("already running." + this.id);
        return;
      }

      if (this.isBusy) {
        logger.log("busy." + this.id);
        return;
      }

      var start = $U.dateFormat(new Date());
      setTimeout($U.bind(this, function() {
        logger.echo("notifier[" + this.id + "] running at " + start, commandline.force_singleline);
        this.timer = true;
        while (this.timer) { //{{{
          this.subjects.getPlugins().forEach(function(s) {
            let now = new Date();
            if (!s.__nextTime) s.__nextTime = now;
            if (s.interval > 0 && !s.isActive && s.__nextTime <= now) {
              s.isActive = true;
              setTimeout(function() {
                let start = (new Date()).getTime();
                if (typeof s.check == "function")
                  try { s.check(); } catch (e) { logger.log("subject.check error: " + e) }
                let stop = (new Date()).getTime();
                let elapse = (stop - start);
                s.isActive = false;
                s.__nextTime = new Date(s.__nextTime.getTime() + s.interval * 1000);
                if (s.__nextTime < now) s.__nextTime = now;
              }, 1000);
            }
          });
          liberator.sleep(3 * 1000);
        }//}}}
        if (typeof this.finallycallback == "function") this.finallycallback();
        logger.echo("notifier[" + this.id + "] stopped.(" + start + ")", commandline.force_singleline);
      }), 10);

    },//}}}
    stop: function(finallycallback) {//{{{
      if (!this.timer) {
        logger.log("not running.");
        if (typeof finallycallback == "function") finallycallback();
        return;
      }
      this.subjects.getPlugins().forEach(function(s) s.shutdown());
      this.observers.getPlugins().forEach(function(o) o.shutdown());
      this.finallycallback = finallycallback;
      this.timer = false;
    }//}}}
  };//}}}

  var instance = new Notifier();
  instance.setup();
  instance.start();
  return instance;
};

})();
// vim: set fdm=marker sw=2 ts=2 sts=0 et:

