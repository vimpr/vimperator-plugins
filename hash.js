// PLUGIN_INFO//{{{
var PLUGIN_INFO = xml`
<VimperatorPlugin>
    <name>{NAME}</name>
    <description>hash of file</description>
    <author mail="konbu.komuro@gmail.com" homepage="http://d.hatena.ne.jp/hogelog/">hogelog</author>
    <version>0.2.2</version>
    <minVersion>2.3</minVersion>
    <maxVersion>2.3</maxVersion>
    <updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/hash.js</updateURL>
    <detail><![CDATA[

== COMMANDS ==
hash:
    :hash md2|md5|sha1|sha256|sha384|sha512 file-path

]]></detail>
</VimperatorPlugin>`;
//}}}

(function() {
    const PR_UINT_MAX = 0xffffffff;
    let Crypt = Cc["@mozilla.org/security/hash;1"].createInstance(Ci.nsICryptoHash);
    let Algos = [
        ["md2", "MD2 Algorithm"],
        ["md5", "MD5 Algorithm"],
        ["sha1", "SHA1 Algorithm"],     // SHA-1
        ["sha256", "SHA256 Algorithm"], // SHA-256
        ["sha384", "SHA384 Algorithm"], // SHA-384
        ["sha512", "SHA512 Algorithm"], // SHA-512
    ];

    function getStream(path)
    {
        let file = io.File(path);
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
            completer: function (context, args){
                if (args.completeArg == 0) {
                    context.title = ["hash", "algorithm"];
                    context.completions = Algos;
                } else if (args.completeArg == 1) {
                    completion.url(context, "f");
                }
            },
            literal: 1,
        },
        true
        );

})();
// vim: fdm=marker sw=4 ts=4 et:
