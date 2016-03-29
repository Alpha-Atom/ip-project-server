var Redis = require("ioredis");
var redis = new Redis();

module.exports = {
  perform: function(a,b) {
    perform(a,b);
  }
}

var perform = function(req,res) {
  var society_name = req.body.society || req.query.society;
  var auth_key = req.body.auth || req.query.auth;
  var admins = req.body.admins || req.query.admins;
  var description = req.body.description || req.query.description;

  if (society_name && auth_key && admins && description) {
    var soc_query = "society:" + society_name;
    society_name = decodeURIComponent(society_name);
    admins = decodeURIComponent(admins);
    description = decodeURIComponent(description);
    admins = JSON.parse(admins);
    redis.hget(soc_query, "name", function (err, result) {
      if (result) {
        res.send({"success": 0,
                  "error": 2});
      } else {
        redis.get("auth-key:" + auth_key, function (err,result) {
          var username = result;
          if (admins.indexOf(result) !== -1) {
            redis.hset(soc_query, "name", society_name);
            redis.hset(soc_query, "admins", JSON.stringify(admins));
            redis.hset(soc_query, "description", description);
            res.send({"success": 1,
                      "society" : {
                       "name": society_name,
                       "admins": JSON.stringify(admins),
                       "description": description
                      },
                      "error": 0});
          } else {
            res.send({"success": 0,
                      "error": 3});
          }
        });
      }
    });
  } else {
    res.send({"success": 0,
              "error": 1})
  }
}
