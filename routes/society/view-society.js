var society_controller = require("./../../presenters/society-controller.js");

module.exports = {
  perform: function (a,b) {
    perform(a,b);
  }
}

var perform = function (req, res) {
  society_controller.get_society(req.params.societyid, function (result) {
    res.send(result);
  })
};
