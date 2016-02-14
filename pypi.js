var PLUGIN_INFO = xml`
<VimperatorPlugin>
<name>pypi</name>
<description>Add a pypi command</description>
<author mail="gael@gawel.org" homepage="http://www.gawel.org">gawel</author>
<version>1.1</version>
<license>MPL 1.1/GPL 2.0/LGPL 2.1</license>
<minVersion>2.0pre</minVersion>
<maxVersion>2.0</maxVersion>
<updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/pypi.js</updateURL>
<detail lang="en"><![CDATA[

== Command ==

:pypi {package or term}

]]></detail>
</VimperatorPlugin>`;

liberator.plugins.pypi = (function(){

var Pypi = {
    packages: [],
    init_packages: function() {
        var req = new XMLHttpRequest();
        req.onreadystatechange = function() {
            if (req.readyState == 4) {
                Pypi.packages = [];
                var lines = req.responseText.split('\n');      
                for (var i=0; i<lines.length; i++) {
                    var line = lines[i];
                    if (/^<a/.exec(line))
                        Pypi.packages.push(line.split('>')[1].split('<')[0]);
                }
                liberator.echo('Pypi packages list is up to date');
            }
        }
        req.open("GET", "http://pypi.python.org/simple/", false);
        req.send(null);
        setTimeout(Pypi.init_packages, 1000*60*60*24);
    }
}

setTimeout(Pypi.init_packages, 1000);

commands.addUserCommand(["pypi"], "pypi search",
    function(args){
        var doc = window.content.document;
        if (!args.length) {
            doc.location.href = 'http://pypi.python.org/pypi';
        }
        var filter = args[0];
        var packages = liberator.plugins.pypi.packages;
        for (var i=0; i<packages.length; i++) {
            if (filter.toLowerCase() == packages[i].toLowerCase()) {
                doc.location.href = 'http://pypi.python.org/pypi/'+packages[i];
                return;
            }
        }
        doc.location.href = 'http://pypi.python.org/pypi?%3Aaction=search&submit=search&term='+filter;
    }, {
        completer: function(context, args){
            if (context.filter.length < 1) return;
            if (!liberator.plugins.pypi.packages.length) {
                liberator.plugins.pypi.init_packages();
            }
            var packages = liberator.plugins.pypi.packages;
            var results = [];
            for (var i=0; i<packages.length; i++) {
                if (new RegExp('^'+context.filter.replace('.', '\\.').toLowerCase()).exec(packages[i].toLowerCase())) {
                    results.push([packages[i], '']);
                }
            }
            return {items:results, start:0};
        }
    }, true);

return Pypi;
})();

// vim: sw=4 ts=4 et fdm=marker:
