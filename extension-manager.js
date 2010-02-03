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
  <version>1.0.0</version>
  <author mail="anekos@snca.net" homepage="http://d.hatena.ne.jp/nokturnalmortum/">anekos</author>
  <license>new BSD License (Please read the source code comments of this plugin)</license>
  <license lang="ja">修正BSDライセンス (ソースコードのコメントを参照してください)</license>
  <updateURL>http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/extensions-manager.js</updateURL>
  <minVersion>2.3</minVersion>
  <maxVersion>2.3</maxVersion>
  <detail><![CDATA[
    ----
  ]]></detail>
  <detail lang="ja"><![CDATA[
    ----
  ]]></detail>
</VimperatorPlugin>;
// }}}
// INFO {{{
let INFO =
<>
  <plugin name="extension manager" version="1.0.0"
          href="http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/extension-manager.js"
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
  <plugin name="extension manager" version="1.0.0"
          href="http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/extension-manager.js"
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
</>;
// }}}


(function () {

  let states = storage.newMap('plugins-extman-states', {store: true});

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

  states.save();

})();

// vim:sw=2 ts=2 et si fdm=marker:
