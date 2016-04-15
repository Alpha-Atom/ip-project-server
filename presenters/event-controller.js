var Redis = require("ioredis");
var redis = new Redis();
var permissions_controller = require("./permissions-controller.js");
var user_controller = require("./user-controller.js");
var society_controller = require("./society-controller.js");

module.exports = {
  create_event: function (soc_name, event, auth, complete) {
    var self = this;
    permissions_controller.user_can_manage_soc_events(auth, soc_name, function (manageable) {
      if (manageable) {
        user_controller.get_user_from_auth(auth, function(organiser) {
          if (event.end > event.start && event.start > Date.now()) {
            self.get_random_event_id(function(event_id) {
              event_query = "event:" + event_id;
              soc_query = "society:" + soc_name.toLowerCase();
              self.invite_all(soc_name, event_id);
              redis.hset(event_query, "name", event.name);
              redis.hset(event_query, "location", event.location);
              redis.hset(event_query, "society", soc_name);
              redis.hset(event_query, "start", event.start);
              redis.hset(event_query, "end", event.end);
              redis.hset(event_query, "details", event.details);
              redis.hset(event_query, "organiser", organiser);
              redis.hset(event_query, "attendees", JSON.stringify([]));
              redis.hset(event_query, "id", event_id);
              redis.hget(soc_query, "events", function (err, events) {
                redis.hset(soc_query, "events", JSON.stringify(JSON.parse(events).concat(event_id)));
              });
              complete({
                "success": 1,
                "event": {
                  "id": event_id,
                  "name": event.name,
                  "organiser": organiser,
                  "attendees": [],
                  "location": event.location,
                  "society": soc_name,
                  "start": event.start,
                  "end": event.end,
                  "details": event.details
                },
                "error": 0
              })
            });
          } else {
            complete({
              "success": 0,
              "error": 2
            })
          }
        });
      } else {
        complete({
          "success": 0,
          "error": 1
        });
      }
    });
  },

  cancel_event: function (event_id, auth, complete, force) {

  },

  invite_all: function (soc_name, event_id) {
    society_controller.get_society(soc_name, function (response) {
      response.society.users.map(function (user) {
        user_controller.get_raw_user(user, function (userdata) {
          redis.hset("user:" + user, "pending_events", JSON.stringify(JSON.parse(userdata.pending_events).concat(event_id)));
        });
      });
    });
  },

  get_event: function (event_id, auth, complete, preauth) {
    redis.hgetall("event:" + event_id, function (err, event) {
      event.attendees = JSON.parse(event.attendees);
      if (preauth) {
        complete({
          "event": event,
          "error": 0
        });
        return;
      }
      permissions_controller.user_is_in_society(auth, event.society, function (canview) {
        if (canview) {
          complete({
            "event": event,
            "error": 0
          });
        } else {
          complete({
            "event": {},
            "error": 1
          });
        }
      });
    });
  },

  get_all_soc_events: function (soc_name, auth, complete) {
    var self = this;
    permissions_controller.user_is_in_society(auth, soc_name, function (canview) {
      if (canview) {
        society_controller.get_society(soc_name, function (response) {
          var events = response.society.events;
          var event_objs = [];
          for (var ii = 0; ii < events.length; ii++) {
            self.get_event(events[ii], "", function(response) {
              event_objs.push(response.event);
              if (event_objs.length === events.length) {
                complete({
                  "events": event_objs,
                  "error": 0
                });
              }
            }, true);
          }
        });
      } else {
        complete({
          "events": [],
          "error": 1
        })
      }
    });
  },

  get_random_event_id: function (complete) {
    var tmp_id = Math.floor(Math.random() * (1000000000-1)+1);
    this.event_exists(tmp_id, function (exists) {
      if (exists) {
        get_random_event_id(complete);
      } else {
        complete(String(tmp_id));
      }
    });
  },

  event_exists: function (event_id, complete) {
    redis.hget("event:" + event_id, "name", function (err, result) {
      complete(!!result);
    });
  },

  accept_event: function (event_id, auth, complete) {
    var self = this;
    user_controller.get_user_from_auth(auth, function (username) {
      if (username) {
        user_controller.get_raw_user(username, function (userdata) {
          var pending_events = JSON.parse(userdata.pending_events);
          var declined_events = JSON.parse(userdata.declined_events);
          var accepted_events = JSON.parse(userdata.accepted_events);
          self.get_event(event_id, auth, function (data) {
            var attendees = data.event.attendees;
            if (pending_events.indexOf(event_id) > -1) {
              pending_events.splice(pending_events.indexOf(event_id), 1);
              accepted_events.push(event_id);
              redis.hset("user:" + username, "pending_events", JSON.stringify(pending_events));
              redis.hset("user:" + username, "accepted_events", JSON.stringify(accepted_events));
              redis.hset("event:" + event_id, "attendees", JSON.stringify(attendees.concat(username.toLowerCase())));
              complete({
                "success": 1,
                "error": 0
              });
            } else if (declined_events.indexOf(event_id) > -1) {
              declined_events.splice(declined_events.indexOf(event_id), 1);
              accepted_events.push(event_id);
              redis.hset("user:" + username, "declined_events", JSON.stringify(declined_events));
              redis.hset("user:" + username, "accepted_events", JSON.stringify(accepted_events));
              redis.hset("event:" + event_id, "attendees", JSON.stringify(attendees.concat(username.toLowerCase())));
              complete({
                "success": 1,
                "error": 0
              });
            } else {
              complete({
                "success": 0,
                "error": 2
              });
            }
          });
        });
      } else {
        complete({
          "success": 0,
          "error": 1
        });
      }
    });
  },

  decline_event: function (event_id, auth, complete) {
    var self = this;
    user_controller.get_user_from_auth(auth, function (username) {
      if (username) {
        user_controller.get_raw_user(username, function (userdata) {
          var pending_events = JSON.parse(userdata.pending_events);
          var declined_events = JSON.parse(userdata.declined_events);
          var accepted_events = JSON.parse(userdata.accepted_events);
          if (pending_events.indexOf(event_id) > -1) {
            pending_events.splice(pending_events.indexOf(event_id), 1);
            declined_events.push(event_id);
            redis.hset("user:" + username, "pending_events", JSON.stringify(pending_events));
            redis.hset("user:" + username, "declined_events", JSON.stringify(declined_events));
            complete({
              "success": 1,
              "error": 0
            });
          } else if (accepted_events.indexOf(event_id) > -1) {
            self.get_event(event_id, auth, function (data) {
              var attendees = data.event.attendees;
              attendees.splice(attendees.indexOf(event_id), 1);
              accepted_events.splice(accepted_events.indexOf(event_id), 1);
              declined_events.push(event_id);
              redis.hset("user:" + username, "accepted_events", JSON.stringify(accepted_events));
              redis.hset("user:" + username, "declined_events", JSON.stringify(declined_events));
              redis.hset("event:" + event_id, "attendees", JSON.stringify(attendees));
              complete({
                "success": 1,
                "error": 0
              });
            })
          } else {
            complete({
              "success": 0,
              "error": 2
            });
          }
        });
      } else {
        complete({
          "success": 0,
          "error": 1
        });
      }
    });
  },

  get_all_pending_events: function (auth, complete) {
    var self = this;
    user_controller.get_user_from_auth(auth, function (username) {
      if (username) {
        user_controller.get_raw_user(username, function (userdata) {
          var pending_events = JSON.parse(userdata.pending_events);
          var pending_events_objs = [];
          pending_events.map(function (event_id) {
            self.get_event(event_id, "", function (response) {
              response.event.id = event_id;
              pending_events_objs.push(response.event);
              if (pending_events_objs.length === pending_events.length) {
                pending_events_objs.sort(function (a,b) {
                  if (a.start < b.start) {
                    return -1;
                  }
                  if (a.start > b.start) {
                    return 1;
                  }
                  return 0;
                });
                complete({
                  "pending_events": pending_events_objs,
                  "error": 0
                });
              }
            }, true);
          })
        });
      } else {
        complete({
          "pending_events": [],
          "error": 1
        });
      }
    });
  },

  get_all_accepted_events: function (auth, complete) {
    var self = this;
    user_controller.get_user_from_auth(auth, function (username) {
      if (username) {
        user_controller.get_public_user_info(username, function (data) {
          var accepted_events = data.user.accepted_events;
          var accepted_events_objs = [];
          accepted_events.map(function (event_id) {
            self.get_event(event_id, "", function (response) {
              response.event.id = event_id;
              accepted_events_objs.push(response.event);
              if (accepted_events_objs.length === accepted_events.length) {
                accepted_events_objs.sort(function (a,b) {
                  if (a.start < b.start) {
                    return -1;
                  }
                  if (a.start > b.start) {
                    return 1;
                  }
                  return 0;
                });
                complete({
                  "accepted_events": accepted_events_objs,
                  "error": 0
                });
              }
            }, true);
          });
        });
      } else {
        complete({
          "accepted_events": [],
          "error": 1
        });
      }
    });
  },

  get_all_declined_events: function (auth, complete) {
    var self = this;
    user_controller.get_user_from_auth(auth, function (username) {
      if (username) {
        user_controller.get_public_user_info(username, function (data) {
          var declined_events = data.user.declined_events;
          var declined_events_objs = [];
          declined_events.map(function (event_id) {
            self.get_event(event_id, "", function (response) {
              response.event.id = event_id;
              declined_events_objs.push(response.event);
              if (declined_events_objs.length === declined_events.length) {
                declined_events_objs.sort(function (a,b) {
                  if (a.start < b.start) {
                    return -1;
                  }
                  if (a.start > b.start) {
                    return 1;
                  }
                  return 0;
                });
                complete({
                  "declined_events": declined_events_objs,
                  "error": 0
                });
              }
            }, true);
          });
        });
      } else {
        complete({
          "declined_events": [],
          "error": 1
        });
      }
    });
  }
}
