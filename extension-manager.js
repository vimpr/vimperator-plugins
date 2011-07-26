/* NEW BSD LICENSE {{{
Copyright (c) 2010, anekos.
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

// PLUGIN_INFO {{{
let PLUGIN_INFO =
<VimperatorPlugin>
  <name>extension manager</name>
  <name lang="ja">アドオン管理</name>
  <description>extension manager</description>
  <description lang="ja">アドオンを管理します。</description>
  <version>1.1.0</version>
  <author mail="anekos@snca.net" homepage="http://d.hatena.ne.jp/nokturnalmortum/">anekos</author>
  <license>new BSD License (Please read the source code comments of this plugin)</license>
  <license lang="ja">修正BSDライセンス (ソースコードのコメントを参照してください)</license>
  <updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/extensions-manager.js</updateURL>
  <minVersion>2.3</minVersion>
  <maxVersion>2.3</maxVersion>
  <detail><![CDATA[
    アドオンの有効無効状態を保存＆復帰できるプラギン
    詳しくはヘルプを読んでくれよ。
    :help extension-manager-plugin
  ]]></detail>
  <detail lang="ja"><![CDATA[
    Store / Restore current extensions state.
    read the help with the below command.
    ":help extension-manager-plugin"
  ]]></detail>
</VimperatorPlugin>;
// }}}
// INFO {{{
let INFO =
<>
  <plugin name="extension-manager" version="1.1.0"
          href="http://github.com/vimpr/vimperator-plugins/blob/master/extension-manager.js"
          summary="extension manager"
          lang="en-US"
          xmlns="http://vimperator.org/namespaces/liberator">
    <author email="anekos@snca.net">anekos</author>
    <license>New BSD License</license>
    <project name="Vimperator" minVersion="2.3"/>
    <p>
      Extention manager death yohooo
    </p>
    <item>
      <tags>:extstate</tags>
      <spec>:exts<oa>tate</oa> <a>sub-command</a> <a>name</a> <oa>extension-names...</oa></spec>
      <description>
        <p>
          Store or restore current extensions state with <a>name</a>.
          <p>The following <a>sub-commands</a> are interpreted.</p>
          if the <oa>extension-names</oa> arguments are specified,
          this command is only for these extensions.
          <ul>
            <li>store</li>
            <li>restore</li>
          </ul>
        </p>
      </description>
    </item>
  </plugin>
  <plugin name="extension-manager" version="1.1.0"
          href="http://github.com/vimpr/vimperator-plugins/blob/master/extension-manager.js"
          summary="extension manager"
          lang="ja"
          xmlns="http://vimperator.org/namespaces/liberator">
    <author email="anekos@snca.net">anekos</author>
    <license>New BSD License</license>
    <project name="Vimperator" minVersion="2.3"/>
    <p>
      extention manager
    </p>
    <item>
      <tags>:extstate</tags>
      <spec>:exts<oa>tate</oa> <a>sub-command</a> <a>name</a> <oa>extension-names...</oa></spec>
      <description>
        <p>
          拡張の有効無効状態を <a>name</a> で保存復帰します。
          <oa>extension-names</oa> で拡張名を指定しておくと、指定された拡張のみが保存復帰の対象になります。
          <p>以下の <a>sub-commands</a> があります。</p>
          <dl>
            <dt>store</dt><dd>保存</dd>
            <dt>restore</dt><dd>復帰</dd>
          </dl>
        </p>
      </description>
    </item>
    <item>
      <tags>:extbisect</tags>
      <spec>:extbisect <a>sub-command</a></spec>
      <description>
        <p>
          問題のある拡張などをあぶり出すためのコマンドです。
          二分探索ぽい方法よって、効率的に困った拡張を探し出します。
          自動的に拡張の有効無効を切り替えていくので、かなり楽が出来ると思います。
        </p>
        <p>
          作業手順。
          (ok fail start を実行すると自動的に再起動します)
          <ol>
            <li>":extbisect start" で開始</li>
            <li>問題が起きていないかテスト</li>
            <li>起きていなければ":extbisect ok"、起きていれば":extbisect fail"を実行</li>
            <li>再起動するので、2 を再び繰り返す。</li>
          </ol>
          <p>
            問題のある拡張がなんであるか、確定したら ok/fail したときにメッセージが出ます。
            メッセージを確認したら、":extbisect reset" で拡張の状態を元に戻してください。
          </p>
          <p>
            テストを行うことで、エラーで Firefox が終了してしまう場合は、再起動後に ok / fail を実行してください。
          </p>
        </p>
      </description>
    </item>
  </plugin>
</>;
// }}}


(function () {

  let states = storage.newMap('plugins-extman-states', {store: true});
  let bisect = storage.newMap('plugins-extman-bisect', {store: true});

  states.modify = bisect.modify = function (name, func) this.set(name, func(this.get(name)));

  function xabled (id, enable)
    services.get("extensionManager")[enable ? 'enableItem' : 'disableItem'](id);

  function xabledWithName (name, enable)
    xabled(liberator.getExtension(name), enable);

  function cmp (s1, s2)
    (s1.toLowerCase() == s2.toLowerCase());

  function extFilter (exts, names)
    (names && names.length) ? exts.filter(function (ext) names.some(function (name) cmp(name, ext.name)))
                            : exts;

  function store (name, targets) {
    let es = extFilter(liberator.extensions, targets);
    states.set(name, {extensions: es, date: new Date()});
  }

  function slash (ary, index)
    [ary.slice(0, index), ary.slice(index)];

  function isVimp (ext)
    (ext.name == 'Vimperator');

  store('last');

  let extState = {
    store: function (name, targets) {
      function done ()
        liberator.echo('extensions state was stored to "' + name + '".');

      if (!name)
        return liberator.echoerr('too few arguments');

      if (states.get(name)) {
        commandline.input(
          'overwrite? [y/n]',
          function (answer)
            (answer.toLowerCase() == 'y' ? (store(name, targets, true), done()) : liberator.echo('canceled'))
        );
      } else {
        store(name, targets, true);
        done();
      }
    },

    restore: function (name, targets) {
      if (!name)
        return liberator.echoerr('too few arguments');

      let state = states.get(name);
      if (!state)
        return liberator.echoerr('"' + name + '" has not been stored.');

      let es = state.extensions;
      if (targets.length)
        es = es.filter(function (ext) targets.some(function (t) t == ext.name));
      es.forEach(function (ext) xabled(ext.id, ext.enabled));

      liberator.echo('extensions state was restored from "' + name + '".');
    },

    flush: function () {
      states.save();
    },

    __noSuchMethod__: function (name) {
      liberator.echoerr(name + ' is not valid sub-command');
    }
  };

  let extBisect = {
    start: function () {
      if (this.__notReady(false))
        return;
      let targets = liberator.extensions.filter(function (ext) !isVimp(ext) && ext.enabled);
      bisect.set('store', liberator.extensions);
      bisect.set('state', 'started');
      let ([a, b] = slash(targets, targets.length / 2)) {
        bisect.set('yet', a);
        bisect.set('current', b);
      }
      bisect.save();
      this.__reflectCurrent();
      liberator.restart();
    },

    ok: function () {
      if (this.__notReady(true))
        return;
      if (this.__finished(true))
        return;
      bisect.modify('yet', function (value) {
        let [a, b] = slash(value, value.length / 2);
        bisect.set('current', a);
        return b;
      });
      this.__reflectCurrent();
      liberator.restart();
    },

    fail: function () {
      if (this.__notReady(true))
        return;
      if (this.__finished(false))
        return;
      bisect.modify('current', function (value) {
        let [a, b] = slash(value, value.length / 2);
        bisect.set('yet', a);
        return b;
      });
      this.__reflectCurrent();
      liberator.restart();
    },

    show: function () {
      function f (ext) liberator.echo(' ' + ext.name);
      liberator.echo('<<current>>');
      bisect.get('current').forEach(f)
      liberator.echo('<<yet>>');
      bisect.get('yet').forEach(f)
    },

    reset: function () {
      if (this.__notReady(true))
        return;
      bisect.set('state', '');
      bisect.get('store').forEach(function (ext) xabled(ext.id, ext.enabled));
      bisect.save();
      liberator.echo('extensions were reset');
      liberator.restart();
    },

    __notReady: function (started) {
      if (!!(bisect.get('state') == 'started') == !!started)
        return false;
      liberator.echoerr('extbisect has ' + (started ? 'not ' : '') + 'been started.');
      return true;
    },

    __finished: function (ok) {
      function answer (ext) {
        liberator.echo(util.escapeString(ext.name) + ' is the criminal!!');
        return true;
      }

      let current = bisect.get('current');
      let yet = bisect.get('yet');

      if (ok && yet.length <= 1)
        return answer(yet[0]);

      if (!ok && current.length <= 1)
        return answer(current[0]);

      return false;
    },

    __reflectCurrent: function () {
      let current = bisect.get('current');
      liberator.extensions.forEach(
        function (ext)
          (xabled(ext.id, isVimp(ext) || current.some(function (e) e.id == ext.id)))
      );
    },

    __noSuchMethod__: function (name) {
      liberator.echoerr(name + ' is not valid sub-command');
    }
  };

  commands.addUserCommand(
    ['exts[tate]'],
    'store / restore extensions state (enabled / disabled).',
    function (args) {
      let [cmd,] = args;
      extState[cmd](args[1], args.slice(2));
    },
    {
      completer: function (context, args) {
        if (args.length == 1) {
          context.title = ['sub command', 'description'];
          context.completions = [
            ['store', 'store current state'],
            ['restore', 'restore current state'],
            ['flush', 'flush']
          ];
        } else if (args.length == 2) {
          context.title = ['name'];
          context.completions = [[name, state.date] for ([name, state] in states)];
        } else if (args.length >= 3) {
          let exts = liberator.extensions;
          context.title = ['name'];
          context.quote = ['', util.escapeString, ''];
          context.completions = [[ext.name, ext.description] for each (ext in exts)];
        }
      }
    },
    true
  );

  commands.addUserCommand(
    ['extbisect'],
    'bisectrrrrrrrrrrr',
    function (args) {
      let [cmd,] = args;
      extBisect[cmd]();
    },
    {
      completer: function (context, args) {
        if (args.length == 1) {
          context.title = ['sub command', 'description'];
          context.completions = [
            ['start', 'start bisect'],
            ['ok', ''],
            ['fail', ''],
            ['reset', ''],
            ['show', '']
          ];
        }
      }
    },
    true
  );



  states.save();

})();

// vim:sw=2 ts=2 et si fdm=marker:
