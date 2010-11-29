var PLUGIN_INFO =
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
append statusbar's menuicon like Tiny Menu [ https://addons.mozilla.org/firefox/addon/1455 ].

thx icon id:tnx.

== Commands ==
  :opentinymenu:
    Open the tiny menu.
]]></detail>
</VimperatorPlugin>;

(function() {
    if (!liberator.plugins.tinymenu)
        liberator.plugins.tinymenu = {};

    let tinymenu = liberator.plugins.tinymenu;
    if (tinymenu.menu) return;

    let p = function(msg) {
        Application.console.log(msg);
    };

    const ICON = 'data:image/png;base64,'+
                 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK'+
                 '6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAGiSURBVHja'+
                 'jFPLSsNQEJ30kZK+Nkk3zUoQuhKErK0gCHHlN5SCUFoImEU3LgVBiFAQhIIf4UIo'+
                 'CIJ/oO3KbWm7aLorJTQg9UxsYxKi7cDhPuaec+femRFqtRpFrAJcAMfA4XrvHXgD'+
                 'usBn8HAqQr4ErlVVlXK5HEmS5G06jqMtFgttPB43sLwC7qICIvCkKIpeKpUok8mE'+
                 'VLPZrIdisSjZtm3NZrNTbJ8D7kbgFkQdN5Miy/SfqeUyffT7OoRusDRZ4ABoleFg'+
                 'O6pWyTTNEMmyrNB6atsEAQPTRxao4+akIAg/zumU2u12mIC9oCUSCWIO/qTOAjre'+
                 '5js1TYsNvdls/qapUqFCocBTnQX2RFEMHTYMI7TudDoeKWjpdNr7klTcbUzYZusn'+
                 'J1lg6LrufjB1cRFEDRwehizQm8/nraDALhGAw8MLC3RHo1FDlmU/E9siWK1WhAx8'+
                 'bdI4AB4mk0mLC2mXCHCWh3vmCutm8ksZNR9L4iwsl0suIEIp96KlzD9yBoffTPl8'+
                 'PthMHhFhO38108bY8YyD3M4nkXZ+jWvnbwEGAKqdlwtH3ubkAAAAAElFTkSuQmCC';

    if (!tinymenu.popup) {
        let menus = Array.slice(document.getElementById('main-menubar').childNodes);
        let popup = document.createElement('menupopup');
        menus.reverse().forEach(function(elem) popup.appendChild(elem.cloneNode(true)));
        popup.setAttribute('id', 'gimperator-tinymenu-popup');
        tinymenu.popup = popup;
    }

    if (!tinymenu.menu) {
        let menu = document.createElement('statusbarpanel');
        menu.setAttribute('id', 'vimperator-tinymenu');
        menu.setAttribute('class','statusbarpanel-iconic');
        menu.setAttribute('src', ICON);
        tinymenu.menu = menu;
    }

    let menu = tinymenu.menu;
    let popup = tinymenu.popup;

    menu.addEventListener('click', function(event) {
        if (popup.state == 'closed')
            popup.openPopup(menu, 'before_end', 0, 0, false, true);
    }, false);

    commands.addUserCommand(
        ['opentinymenu'],
        'Open the tiny menu ',
        function () {
            popup.openPopup(menu, 'before_end', 0, 0, false, true);
        },
        true
    );

    //document.getElementById('status-bar').insertBefore(menu, document.getElementById('security-button').nextSibling);
    document.getElementById('status-bar').appendChild(popup);
    document.getElementById('status-bar').appendChild(menu);
})();
