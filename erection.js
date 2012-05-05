/* NEW BSD LICENSE {{{
Copyright (c) 2012, anekos.
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
  <plugin name="erection" version="1.1.1"
          href="http://vimpr.github.com/"
          summary="Show the Erection."
          lang="en-US"
          xmlns="http://vimperator.org/namespaces/liberator">
    <author email="anekos@snca.net">anekos</author>
    <license>New BSD License</license>
    <project name="Vimperator" minVersion="3.0"/>
    <p></p>
    <item>
      <tags>:erection-copy</tags>
      <spec>:erection copy <a>erection</a></spec>
      <description><p>Copy erected text.</p></description>
    </item>
    <item>
      <tags>:erection-show</tags>
      <spec>:erection show <a>erection</a></spec>
      <description><p>Show erected text with the image.</p></description>
    </item>
  </plugin>
  <plugin name="エレクチオン" version="1.1.1"
          href="http://vimpr.github.com/"
          summary="どうしてなの――ッ！！ どうしてエレクチオンしないのよーッ！！"
          lang="ja"
          xmlns="http://vimperator.org/namespaces/liberator">
    <author email="anekos@snca.net">anekos</author>
    <license>New BSD License</license>
    <project name="Vimperator" minVersion="3.0"/>
    <p></p>
    <item>
      <tags>:erection-copy</tags>
      <spec>:erection copy <a>erection</a></spec>
      <description><p>エレクチオンテキストをクリップボードにコピーします。</p></description>
    </item>
    <item>
      <tags>:erection-show</tags>
      <spec>:erection show <a>erection</a></spec>
      <description><p>エレクチオンテキストと画像を表示します。</p></description>
    </item>
  </plugin>
</>;
// }}}

(function () {

  const VERSION = INFO.@version[0];

  function erect (callback) {
    const VC =
      Cc["@mozilla.org/xpcom/version-comparator;1"]
        .getService(Ci.nsIVersionComparator);

    const Store = storage.newMap('erection', {store: true});

    function parentUntil (e, tagName) {
      while (e = e.parentNode) {
        if (e.tagName === tagName)
          return e;
      }
      return;
    }

    function siblingUntil (e, tagName) {
      while (e = e.nextSibling) {
        if (e.tagName === tagName)
          return e;
      }
      return;
    }

    function prop (propName) {
      return function (e) {
        return e[propName];
      }
    }

    function fix (text) {
      return text && text.replace(/[\s\n\r]+|・\\/g, ' ').trim();
    }

    let textContent = prop('textContent');

    function onComplete (xhr) {
      let erections = [];

      let doc = xhr.response;
      for (let [, img] in Iterator(doc.querySelectorAll('td > p > font > img'))) {
        let p = parentUntil(img, 'P');

        let entry = {imageURL: img.src};
        entry.text = Array.map(p.querySelectorAll('strong'), textContent).filter(function (t) !t.replace(/\s+/g, '').match(/^・+$/)).join("\n");
        let [by, from] = Array.map(siblingUntil(p.nextSibling, 'P').querySelectorAll('font'), function (it) it.textContent);
        entry.by = by;
        entry.from = from;

        erections.push(entry);
      }

      for (let [, img] in Iterator(doc.querySelectorAll('td > p > img'))) {
        let p = parentUntil(img, 'P');

        let entry = {imageURL: img.src};
        entry.text = Array.map(p.querySelectorAll('strong'), textContent).filter(function (t) !t.replace(/\s+/g, '').match(/^・+$/)).join("\n");
        let [by, from] = Array.map(siblingUntil(p.nextSibling, 'P').querySelectorAll('font'), textContent);
        entry.by = by;
        entry.from = from;

        erections.push(entry);
      }

      for (let [, e] in Iterator(erections)) {
        for (let [n, t] in Iterator(e)) {
          if (typeof t === 'string')
            e[n] = fix(t);
        }
      }

      Store.set('version', VERSION);
      Store.set('erections', erections);
      Store.save();

      return callback(erections);
    }

    if (VC.compare(Store.get('version'), VERSION) == 0) {
      //liberator.log('Get erections from Cache');
      callback(Store.get('erections'));
      return;
    }

    //liberator.log('Get erections from Web');

    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4)
        onComplete(xhr);
    };
    xhr.open('GET', 'http://doutanuki.web.fc2.com/erection.htm');
    xhr.responseType = 'document';
    xhr.send(null);
  }

  function erectionCompleter (context, args) {
    context.title = ['セリフ', '人物 (出典)'];
    context.compare = false;
    context.incomplete = true;

    context.filters = [CompletionContext.Filter.textDescription];

    erect(function (erections) {
      context.completions = [
        [n + ': ' + e.text, e.by + (e.from || '')]
        for ([n, e] in Iterator(erections))
      ];
      context.incomplete = false;
    });
  }

  function makeErectionCommand (action) {
    return function (args) {
      let num = parseInt(args.literalArg, 10);
      return erect(function (erections) {
        return action(erections[num], args);
      });
    }
  }

  let subOption = {
    literal: 0,
    completer: erectionCompleter
  };

  commands.addUserCommand(
    ['erection'],
    'Erection',
    function (args) {
    },
    {
      subCommands: [
        new Command(
          ['c[opy]'],
          'Copy text',
          makeErectionCommand(function (e) {
            util.copyToClipboard(String(<>{e.text} - {e.by} {e.from} {e.imageURL}</>));
          }),
          subOption
        ),
        new Command(
          ['s[how]'],
          'Show text and image',
          makeErectionCommand(function (e) {
            liberator.echo(<>
              <div style="height: 800px">
                <h1>{e.text}</h1>
                <img src={e.imageURL} />
                <span>{e.by}</span> <span>{e.from}</span>
              </div>
            </>);
          }),
          subOption
        ),
        new Command(
          ['e[xcommand]'],
          'Open command line with select erection',
          makeErectionCommand(function (e, args) {
            let cmdArgs = String(<>{e.text} - {e.by} {e.from} {e.imageURL}</>);
            setTimeout(function () commandline.open('', args[0] + ' ' + cmdArgs, modes.EX), 1);
          }),
          {
            literal: 1,
            completer: function (context, args) {
              if (args.length <= 1) {
                completion.ex(context);
              } else {
                erectionCompleter(context, args);
              }
            }
          }
        )
      ]
    },
    true
  );

  erect(function () void 0);

})();

// vim:sw=2 ts=2 et si fdm=marker:
