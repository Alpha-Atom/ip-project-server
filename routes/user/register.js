var user_controller = require("./../../controllers/user-controller.js");

module.exports = {
  perform: function(a,b) {
    perform(a,b);
  }
}

var perform = function (req, res) {
  var username = req.body.user || req.query.user;
  var password = req.body.password || req.query.password;

  if (username && password) {
    username = username.toLowerCase();
    user_controller.register(username, password, function (result) {
      res.send(result);
    })
  } else {
    res.send({
      "registered": 0,
      "error": 2
    })
  }
};
