var user_controller = require("./../../controllers/user-controller.js");

module.exports = {
  perform: function(a,b) {
    perform(a,b);
  }
}

var perform = function(req, res) {
  var username = req.body.user || req.query.user;
  var password = req.body.password || req.query.password;

  if (username && password) {
    user_controller.authenticate(username, password, function (result) {
      res.send(result);
    });
  } else {
    res.send({"logged_in": 0,
              "error": 2});
  }

};
