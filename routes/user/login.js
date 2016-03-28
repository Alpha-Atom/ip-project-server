var Redis = require("ioredis");
var redis = new Redis();
var bcrypt = require('bcrypt-nodejs');
var authgen = require("./../../utils/auth-keys.js");

module.exports = {
  perform: function(a,b) {
    perform(a,b);
  }
}

var perform = function(req, res) {
  var username = req.body.user || req.query.user;
  var password = req.body.password || req.query.password;
  var uquery   = 'user:' + username;

  redis.hgetall(uquery).then(function (result) {
    if (result.password && result !== undefined && result !== null) {
      var user_object = result;
      if (username && password) {
        username = username.toLowerCase();
        bcrypt.compare(password, user_object.password, function (err, matched) {
          if (matched) {
            var new_auth_key = authgen.generate(username);
            var aquery = "auth-key:" + new_auth_key;
            redis.set(aquery, username);
            redis.hset(uquery, "auth-key", new_auth_key);
            if (user_object["auth-key"]) {
              redis.del("auth-key:" + user_object["auth-key"]);
            }
            res.send({"logged_in": 1,
                     "auth-key": new_auth_key,
                     "error": 0})
          } else {
            res.send({"logged_in": 0,
                     "error": 2});
          }
        });
      } else {
        res.send({"logged_in": 0,
                 "error": 3});
      }
    } else {
      res.send({"logged_in": 0,
               "error": 1});
               return;
    }
  });
};
