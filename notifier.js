/**
 * ==VimperatorPlugin==
 * @name            notifier.js
 * @description     notice of change framework.
 * @description-ja  変更通知フレームワーク。
 * @author          suVene suvene@zeromemory.info
 * @version         0.1.0
 * @minVersion      2.0pre
 * @maxVersion      2.0pre
 * Last Change:     07-Dec-2008.
 * ==/VimperatorPlugin==
 *
 * HEAD COMMENT {{{
 *  }}}
 */
(function() {
io.sourceFromRuntimePath(['libly.js']);
if (!liberator.plugins.libly) {
    liberator.log('notifier: needs libly.js');
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
    var logger = $U.getLogger('notifier');

    var Loader = function() {//{{{
        this.initialize.apply(this, arguments);
    };
    Loader.prototype = {
        initialize: function(name, registerHook) {
            liberator.plugins.notifier[name] = this;
            this.name = name;
            this.plugins = [];
            this.registerHook = registerHook;
            this.load(name);
        },
        load: function(name) {
            io.getRuntimeDirectories('plugin/notifier').forEach(function(dir) {
                $U.readDirectory(io.expandPath(dir.path), '^' + name + '_', function(f) {
                    try {
                        io.source(f.path, true)
                        logger.log('plugin load success: ' + f.leafName);
                    } catch (e) {
                        logger.log('plugin load failed: ' + f.leafName);
                    }
                });
            });
        },
        register: function(plugin) {
            this.plugins.push(this.registerHook(plugin));
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
        initialize: function(title, message, options) {
            try {
                if (typeof title == 'undefined' || title == null) throw 'title is undefined.';
                if (typeof message == 'undefined' || message == null) throw 'message is undefined.';
                this.title = title;
                this.message = message;
                this.options = options;
            } catch (e) {
                logger.log('Message.initialize error: ' + e);
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
            if (typeof this.initialize == 'function') this.initialize();
        }
    };//}}}

    var Subject = function() {//{{{
        this.__initialize__.apply(this, arguments);
    };
    Subject.prototype = {
        __initialize__: function(args) {
            this.isActive = false;
            this.observers = [];
            this.interval = 0;
            //if (this.interval < 60) this.interval = 60;
            this.__nextTime = new Date();
            $U.extend(this, args);
            if (typeof this.initialize == 'function') this.initialize();
        },
        attach: function(observer) {
            this.observers.push(observer);
        },
        notify: function(message) {
            if (!message) return;
            this.observers.forEach(function(o) {
                if (!o || typeof o.update != 'function') return;
                try {
                    o.update(message);
                } catch (e) {
                    logger.log(e);
                }
            });
        },
        check: function() { throw 'needs override.' }
    };//}}}

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
                logger.log('bussy.' + this.id);
                return;
            }

            this.isBusy = true;

            commands.addUserCommand(['notifierstart'], 'start the notifier',
                $U.bind(this, function(args) { this.start() }), null, true
            );
            commands.addUserCommand(['notifierrestart'], 'restart the notifier',
                $U.bind(this, function(args) { this.stop($U.bind(this, function() { this.start() })) }),
                null, true
            );
            commands.addUserCommand(['notifierstop'], 'stop the notifier',
                $U.bind(this, function(args) { this.stop() }), null, true
            );

            liberator.plugins.notifier.libly = libly;
            liberator.plugins.notifier.Message = Message;

            this.observers = new Loader('observer', function(args) new Observer(args));
            this.subjects = new Loader('subject', function(args) new Subject(args));

            this.observers.getPlugins().forEach($U.bind(this, function(o) {
                this.subjects.getPlugins().forEach(function(s) s.attach(o));
            }));

            this.isBusy = false;
        },//}}}
        start: function() {//{{{

            if (this.timer) {
                logger.log('already running.' + this.id);
                return;
            }

            if (this.isBusy) {
                logger.log('busy.' + this.id);
                return;
            }

            var start = $U.dateFormat(new Date());
            setTimeout($U.bind(this, function() {
                logger.echo('notifier[' + this.id + '] running at ' + start, commandline.force_singleline);
                this.timer = true;
                while (this.timer) { //{{{
                    liberator.dump('window:' + window.content.window);
                    this.subjects.getPlugins().forEach(function(s) {
                        let now = new Date();
                        if (!s.__nextTime) s.nexttime = now;
                        if (s.interval > 0 && !s.isActive && s.__nextTime <= now) {
                            setTimeout(function() {
                                let start = (new Date()).getTime();
                                s.isActive = true;
                                if (typeof s.check == 'function')
                                    try { s.check(); } catch (e) { logger.log('subject.check error: ' + e) }
                                let stop = (new Date()).getTime();
                                let elapse = (stop - start);
                                s.isActive = false;
                                s.__nextTime = new Date(s.__nextTime.getTime() + s.interval * 1000);
                                if (s.__nextTime < now) s.__nextTime = now;
                            }, 10);
                        }
                    });
                    liberator.sleep(3 * 1000);
                }//}}}
                if (typeof this.finallycallback == 'function') this.finallycallback();
                logger.echo('notifier[' + this.id + '] stopped.(' + start + ')', commandline.force_singleline);
            }), 10);

        },//}}}
        stop: function(finallycallback) {//{{{
            if (!this.timer) {
                logger.log('not running.');
                if (typeof finallycallback == 'function') finallycallback();
                return;
            }
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
// vim: set fdm=marker sw=4 ts=4 sts=0 et:

