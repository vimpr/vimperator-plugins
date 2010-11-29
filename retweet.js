// PLUGIN_INFO//{{{
var PLUGIN_INFO =
<VimperatorPlugin>
  <name>retweet</name>
  <description>ReTweet This Page.</description>
  <description lang="ja">開いているTweetをReTweetします。</description>
  <author mail="from.kyushu.island@gmail.com" homepage="http://iddy.jp/profile/from_kyushu">from_kyushu</author>
  <version>0.3</version>
  <license>GPL</license>
  <minVersion>1.2</minVersion>
  <maxVersion>2.1</maxVersion>
  <updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/retweet.js</updateURL>
  <require type="plugin">_libly.js</require>
  <detail><![CDATA[

== Command ==
Usage:
  :rtt
    ReTweet This Post.

  ]]></detail>
</VimperatorPlugin>;
//}}}
//
(
  function()
  {
    var password;
    var username;
    var passwordManager = Cc["@mozilla.org/login-manager;1"].getService(Ci.nsILoginManager);
    var $U = liberator.plugins.libly.$U;

    function getBody()
    {
      var body = $U.getFirstNodeFromXPath("//span[@class='entry-content']").innerHTML;
      //return body.replace(/<[^>]*>/g, "");
      var tags = body.match(/<[^>]*>/g);
      for(var tag in tags)
      {
        body = body.replace(tags[tag],"");
      }
      return body;
    }

    function getUserName()
    {
      return $U.getFirstNodeFromXPath('//a[contains(concat(" ",normalize-space(@class)," "),"screen-name")]').innerHTML;
    }

    function getShortenUrl(longUrl)
    {
      var xhr = new XMLHttpRequest();
      var req = "http://bit.ly/api?url=" + encodeURIComponent(longUrl);
      xhr.open('GET',req, false);
      xhr.send(null);
      if(xhr.status != 200)
      {
        return longUrl;
      }
      return xhr.responseText;
    }

    function sendTwitter(url,name,body,comment)
    {
      var xhr = new XMLHttpRequest();
      var statusText = (comment ? comment + " " : "") + "RT @" + name + " [" + url +"]: " + body;
      return liberator.echo(statusText);
      xhr.open("POST", "https://twitter.com/statuses/update.json", false, username, password);
      xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      xhr.send("status=" + encodeURIComponent(statusText) + "&source=Vimperator");

      liberator.echo("[RT] Your post was sent.");
    }

    commands.addUserCommand(
      ['retweet[This]','rtt'],
      'ReTweet This.',
      function(args)
      {
        try
        {
          var logins = passwordManager.findLogins({}, "http://twitter.com","https://twitter.com",null);
          var body = getBody();
          var name = getUserName();
          var url = getShortenUrl(buffer.URL);
          if(logins.length)
          {
            username = logins[0].username;
            password = logins[0].password;
            sendTwitter(url,name,body,args.literalArg);
          }
          else if(liberator.globalVariables.twitter_username && liberator.globalVariables.twitter_password)
          {
            username = liberator.globalVariables.twitter_username;
            password = liberator.globalVariables.twitter_password;
            sendTwitter(url,name,body,args.literalArg);
          }
          else
          {
            throw "Accont not found";
          }
        }
        catch(e)
        {
          liberator.echoerr(e);
        }
      },
      {
        literal: 0
      },
      true
    );
  }
)();
