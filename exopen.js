var INFO =
xml`<plugin name=${NAME} version="0.10.2"
            href="http://github.com/vimpr/vimperator-plugins/blob/master/exopen.js"
            summary="テンプレートからURLをOpenします"
            lang="ja"
            xmlns="http://vimperator.org/namespaces/liberator">
  <author homepage="http://vimperator.g.hatena.ne.jp/pekepekesamurai">pekepekesamurai</author>
  <project name="Vimperator" minVersion="3.6"/>
  <item>
    <tags>:exopen</tags>
    <spec>:exopen <a>template_name</a></spec>
    <description>
      <p>
        <a>template_name</a> で設定されたURLを開きます。
      </p>
    </description>
  </item>
  <h3 tag="exopen-example">Example</h3>
  <code><ex><![CDATA[
    :exopen http://www.google.co.jp/search?q=%TITLE%
  ]]></ex></code>
  <p>%TITLE%を現在開いているWebページのタイトルに展開してURLを開きます。</p>

  <code><ex><![CDATA[
    :exopen [title]
  ]]></ex></code>
  <p>テンプレートで設定されたURLを開きます。</p>

  <h3 tag="exopen-keyword">Keyword</h3>
  <dl>
    <dt>%TITLE%</dt><dd>現在のWebページのタイトル</dd>
    <dt>%URL%</dt><dd>現在のWebページのURL</dd>
    <dt>%SEL%</dt><dd>選択中の文字列</dd>
    <dt>%HTMLSEL%</dt><dd>選択中のHTMLソース</dd>
  </dl>

  <h3 tag="exopen-rc-example">.vimperatorrc exmaple</h3>
  <code><ex><![CDATA[
  javascript <<EOM
  liberator.globalVariables.exopen_templates = [
    {
      label: 'vimpnightly',
      value: 'http://code.google.com/p/vimperator-labs/downloads/list?can=1&q=label:project-vimperator',
      description: 'open vimperator nightly xpi page',
      newtab: true
    }, {
      label: 'vimplab',
      value: 'http://www.vimperator.org/vimperator',
      description: 'open vimperator trac page',
      newtab: true
    }, {
      label: 'vimpscript',
      value: 'http://code.google.com/p/vimperator-labs/issues/list?can=2&q=label%3Aproject-vimperator+label%3Atype-plugin',
      description: 'open vimperator trac script page',
      newtab: true
    }, {
      label: 'coderepos',
      value: 'http://coderepos.org/share/browser/lang/javascript/vimperator-plugins/trunk/',
      description: 'open coderepos vimperator-plugin page',
      newtab: true
    }, {
      label: 'sldr',
      value: 'http://reader.livedoor.com/subscribe/%URL%'
    }
  ];
  EOM
  ]]></ex></code>
  <dl>
    <dt>label</dt><dd>テンプレート名。コマンドの引数で指定してください。</dd>
    <dt>value</dt><dd>OpenするURL</dd>
    <dt>custom</dt><dd>
      関数か配列で指定してください。
      関数の場合、return された文字列をオープンします。
      配列の場合、value で指定された文字列を置換します。(条件→Array[0]、置換文字列→Array[1])
    </dd>
    <dt>description</dt><dd>補完時に表示する説明文。</dd>
    <dt>newtab</dt><dd>新規タブで開く場合は true を指定してください。</dd>
    <dt>escape</dt><dd>URLエンコードする場合、true を指定してください。</dd>
  </dl>
</plugin>`;

