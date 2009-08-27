/**
 * encodingSwithcerCommand (Vimperator plugin)
 * @author teramako teramako@gmail.com, hogelog <konbu.komuro@gmail.com>
 * @version 0.1
 *
 * Usage:
 *
 * change encoding
 * :fileencoding {encodeName}
 * :fenc {encodeName}
 *
 * list available encodings
 * :listencoding [expr]
 * :lsenc [expr]
 *
 * change auto detector
 * :autodetector {detectorName}
 * :audet {detectorName}
 *
 * list available auto detectors
 * :listdetector [expr]
 * :lsdet [expr]
 */
(function(){

var encodings = [];
var detectors = [];
const Cc = Components.classes;
const Ci = Components.interfaces;
if (!RDF) var RDF = Cc['@mozilla.org/rdf/rdf-service;1'].getService(Ci.nsIRDFService);
if (!RDFCU) var RDFCU = Cc['@mozilla.org/rdf/container-utils;1'].getService(Ci.nsIRDFContainerUtils);
var cm = RDF.GetDataSource('rdf:charset-menu');
var sbService = Cc['@mozilla.org/intl/stringbundle;1'].getService(Ci.nsIStringBundleService);
var sbCharTitle = sbService.createBundle('chrome://global/locale/charsetTitles.properties');
CreateMenu('browser');
CreateMenu('more-menu');
var allEnum = cm.GetAllResources();
while (allEnum.hasMoreElements()){
    var res = allEnum.getNext().QueryInterface(Ci.nsIRDFResource);
    var value = res.Value;
    if (RDFCU.IsContainer(cm, res) || value.indexOf('charset.') == 0 || value.indexOf('----') == 0) {
        continue;
    }
    var label = sbCharTitle.GetStringFromName(value.toLowerCase() + '.title');
    if (res.Value.indexOf('chardet.') == 0){
        value = value.substr('chardet.'.length);
        var buf = createDetector(value);
        buf[1] = label;
        detectors.push(buf);
    } else {
        encodings.push([value,label]);
    }
}
function createDetector(name){
    var i = name.indexOf('_');
    if (i > 0){
        return [name.substr(0,i),null,name.substr(i)];
    }
    return [name,null,''];
}
function getDetector(name){
    for (let i = 0, l = detectors.length; i < l; i++){
        if (detectors[i][0].toLowerCase() == name.toLowerCase()){
            return detectors[i][0] + detectors[i][2];
        }
    }
}
function getEncoding(name){
    for (let i = 0, l = encodings.length; i < l; i++){
        if (encodings[i][0].toLowerCase() == name.toLowerCase()){
            return encodings[i][0];
        }
    }
}
function isValid(array, value) array.some(function(v)
    v[0].toLowerCase() == value.toLowerCase());
function completion(array, filter){
    if (!filter) return array;
    filter = filter.toLowerCase();
    return array.filter(function(v)
        v[0].toLowerCase().indexOf(filter) == 0);
}
liberator.modules.commands.addUserCommand(['fileencoding','fenc'],'set the charactor encoding for the current page', function(args) {
        var value = args.string == undefined ? args: args.string;
        if(!value) {
            var fenc = getBrowser().docShell.QueryInterface(Ci.nsIDocCharset).charset;
            liberator.echo("fileencoding: "+fenc);
            return fenc;
        } else if(!isValid(encodings, value)) {
            liberator.echoerr('Invalid argument: fileencoding '+value);
            return false;
        } else {
            value = getEncoding(value);
            SetForcedCharset(value);
            return value;
        }
    },
    {
        completer: function(context){
            let filter = context.filter;
            context.completions = completion(encodings, filter);
        }
    }
);
liberator.modules.commands.addUserCommand(['autodetector','audet'],'set auto detect character encoding', function(args) {
        var value = args.string == undefined ? args: args.string;
        var pref = Cc['@mozilla.org/preferences-service;1'].getService(Ci.nsIPrefBranch);
        if(!value) {
            var audet = pref.getComplexValue('intl.charset.detector',Ci.nsISupportsString).data;
            if(audet=='') {
                audet = 'off';
            }
            audet = createDetector(audet)[0];
            liberator.echo("autodetector: "+audet);
            return audet;
        } else if(!isValid(detectors, value)) {
            liberator.echoerr('Invalid argument: autodetector '+value);
            return false;
        } else {
            var str = Cc['@mozilla.org/supports-string;1'].createInstance(Ci.nsISupportsString);
            if (!value || value == 'off') {
                str.data = '';
            } else {
                str.data = value = getDetector(value);
            }
            pref.setComplexValue('intl.charset.detector',Ci.nsISupportsString, str);
            SetForcedDetector(true);
        }
    },
    {
        completer: function(context, arg){
            let filter = context.filter;
            context.completions = completion(detectors, filter);
        }
    }
);
function listCharset(arg, current, list){
    if (!arg) arg = '.';
    var reg = new RegExp(arg,'i');
    var str = [];
    str.push('<table>');
    list.forEach(function(i){
        if (!reg.test(i[0]) && !reg.test(i[1])) return;
        str.push('<tr>');
        if (current == i[0]){
            str.push('<td class="hl-Title">' + i[0] + '</td><td class="hl-Title">' + i[1] + '</td>');
        } else {
            str.push('<td>' + i[0] + '</td><td>' + i[1] + '</td>');
        }
        str.push('</tr>');
    });
    str.push('</table>');
    liberator.echo( str.join(''), true);
}
liberator.modules.commands.addUserCommand(['listencoding','lsenc'],'list all encodings',
    function(args){
        var arg = args.string == undefined ? args: args.string;
        listCharset(arg, liberator.modules.options.fileencoding, encodings);
    },{
        completer: function(context, arg){
            let filter = context.filter;
            context.completions = completion(encodings, filter);
        }
    }
);
liberator.modules.commands.addUserCommand(['listdetector','lsdet'],'list all auto detectors',
    function(args){
        var arg = args.string == undefined ? args: args.string;
        listCharset(arg, liberator.modules.options.autodetector, detectors);
    },{
        completer: function(context, arg){
            let filter = context.filter;
            context.completions = completion(detectors, filter);
        }
    }
);

})();

// vim: set fdm=marker sw=4 ts=4 et:
