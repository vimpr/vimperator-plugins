var PLUGIN_INFO = xml`
<VimperatorPlugin>
<name>{NAME}</name>
<description>Tiny Menu for Vimperator</description>
<minVersion>2.0pre</minVersion>
<maxVersion>2.0</maxVersion>
<updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/tinymenu.js</updateURL>
<author mail="hotchpotch@gmail.com" homepage="http://d.hatena.ne.jp/secondlife/">Yuichi Tateno</author>
<license>MPL 1.1/GPL 2.0/LGPL 2.1</license>
<version>0.2</version>
<detail><![CDATA[
open statusbar menu like Tiny Menu [ https://addons.mozilla.org/firefox/addon/1455 ] through ':opentinymenu' command.

== Commands ==
  :opentinymenu:
    Open the tiny menu.
]]></detail>
</VimperatorPlugin>`;

(function() {
    if (!liberator.plugins.tinymenu) {
        liberator.plugins.tinymenu = {};
    }

    let tinymenu = liberator.plugins.tinymenu;

    if (tinymenu.popup) return;

        let menus = Array.slice(document.getElementById('main-menubar').childNodes);
        let popup = document.createElement('menupopup');
        menus.reverse().forEach(function(elem) popup.appendChild(elem.cloneNode(true)));
        popup.setAttribute('id', 'vimperator-tinymenu-popup');
        tinymenu.popup = popup;

    popup.addEventListener( 'popuphidden' , function(event) { popup.hidePopup(); } , false);

    commands.addUserCommand(
        ['opentinymenu'],
        'Open the tiny menu ',
        function () {
            popup.openPopup(document.getElementById('status-bar'), 'before_end', 0, 0, false, true);
        },
        true);

    document.getElementById('status-bar').appendChild(popup);
})();