liberator.plugins.exOpen = (function() {
  var global = liberator.globalVariables.exopen_templates;
  if (!global) {
    global = [{
      label: 'vimpnightly',
      value: 'http://code.google.com/p/vimperator-labs/downloads/list?can=1&q=label:project-vimperator',
      description: 'open vimperator nightly xpi page',
      newtab: true
    }, {
      label: 'vimplab',
      value: 'http://www.vimperator.org/vimperator',
      description: 'open vimperator trac page',
      newtab: true
    }, {
      label: 'vimpscript',
      value: 'http://code.google.com/p/vimperator-labs/issues/list?can=2&q=label%3Aproject-vimperator+label%3Atype-plugin',
      description: 'open vimperator trac script page',
      newtab: true
    }, {
      label: 'coderepos',
      value: 'http://coderepos.org/share/browser/lang/javascript/vimperator-plugins/trunk/',
      description: 'open coderepos vimperator-plugin page',
      newtab: true
    }, {
      label: 'sldr',
      value: 'http://reader.livedoor.com/subscribe/%URL%'
    }];
  }

  function openTabOrSwitch(url) {
    var tabs = gBrowser.mTabs;
    for (let i=0, l=tabs.length; i<l; i++)
      if (tabs[i].linkedBrowser.contentDocument.location.href == url) return (gBrowser.tabContainer.selectedIndex = i);
    return liberator.open(url, liberator.NEW_TAB);
  }

  function replacer(str, isEscape) {
    if (!str) return '';
    var win = new XPCNativeWrapper(window.content.window);
    var sel = '', htmlsel = '';
    var selection = win.getSelection();
    function __replacer(val) {
      switch (val) {
        case '%TITLE%':
          return buffer.title;
        case '%URL%':
          return buffer.URL;
        case '%SEL%':
          if (sel) return sel;
          else if (selection.rangeCount < 1) return '';
          for (let i=0, c=selection.rangeCount; i<c;
            sel += selection.getRangeAt(i++).toString());
          return sel;
        case '%HTMLSEL%':
          if (htmlsel) return sel;
          if (selection.rangeCount < 1) return '';

          let serializer = new XMLSerializer();
          for (let i=0, c=selection.rangeCount; i<c;
            htmlsel += serializer.serializeToString(selection.getRangeAt(i++).cloneContents()));
          return htmlsel;
      }
      return '';
    }
    var _replacer = __replacer;
    if (isEscape) _replacer = function(val) escape( __replacer(val) );

    return str.replace(/%(TITLE|URL|SEL|HTMLSEL)%/g, _replacer);
  }

  var ExOpen = function() this.initialize.apply(this, arguments);
  ExOpen.prototype = {
    initialize: function() {
      this.createCompleter();
      this.registerCommand();
    },
    createCompleter: function() {
        this.completer = global.map(
          function(t) [t.label, util.escapeString((t.description ? t.description + ' - ' : '') + t.value)]
        );
    },
    registerCommand: function() {
      var self = this;
      commands.addUserCommand(['exopen'], 'Open byextension URL',
        function(args) self.open(args), {
          completer: function(context, args) {
            context.title = ['Template', 'Description - Value'];
            if (!context.filter) {
              context.completions = self.completer;
              return;
            }
            var filter = context.filter.toLowerCase();
            context.completions = self.completer.filter( function( t ) t[0].toLowerCase().indexOf(filter) == 0 );
          }
      });
    },
    find: function(label) {
      var ret = null;
      global.some(function(template) (template.label == label) && (ret = template));
      return ret;
    },
    open: function(args) {
      var url = '';
      if (!args) return;
      var name = args.string;
      if (args instanceof Array) {
        name = args.shift();
        args.string = args.string.replace(new RegExp(name.replace(/(\W)/g,'\\$1')+'\\s+'),'');
      }
      var template = this.find(name) || {value: name};
      if (typeof template.custom == 'function') {
        url = template.custom.call(this, template.value, args);
      } else if (template.custom instanceof Array) {
        url = replacer(template.value).replace(template.custom[0], template.custom[1], template.escape);
      } else {
        url = replacer(template.value, template.escape);
      }
      if (!url) return;
      if (template.newtab || args.bang) openTabOrSwitch(url);
      else liberator.open(url);
    },
  };
  return new ExOpen();
})();
