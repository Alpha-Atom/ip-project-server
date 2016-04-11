var society_controller = require("./../../presenters/society-controller.js");

module.exports = {
  perform: function (a,b) {
    perform(a,b);
  }
}

var perform = function (req, res) {
  if (req.params.societyid) {
    society_controller.get_society(req.params.societyid, function (result) {
      res.send(result);
    });
  } else {
    society_controller.get_all_societies(function (result) {
      res.send(result);
    });
  }
};
