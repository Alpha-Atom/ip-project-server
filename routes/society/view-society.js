var Redis = require("ioredis");
var redis = new Redis();

module.exports = {
  perform: function (a,b) {
    perform(a,b);
  }
}

var perform = function (req, res) {
  var auth_key = req.body.auth || req.query.auth;

  redis.hgetall("society:" + req.params.societyid).then(function (result) {
    if (result.name) {
      result.users = JSON.parse(result.users);
      result.admins = JSON.parse(result.admins);
      res.send({
        "society": result,
        "error": 0
      });
    } else {
      res.send({"society": {},
               "error": 1});
    }
  });
};
