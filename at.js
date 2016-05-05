
(function () {
  let store = storage.newMap('at', {store: true});

  let entries = [];

  // 復帰処理
  {
    let _entries = store.get('entries', []);
    if (__context__.loaded) {
      entries = _entries;
    } else {
      let now = new Date().getTime();
      _entries.forEach(function (entry) {
        // FIXME
        // 5 分より前のものは中止する
        // if ((now - entry.time) > (5 * 60 * 1000))
        //   return;
        addEntry(entry.time, entry.command);
      });
    }
  }
  __context__.loaded = true;


  function removeEntryByHandle (handle) {
    entries = entries.filter(function (entry) {
      if (entry.handle == handle) {
        clearTimeout(entry.handle);
        return false;
      } else {
        return true;
      }
    });
    save();
  }

  function addEntry (time, command) {
    let now = new Date().getTime();
    let delta = time - now;
    if (delta <= 0)
      throw "Invalid time";
    let handle =
      setTimeout(
        function (){
          removeEntryByHandle(handle);
          liberator.execute(command);
        },
        delta
      );
    let entry = {
      time: time,
      handle: handle,
      command: command
    };
    entries.push(entry);
    save();
    return entry;
  }

  function entryToString (entry) {
    return 'Do "' + entry.command + '" at ' + new Date(entry.time);
  }

  function save () {
    store.set('entries', entries);
    store.save();
  }

  function parseTimeCode (code) {
    function rin (from, value, to) {
      return from <= value && value <= to;
    }

    let now = new Date();
    let result = now.getTime();

    let m;
    //                          1 Year        2 Month      3 Date          4 Hour    5 Minute
    if (m = code.trim().match(/^(\d{2,4})[-\/](\d{1,2})[-/](\d{1,2})[-_\s](\d{1,2}):(\d{1,2})/)) {
      let [year, month, date, hour, minute] = Array.slice(m, 1).map(function (it) parseInt(it, 10));
      month--;
      if (rin(2000, year, 3000) && rin(1, month, 12) && rin(1, date, 31) && rin(1, hour, 24) && rin(1, minute, 59))
        return new Date(year, month, date, hour, minute, 0, 0).getTime();
    }

    //                          1 Hour    2 Minute 3 Second
    if (m = code.trim().match(/^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?/)) {
      let [hour, minute, second] = Array.slice(m, 1).map(function (it) parseInt(it, 10));
      let [year, month, date] = [now.getYear() + 1900, now.getMonth(), now.getDate()];
      if (rin(1, hour, 24) && rin(0, minute, 59))
        return new Date(year, month, date, hour, minute, second || 0, 0).getTime();
    }

    let rest = code.replace(
      /(\d+(?:\.\d+)?)\s*[hms]/ig,
      function (m) {
        let v = parseFloat(m);
        let p = ({
          'h': 60 * 60 * 1000,
          'm': 60 * 1000,
          's': 1000
        })[m.match(/[hms]/)[0]];
        result += (v * p);
        return '';
      }
    );

    // TODO check
    // if (rest...)

    return result;
  }

  function showEntryList () {
    let msg = (entries.length <= 0) ? `<div>No entry</div>`
                                    : `<dl>
        ${liberator.modules.template.map(entries, function (entry) xml`<li>${entryToString(entry)}</li>`)}
      </dl>`;
    liberator.echo(msg, true);
  }

  commands.addUserCommand(
    ['at'],
    'Do something at ...',
    function (args) {
      showEntryList();
    },
    {
      subCommands: [
        new Command(
          ['a[dd]'],
          'Add a entry',
          function (args) {
            let time = parseTimeCode(args[0]);
            let command = args.literalArg;

            let entry = addEntry(time, command);

            let msg = entryToString(entry);
            liberator.echo(msg);
            liberator.log(msg);
          },
          {
            literal: 1,
            completer: function (context, args) {
              if (args.length > 1) {
                liberator.modules.completion.ex(context);
                return;
              }
              context.title = ['sample time code', 'description'];
              context.completions = [
                ['1h30m', 'Do something in an hour and half later'],
                ['1.5h', 'Do something in an hour and half later'],
                ['30', 'Do something in half an hour later'],
                ['2099/1/3-13:00', 'Do something in 2099/1/3-13:00'],
                ['13:00', 'Do something in 13:00'],
              ];
            }
          }
        ),
        new Command(
          ['r[emove]', 'rm'],
          'Remove a entry',
          function (args) {
            if (args.length <= 0)
              return;
            for (handle of args) {
              removeEntryByHandle(handle);
            }
            liberator.echo('Some "at" entries has been removed.');
          },
          {
            completer: function (context, args) {
              function has (ary, value) {
                return ary.some(function (it) it == value);
              }
              context.title = ['Handle', 'Command'];
              context.completions = entries.filter(function (entry) {
                return !has(args, entry.handle);
              }).map(function (entry) {
                return [entry.handle, entryToString(entry)]
              });
            }
          }
        ),
        new Command(
          ['s[how]'],
          'Show entries',
          function (args) {
            showEntryList();
          }
        )
      ]
    },
    true
  );

})();
