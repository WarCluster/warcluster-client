var express = require('express');
var oauth = require('oauth');
var sys = require('util');
var Organel = require("organic").Organel;
var _ = require("underscore");

module.exports = Organel.extend(function NotFoundPage(plasma, config){
  Organel.call(this, plasma);
  var self = this;

  var consumer = function() {
    return new oauth.OAuth(
      "https://twitter.com/oauth/request_token", 
      "https://twitter.com/oauth/access_token", 
      config.consumerKey, 
      config.consumerSecret, 
      "1.0A", 
      config.callbackFullUrl, 
      "HMAC-SHA1"
    );   
  }

  this.on("HttpServer", function(c){
    var app = c.data.app;

    app.get(config.connectUrl || '/twitter/connect', function(req, res){
      if (typeof req.session == "undefined")
        console.error("Session is undefined");

      consumer().getOAuthRequestToken(function(error, oauthToken, oauthTokenSecret, results){
        if (error) {
          res.send("Error getting OAuth request token : " + sys.inspect(error), 500);
        } else {
          req.session.oauthRequestToken = oauthToken;
          req.session.oauthRequestTokenSecret = oauthTokenSecret;  

          res.redirect("https://twitter.com/oauth/authorize?oauth_token="+oauthToken);
        }
      });
    });

    var url = config.callbackUrl || '/twitter/callback';

    app.get(url, function(req, res, next){
      consumer().getOAuthAccessToken(req.session.oauthRequestToken, req.session.oauthRequestTokenSecret, req.query.oauth_verifier, function(error, oauthAccessToken, oauthAccessTokenSecret, results) {
        if (error) {
          req.twitterError = "Error getting OAuth access token : " + sys.inspect(error);
          next();
        } else {
          req.session.oauthAccessToken = oauthAccessToken;
          req.session.oauthAccessTokenSecret = oauthAccessTokenSecret;
          
          // Right here is where we would write out some nice user stuff
          consumer().get("https://api.twitter.com/1.1/account/verify_credentials.json", req.session.oauthAccessToken, req.session.oauthAccessTokenSecret, function (error, data, response) {
            if (error) {
              req.session.twitterError = "Error getting twitter screen name : " + sys.inspect(error);
              next();
            } else {
              req.session.twitter = JSON.parse(data);
              // console.log("2.req.twitter:", req.session.twitter);
              next();
            }  
          });  
        }
      });
    });

    return false;
  });

})