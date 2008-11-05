/**
 * ==VimperatorPlugin==
 * @name           proxy.js
 * @description    proxy setting plugin
 * @description-ja プロクシ設定
 * @minVersion     0.6pre
 * @author         cho45, halt feits
 * @version        0.6
 * ==/VimperatorPlugin==
 *
 * Usage:
 * :proxy {conf_name}         -> set proxy setting to conf_name
 *
 * The proxy_settings is a string variable which can set on
 * vimperatorrc as following.
 *
 * let proxy_settings = "[{ { conf_name:'disable', conf_usage:'direct connection', settings:[{label:'type', param:0}] } }]"
 *
 * or your can set it using inline JavaScript.
 *
 * javascript <<EOM
 * liberator.globalVariables.proxy_settings = [
 *    {
 *       conf_name: 'disable',
 *       conf_usage: 'direct connection',
 *       settings: [
 *       {
 *          label: 'type',
 *          param: 0
 *       }
 *       ]
 *    },
 *    {
 *       conf_name: 'squid',
 *       conf_usage: 'use squid cache proxy',
 *       settings: [
 *       {
 *          label: 'type',
 *          param: 1
 *       },
 *       {
 *          label: 'http',
 *          param: 'squid.example.com'
 *       },
 *       {
 *          label: 'http_port',
 *          param: 3128
 *       }
 *       ]
 *    }
 * ];
 * EOM
 */

(function() {
    if (!liberator.globalVariables.proxy_settings) {
        liberator.globalVariables.proxy_settings = [
            {
                conf_name: 'disable',
                conf_usage: 'direct connection',
                settings: [
                    {
                        label: 'type',
                        param: 0
                    }
                ]
            },
            {
                conf_name: 'polipo',
                conf_usage: 'use polipo cache proxy',
                settings: [
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
    };

    var proxy_settings = liberator.globalVariables.proxy_settings;

    liberator.commands.addUserCommand(["proxy"], 'Proxy settings', function (args) {
        const prefs = Components.classes["@mozilla.org/preferences-service;1"]
                                .getService(Components.interfaces.nsIPrefService);
        var name = args;
        if (!name) {
            liberator.echo("Usage: proxy {setting name}");
        }
        proxy_settings.some(function (proxy_setting) {
            if (proxy_setting.conf_name.toLowerCase() != name.toLowerCase()) {
                return false;
            }

            //delete setting
            ['http', 'ssl', 'ftp', 'gopher'].forEach(function (scheme_name) {
                prefs.setCharPref("network.proxy." + scheme_name, '');
                prefs.setIntPref("network.proxy." + scheme_name + "_port", 0);
            });

            proxy_setting.settings.forEach(function (conf) {
                liberator.options.setPref('network.proxy.' + conf.label, conf.param);
            });

            liberator.echo("Set config: " + name);
            return true;
        });
    },
    {
        completer: function (filter) {
            var completions = [];
            var exp = new RegExp("^" + filter);

            for each (let { conf_name: name, conf_usage: usage } in proxy_settings) {
                if (exp.test(name)) {
                    completions.push([name, usage]);
                }
            }

            return [0, completions];
        }
    });

})();
// vim: set sw=4 ts=4 et:
