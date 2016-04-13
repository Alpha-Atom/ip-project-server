var user_controller = require("./../../presenters/user-controller.js");

module.exports = {
  perform: function (a,b) {
    perform(a,b);
  }
}

var perform = function (req, res) {
  var friend = req.body.friend || req.query.friend;
  var auth = req.body.auth || req.query.auth;

  if (friend && auth) {
    user_controller.remove_friend(friend, auth, function (response) {
      res.send(response);
    });
  } else {
    res.send({
      "success": 0,
      "error": 3
    })
  }
};
