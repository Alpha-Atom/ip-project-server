var event_controller = require("./../../presenters/event-controller.js");

module.exports = {
  perform: function (a,b) {
    perform(a,b);
  }
}

var perform = function (req, res) {
  var event_id = req.params.eventid;
  var auth = req.body.auth || req.query.auth;

  if (event_id && auth) {
    event_controller.cancel_event(event_id, auth, function (response) {
      res.send(response);
    });
  } else {
    res.send({
      "success": 0,
      "error": 3
    });
  }
};
