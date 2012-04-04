var PLUGIN_INFO =
<VimperatorPlugin>
  <name>AppLauncher</name>
  <name lang='ja'>アプリケーションランチャー</name>
  <description>Launch defined application</description>
  <description lang='ja'>アプリケーションを起動します</description>
  <version>0.12</version>
  <author>pekepeke</author>
  <minVersion>2.0pre</minVersion>
  <updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/applauncher.js</updateURL>
  <detail lang='ja'><![CDATA[
  == Commands ==
    :applaunch [name]:
    :runapp [name]:
      [name] で指定されたアプリケーションを起動します。
  == .vimperatorrc example ==
    >||
    js <<EOM
    liberator.globalVariables.applauncher_list = [
      [ 'name', 'application path', ['arguments', '%URL%', '%SEL%']],
      [ 'Internet Explorer', 'C:\\Program Files\\Internet Explorer\\iexplore.exe', '%URL%'],
      [ 'Internet Explorer(Search)', 'C:\\Program Files\\Internet Explorer\\iexplore.exe', '%SEL%'],
    ];
    liberator.globalVariables.applauncher_charset = 'Shift_JIS';
    EOM
    ||<
    %URL% は実行時に選択中のリンクURL、もしくは開いているページのURLに置き換えられます。
    %SEL% は選択中の文字列に置き換えられます。
    %TITLE% はページのタイトルに置き換えられます。
    引数を複数指定する場合は配列形式で指定してください。
    applauncher_charset を指定すると、渡される文字列が指定の文字セットに変換されます。
  ]]></detail>
</VimperatorPlugin>

liberator.plugins.AppLauncher = (function(){
  const UConv = Cc['@mozilla.org/intl/scriptableunicodeconverter'].getService(Ci.nsIScriptableUnicodeConverter);
  const AppName = 'AppLauncher';

  var global = liberator.globalVariables;
  var settings = global.applauncher_list || [];
  var defaultCharset = global.applauncher_charset;
  if (!settings || settings.length <= 0) return;
  var completer = settings.map( function([name, app, args]) [name, args ? app + ' ' + args.toString(): app] );

  var Class = function() function(){ this.initialize.apply(this, arguments); };
  var AppLauncher = new Class();

  AppLauncher.prototype = {
    initialize: function(){
      this.buildMenu();
      this.registerCommand();
    },
    registerCommand: function(){
      var self = this;
      commands.addUserCommand(['applaunch', 'runapp'], 'Run Defined Application',
        function(arg){
          arg = (typeof arg.string == 'undefined' ? arg : arg.literalArg);
          self.launch(arg);
        }, {
          literal: 0,
          completer: function(context, arg){
            var filter = context.filter;
            context.title = [ 'Name', 'Description'];
            if (!filter){
              context.completions = completer;
              return;
            }
            filter = filter.toLowerCase();
            context.completions = completer.filter( function(el) el[0].toLowerCase().indexOf(filter) == 0);
          }
        }, true);
    },
    buildMenu: function(){
      var self = this;
      var menu = document.getElementById('contentAreaContextMenu')
                         .appendChild(document.createElement('menu'));
      menu.setAttribute('id', AppName + 'Context');
      menu.setAttribute('label', AppName);
      menu.setAttribute('accesskey', 'L');

      var menupopup = menu.appendChild(document.createElement('menupopup'));
      menupopup.setAttribute('id', AppName + 'ContextMenu');
      for (let i=0, l=settings.length; i<l; i++){
        let [name, app, args] = settings[i];
        let menuitem = menupopup.appendChild(document.createElement('menuitem'));
        menuitem.setAttribute('id', AppName + i);
        menuitem.setAttribute('label', name + '\u3092\u8D77\u52D5');
        menuitem.addEventListener('command', function() self.launch(name), false);
      }
    },
    variables: {
      __noSuchMethod__: function(name) name,
      URL: function() gContextMenu && gContextMenu.onLink ? gContextMenu.getLinkURL() : buffer.URL,
      SEL: function(){
        var selection = window.content.window.getSelection();
        var sel = '';
        for (let i=0, l=selection.rangeCount; i<l; i++) sel+=selection.getRangeAt(i).toString();
        return sel;
      },
      TITLE: function() buffer.title
    },
    launch: function(appName){
      var self = this;
      appName = appName.replace(/\\+/g, '');                // fix commandline input ' ' -> '\ '
      settings.some( function([name, app, args]){
        args = args instanceof Array ? args : args ? [args] : [];
        args = args.map( function( val ) val.replace(/%([A-Z]+)%/g, function( _, name ) self.variables[name]()) );
        if (defaultCharset){
          UConv.charset = defaultCharset;
          args = args.map( function( val ) UConv.ConvertFromUnicode(val) );
        }
        if (appName == name){
          io.run(app, args);
          return true;
        }
        return false;
      });
    }
  }
  return new AppLauncher();
})();
