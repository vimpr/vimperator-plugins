/* NEW BSD LICENSE {{{
Copyright (c) 2011, anekos.
All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

    1. Redistributions of source code must retain the above copyright notice,
       this list of conditions and the following disclaimer.
    2. Redistributions in binary form must reproduce the above copyright notice,
       this list of conditions and the following disclaimer in the documentation
       and/or other materials provided with the distribution.
    3. The names of the authors may not be used to endorse or promote products
       derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF
THE POSSIBILITY OF SUCH DAMAGE.


###################################################################################
# http://sourceforge.jp/projects/opensource/wiki/licenses%2Fnew_BSD_license       #
# に参考になる日本語訳がありますが、有効なのは上記英文となります。                #
###################################################################################

}}} */

// INFO {{{
let INFO =
<>
  <plugin name="usi.js" version="1.3.2"
          href="http://vimpr.github.com/"
          summary="for Remember The Milk."
          lang="en-US"
          xmlns="http://vimperator.org/namespaces/liberator">
    <author email="anekos@snca.net">anekos</author>
    <license>New BSD License</license>
    <project name="Vimperator" minVersion="3.0"/>
    <p>See ( ◕ ‿‿ ◕ ) the completions.</p>
    <item>
      <tags>:usi</tags>
      <spec>:usi</spec>
      <description><p></p></description>
    </item>
  </plugin>
</>;
// }}}

