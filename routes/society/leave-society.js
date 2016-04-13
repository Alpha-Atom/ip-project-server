var society_controller = require("./../../presenters/society-controller.js");

module.exports = {
  perform: function (a,b) {
    perform(a,b);
  }
}

var perform = function (req, res) {
  var soc_name = req.body.society || req.query.society;
  var auth_key = req.body.auth || req.query.auth;

  if (soc_name && auth_key) {
    society_controller.leave_society(soc_name, auth_key, function (response) {
      res.send(response);
    });
  } else {
    res.send({"success": 0,
              "error": 2});
  }
};
