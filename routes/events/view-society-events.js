var event_controller = require("./../../presenters/event-controller.js");

module.exports = {
  perform: function (a,b) {
    perform(a,b);
  }
}

var perform = function (req, res) {
  var auth_key = req.body.auth || req.query.auth;

  if (auth_key) {
    event_controller.get_event(req.params.eventid, auth_key, function (response) {
      res.send(response);
    });
  } else {
    res.send({
      "event": {},
      "error": 2
    });
  }
};
