// ORIGINAL: http://vimperator.g.hatena.ne.jp/kei-s/20101005
(function() {
    function hasMultipleWords (s) {
        return s.split(/\s/).length > 1;
    }

    function isWord (s) {
        return /^[^\s\.\/]+$/i.test(s);
    }

    function isIPAddress (s) {
        return /^([0-9]+\.){3}([0-9]+)$/i.test(s);
    }

    function hasScheme (s) {
        return /^([a-zA-Z0-9-]+):/i.test(s);
    }

    let tldList = "local|museum|travel|aero|arpa|coop|info|jobs|name|nvus|biz|com|edu|gov|int|mil|net|org|pro|xxx|ac|ad|ae|af|ag|ai|ak|al|am|an|ao|aq|ar|as|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|bi|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|cr|cs|ct|cu|cv|cx|cy|cz|dc|de|dj|dk|dm|do|dz|ec|ee|eg|eh|er|es|et|eu|fi|fj|fk|fl|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|gt|gu|gw|gy|hi|hk|hm|hn|hr|ht|hu|ia|id|ie|il|im|in|io|iq|ir|is|it|je|jm|jo|jp|ke|kg|kh|ki|km|kn|kp|kr|ks|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mi|mk|ml|mm|mn|mo|mp|mq|mr|ms|mt|mu|mv|mw|mx|my|mz|na|nc|nd|ne|nf|ng|nh|ni|nj|nl|nm|no|np|nr|nu|ny|nz|oh|ok|om|or|pa|pe|pf|pg|ph|pk|pl|pm|pn|pr|ps|pt|pw|py|qa|re|ri|ro|ru|rw|sa|sb|sc|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|st|su|sv|sy|sz|tc|td|tf|tg|th|tj|tk|tl|tm|tn|to|tp|tr|tt|tv|tw|tx|tz|ua|ug|uk|um|us|ut|uy|uz|va|vc|ve|vg|vi|vn|vt|vu|wa|wf|wi|ws|wv|wy|ye|yt|yu|za|zm|zw".split("|");
    function hasTLD (s) {
        let m = s.match(/^(?:(?:[^\.\s:\/]+\.)+?)+([a-zA-Z]+)(?::\d+)?(?:\/[^\s]*)?$/i);
        return m != null && tldList.indexOf(m[1]) != -1;
    }

    function requirePrefix (s) {
        if (!s)
          return false;
        let validators = [hasMultipleWords, isWord, isIPAddress, hasScheme, hasTLD];
        return !(validators.some(function(validator) { return validator(s); }));
    }

    liberator.plugins.libly.$U.around(
        liberator,
        'open',
        function (next, args) {
            let [urls, where, force] = args;
            if (typeof urls == "string") {
                if (requirePrefix(urls.trim())) {
                    args[0] = options.defsearch + " " + urls;
                }
            }
            return next();
        }
    )
})();
