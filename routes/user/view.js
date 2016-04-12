var user_controller = require("./../../presenters/user-controller.js");

module.exports = {
  perform: function (a,b) {
    perform(a,b);
  }
}

var perform = function (req, res) {
  if (req.params.user) {
    user_controller.get_public_user_info(req.params.user.toLowerCase(), function (response) {
      res.send(response);
    });
  } else {
    user_controller.get_all_public_infos(function (response) {
      res.send(response);
    });
  }
};
