/**
 * notifier.js plugin subject
 * @name            subject_test.js
 * @description     notify if ...
 * @description-ja  ... の時ポップアップ通知。
 * @author          suVene suvene@zeromemory.info
 * @version         0.1.0
 * Last Change:     07-Dec-2008.
 */
(function() {

var notifier = liberator.plugins.notifier;
if (!notifier) return;

var lib = notifier.lib;
var $U = lib.$U;
var logger = $U.getLogger('subject_test');

notifier.subject.register({
    interval: 3,
    initialize: function() {
        logger.log('initialize');
        this.count = 0;
    },
    check: function() {
        this.count++;
        logger.log('check');
        var req = new lib.Request(
            'http://localhost:8080/index.html',
            null,  // headers {}
            {
                encode: 'shift_jis'
            }
        );
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

