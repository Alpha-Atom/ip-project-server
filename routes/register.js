var Redis = require("ioredis");
var redis = new Redis();
var bcrypt = require('bcrypt-nodejs');

module.exports = {
  perform: function(a,b) {
    perform(a,b);
  }
}

var perform = function (req, res) {
  var tmp_username = req.body.user || req.query.user;
  var tmp_password = req.body.password || req.query.password;
  tmp_username = tmp_username.toLowerCase();
  var uquery       = 'user:' + tmp_username;
  var user_object  = {};

  redis.hgetall(uquery).then(function (result) {
    if (result.password && result !== undefined && result !== null) {
      res.send({"registered": 0,
               "error": 1});
    } else {
      bcrypt.hash(tmp_password, null, null, function (err, hash) {
        user_object["password"] = hash;
        user_object["auth-key"] = bcrypt.hashSync(Date.now().toString() + tmp_username);
        redis.hset(uquery, "password", user_object.password);
        redis.hset(uquery, "auth-key", user_object["auth-key"]);
        res.send({"registered": 1,
                 "auth-key": user_object["auth-key"],
                 "error": 0});
      });
    }
  });
};
