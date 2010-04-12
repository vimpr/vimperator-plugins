/**
 * Vimperator-Plugin
 * @see http://vimperator.g.hatena.ne.jp/voidy21/20100119/1263907211
 * @see http://vimperator.g.hatena.ne.jp/nokturnalmortum/20100120/1263927707
 * @see http://vimperator.g.hatena.ne.jp/teramako/20100221/1266774716
 * @require _libly.js
 */

let U = liberator.plugins.libly.$U;

/**
 * create a function for replacing
 * tabbrowser.addTab or browser.loadURIWithFlags method
 * to the function.
 * @param {Boolean} isAddTab either for tabbrowser.addTab or not
 * @return {Function}
 */
function createAround(isAddTab){
  /**
   * replaced function
   * @param {Function} wrappedOriginalFunction
   * @param {arguments} args the arguments for original function
   */
  return function openerAround(wrappedOriginalFunction, args){
    let url = args[0], uri;
    if (!url)
      return wrappedOriginalFunction();
    try {
      uri = getRedirectedURL(util.createURI(url));
      args[0] = uri.spec;
    } catch(e){
      liberator.echoerr(e);
    }
    if (!(uri && jump(uri))){
      if (isAddTab){
        let tab = wrappedOriginalFunction();
        if (!("_around" in tab))
          tab.linkedBrowser._around = U.around(tab.linkedBrowser,
                                               "loadURIWithFlags",
                                               createAround(false));
        return tab;
      }
      return wrappedOriginalFunction();
    }
    return tabs.getTab();
  };
}

/**
 * @param {String} msg
 */
function echomsg(msg){
  liberator.echomsg(NAME + ": " + msg, 2);
}

/**
 * if already the aURI is opened in the tabs,
 *  selected the tab and return true
 * or else
 *  return false
 * @param {nsIURI} aURI
 * @param {Boolean}
 */
function jump(aURI){
  if (aURI.schemeIs("about"))
    return false;
  for (let [i, browser] in tabs.browsers){
    if (browser.currentURI.equals(aURI)){
      echomsg("jumping to " + i + ": " + aURI.spec);
      tabs.select(i);
      return true;
    }
  }
  return false;
}

/**
 * if aURI is "URL Shortener" host,
 * returns true or else returns false
 * @param {nsIURI} aURI
 * @return {Boolean}
 */
function isShortenURLHost(aURI){
  switch(aURI.host){
    case "bit.ly":
    case "j.mp":
    case "goo.gl":
    case "ff.im":
    case "ow.ly":
    case "tinyurl.com":
    case "tumblr.com":
      return true;
    default:
      return false;
  }
}
/**
 * @param {nsIURI} aURI
 * @return {nsIURI} either a redirected URI or an URI of the arugments
 */
function getRedirectedURL(aURI){
  if ((aURI.schemeIs("http") || aURI.schemeIs("https")) && isShortenURLHost(aURI)){
    let x = new XMLHttpRequest;
    x.open("HEAD", aURI.spec, false);
    x.send(null);
    echomsg(aURI.spec + " -> " + x.channel.URI.spec);
    return x.channel.URI;
  }
  return aURI;
}

function init(){
  onUnload();
  let tabbrowser = getBrowser();
  tabbrowser._around = U.around(tabbrowser, "addTab", createAround(true));
  for (let [,browser] in tabs.browsers){
    browser._around = U.around(browser, "loadURIWithFlags", createAround(false));
  }
}
init();

/**
 * called before the script is reloaded
 */
function onUnload(){
  let tabbrowser = getBrowser();
  if ("_around" in tabbrowser){
    tabbrowser._around.restore();
    delete tabbrowser_around
  }
  for (let [,browser] in tabs.browsers){
    if ("_around" in browser){
      browser._around.restore();
      delete browser_around
    }
  }
}

// vim: sw=2 ts=2 et:
