/*
 * ==VimperatorPlugin==
 * @name            pathtraq.js
 * @description     optimize the indicator of Pathtraq add-on.
 * @description-ja  Pathtraq アドオンの表示をいい感じにする。
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
 *  this plugin change Pathtraq indicators to non-display,
 *  and display the icon of Pathtraq.
 *  you can use value 'p' in option 'pageinfo'.
 *  it will display ratings of current page.
 *
 *  refer: http://pathtraq.com/
 *
 * EXAMPLE
 *  default + Pathtraq
 *      :set pageinfo=gfmp
 *
 * */

( function () {

// add-on check
const doc = window.document;
if (!doc.getElementById('pathtraq-status')) {
    liberator.log('pathtraq.js is need Pathtraq add-on: http://pathtraq.com/install', 0);
    return;
}

// favicon
var icon = 'data:image/png;base64,'+
    'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAA3NCSVQICAjb4U/gAAAAPFBMVEUJ'+
    'tsHd8vQ3xMyT3+Pv7+9z1dsYu8W/6u3s9/dVzNTo6OjO7/GD2t9k0Nf39/dGyNAov8mh4ub///+i'+
    '4+eX1QPaAAAAFHRSTlP/////////////AP////////8A/xAuIvoAAAAJcEhZcwAAHCAAABwgAc0P'+
    'm54AAAAcdEVYdFNvZnR3YXJlAEFkb2JlIEZpcmV3b3JrcyBDUzOY1kYDAAAEEXRFWHRYTUw6Y29t'+
    'LmFkb2JlLnhtcAA8P3hwYWNrZXQgYmVnaW49IiAgICIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6'+
    'a2M5ZCI/Pgo8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9i'+
    'ZSBYTVAgQ29yZSA0LjEtYzAzNCA0Ni4yNzI5NzYsIFNhdCBKYW4gMjcgMjAwNyAyMjoxMTo0MSAg'+
    'ICAgICAgIj4KICAgPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAy'+
    'LzIyLXJkZi1zeW50YXgtbnMjIj4KICAgICAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIK'+
    'ICAgICAgICAgICAgeG1sbnM6eGFwPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIj4KICAg'+
    'ICAgICAgPHhhcDpDcmVhdG9yVG9vbD5BZG9iZSBGaXJld29ya3MgQ1MzPC94YXA6Q3JlYXRvclRv'+
    'b2w+CiAgICAgICAgIDx4YXA6Q3JlYXRlRGF0ZT4yMDA4LTAxLTAyVDExOjEyOjE0WjwveGFwOkNy'+
    'ZWF0ZURhdGU+CiAgICAgICAgIDx4YXA6TW9kaWZ5RGF0ZT4yMDA4LTAxLTAyVDEzOjU0OjU0Wjwv'+
    'eGFwOk1vZGlmeURhdGU+CiAgICAgIDwvcmRmOkRlc2NyaXB0aW9uPgogICAgICA8cmRmOkRlc2Ny'+
    'aXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczpkYz0iaHR0cDovL3B1cmwub3Jn'+
    'L2RjL2VsZW1lbnRzLzEuMS8iPgogICAgICAgICA8ZGM6Zm9ybWF0PmltYWdlL3BuZzwvZGM6Zm9y'+
    'bWF0PgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4K'+
    'ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg'+
    'ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAg'+
    'ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg'+
    'ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAg'+
    'ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg'+
    'ICAgICAgICDwMiY1AAAAfklEQVQYlV3PyxbDIAgE0DFBfMVpe/r//xqQ2EVno17lgOgeoUd8i3VO'+
    'U6EzyQMsCo8OWSBJcVXWDLU3BszIVi+2Ti44UL1aKt4BAFcvKv4AuqF4CT9oG3TYXEP9IgBoV4M1'+
    '6wGv0yfTL/sGG7YUsv+AXWR9LeBo0XaDPB+P3E6JCGjvBk1hAAAAAElFTkSuQmCC';

// display icon
let panel = doc.createElement('statusbarpanel');
let label = doc.getElementById('pathtraq-app-label');
panel.setAttribute('id', 'panel-pathtraq');
panel.setAttribute('class', 'statusbarpanel-iconic');
panel.setAttribute('src', icon);
label.parentNode.appendChild(panel);

// register pageinfo
let pageRating = doc.getElementById('pathtraq-status-rating-page');
let siteRating = doc.getElementById('pathtraq-status-rating-site');
liberator.modules.buffer.addPageInfoSection(
    'p',
    'Pathtraq Ratings',
    function (verbose) {
        if(verbose) {
            if (pageRating.value) yield ['Page rating', pageRating.value];
            if (siteRating.value) yield ['Site rating', siteRating.value];
        }
        return;
    }
);

// hide elements
[
    label,
    pageRating,
    siteRating,
    doc.getElementById('pathtraq-status-rating-sep'),
].forEach(function (n) {
    n.setAttribute('style', 'display: none !important;');
});

} )();

// vim: set sw=4 ts=4 et;
