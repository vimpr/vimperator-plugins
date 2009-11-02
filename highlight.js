/*
 * ==VimperatorPlugin==
 * @name            highlight.js
 * @description     Factory for the object to highlight specified element[s]. this set in plugins.highlighterFactory.
 * @description-ja  指定した要素をハイライトするオブジェクトを返す Factory 。 plugins.highlighterFactory に構築される。
 * @author          janus_wel <janus_wel@fb3.so-net.ne.jp>
 * @version         0.12
 * @minversion      2.3pre 2009/11/02
 * ==/VimperatorPlugin==
 *
 * LICENSE
 *  New BSD License
 *
 * USAGE
 *  plugins.highlighterFactory() return the object to highlight element[s].
 *  arguments is object that have below properties.
 *      color:    color name that define by css or RGB format ( #xxxxxx ),
 *      opacity:  opacity for -moz-opacity property in css.
 *      interval: interval to blink ( unit: msec ). if 0 specified, not blink.
 *
 *  returned object has 3 methods.
 *      set:            setter that accept object have above properties.
 *      highlight:      method to highlight specified element.
 *      unhighlightAll: unhighlight all.
 *
 *  highlight is implement by "div" element that have style "position: absolute;".
 *  it has class name "vimp_plugin_highlightelement", so you should use buffer.evaluateXPath
 *  with query that like '//div[contains(concat(" ", @class, " "), " vimp_plugin_highlightelement ")]'
 *  when you want to process elements to highlight.
 *
 * EXAMPLE
 *  let h = plugins.highlighterFactory({
 *      color:    '#0080ff',
 *      opacity:  0.7,
 *      interval: 0,
 *  );
 *  h.highlight(content.document.getElementsByTagName('A'));
 *  h.unhighlightAll();
 *
 * TODO
 *  need valid English.
 * */

( function () {

const fixedStyle = [
    'position: absolute;',
    'display:  block;',
    'z-index:  2147483647;',
].join('');

// class definition
function Highlighter() {
    this._initialize.apply(this, arguments);
}
Highlighter.prototype = {
    _initialize: function (args) {
        if (args) this.set(args);
        this.highlightList = [];
    },

    set: function (args) {
        this.color    = args.color;
        this.opacity  = args.opacity;
        this.interval = args.interval;

        this._prepareTemplate();

        return this;
    },

    _prepareTemplate: function () {
        let div = window.document.createElement('div');
        div.className = 'vimp_plugin_highlightelement';

        let style = fixedStyle + [
            'background-color: ' + this.color + ';',
            '-moz-opacity: ' + this.opacity + ';'
        ].join('');
        div.setAttribute('style', style);

        this._highlightTemplate = div;
    },

    highlight: function (element) {
        if (!this._isDisplay(element)) return;

        let doc = element.ownerDocument;

        // TODO: highlight XUL elements
        if (!doc.body) return;

        let scrollX = doc.defaultView.scrollX;
        let scrollY = doc.defaultView.scrollY;

        let rects = element.getClientRects();
        for (let i=0, l=rects.length ; i<l ; ++i) {
            let r = rects[i];
            let h = this._buildHighlighter({
                top:    r.top + scrollY,
                left:   r.left + scrollX,
                width:  r.right - r.left,
                height: r.bottom - r.top,
            });
            this.highlightList.push(h);
            doc.body.appendChild(h);
        }
    },

    _unhighlight: function (element) {
        if (element.intervalId) clearInterval(element.intervalId);
        element.parentNode.removeChild(element);
    },

    unhighlightAll: function () {
        let list = this.highlightList;
        while (list.length) this._unhighlight(list.pop());
    },

    _isDisplay: function (element) {
        let computedStyle = content.document.defaultView.getComputedStyle(element, null);
        return (   computedStyle.getPropertyValue('visibility') !== 'hidden'
                && computedStyle.getPropertyValue('display')    !== 'none');
    },

    _buildHighlighter: function (rect) {
        let div = this._highlightTemplate.cloneNode(false);
        div.style.top    = rect.top + 'px';
        div.style.left   = rect.left + 'px';
        div.style.width  = rect.width + 'px';
        div.style.height = rect.height + 'px';

        if (this.interval > 0) {
            div.intervalId = setInterval(
                function () {
                    let d = div.style.display;
                    div.style.display = (d === 'block' ? 'none' : 'block');
                },
                this.interval
            );
        }
        else {
            div.intervalId = undefined;
        }

        return div;
    },
};

if (!plugins.highlighterFactory) {
    plugins.highlighterFactory = function () {
        let h = new Highlighter();
        return h.set.apply(h, arguments);
    }
}

} )();

// vim: set sw=4 ts=4 et;
