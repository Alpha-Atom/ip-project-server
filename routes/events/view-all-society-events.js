var event_controller = require("./../../presenters/event-controller.js");

module.exports = {
  perform: function (a,b) {
    perform(a,b);
  }
}

var perform = function (req, res) {
  var soc_name = req.params.societyid;
  var auth = req.body.auth || req.query.auth;

  if (soc_name && auth) {
    event_controller.get_all_soc_events(soc_name, auth, function (response) {
      res.send(response);
    });
  } else {
    res.send({
      "events": [],
      "error": 2
    })
  }
};