(function () {
  // Constants {{{
  const AppName = 'usi';
  const APIKey = '0ac1fa2a426b535212518bf9a9e55e23';
  const APISecret = '75a925384404568d';
  const Save = storage.newMap(AppName, {store: true});

  // }}}

  // Combo {{{
  function Combo (block) {
    return function () {
      let it;
      let c = {
        next: function (result) {
          setTimeout(function () {
            if (!it)
              return;
            try {
              c.result = result;
              it.send(result);
            } catch (e if e instanceof StopIteration) {}
          }, 0);
        },
        result: void 0
      };
      it = block(c, arguments);
      it.next();
    };
  }
  // }}}

  // Cache {{{

  CacheAge = 10 * 1000 * 60;

  const StorageCache = (function () {
    let store = storage.newMap(AppName + '-cache', {store: true});

    return {
      get: function (key) let (v = store.get(key)) (v && v.value),

      set: function (key, value, age)
        store.set(key, {value: value, expire: new Date().getTime() + (age || CacheAge)}),

      remove: function (key) store.remove(key),

      clear: function () store.clear(),

      has: function (key) {
        const Nothing = {};
        let found = store.get(key, Nothing);
        return (found !== Nothing) && found && (found.expire - new Date().getTime() > 0);
      }
    };
  })();

  const Cache = StorageCache;

  const CompletionCache = (function (key) {
    const cache = {};

    return {
      get: function (key, args) {
        return cache[key][parseInt(args.string, 10)];
      },

      remove: function (key) {
        delete cache[key];
      },

      complete: function (key, context, args, items) {
        function procOpts (desc, opts) {
          if (opts && opts.warn)
            return <span highlight="ErrorMsg">{desc}</span>;
          else
            return desc;
        }
        context.compare = void 0;
        context.completions = [
          [i + ': ' + name, procOpts(desc, opts)]
          for ([i, [name, desc, value, opts]] in Iterator(items))
        ];
        cache[key] = items.map(function ([,, v]) v);
      }
    };

  })();

  const Transactions = (function () {
    let data = storage.newArray(AppName + '-transaction', {store: true});

    return {
      __iterator__: function () Iterator(data),

      push: function (id, desc) {
        data.push({id: id, desc: desc});
      },

      pop: function (index) {
        data.get(index);
        data.truncate(index);
        Cache.clear();
      }
    };
  })();

  // }}}

  const Utils = { // {{{
    // TODO エラー処理
    httpGet: function (url, onComplete, synchronize) {
      let xhr = new XMLHttpRequest();
      xhr.open('GET', url, !!onComplete);
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status == 200 && !synchronize)
          return onComplete(xhr);
      };
      xhr.send();
      if (synchronize)
        return onComplete(xhr);
    },

    md5: function (str) {
      function toHexString (charCode)
        ("0" + charCode.toString(16)).slice(-2);

      const conv = Cc["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Ci.nsIScriptableUnicodeConverter);
      const crypto = Cc["@mozilla.org/security/hash;1"].createInstance(Ci.nsICryptoHash);

      conv.charset = 'UTF-8';
      let result = {};
      let data = conv.convertToByteArray(str, result);

      crypto.init(crypto.MD5);
      crypto.update(data, data.length);

      let binCode = crypto.finish(false);
      return [toHexString(binCode.charCodeAt(i)) for(i in binCode)].join("");
    },

    copy: function (obj) {
      let result = {};
      for (let [k, v] in Iterator(obj))
        result[k] = v;
      return result;
    },

    joinParams: function (params) {
      return [
        encodeURIComponent(k) + '=' + encodeURIComponent(v)
        for ([k, v] in Iterator(params))
      ].join('&');
    },

    echo: function (msg) {
      liberator.echo('[' + AppName + '] ' + msg);
    },

    echoerr: function (msg) {
      liberator.echoerr('[' + AppName + '] ' + msg);
    },

    log: function (msg) {
      liberator.log(
        '[' + AppName + '] ' + (
          typeof msg == 'string' ? msg :
          msg instanceof XML     ? msg : msg
        )
      );
    },

    toDate: function (date) {
      let dateStr = String(date);
      return dateStr && new Date(String(dateStr));
    },

    toSmartDateText: function (target) {
      const Hour = 1000 * 60 * 60;
      const Day = Hour * 24;

      function cutTime (date) {
        return new Date(date.getYear(), date.getMonth(), date.getDate());
      }

      function beforeAfter (n) {
        return (n > 0 ? 'after' : 'before');
      }

      target = Utils.toDate(target);
      if (!target)
        return '';

      let now = new Date();
      let [targetDay, nowDay] = [cutTime(target), cutTime(now)];
      let dDay = (targetDay.getTime() - nowDay.getTime()) / Day;
      let dHour = Math.floor((target.getTime() - now.getTime()) / Hour);

      let base = target.getHours() === 0 ? target.toLocaleFormat('%Y/%m/%d (%a)')
                                         : target.toLocaleFormat('%Y/%m/%d (%a) %H:%M');
      let prefix;
      if (dDay == 0){
        prefix = Math.abs(dHour) + ' hours ' + beforeAfter(dHour);
      } else if (dDay == -1) {
        prefix = 'Yesterday';
      } else if (dDay == 1) {
        prefix = 'Tomorrow';
      } else if (Math.abs(dDay) <= 7) {
        prefix = Math.abs(dDay) + ' days ' + beforeAfter(dDay);
      }
      //Utils.log([result, dHour, dDay, targetDay, nowDay]);
      return prefix ? prefix + ' - ' + base : base;
    },

    timeArraySort: function (list) {
      let n = new Date().getTime();
      list.sort(function ([a], [b]) {
        let ad = a - n, bd = b - n;
        if (ad < bd)
          return -1;
        if (ad > bd)
          return 1;
        return 0;
      });
      return list;
    }
  }; // }}}

  const Cow = { // {{{
    get: function (_params, {onComplete, onFail, cache, timeline, pre, synchronize}) { // {{{
      function toResult (text)
        (new XMLList(text));

      let args = arguments;
      let params = Utils.copy(_params);
      let key;

      if (!onComplete)
        onComplete = function () Utils.echo('Success: ' + params.method);

      if (!onFail)
        onFail = function (result) {
          let msg = params.method + ' was failed: ' + result.err.@msg;
          Utils.echoerr(msg);
          Utils.log(msg);
          if (Save.get('authorized') && result.err.@code == "98") {
            Save.clear();
            Save.save();
            Cow.openAuthPage();
          }
        };

      if (!pre && !Save.get('authorized'))
        return Cow.getToken(function () Cow.get.apply(Cow, args));


      if (pre) {
        // key = Utils.joinParams(params);
      } else {
        params.auth_token = Save.get('token');

        if (cache && Cache.has(cache)) {
          Utils.log('Get from cache: ' + cache);
          return onComplete(toResult(Cache.get(cache)));
        }

        if (timeline) {
          let timelineValue = Save.get('timeline');
          if (timelineValue) {
            params.timeline = timelineValue;
          } else {
            Utils.log('create timeline');
            Cow.get(
              {
                method: 'rtm.timelines.create',
              },
              {
                synchronize: synchronize,
                onComplete: function (result) {
                  let timeline = result.timeline;
                  Save.set('timeline', timeline);
                  Cow.get.apply(Cow, args);
                }
              }
            );
            return;
          }
        }
      }


      let url = Cow.makeURL(params);
      Utils.log('Get from remote: ' + url);
      return Utils.httpGet(
        url,
        function (xhr) {
          let text = xhr.responseText.replace(/^<\?[^\?]+\?>/, '');
          let result = toResult(text);
          if (result.@stat == 'ok') {
            if (!pre)
              Cache.set(cache, text);
            onComplete(result);
          } else {
            onFail(result);
          }
        },
        synchronize
      );
    }, // }}}

    makeURL: function (_params, base) { // {{{
      function makeSig (params) {
        let keys = [k for ([k] in Iterator(params))];
        keys.sort();

        let paramString = [
          k + params[k]
          for ([, k] in Iterator(keys))
        ].join('');

        return Utils.md5(APISecret + paramString);
      }

      let params = Utils.copy(_params);
      params.api_key = APIKey;
      params.api_sig = makeSig(params);
      let paramString = Utils.joinParams(params);
      return (base || 'http://api.rememberthemilk.com/services/rest/') + '?' + paramString;
    }, // }}}

    openAuthPage: function () { // {{{
      Utils.log('openAuthPage');
      Cow.get(
        {
          method: 'rtm.auth.getFrob',
        },
        {
          pre: true,
          onComplete: function (result) {
            let frob = String(result.frob);
            Save.set('frob', frob);
            Save.save();
            Utils.log('Got frob: ' + frob);
            let url =
              Cow.makeURL(
                {
                  perms: 'delete',
                  frob: frob
                },
                'http://www.rememberthemilk.com/services/auth/'
              );
            liberator.open(url, liberator.NEW_TAB);
          }
        }
      );
    }, // }}}

    getToken: function (onComplete) { // {{{
      Utils.log('Start to get token');

      Cow.get(
        {
          method: 'rtm.auth.getToken',
          frob: Save.get('frob')
        },
        {
          pre: true,
          onComplete: function (result) {
            Save.set('token', String(result.auth.token));
            Save.set('user.id', String(result.auth.user.@id));
            Save.set('user.name', String(result.auth.user.@name));
            Save.set('user.fullname', String(result.auth.user.@fullname));
            Save.set('authorized', true);
            Save.save();

            onComplete();
          },

          onFail: function (result) {
            Utils.log(result);
            Cow.openAuthPage();
          }
        }
      );
    }, // }}}

    checkAuth: function (onAuthorized) { // {{{
      Cow.get(
        {
          method: 'rtm.auth.checkToken',
          auth_token: Save.get('token')
        },
        {}
      )
    }, //}}}

    showTasks: Combo(function (c, [lists]) { // {{{
      Cow.get(
        {
          method: 'rtm.lists.getList',
        },
        {
          cache: 'lists.getList',
          onComplete: function (result) {
            let table = {};
            for (let [k, v] in Iterator(result.lists.list))
              table[v.@id] = v.@name;
            c.next(table);
          }
        }
      );

      let table = yield;

      Cow.get(
        {
          method: 'rtm.tasks.getList',
          filter: 'status:incomplete'
        },
        {
          cache: 'rtm.tasks.getList?filter=status:incomplete',
          onComplete: function (result) {
            let cs = [];
            for (let [, list] in Iterator(result.tasks.list)) {
              if (lists && lists.every(function (name) table[list.@id] != name))
                continue;
              for (let [, taskseries] in Iterator(list.taskseries)) {
                for (let [, task] in Iterator(taskseries.task)) {
                  cs.push([
                    let (d = Utils.toDate(task.@due))
                      (d ? d.getTime() : Infinity),
                    [taskseries.@name, Utils.toSmartDateText(task.@due)]
                  ]);
                }
              }
            }
            let n = new Date().getTime();
            Utils.timeArraySort(cs);
            let contents = <></>;
            for (let [, [d, [a, b]]] in Iterator(cs)) {
              let hl = (n - d) > 0 ? 'ErrorMsg' : '';
              contents += <tr highlight={hl}><td>{a}</td><td>{b}</td></tr>;
            }
            liberator.echo(<><table>{contents}</table></>);
          }
        }
      );
    }), // }}}
  }; // }}}

  const CommandOptions = { // {{{
    lists: [
      ['-lists', '-l'],
      commands.OPTION_LIST,
      null,
      function (context, args) {
        return Cow.get(
          {
            method: 'rtm.lists.getList',
          },
          {
            synchronize: true,
            cache: 'lists.getList',
            onComplete: function (result) {
              let [, prefix] = context.filter.match(/^(.*,)[^,]*$/) || [];
              if (prefix)
                  context.advance(prefix.length);
              return [
                [v.@name, v.@id]
                for ([k, v] in Iterator(result.lists.list))
              ];
            }
          }
        );
      }
    ]
  };
  // }}}

  // Command maker {{{

  function TaskActionOnComplete (text) {
    return function (result) {
      let echoText = text + ': ' + result.list.taskseries.@name;
      let due = Utils.toSmartDateText(result.list.taskseries.task.@due);
      if (due)
        echoText += ' (' + due + ')';
      if (result.transaction.@undoable)
        Transactions.push(result.transaction.@id, echoText);
      Utils.echo(echoText);
    }
  }

  function SelectorCommand ({names, cache, description, action, onComplete, timeline, completionMethod, completionList, completer}) { // {{{
    let ccKey = names + ':' + Utils.md5(Error().stack);
    return new Command(
      names instanceof Array ? names : [names],
      description,
      function (args) {
        Cow.get(
          action(CompletionCache.get(ccKey, args)),
          {
            timeline: timeline,
            onComplete: onComplete
          }
        );
        CompletionCache.remove(ccKey);
        if (typeof cache === 'string')
          Cache.remove(cache);
      },
      {
        literal: 0,
        completer: completer || function (context, args){
          context.incomplete = true;
          Cow.get(
            completionMethod,
            {
              cache: cache || true,
              onComplete: function (result) {
                context.incomplete = false;
                CompletionCache.complete(ccKey, context, args, completionList(result));
              }
            }
          );
        }
      }
    );
  } // }}}

  function TaskSelectorCommand ({key, method, filter, cache, names, description, onComplete}) { // {{{
    let ccKey = names + ':' + Utils.md5(Error().stack);
    if (!cache)
      cache = 'rtm.tasks.getList?filter=status:incomplete';
    return new Command(
      names instanceof Array ? names : [names],
      description,
      function (args) {
        Cow.get(
          let ([list, taskseries, task] = CompletionCache.get(ccKey, args)) ({
            method: 'rtm.' + key,
            list_id: list.@id,
            taskseries_id: taskseries.@id,
            task_id: task.@id
          }),
          {
            timeline: true,
            onComplete: onComplete
          }
        );
        CompletionCache.remove(ccKey);
        if (typeof cache === 'string')
          Cache.remove(cache);
      },
      {
        literal: 0,
        options: [CommandOptions.lists],
        completer: Combo(function (c, [context, args]) {
          context.incomplete = false;

          Cow.get(
            {
              method: 'rtm.lists.getList',
            },
            {
              cache: 'lists.getList',
              onComplete: function (result) {
                let table = {name2id: {}, id2name: {}};
                for (let [k, v] in Iterator(result.lists.list)) {
                  table.name2id[v.@name] = v.@id;
                  table.id2name[v.@id] = v.@name;
                }
                c.next(table);
              }
            }
          );

          let table = yield;

          let lists = args['-lists'] || [];

          context.filter =
            context.filter.replace(
              /\s*#(\S+)\s*/g,
              function (m, name) (table.name2id[name] ? (lists.push(name), '') : m)
            );

          Cow.get({
              method: 'rtm.tasks.getList',
              filter: filter || 'status:incomplete'
            },
            {
              cache: cache,
              onComplete: function (result) {
                let cs = [];
                let n = new Date().getTime();
                for (let [, list] in Iterator(result.tasks.list)) {
                  if (lists.length && lists.every(function (name) table.id2name[list.@id] != name))
                    continue;
                  for (let [, taskseries] in Iterator(list.taskseries)) {
                    for (let [, task] in Iterator(taskseries.task)) {
                      cs.push(let (d = Utils.toDate(task.@due)) [
                        (d ? d.getTime() : Infinity),
                        [taskseries.@name, Utils.toSmartDateText(task.@due), [list, taskseries, task], {warn: d < n}]
                      ]);
                    }
                  }
                }

                // 現在に近い順に並べます
                Utils.timeArraySort(cs);
                CompletionCache.complete(ccKey, context, args, cs.map(function ([a, b]) b));
              }
            }
          )
        })
      }
    );
  } // }}}
  // }}}

  // Level 3 {{{

  TaskSubCommands = [ // {{{
    // add {{{
    new Command(
      ['a[dd]'],
      'Add a task',
      function (args) {
        Cow.get(
          {
            method: 'rtm.tasks.add',
            parse: 1,
            name: args.literalArg
          },
          {
            timeline: true,
            onComplete: TaskActionOnComplete('Task was added')
          }
        )
      },
      {
        literal: 0,
        completer: function (context, args) {
          let SmartAddCompleter = {
            '#': function () {
              context.incomplete = true;
              Cow.get(
                {
                  method: 'rtm.lists.getList',
                },
                {
                  cache: 'lists.getList',
                  onComplete: function (result) {
                    context.completions = [
                      [v.@name, v.@id]
                      for ([k, v] in Iterator(result.lists.list))
                    ];
                    context.incomplete = false;
                  }
                }
              );
            },

            '*': function () {
              // FIXME 数字含みのパターンをちゃんと補完する
              const Items = 'daily, weekly, biweekly, monthly, yearly, after 1 day, after 1 week, after 1 year';
              context.completions = [
                [v, v]
                for ([, v] in Iterator(Items.split(/,\s*/)))
              ];
            },

            '=': function () {
              // FIXME 数字含みのパターンをちゃんと補完する
              const Items = '1 min, 5 min, 1 hr';
              context.completions = [
                [v, v]
                for ([, v] in Iterator(Items.split(/,\s*/)))
              ];
            },

            '!': function () {
              context.completions = [
                ['1', 'High priority'],
                ['2', 'Middle priority'],
                ['3', 'Low priority']
              ];
            },

            'http': function () {
              const Items = 'http://snca.net/, http://kurinton.net/';
              context.completions = [
                [v, v]
                for ([, v] in Iterator(Items.split(/,\s*/)))
              ];
            },
          };

          // FIXME http が補完できない
          let left = args.string.slice(0, context.caret);
          let m = /(?:^|\s)([#!@=*^]|http)([^#!@=*^]*)$/.exec(left);
          if (m) {
            let completer = SmartAddCompleter[m[1]];
            if (completer) {
              context.compare = void 0;
              let pos = left.length - m[1].length - m[2].length + (m[1].length == 1 ? 1 : 0);
              context.advance(pos);
              completer();
              return;
            }
          }
        }
      }
    ), // }}}
    // complete {{{
    TaskSelectorCommand({
      key: 'tasks.complete',
      names: 'c[omplete]',
      description: 'Complete a task',
      onComplete: TaskActionOnComplete('Task was completed')
    }), // }}}
    // uncomplete {{{
    TaskSelectorCommand({
      key: 'tasks.uncomplete',
      names: 'u[ncomplete]',
      description: 'Uncomplete a task',
      cache: 'rtm.tasks.getList?filter=status:completed',
      filter: 'status:completed',
      onComplete: TaskActionOnComplete('Task was uncompleted')
    }), // }}}
    // delete {{{
    TaskSelectorCommand({
      key: 'tasks.delete',
      names: 'd[elete]',
      description: 'Delete a task',
      onComplete: TaskActionOnComplete('Task was deleted')
    }), // }}}
    // postpone {{{
    TaskSelectorCommand({
      key: 'tasks.postpone',
      names: 'p[ostpone]',
      description: 'Postpone a task',
      onComplete: TaskActionOnComplete('Task was postponed')
    }), // }}}
    new Command(
      ['s[how]'],
      'Show tasks',
      function (args) {
        Cow.showTasks(args.length && args);
      },
      {
        completer: function (context, args) {
          context.incomplete = true;

          Cow.get(
            {
              method: 'rtm.lists.getList',
            },
            {
              synchronize: true,
              cache: 'lists.getList',
              onComplete: function (result) {
                context.completions = [
                  [v.@name, v.@id]
                  for ([k, v] in Iterator(result.lists.list))
                ];
                context.incomplete = false;
              }
            }
          );
        }
      }
    )
  ]; // }}}

  TransactionSubCommands = [ // {{{
    let (ccKey = 'transaction/undo')
    new Command(
      ['undo'],
      'Undo your ooops',
      function (args) {
        let [i, tId] = CompletionCache.get(ccKey, args);
        Cow.get(
          {
            method: 'rtm.transactions.undo',
            transaction_id: tId
          },
          {
            timeline: true,
            onComplete: function (result) {
              Utils.echo('Task was undid.');
              Cache.clear();
            }
          }
        );
      },
      {
        literal: 0,
        completer: function (context, args) {
          CompletionCache.complete(
            ccKey, context, args,
            [
              [t.desc, '', [i, t.id]]
              for ([i, t] in Iterator(Transactions))
            ]
          );
        }
      }
    )
  ]; // }}}

  // }}}

  // Level 2 {{{

  MainSubCommands = [
    new Command(
      ['t[ask]'],
      'Task control',
      function (args) {
        Cow.showTasks(args['-lists']);
      },
      {
        options: [CommandOptions.lists],
        subCommands: TaskSubCommands
      }
    ),
    new Command(
      ['c[ache]'],
      'Cache control',
      function (args) {
      },
      {
        subCommands: [
          new Command(
            ['clear'],
            'Clear all cache data',
            function () Cache.clear()
          )
        ]
      }
    ),
    new Command(
      ['tr[ansaction]', 'T'],
      'Transaction control',
      function () {
      },
      {
        subCommands: TransactionSubCommands
      }
    )
  ];

  // }}}

  // Level 1 {{{
  commands.addUserCommand(
    ['usi'],
    'for Remember The Milk',
    function (args) {
      if (Save.get('authorized'))
        liberator.execute('usi task');
      else
        Cow.openAuthPage();
    },
    {
      subCommands: MainSubCommands
    },
    true
  );
  // }}}

})();

// vim:sw=2 ts=2 et si fdm=marker:


