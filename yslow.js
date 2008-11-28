/*
 * ==VimperatorPlugin==
 * @name            yslow.js
 * @description     optimize the indicator of YSlow add-on.
 * @description-ja  YSlow アドオンの表示をいい感じにする。
 * @author          janus_wel <janus_wel@fb3.so-net.ne.jp>
 * @version         0.10
 * @minversion      2.0pre
 * @maxversion      2.0pre
 * ==/VimperatorPlugin==
 *
 * LICENSE
 *  New BSD License
 *
 * USAGE
 *  this plugin change YSlow indicators to non-display.
 *  you can use value 'y' in option 'pageinfo'.
 *  it will display performances of current page.
 *
 * EXAMPLE
 *  default + YSlow
 *      :set pageinfo=gfmy
 *
 * */

( function () {

// add-on check
const doc = window.document;
if (!doc.getElementById('yslowStatusBar')) {
    liberator.log('yslow.js is need YSlow add-on: https://addons.mozilla.org/firefox/addon/5369', 0);
    return;
}

// register pageinfo
let grade = doc.getElementById('yslowStatusGrade');
let size  = doc.getElementById('yslowStatusSize');
let time  = doc.getElementById('yslowStatusTime');
liberator.modules.buffer.addPageInfoSection(
    'y',
    'YSlow Status',
    function (verbose) {
        if(verbose) {
            if (grade.value && grade.value !== 'YSlow') yield ['Grade', grade.value];
            if (size.value) yield ['Size', size.value];
            if (time.value) yield ['Time', time.value];
        }
        return;
    }
);

// hide elements
[
    grade,
    size,
    time,
].forEach(function (n) {
    n.setAttribute('style', 'display: none !important;');
});

} )();
