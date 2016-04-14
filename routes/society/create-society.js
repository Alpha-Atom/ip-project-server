var Redis = require("ioredis");
var redis = new Redis();
var society_controller = require("./../../presenters/society-controller.js");

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
  var image = req.body.image || req.query.image || "";

  if (society_name && auth_key && admins && description) {
    society_controller.create_society(society_name, admins, description, image, auth_key, function (result) {
      res.send(result);
    });
  } else {
    res.send({"success": 0,
              "error": 1})
  }
}
