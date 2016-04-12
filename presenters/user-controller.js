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

  get_public_user_info: function (user, complete) {
    var user_key = "user:" + user;

    redis.hgetall(user_key, function(err, result) {
      if (result.password) {
        var public = {};
        public.username = user;
        public.societies = JSON.parse(result.societies) || [];
        public.friends = JSON.parse(result.friends) || [];
        public.accepted_events = JSON.parse(result.accepted_events) || [];
        complete({
          "user": public,
          "error": 0
        });
      } else {
        complete({
          "user": {},
          "error": 1
        });
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

  user_exists: function (user, complete) {
    var user_key = "user:" + user;

    redis.hgetall(user_key, function (err, result) {
      complete(!!result.password);
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
  },

  register: function (user, pass, complete) {
    var user_key = "user:" + user;
    var auth_key = "";
    var new_user = {};

    this.user_exists(user, function (exists) {
      if (exists) {
        complete({
          "registered": 0,
          "error": 1
        });
      } else {
        bcrypt.hash(pass, null, null, function (err, hash) {
          new_user["password"] = hash;
          new_user["auth-key"] = auth_gen.generate(user);
          auth_key = "auth-key:" + new_user["auth-key"];

          redis.hset(user_key, "password", new_user["password"]);
          redis.hset(user_key, "auth-key", new_user["auth-key"]);
          redis.hset(user_key, "societies", JSON.stringify([]));
          redis.hset(user_key, "friends", JSON.stringify([]));
          redis.hset(user_key, "pending_events", JSON.stringify([]));
          redis.hset(user_key, "accepted_events", JSON.stringify([]));
          redis.hset(user_key, "declined_events", JSON.stringify([]));
          redis.set(auth_key, user);
          complete({
            "registered": 1,
            "auth-key": new_user["auth-key"],
            "error": 0
          })
        });
      }
    })

  }
}
