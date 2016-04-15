module.exports = {

  send_notifications_for: function (event_id) {
    var event_controller = require("./event-controller.js");
    event_controller.get_event(event_id, "", function (response) {
      var attendees = response.event.attendees;
      console.log("Triggered Event: " + response.event.name);
      console.dir(attendees);
      attendees.map(function (attendee) {
        console.log((new Date(Date.now())).toString() + " : Sending push notification to " + attendee + " for event starting at " + (new Date(Number(response.event.start)).toString()));
      });
      event_controller.cancel_event(event_id, "", function(){}, true);
    }, true);
  }

}
