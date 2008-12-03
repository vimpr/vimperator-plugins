/*
 * ==VimperatorPlugin==
 * @name            toggline.js
 * @description     toggle online/offline.
 * @description-ja  オンライン / オフラインを切り替える。
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
 *  this plugin provide you visualization of online/offline status
 *  and command that toggle online/offline.
 *
 *      :toggline   toggle online/offline
 *
 *  refer: https://developer.mozilla.org/ja/Online_and_offline_events
 *         http://builder.japan.zdnet.com/sp/firefox-3-for-developer-2008/story/0,3800087566,20384534,00.htm
 *
 * TODO
 *  need stylish icon.
 * */

( function () {
// define data
const onLineText  = 'status: online';
const offLineText = 'status: offline';
const onLineIcon = 'data:image/gif;base64,'+
    'R0lGODlhEAAQAMQfAHbDR0twLrPdlpHQaZGYjPn8983muYvSWIPNU3G/RNTtxTZZGn6TbVKCLJPm'+
    'V4nkTOz35ajld8LmqV16Rn7VR4DLT4zlUExgPHGLXIvOYKTad4DZSGm4PlJnQv///////yH5BAEA'+
    'AB8ALAAAAAAQABAAAAWE4Cd+Xml6Y0pORMswE6p6mGFIUR41skgbh+ABgag4eL4OkFisDAwZxwLl'+
    '6QiGzQHEM3AEqFZmJbNVICxfkjWjgAwUHkECYJmqBQNJYSuf18ECAABafQkJD3ZVGhyChoYcHH8+'+
    'FwcJkJccD2kjHpQPFKAbmh4FMxcNqKhTPSknJiqwsSMhADs=';
const offLineIcon = 'data:image/gif;base64,'+
    'R0lGODlhEAAQAMQfAOt0dP94eOFjY/a0tP/JyfFfX/yVlf6mppNtbf5qanknJ9dVVeZqat5eXpiM'+
    'jGo4OIUvL3pGRthWVuhvb1kaGv39/f1lZdg7O/7Y2F8/P+13d4tcXNRTU2dCQv///////yH5BAEA'+
    'AB8ALAAAAAAQABAAAAV/4Cd+Xml6Y0pGTosgEap6G0YQh6FDskhjGg0AMJkwAjxfBygkGhmCAAXl'+
    '6QyGnuLFI4g+qNbixLMNdBNfkpXBLncbial6AC17Gvg4eND1BPB3cHJVBguGhwsSHHo+GRqKHJGR'+
    'CQo9JI4WBZoFFpUVMw8QCqMQU58qJCclqKytIQA7';

let isOnLine = window.navigator.onLine;


// build panel
const doc = window.document;
let panel = doc.createElement('statusbarpanel');
panel.setAttribute('id', 'panel-toggline');
panel.setAttribute('class', 'statusbarpanel-iconic');
panel.setAttribute('tooltiptext', isOnLine ? onLineText : offLineText);
panel.setAttribute('src', isOnLine ? onLineIcon : offLineIcon);


// insert panel
let positionMarker = doc.getElementById('security-button');
positionMarker.parentNode.insertBefore(panel, positionMarker);

// register events
window.addEventListener(
    'online',
    function () {
        panel.setAttribute('src', onLineIcon);
        panel.setAttribute('tooltiptext', onLineText);
    },
    false
);
window.addEventListener(
    'offline',
    function () {
        panel.setAttribute('src', offLineIcon);
        panel.setAttribute('tooltiptext', offLineText);
    },
    false
);

// register command
commands.addUserCommand(
    ['toggline'],
    'toggle online/offline',
    function () {
        BrowserOffline.toggleOfflineStatus();
    },
    {}
);
} )();

// vim: set sw=4 ts=4 et;
