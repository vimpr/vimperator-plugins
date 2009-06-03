//
//  hatebuWatchDog.js     - hatena bookmark watch dog -
//

// Clear all watchers if started watcher exists.
if (plugins.hatebuWatchDog && plugins.hatebuWatchDog.stopWatching)
  plugins.hatebuWatchDog.stopWatching();

plugins.hatebuWatchDog = (function() {

  const libly = plugins.libly;
  let previousValue = 0;
  let tasks = [];

  function addTask(target) {
    liberator.dump(target.site);
    const MINUTE = 60; // sec.
    interval = getInterval() || (10 * MINUTE);       // default 10 min.
    interval = Math.max(interval, MINUTE);      // lower limt is 1 min.

    // initialize previous value
    target.previousValue = 0;

    tasks.push(setInterval(watch, 1000 * interval, target));
    liberator.dump({target: target, interval: interval});
  }

  function clearAllTasks() {
    tasks.forEach(function(task) {
        clearInterval(task);
    });
    tasks = [];
    liberator.dump("watch dog is sleeping...");
  }

  function watch(target) {
    getCurrentValue(
      target.site,
      function(currentValue) {
        let delta =  currentValue - target.previousValue;
        if (delta || notifyAlways()) {
          showHatebuNotification(target.site, currentValue, delta);
        }
        target.previousValue = currentValue;
      },
      function() {
        liberator.echoerr("Cannot get current value.");
      }
    );
  }

  function getCurrentValue(target, onSuccess, onFailure) {
    // build hatebu xml-rpc request
    let req = new libly.Request(
      'http://b.hatena.ne.jp/xmlrpc',
      {
        'Content-Type' : 'text/xml'
      },{
        postBody : <methodCall>
                     <methodName>bookmark.getTotalCount</methodName>
                     <params>
                       <param><value><string>{target}</string></value></param>
                     </params>
                   </methodCall>.toXMLString()
      }
    );

    let currentValue;
    req.addEventListener("onSuccess", function(data) {
      liberator.log("XML-RPC request was succeeded.");
      let resXml = new XML(data.responseText.replace(/^<\?xml version[^>]+?>/, ''));
      currentValue = window.eval(resXml..int.toString());
      onSuccess(currentValue);
    });
    req.addEventListener("onFailure", function(data) {
      onFailure();
    });
    liberator.log("reauest...");
    req.post();
    liberator.log("done...");
  }

  function notifyAlways()
    window.eval(liberator.globalVariables.hatebuWatchDogAlways) || false;

  function showHatebuNotification(targetSite, currentValue, delta) {
    let title = delta > 0 ? "\u304A\u3081\u3067\u3068\u3046\u3054\u3056\u3044\u307E\u3059"  // good news
              :(delta < 0 ? "\u6B8B\u5FF5\u306A\u304A\u77E5\u3089\u305B"                    // bad news
              :             "\u304A\u77E5\u3089\u305B");
    let suffix = delta != 0 ? "\u306B\u306A\u308A\u307E\u3057\u305F\u3002"
                            : "\u3067\u3059\u3002";
    let message = "'" + targetSite + "' \u306E\u88AB\u306F\u3066\u30D6\u6570\u306F '" +
                  currentValue + "' " + suffix + " (" + getSignedNum(delta) + ")";

    showAlertNotification(null, title, message);
  }

  function showAlertNotification(icon, title, message) {
    Cc['@mozilla.org/alerts-service;1']
    .getService(Ci.nsIAlertsService)
    .showAlertNotification(
      icon, //'chrome://mozapps/skin/downloads/downloadIcon.png',
      title,
      message
    );
  }

  function getSignedNum(num) {
    if (num > 0) return "+" + num;
    if (num < 0) return "-" + Math.abs(num);
    return "0";
  }

  function getInterval()
    window.eval(liberator.globalVariables.hatebuWatchDogInterval) || 600; // default : 10 min.

  return {
    interval getter: function() getInterval(),
    addTask        : addTask,
    stopWatching   : clearAllTasks
    //previous setter: function(val) previousValue = val,
    //previous getter: function() previousValue
  };
})();

// Awaking the watch dog.
let (targets, self = plugins.hatebuWatchDog) {
  try {
    targets = window.eval(liberator.globalVariables.hatebuWatchDogTargets);
  } catch(e) {
    targets = liberator.globalVariables.hatebuWatchDogTargets;
  }
  if (targets) {
    if (!(targets instanceof Array))
      targets = [targets];
    targets.forEach(function(target) {
      self.addTask({site : target});
    });
  }
  else {
    liberator.echoerr("Please set g:hatebeWatchDogTargets before watch().");
  }
}

liberator.dump("Watch dog is awaking ...");
