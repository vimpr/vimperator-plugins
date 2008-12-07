/**
 * notifier.js plugin subject
 * @name            subject_hatena_bottle.js
 * @description     notify if hatena bottle changed.
 * @description-ja  はてなボトルの変更通知。
 * @author          suVene suvene@zeromemory.info
 * @version         0.1.0
 * Last Change:     08-Dec-2008.
 */
(function() {

var notifier = liberator.plugins.notifier;
if (!notifier) return;

var libly = notifier.libly;
var $U = libly.$U;
var logger = $U.getLogger('subject_hatelabo_bottle');

var URL = 'http://bottle.hatelabo.jp';

notifier.subject.register({
    interval: 30,
    initialize: function() {
        this.count = 0;
        this.initialized = false;
        this.cache;

        var req = new libly.Request(URL);
        req.addEventListener('onSuccess', $U.bind(this, function(res) {
            logger.log('initialized');
            this.cache = this.parse(res);
            if (this.cache)
                this.initialized = true;
        }));
        req.get();
    },
    parse: function(res) {

        var ret, dom;

        if (!res.isSuccess() || res.responseText == '') return ret;

        dom = res.getHTMLDocument('id("body")//div[contains(concat(" ", @class, " "), " entry ")]');
        if (!dom) return ret;

        ret = [];
        for (let i = 0, len < dom.childNodes.length; i < len; i++) {
            ret.push(dom.childNodes[i]);
        }

        return ret;
    },
    check: function() {

        if (!this.initialized) return;

        this.count++;
        logger.log('check');
        var req = new libly.Request(URL);
        req.addEventListener('onSuccess', $U.bind(this, function(res) {
            var text = res.responseText;
            logger.log('success!! ');
            var message = new notifier.Message('TEST', text);
            this.notify(message);

            if (this.count == 5) {
                notifier.subject.unregister(this);
                this.count = 0;
            }
        }));
        req.get();
    }
});

})();
// vim: set fdm=marker sw=4 ts=4 sts=0 et:

