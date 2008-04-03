/**
 * vimperator plugin
 *
 * proxy setting plugin (for vimperator-0.6pre)
 *
 * @author cho45
 * @author halt feits
 * @version 0.6.1
 */

(function() {

    const proxy_settings = [
    {
        conf_name: 'disable',
        conf_usage: 'direct connection',
        setting: [
            {
                label: 'type',
                param: 0
            }
        ]
    },
    {
        conf_name: 'polipo',
        conf_usage: 'use polipo cache proxy',
        setting: [
            {
                label: 'type',
                param: 1
            },
            {
                label: 'http',
                param: 'localhost'
            },
            {
                label: 'http_port',
                param: 8123
            }
        ]
    }
    ];

    liberator.commands.addUserCommand(["proxy"], 'proxy settings',
    function (args) {
        const prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
        var name = args;
        if (!name) {
            liberator.echo("Usage: proxy {setting name}");
        }
        for (var i = 0; i < proxy_settings.length; i++) {
            var proxy_setting = proxy_settings[i];
            if (proxy_setting.conf_name.toLowerCase() == name.toLowerCase()) {

                //delete setting
                ['http', 'ssl', 'ftp', 'gopher'].forEach(
                        function (p) {
                            prefs.setCharPref("network.proxy." + p, '');
                            prefs.setIntPref("network.proxy." + p + "_port", 0);
                        }
                );

                for (var j = 0; j < proxy_setting.setting.length; j++) {
                    var conf = proxy_setting.setting[j];
                    liberator.options.setPref('network.proxy.' + conf.label, conf.param);
                }

                liberator.echo("set config:" + name);
                break;
            }
        }
    },
    {
        completer: function (filter) {
            var completions = [];

            for (var i = 0; i < proxy_settings.length; i++) {
                var name = proxy_settings[i].conf_name;
                var usage = proxy_settings[i].conf_usage;
                
                var exp = new RegExp("^" + filter);

                if (exp.test(name)) {
                    completions.push([name, usage]);
                }
            }

            return [0, completions];
        }
    }
);

})();
// vim: set sw=4 ts=4 et:
