/**
 * ==VimperatorPlugin==
 * @name            cookie.js
 * @description     display cookie in ':pageinfo'.
 * @description-ja  :pageinfo で cookie を表示する
 * @author          janus_wel <janus_wel@fb3.so-net.ne.jp>
 * @version         0.10
 * @minversion      2.0pre
 * ==/VimperatorPlugin==
 *
 * LICENSE
 *   New BSD License
 *
 * USAGE
 *   set 'c' to option 'pageinfo' and type ':pageinfo'
 *
 * EXAMPLE
 *   set pageinfo=gfmc
 *
 * HISTORY
 *   2008/11/06 ver. 0.10   - initial written.
 *
 */

( function () {

// class definition
// cookie manager
function CookieManager() {
    this.initialize.apply(this, arguments);
}
CookieManager.prototype = {
    initialize: function (uri) {
        const Cc = Components.classes;
        const Ci = Components.interfaces;

        const MOZILLA = '@mozilla.org/';
        const IO_SERVICE = MOZILLA + 'network/io-service;1';
        const COOKIE_SERVICE = MOZILLA + 'cookieService;1';

        this.ioService = Cc[IO_SERVICE].getService(Ci.nsIIOService);
        this.cookieService = Cc[COOKIE_SERVICE].getService(Ci.nsICookieService);
        if(!this.ioService || !this.cookieService) {
            throw new Error('error on CookieManager initialize.');
        }

        this.readCookie(uri);
    },

    readCookie: function (uri) {
        if(uri) {
            this.uri = uri;
            this.uriObject = this.ioService.newURI(uri, null, null);
            this.cookie = this._deserializeCookie(this._getCookieString());
        }
    },

    _getCookieString: function () {
        return this.uriObject
            ? this.cookieService.getCookieString(this.uriObject, null)
            : null;
    },

    _setCookieString: function (cookieString) {
        if(this.uriObject && cookieString) {
            this.cookieService.setCookieString(this.uriObject, null, cookieString, null);
        }
    },

    _deserializeCookie: function (cookieString) {
        if (!cookieString) return {};

        let cookies = cookieString.split(/; */);
        let cookie = {};
        let key, val;
        for (let i=0, max=cookies.length ; i<max ; ++i) {
            [key, val] = cookies[i].split('=');
            cookie[key] = val;
        }
        return cookie;
    },

    getCookie: function (key) {
        return this.cookie[key] ? this.cookie[key] : null;
    },

    properties: function () {
        return [k for ([k, v] in Iterator(this.cookie))];
    },

    setCookie: function (obj) {
        this.cookie[obj.key] = obj.value;
        let string = [
            obj.key + '=' + obj.value,
            'domain=' + obj.domain,
            'expires=' + new Date(new Date().getTime() + obj.expires),
        ].join('; ');
        this._setCookieString(string);
    },
};

liberator.modules.buffer.addPageInfoSection(
    'c',
    'Cookie',
    function (verbose) {
        if(verbose) {
            let p;
            let c = new CookieManager(liberator.modules.buffer.URL);
            for ([, p] in Iterator(c.properties())) {
                yield [p, c.getCookie(p)];
            }
        }
        return;
    }
);

})();

// vim: set sw=4 ts=4 et;
