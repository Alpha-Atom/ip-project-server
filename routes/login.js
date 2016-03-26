var Redis = require("ioredis");
var redis = new Redis();
var bcrypt = require('bcrypt-nodejs');

module.exports = {
  perform: function(a,b) {
    perform(a,b);
  }
}

var perform = function(req, res) {
  var username = req.body.user || req.query.user;
  username = username.toLowerCase();
  var password = req.body.password || req.query.password;
  var auth_key = req.body.auth_key || req.query.auth_key;
  var uquery   = 'user:' + username;

  redis.hgetall(uquery).then(function (result) {
    if (result.password && result !== undefined && result !== null) {
      var user_object = result;
      if (auth_key !== "" && auth_key !== undefined && auth_key !== null) {
        if (auth_key === user_object["auth-key"]) {
          var timestamp_user = Date.now().toString() + username;
          user_object["auth-key"] = bcrypt.hashSync(timestamp_user);
          redis.set(uquery, "auth-key", user_object["auth-key"]);
          res.send({"logged_in": 1,
                   "auth-key": user_object["auth-key"],
                   "error": 0});
        } else {
          res.send({"logged_in": 0,
                   "error": 3});
        }
      } else {
        bcrypt.compare(password, user_object["password"], function (err, matched) {
          if (matched === true) {
            if (undefined === user_object["auth-key"]) {
              var timestamp_user = Date.now().toString() + username;
              user_object["auth-key"] = bcrypt.hashSync(timestamp_user);
              redis.set(uquery, JSON.stringify(user_object));
              res.send({"logged_in": 1,
                       "auth-key": user_object["auth-key"],
                       "error": 0});
            } else {
              res.send({"logged_in": 1,
                       "auth-key": user_object["auth-key"],
                       "error": 0});
            }
            return;
          } else {
            res.send({"logged_in": 0,
                     "error": 2});
                     return;
          }
        });

      }
    } else {
      res.send({"logged_in": 0,
               "error": 1});
               return;
    }
  });
};
