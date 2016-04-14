var event_controller = require("./../../presenters/event-controller.js");

module.exports = {
  perform: function (a,b) {
    perform(a,b);
  }
}

var perform = function (req, res) {
  var soc_name = req.body.society || req.query.society;
  var event_name = req.body.name || req.query.name;
  var event_loc = req.body.location || req.query.location;
  var event_start = req.body.start || req.query.start;
  var event_end = req.body.end || req.query.end;
  var event_details = req.body.details || req.query.details;
  var auth_key = req.body.auth || req.query.auth;

  if (soc_name && event_name && event_loc && event_start && event_end && event_details && auth_key) {
    soc_name = decodeURIComponent(soc_name);
    event_name = decodeURIComponent(event_name);
    event_loc = decodeURIComponent(event_loc);
    event_start = decodeURIComponent(event_start);
    event_end = decodeURIComponent(event_end);
    event_details = decodeURIComponent(event_details);
    auth_key = decodeURIComponent(auth_key);
    var event = {
      name: event_name,
      location: event_loc,
      start: event_start,
      end: event_end,
      details: event_details
    };
    event_controller.create_event(soc_name, event, auth_key, function (response) {
      res.send(response);
    });
  } else {
    res.send({
      "success": 0,
      "error": 3
    });
  }
};
