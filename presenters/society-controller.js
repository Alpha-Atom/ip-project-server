var Redis = require("ioredis");
var redis = new Redis();
var permissions_controller = require("./permissions-controller.js");
var user_controller = require("./user-controller.js");

module.exports = {
  get_society: function (soc_name, complete) {
    redis.hgetall("society:" + soc_name, function (err, result) {
      if (result.name) {
        result.users = JSON.parse(result.users);
        result.admins = JSON.parse(result.admins);
        result.events = JSON.parse(result.events);
        complete({
          "society": result,
          "error": 0
        })
      } else {
        complete({
          "society": {},
          "error": 1
        })
      }
    });
  },

  create_society: function (soc_name, admins, description, auth, complete) {
    var society_name = decodeURIComponent(soc_name);
    var soc_query = "society:" + society_name;
    admins = decodeURIComponent(admins);
    description = decodeURIComponent(description);
    var admins_str = admins;
    admins = JSON.parse(admins);

    redis.hget(soc_query, "name", function (err, result) {
      if (result) {
        complete({"success": 0,
                 "error": 2});
      } else {
        redis.get("auth-key:" + auth, function (err,result) {
          var username = result;
          var user_query = "user:" + username;
          var users_exist = true;
          if (admins.indexOf(result) !== -1) {
            redis.hset(soc_query, "name", society_name);
            redis.hset(soc_query, "admins", admins_str);
            redis.hset(soc_query, "description", description);
            redis.hset(soc_query, "users", admins_str);
            redis.hset(soc_query, "events", JSON.stringify([]));
            admins.map(function (admin_name) {
              user_controller.user_exists(admin_name, function (exists) {
                if (!exists) {
                  users_exist = false;
                }
              });
            });
            if (users_exist) {
              admins.map(function (admin_name) {
                redis.hget("user:" + admin_name, "societies", function (err, result) {
                  if (result) {
                    result = JSON.parse(result);
                    redis.hset("user:" + admin_name, "societies", JSON.stringify(result.concat(society_name)));
                  } else {
                    redis.hset("user:" + admin_name, "societies", JSON.stringify([society_name]));
                  }
                });
              });
              complete({"success": 1,
                       "society" : {
                         "name": society_name,
                         "admins": admins,
                         "description": description,
                         "users": admins
                       },
                       "error": 0});

            } else {
              complete({"success": 0,
                       "error": 4});
            }
          } else {
            complete({"success": 0,
                     "error": 3});
          }
        });
      }
    });
  },

  get_user_list: function (soc_name, complete) {
    this.get_society(soc_name, function (result) {
      if (result.society.name) {
        complete(result.society.users);
      } else {
        complete([]);
      }
    });
  },

  get_admin_list: function (soc_name, complete) {
    this.get_society(soc_name, function (result) {
      if (result.society.name) {
        complete(result.society.admins);
      } else {
        complete([]);
      }
    })
  },

  join_society: function (soc_name, auth, complete) {
    permissions_controller.user_is_in_society(auth, soc_name, function (user_in_soc) {
      if (user_in_soc) {
        complete({
          "success": 0,
          "error": 1
        });
      } else {
        user_controller.get_user_from_auth(auth, function (username) {
          user_query = "user:" + username;
          redis.hget(user_query, "societies", function (err, result) {
            if (result) {
              result = JSON.parse(result);
              redis.hset(user_query, "societies", JSON.stringify(result.concat(soc_name)));
            } else {
              redis.hset(user_query, "societies", JSON.stringify([soc_name]));
            }
          });
          redis.hget("society:" + soc_name, "users", function (err, users_result) {
            users_result = JSON.parse(users_result);
            redis.hset("society:" + soc_name, "users", JSON.stringify(users_result.concat(username)));
          });
        });
        complete({
          "success": 1,
          "error": 0
        });
      }
    });
  },

  get_all_societies: function (complete) {
    var self = this;
    var stream = redis.scanStream({
      match: "society:*"
    });
    var society_names = [];
    stream.on('data', function (keys) {
      keys.map(function(key) {
        society_names.push(key.split(":")[1]);
      });
    });
    stream.on('end', function () {
      var soc_objects = [];
      if (society_names.length === 0) {
        complete({
          "societies": []
        });
        return;
      }
      for (var ii = 0; ii < society_names.length; ii++) {
        self.get_society(society_names[ii], function(response) {
          soc_objects.push(response.society);
          if (soc_objects.length === society_names.length) {
            soc_objects.sort(function(a, b) {
              var textA = a.name.toLowerCase();
              var textB = b.name.toLowerCase();
              return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
            });
            complete({
              "societies": soc_objects
            });
          }
        });
      }
    });
  },

  leave_society: function (soc_name, auth, complete) {
    // permissions_controller.user_is_in_society(auth, soc_name, function)
  }
}
