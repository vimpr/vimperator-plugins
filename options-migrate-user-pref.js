var PLUGIN_INFO = xml`
<VimperatorPlugin>
<name>{NAME}</name>
<description>options migrate user_pref</description>
<description lang="ja">:set foobarbaz で簡単に user_pref をセットできるプラグイン</description>
<minVersion>2.0pre</minVersion>
<maxVersion>2.0</maxVersion>
<updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/options-migrate-user-pref.js</updateURL>
<author mail="hotchpotch@gmail.com" homepage="http://d.hatena.ne.jp/secondlife/">Yuichi Tateno</author>
<license>MIT</license>
<version>0.1</version>
<detail><![CDATA[
>||
:set! javascript.enabled=true
||<
を
>||
:set javascript
:set nojavascript
||<
のようにマッピングするためのプラグインです。
boolean/number を簡単にセットできるようになるため、よく user_pref を変更する場合などに便利です。

例
>||
js <<EOF
liberator.globalVariables.options_migrate_user_pref =
[
    {
        pref: 'javascript.enabled',
        description: 'Using JavaScript',
        command: ['javascript', 'js'],
    },
    {
        pref: 'font.size.fixed.ja',
        description: 'JA fixed font-size',
        command: ['jaffont'],
    }
];
EOF
||<

]]></detail>
</VimperatorPlugin>`;

(function() {
    let p = function(msg) {
        Application.console.log(msg);
    }

    liberator.plugins.migrateUserPref = function(config) {
        config.forEach(function(conf) {
            let pref = conf.pref;
            let type;
            try
            {
                switch (services.get('prefs').getPrefType(conf.pref))
                {
                case Ci.nsIPrefBranch.PREF_STRING:
                    // XXX: string のとき、うまく user_pref に設定できていない?
                    type = 'string';
                    break;
                case Ci.nsIPrefBranch.PREF_INT:
                    type = 'number';
                    break;
                case Ci.nsIPrefBranch.PREF_BOOL:
                    type = 'boolean';
                    break;
                default:
                    return liberator.echoerr('migrate-user-pref: error pref: ' + pref);
                }
            }
            catch (e)
            {
                return liberator.echoerr('migrate-user-pref: error pref: ' + pref + ' ' + e);
            }
            if (!options.get(conf.command[0])) {
                options.add(conf.command, conf.description, type,
                    (typeof conf.defaultValue == 'undefined' ? options.getPref(pref) : conf.defaultValue),
                    {
                        setter: function(value) options.setPref(pref, value),
                        getter: function() options.getPref(pref),
                    }
                );
            }
        });
    }

    liberator.plugins.migrateUserPref(liberator.globalVariables['options_migrate_user_pref'] || []);
})();

