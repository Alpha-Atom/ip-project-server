var Redis = require("ioredis");
var redis = new Redis();
var scheduler = require("node-schedule");
var notification_controller = require("./notification-controller.js");
var registered_events = {};

module.exports = {

  schedule_event: function (event_id, time) {
    var event_time = new Date(Number(time));
    console.log("Scheduled event for " + event_time);
    var job = scheduler.scheduleJob(event_time, function(evt_id) {
      notification_controller.send_notifications_for(evt_id);
    }.bind(null, event_id));
    registered_events[event_id] = job;
  },

  register_existing_events: function () {
    var self = this;
    var stream = redis.scanStream({
      match: "event:*"
    });
    var event_ids = [];
    stream.on('data', function (keys) {
      keys.map(function (key) {
        event_ids.push(key.split(":")[1]);
      });
    })
    stream.on('end', function () {
      var event_controller = require("./event-controller.js");
      for (var ii = 0; ii < event_ids.length; ii++) {
        event_controller.get_event(event_ids[ii], "", function (response) {
          var event = response.event;
          self.schedule_event(event.id, event.start);
        }, true);
      }
    });
  },

  cancel_registered: function (event_id) {
    var event = registered_events[event_id];
    if (event !== undefined) {
      event.cancel();
      delete registered_events.event_id;
    }
  }

}
