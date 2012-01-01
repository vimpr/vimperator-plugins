/* NEW BSD LICENSE {{{
Copyright (c) 2012, anekos.
All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

    1. Redistributions of source code must retain the above copyright notice,
       this list of conditions and the following disclaimer.
    2. Redistributions in binary form must reproduce the above copyright notice,
       this list of conditions and the following disclaimer in the documentation
       and/or other materials provided with the distribution.
    3. The names of the authors may not be used to endorse or promote products
       derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF
THE POSSIBILITY OF SUCH DAMAGE.


###################################################################################
# http://sourceforge.jp/projects/opensource/wiki/licenses%2Fnew_BSD_license       #
# に参考になる日本語訳がありますが、有効なのは上記英文となります。                #
###################################################################################

}}} */

// INFO {{{
let INFO =
<>
  <plugin name="MPDCurrentSong" version="1.0.0"
          href="http://vimpr.github.com/"
          summary="Get current song for MPD"
          lang="en-US"
          xmlns="http://vimperator.org/namespaces/liberator">
    <author email="anekos@snca.net">anekos</author>
    <license>New BSD License</license>
    <project name="Vimperator" minVersion="3.0"/>
    <p>
      <code><![CDATA[
:cabbrev -javascript .song let (song = plugins.mpdCurrentsong.API.getSongInfo()) <>{song.Title} / {song.Artist} #NowPlaying</>
      ]]> </code>
    </p>
  </plugin>
  <plugin name="MPDCurrentSong" version="1.0.0"
          href="http://vimpr.github.com/"
          summary="現在再生中の曲を取得する for MPD"
          lang="ja"
          xmlns="http://vimperator.org/namespaces/liberator">
    <author email="anekos@snca.net">anekos</author>
    <license>New BSD License</license>
    <project name="Vimperator" minVersion="3.0"/>
    <p>
      <code><![CDATA[
:cabbrev -javascript .song let (song = plugins.mpdCurrentsong.API.getSongInfo()) <>{song.Title} / {song.Artist} #NowPlaying</>
      ]]> </code>
    </p>
  </plugin>
</>;
// }}}


(function () {

  let socketService =
    let (stsvc = Cc['@mozilla.org/network/socket-transport-service;1'])
      let (svc = stsvc.getService())
        svc.QueryInterface(Ci.nsISocketTransportService);

  function getSongInfo () {
    let host = liberator.globalVariables.mpd_currentsong_host || 'localhost';
    let port = liberator.globalVariables.mpd_currentsong_port || 6600;
    let transport = socketService.createTransport(null, 0, host, port, null);
    let os = transport.openOutputStream(0, 0, 0);
    let is = transport.openInputStream(0, 0, 0);
    let cis = Cc["@mozilla.org/intl/converter-input-stream;1"].createInstance(Ci.nsIConverterInputStream);
    cis.init(is, 'UTF-8', 1024, 0xFFFD);
    cis.QueryInterface(Ci.nsIUnicharLineInputStream);

    let buf = "currentsong\nping\n";
    os.write(buf, buf.length);

    let timeout = true;
    let song = {};

    let buf = {};
    outer: for (let i = 0; i < 100; i++) {
      while (cis.readLine(buf) > 0) {
        let line = buf.value;
        let m = line.match(/^(\w+):\s*(.*)$/);
        if (m)
          song[m[1]] = m[2];
        if (!/^OK MPD/.test(line) && /^OK/.test(line)) {
          timeout = false;
          break outer;
        }
      }
      liberator.sleep(100);
    }
    os.close();
    is.close();

    if (timeout)
      throw 'Timeout';

    return song;
  }

  __context__.API = {
    getSongInfo: getSongInfo
  };

})();

// vim:sw=2 ts=2 et si fdm=marker:
