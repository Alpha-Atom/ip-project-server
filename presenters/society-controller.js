var Redis = require("ioredis");
var redis = new Redis();

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
          if (admins.indexOf(result) !== -1) {
            redis.hset(soc_query, "name", society_name);
            redis.hset(soc_query, "admins", admins_str);
            redis.hset(soc_query, "description", description);
            redis.hset(soc_query, "users", admins_str);
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

  },

  leave_society: function (soc_name, auth, complete) {

  }
}
