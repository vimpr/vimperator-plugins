// ==VimperatorPlugin==
// @name           memo
// @description    to write a memo
// @description-ja メモを書く
// @license        Creative Commons 2.1 (Attribution + Share Alike)
// @version        1.0
// @author         anekos (anekos@snca.net)
// @maxVersion     2.0pre
// @minVersion     2.0pre
// ==/VimperatorPlugin==
//
// Usage:
//    :memo
//      show the memo that was written.
//    :memo fooooobar!
//      write "fooooobar!" to the specified memo file.
//
// Usage-ja:
//    :memo
//      書かれたメモを表示する
//    :memo fooooobar!
//      "fooooobar!" と、メモに書く
//
// Links:
//
// References:
//    http://developer.mozilla.org/index.php?title=Ja/Code_snippets/File_I%2F%2FO

(function () {
  let localfilepath = liberator.globalVariables.memo_filepath || io.expandPath('~/.vimpmemo');
  let charset = 'UTF-8';

  //ネタ的
  let lz = function(s,n)(s+'').replace(new RegExp('^.{0,'+(n-1)+'}$'),function(s)lz('0'+s,n));

  function dateTime () {
    with (new Date())
      return lz(getFullYear(), 4) + '/' +
             lz(getMonth() + 1, 2) + '/' +
             lz(getDate(), 2) + ' ' +
             lz(getHours(), 2) + ':' +
             lz(getMinutes(), 2);
  }

  function filepath () {
    let result = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
    result.initWithPath(localfilepath);
    return result;
  }

  function puts (line) {
    line = dateTime() + "\t" + line + "\n";
    let out = Cc["@mozilla.org/network/file-output-stream;1"].createInstance(Ci.nsIFileOutputStream);
    let conv = Cc['@mozilla.org/intl/converter-output-stream;1'].
                            createInstance(Ci.nsIConverterOutputStream);
    out.init(filepath(), 0x02 | 0x10 | 0x08, 0664, 0);
    conv.init(out, charset, line.length,
              Components.interfaces.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER);
    conv.writeString(line);
    conv.close();
    out.close();
  }

  function gets () {
    let file = Cc['@mozilla.org/network/file-input-stream;1'].createInstance(Ci.nsIFileInputStream);
    file.init(filepath(), 1, 0, false);
    let conv = Cc['@mozilla.org/intl/converter-input-stream;1'].createInstance(Ci.nsIConverterInputStream);
    conv.init(file, charset, file.available(), conv.DEFAULT_REPLACEMENT_CHARACTER);
    let result = {};
    conv.readString(file.available(), result);
    conv.close();
    file.close();
    return result.value;
  }

  commands.addUserCommand(
    ['memo'],
    'Write memo',
    function (arg) {
      if (arg.string) {
        puts(arg.string);
      } else {
        liberator.echo(gets());
      }
    }
  );

})();
