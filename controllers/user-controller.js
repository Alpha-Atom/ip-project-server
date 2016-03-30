var Redis = require("ioredis");
var redis = new Redis();
var auth_gen = require("./../utils/auth-keys.js");
var permissions_controller = require("./permissions-controller.js");

module.exports = {
  get_password: function (user, complete) {
    var user_key = "user:" + user;

    redis.hget(user_key, "password", function (err, password) {
      if (password) {
        complete(password);
      } else {
        complete("");
      }
    });
  },

  get_user_from_auth: function (auth, complete) {
    var auth_key = "auth-key:" + auth;

    redis.get(auth_key, function (err, username) {
      if (username) {
        complete(username);
      } else {
        complete("");
      }
    });
  },

  authenticate: function (user, pass, complete) {
    permissions_controller.user_can_auth(user, pass, function (success) {
      var user_key = "user:" + user;

      if (success) {
        redis.hget(user_key, "auth-key", function (auth) {
          var new_auth_key = auth_gen.generate(user);
          if (auth) {
            redis.del("auth-key:" + auth);
          }
          redis.set("auth-key:" + auth, new_auth_key);
          redis.hset(user_key, "auth-key", new_auth_key);

          complete({
            "logged_in": 1,
            "auth-key": new_auth_key,
            "error": 0
          });
        });
      } else {
        complete({
          "logged_in": 0,
          "error": 1
        });
      }
    });
  }
}
