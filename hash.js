// PLUGIN_INFO//{{{
var PLUGIN_INFO =
<VimperatorPlugin>
    <name>{NAME}</name>
    <description>hash of file</description>
    <author mail="konbu.komuro@gmail.com" homepage="http://d.hatena.ne.jp/hogelog/">hogelog</author>
    <version>0.2</version>
    <minVersion>2.0pre</minVersion>
    <maxVersion>2.0pre</maxVersion>
    <updateURL>http://svn.coderepos.org/share/lang/javascript/vimperator-plugins/trunk/hash.js</updateURL>
    <detail><![CDATA[

== COMMANDS ==
hash:
    :hash md2|md5|sha1|sha256|sha384|sha512 file-path

]]></detail>
</VimperatorPlugin>;
//}}}

(function() {
    const PR_UINT_MAX = 0xffffffff;
    let Crypt = Cc["@mozilla.org/security/hash;1"].createInstance(Ci.nsICryptoHash);
    let Algos = [
        ["md2", "MD2 Algorithm"],
        ["md5", "MD5 Algorithm"],
        ["sha1", "SHA1 Algorithm"],
        ["sha256", "SHA256 Algorithm"],
        ["sha384", "SHA385 Algorithm"],
        ["sha512", "SHA512 Algorithm"],
    ];

    function getStream(path)
    {
        let file = io.getFile(path);
        let stream = Cc["@mozilla.org/network/file-input-stream;1"]
            .createInstance(Ci.nsIFileInputStream);
        stream.init(file, 0x01, 0444, 0);
        return stream;
    }

    // return the two-digit hexadecimal code for a byte
    function toHexString(charCode)
    {
      return ("0" + charCode.toString(16)).slice(-2);
    }


    commands.addUserCommand(["hash"], "hash of file",
        function(args){
            if (args.length!=2) {
    
                liberator.echo("usage \":hash md2|md5|sha1|sha256|sha384|sha512 file-path\"");
                return false;
            }
            let [algo, path] = args;
            let stream = getStream(path);

            Crypt.initWithString(algo);

            // read the entire stream
            Crypt.updateFromStream(stream, PR_UINT_MAX);

            stream.close();

            // get base-64 string
            let hash = Crypt.finish(false);

            // convert the binary hash data to a hex string.
            let str = [toHexString(hash.charCodeAt(i)) for(i in hash)].join("");
            util.copyToClipboard(str, true);
        },
        {
            bang: true,
            completer: function (context){
                let args = context.value.split(/\s/);
                if (args.length<=2) {
                    context.title = "hash algorithm";
                    context.completions = Algos;
                } else if (args.length==3) {
                    completion.url(context, "f");
                }
            },
        });

})();
// vim: fdm=marker sw=4 ts=4 et:
