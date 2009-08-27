let PLUGIN_INFO =
<VimperatorPlugin>
<name>{NAME}</name>
<description>Tombloo integrate plugin</description>
<description lang="ja">Tombloo 統合プラグイン</description>
<author>Trapezoid</author>
<version>0.1e</version>
<minVersion>2.0pre</minVersion>
<maxVersion>2.0pre</maxVersion>
<updateURL>http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/tombloo.js</updateURL>
<detail><![CDATA[

== EX-COMMANDS ==

:tombloo arg:
    post by Tombloo (don't use prompt)

:tombloo! arg:
    post by Tombloo (use prompt)

:tomblooAction arg:
    execute Tombloo's action in tool menu

]]></detail>
<detail lang="ja"><![CDATA[
== EX-COMMANDS ==

:tombloo arg:
    Tombloo を使って投稿します ( ダイアログは出てきません )

:tombloo! arg:
    Tombloo を使って投稿します ( ダイアログが出てきます )

:tomblooAction arg:
    ツールバーから選択できる Tombloo のメニューを実行します

]]></detail>
</VimperatorPlugin>;

(function () {

// ts: "T"ombloo "S"ervice
let tomblooService;
try { tomblooService = getTombloo(); }
catch (e) {
    liberator.log(e.message, 0);
    return;
}

with (tomblooService) {

commands.addUserCommand(
    ['tomblooAction'],
    'Execute Tombloo actions',
    function (arg) {
        let f = Tombloo.Service.actions[arg.string];
        (f instanceof Function)
            ? f.execute()
            : liberator.echoerr(arg.string + ' is not Tombloo Action.');
    },
    {
        completer: function (context) {
            context.title = ['Tombloo Actions'];

            let names = Tombloo.Service.actions.names;
            let candidates = [[n, n] for([, n] in Iterator(names))];
            context.completions = candidates.filter(
                function ($_) this.test($_[0]),
                new RegExp(context.filter, 'i')
            );
        },
    }
);

commands.addUserCommand(
    ['tombloo'],
    'Post by Tombloo',
    function (args) {
        //let f = Tombloo.Service.extractors[args.string];
        let arg = args.string.replace(/\\(?=\u0020)/g, '');
        liberator.log(args.string, 0);
        liberator.log(arg, 0);

        let f = Tombloo.Service.extractors[arg];
        (typeof f === 'object')
            ? Tombloo.Service.share(getContext(), f, args.bang)
            : liberator.echoerr(args.string + ' is not Tombloo command');
    },
    {
        bang: true,
        completer: function (context) {
            context.title = ['Tombloo'];

            let extensions = Tombloo.Service.check(getContext());
            let candidates = [[e.name, e.name] for ([, e] in Iterator(extensions))];
            context.completions = candidates.filter(
                function($_) this.test($_[0]),
                new RegExp(context.filter, 'i')
            );
        }
    }
);

} // with (tomblooService)

// helper ---
function getTombloo() {
    const serviceId = '@brasil.to/tombloo-service;1';

    if (!Cc[serviceId])
        throw new Error('Tombloo is not found. install from http://github.com/to/tombloo/wikis');

    return Cc[serviceId].getService().wrappedJSObject;
}

function getContext() {
    const doc = window.content.document;
    const win = window.content.wrappedJSObject;
    return implant(
        implant(
            {
                document:   doc,
                window:     win,
                title:      doc.title.toString() || '',
                selection:  win.getSelection().toString(),
                target:     doc,
                //event     : event,
                //mouse     : mouse,
                //menu      : gContextMenu,
            },
            {}
        ),
        win.location
    );
}

// stuff ---
function implant(dst, src, keys){
    if (keys) {
        keys.forEach(function(key) { dst[key] = src[key]; });
    }
    else {
        for (let key in src) dst[key] = src[key];
    }

    return dst;
}

})();

// vim:sw=4 ts=4 et:
