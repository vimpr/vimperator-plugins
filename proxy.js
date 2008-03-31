/**
 * vimperator plugin
 *
 * proxy setting plugin (for vimperator-0.6pre)
 *
 * @author cho45
 * @author halt feits
 * @version 0.6.0
 */

(function() {

    const proxy_settings = [
    {
        conf_name: 'disable',
        setting: [
            {
                label: 'network.proxy.type',
                param: 0
            }
        ]
    },
    {
        conf_name: 'polipo',
        setting: [
            {
                label: 'network.proxy.type',
                param: 1
            },
            {
                label: 'network.proxy.http',
                param: 'localhost'
            },
            {
                label: 'network.proxy.http_port',
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
            if (proxy_settings[i].conf_name.toLowerCase() == name.toLowerCase()) {

                //delete setting
                ['http', 'ssl', 'ftp', 'gopher'].forEach(
                        function (p) {
                            prefs.setCharPref("network.proxy." + p, '');
                            prefs.setIntPref("network.proxy." + p + "_port", 0);
                        }
                );

                for (var j = 0; j < proxy_settings[i].setting.length; j++) {

                    var conf = proxy_settings[i].setting[j];
                    switch (conf.label) {
                        case "network.proxy.type":
                            prefs.setIntPref(conf.label, conf.param);
                            break;
                        case "network.proxy.http":
                            prefs.setCharPref(conf.label, conf.param);
                            break;
                        case "network.proxy.http_port":
                            prefs.setIntPref(conf.label, conf.param);
                            break;
                    }
                
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
                name = proxy_settings[i].conf_name;
                
                var exp = new RegExp("^" + filter);

                if (exp.test(name)) {
                    completions.push([name, name]);
                }
            }

            return [0, completions];
        }
    }
);

})();
// vim: set sw=4 ts=4 et:
