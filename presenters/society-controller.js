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
                    redis.hset("user:" + admin_name, "societies", result.concat(society_name));
                  } else {
                    redis.hset("user:" + admin_name, "societies", [society_name]);
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
              redis.hset(user_query, "societies", result.concat(society_name));
            } else {
              redis.hset(user_query, "societies", [society_name]);
            }
          });
          redis.hget("society:" + soc_name, "users", function (err, users_result) {
            redis.hset("society" + soc_name, users_result.concat(username));
          });
        });
        complete({
          "success": 1,
          "error": 0
        });
      }
    });
  },

  leave_society: function (soc_name, auth, complete) {
    permissions_controller.user_is_in_society(auth, soc_name, function)
  }
}
