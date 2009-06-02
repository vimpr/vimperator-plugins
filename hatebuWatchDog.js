//
//  hatebuWatchDog.js     - hatena bookmark watch dog -
//
plugins.hatebuWatchDog = {};
plugins.hatebuWatchDog = (function() {
  // for DEVELOPMENT
  //liberator.globalVariables.hatebuWatchDogTarget = 'http://d.hatena.ne.jp/snaka72/';
  //liberator.globalVariables.hatebuWatchDogWatchAlways = 'true';

  let previousValue = 0;

  function watch() {
    let libly = plugins.libly;
    if (target() == '') {
      liberator.echoerr("Please set g:hatebeWatchDogTarget before watch().");
      return;
    }
    // build hatebu xml-rpc request
    let requestBody = (
       <methodCall>
          <methodName>bookmark.getTotalCount</methodName>
          <params>
            <param><value><string>{target()}</string></value></param>
          </params>
        </methodCall>
    ).toXMLString();

    let req = new libly.Request(
      'http://b.hatena.ne.jp/xmlrpc',
      {
        'Content-Type' : 'text/xml'
      },{
        asynchronous: false,
        postBody : requestBody
      }
    );

    let currentValue;
    let resXml;
    req.addEventListener("onSuccess", function(data) {
      liberator.log("XML-RPC request was succeeded.");
      resXml = new XML(data.responseText.replace(/^<\?xml version[^>]+?>/, ''));
      currentValue = window.eval(resXml..int.toString());
    });
    req.addEventListener("onFailure", function(data) {
      liberator.echoerr("Cannot remove pin");
    });

    liberator.log("reauest...");
    req.post();
    liberator.log("done...");

    let isDifferent = currentValue != previousValue;
    if (isDifferent || watchAlways())
      growl('Your hatebu count became ... ' + currentValue);

    return {
      isDifferent : isDifferent,
      count: isDifferent ? (previousValue = currentValue)
                         : previousValue
    };
  }

  function target()
    liberator.globalVariables.hatebuWatchDogTarget || '';

  function watchAlways()
    window.eval(liberator.globalVariables.hatebuWatchDogAlways) || false;

  function getInterval()
    window.eval(liberator.globalVariables.hatebuWatchDogInterval) || 600; // default : 10 min.

  function growl(message) {
    Cc['@mozilla.org/alerts-service;1']
    .getService(Ci.nsIAlertsService)
    .showAlertNotification(
      null, //'chrome://mozapps/skin/downloads/downloadIcon.png',
      "From hatebuWatchDog",
      message
    );
  }

  var watchInterval;
  function setWatchInterval(interval) {
    interval = interval || 600;
    interval = interval < 60 ? 60 : interval;

    // Clear interval while plugin reloaded.
    if (watchInterval) {
      clearInterval(watchInterval);
      liberator.echo("timer reset!");
    }
    watchInterval = setInterval(function() watch(), 1000 * interval);
  }

  // Run immediatly
  setWatchInterval(getInterval());

  return {
    watch : watch,
    target: target,
    interval : setWatchInterval
  }
})();
