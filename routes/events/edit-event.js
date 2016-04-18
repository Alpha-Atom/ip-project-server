var event_controller = require("./../../presenters/event-controller.js");

module.exports = {
  perform: function (a,b) {
    perform(a,b);
  }
}

var perform = function (req, res) {
  var event_id = req.params.eventid;
  var new_name = req.body.name || req.query.name || "";
  var new_loc = req.body.location || req.query.location || "";
  var new_start = req.body.start || req.query.start || "";
  var new_end = req.body.end || req.query.end || "";
  var new_details = req.body.details || req.query.details || "";
  var auth_key = req.body.auth || req.query.auth;

  if (event_id && auth_key && (new_name || new_loc || new_start || new_end || new_details)) {
    if (new_name) decodeURIComponent(new_name);
    if (new_loc) decodeURIComponent(new_loc);
    if (new_start) decodeURIComponent(new_start);
    if (new_end) decodeURIComponent(new_end);
    if (new_details) decodeURIComponent(new_details);
    if (auth_key) decodeURIComponent(auth_key);
    event_controller.edit_event(event_id, new_name, new_loc, new_start, new_end, new_details, auth_key, function (response) {
      res.send(response);
    });
  } else {
    res.send({
      "success": 0,
      "error": 4
    });
  }

};
