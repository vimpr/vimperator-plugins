/*
 * ==VimperatorPlugin==
 * @name            imageextender.js
 * @description     extend image operation.
 * @description-ja  画像操作特集。
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
 *  extended-hints mode ';m' to yank image URL and
 *  ';i' to save image are available.
 *  there are default setting.
 *  you can change there by below settings.
 *
 *  command ':downimageall' is also available.
 *  it is to download all images of current page,
 *  but it effects heavy load to the server,
 *  you must use carefully.
 *  we are NOT RESPONSIBLE for result of this command.
 *
 * SETTING
 *  image_extender_yank_key:    key name to yank image URL.
 *                              default is 'm'.
 *  image_extender_save_key:    key name to save image.
 *                              default is 'i'.
 *  image_extender_skip_prompt: if set 'true', skip prompt to locate and name.
 *                              the reflection of this setting is dynamic.
 *                              ':downimageall' command ignore this setting.
 *                              default is 'false'
 *
 * EXAMPLE
 *  in .vimperatorrc
 *
 *      image_extender_yank_key='g'
 *      image_extender_save_key='e'
 *      image_skip_prompt='true'
 *
 *  in this settings, ';g' start extended-hints mode to yank image URL.
 *  ';e' start it to save image. prompt is not displayed at save operation.
 *
 * */

( function () {

// default settings
const yankKey = liberator.globalVariables.image_extender_yank_key || 'm';
const saveKey = liberator.globalVariables.image_extender_save_key || 'i';

// common settings
const query = '//img[@src and not(starts-with(@src, "data:"))]';
const interval = 200; // 5 images per second

// extended-hints mode
// to yank image URL
hints.addMode(
    yankKey,
    'Yank image URL',
    function (element) util.copyToClipboard(element.src, true),
    function () query
);
// to save image
hints.addMode(
    saveKey,
    'Save image',
    function (element) {
        let skipPrompt = stringToBoolean(liberator.globalVariables.image_extender_skip_prompt, false);

        try       { saveImage(element, skipPrompt); }
        catch (e) { liberator.echoerr(e); }
    },
    function () query
);
commands.addUserCommand(
    ['downimageall'],
    'download all images of current page',
    function () {
        // refer: http://d.hatena.ne.jp/amachang/20071108/1194501306
        let images = buffer.evaluateXPath(query);
        let l = images.snapshotLength;
        let i = 0;
        setTimeout ( function a() {
            if (!(i < l)) return;
            try       { saveImage(images.snapshotItem(i), true); }
            catch (e) { liberator.echoerr(e); }
            ++i;
            setTimeout(a, interval);
        }, interval);
    },
    {}
);

// stuff function
function stringToBoolean(str, defaultValue) {
    return !str                          ? (defaultValue ? true : false)
         : str.toLowerCase() === 'false' ? false
         : /^\d+$/.test(str)             ? (parseInt(str) ? true : false)
         :                                 true;
}

function saveImage(imgElement, skipPrompt) {
    let doc = imgElement.ownerDocument;
    let url = imgElement.src;
    let filename = url.split(/\/+/g).pop();

    urlSecurityCheck(url, doc.nodePrincipal);
    // we always want to save that link relative to the current working directory
    options.setPref("browser.download.lastDir", io.getCurrentDirectory().path);
    saveImageURL(url, filename, null, true, skipPrompt, makeURI(url, doc.characterSet));
}
} )();

// vim: sw=4 sts=4 ts=4 et
