var request = require("request");
var base_url = "http://localhost:3000";

describe("Events Operations", function () {

  var event_create = function (auth_key, time) {
    var mydate = Date.now() + 1000000;
    if (time) {
      mydate = 10;
    }
    return {
      url: base_url + "/events/create",
      method: "POST",
      json: {
        society: "foo123soc",
        name: "event",
        location: "location",
        start: mydate,
        end: mydate+10,
        details: "some details",
        auth: auth_key
      }
    }
  };

  var auth_user = function (username) {
    return {
      url: base_url + "/user/auth/",
      method: "POST",
      json: {
        user: username,
        password: "foofoo"
      }
    };
  };

  var join_soc = function (soc_name, auth_key) {
    return {
      url: base_url + "/society/join/",
      method: "POST",
      json: {
        society: soc_name,
        auth: auth_key
      }
    };
  };

  var foo123auth;
  var foo789auth;
  var event_id;

  describe("POST /events/create/", function () {
    it("can create an event", function (done) {
      request(auth_user("foo123"), function (error, response, body) {
        foo123auth = body["auth-key"];
        request(event_create(foo123auth), function (error, response, body) {
          event_id = body.event.id;
          expect(response.statusCode).toBe(200);
          expect(body.success).toBe(1);
          expect(typeof body.event.name).toBe("string");
          expect(body.error).toBe(0);
          done();
        });
      });
    });

    it("fails to create if user is not an admin", function (done) {
      request(auth_user("foo789"), function (error, response, body) {
        foo789auth = body["auth-key"];
        request(join_soc("foo123soc", foo789auth), function (error, response, body) {
          request(event_create(foo789auth), function (error, response, body) {
            expect(response.statusCode).toBe(200);
            expect(body.success).toBe(0);
            expect(typeof body.event).toBe("undefined");
            expect(body.error).toBe(1);
            done();
          });
        })
      });
    });

    it("fails to create if times are invalid", function (done) {
      request(event_create(foo123auth, true), function (error, response, body) {
        expect(response.statusCode).toBe(200);
        expect(body.success).toBe(0);
        expect(typeof body.event).toBe("undefined");
        expect(body.error).toBe(2);
        done();
      });
    });

    it("rejects malformed requests", function (done) {
      request({
        url: base_url + "/events/create/",
        method: "POST",
        json: {
          yeah: "no"
        }
      }, function (error, response, body) {
        expect(response.statusCode).toBe(200);
        expect(body.success).toBe(0);
        expect(typeof body.event).toBe("undefined");
        expect(body.error).toBe(3);
        done();
      });
    });
  }); //end POST /events/create/

  describe("GET /events/view/:eventid", function () {
    it("can view an event", function (done) {
      request({
        url: base_url + "/events/view/" + event_id,
        method: "GET",
        qs: {
          auth: foo123auth
        }
      }, function (error, response, body) {
        body = JSON.parse(body);
        expect(response.statusCode).toBe(200);
        expect(typeof body.event.name).toBe("string");
        expect(body.error).toBe(0);
        done();
      });
    });

    it("does not show non existant events", function (done) {
      request({
        url: base_url + "/events/view/nah",
        method: "GET",
        qs: {
          auth: foo123auth
        }
      }, function (error, response, body) {
        body = JSON.parse(body);
        expect(response.statusCode).toBe(200);
        expect(body.event).not.toBe(null);
        expect(JSON.stringify(body.event)).toEqual(JSON.stringify({}));
        expect(body.error).toBe(1);
        done();
      });
    });

    it("rejects malformed request", function (done) {
      request({
        url: base_url + "/events/view/nah",
        method: "GET",
      }, function (error, response, body) {
        body = JSON.parse(body);
        expect(response.statusCode).toBe(200);
        expect(body.event).not.toBe(null);
        expect(JSON.stringify(body.event)).toEqual(JSON.stringify({}));
        expect(body.error).toBe(2);
        done();
      });
    });
  });

  describe("GET /events/pending/", function () {
    it("can view pending events", function (done) {
      request({
        url: base_url + "/events/pending/",
        method: "GET",
        qs: {
          auth: foo123auth
        }
      }, function (error, response, body) {
        body = JSON.parse(body);
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(body.pending_events)).toBe(true);
        expect(body.pending_events.length).toBe(1);
        expect(body.error).toBe(0);
        done();
      });
    });

    it("rejects invalid auth keys", function (done) {
      request({
        url: base_url + "/events/pending/",
        method: "GET",
        qs: {
          auth: "nah"
        }
      }, function (error, response, body) {
        body = JSON.parse(body);
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(body.pending_events)).toBe(true);
        expect(body.pending_events.length).toBe(0);
        expect(body.error).toBe(1);
        done();
      });
    });

    it("rejects malformed request", function (done) {
      request({
        url: base_url + "/events/pending/",
        method: "GET",
      }, function (error, response, body) {
        body = JSON.parse(body);
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(body.pending_events)).toBe(true);
        expect(body.pending_events.length).toBe(0);
        expect(body.error).toBe(2);
        done();
      });
    });
  });

  describe("POST /events/accept/:eventid", function () {
    it("can accept events", function (done) {
      request({
        url: base_url + "/events/accept/" + event_id,
        method: "POST",
        json: {
          auth: foo123auth
        }
      }, function (error, response, body) {
        expect(response.statusCode).toBe(200);
        expect(body.success).toBe(1);
        expect(body.error).toBe(0);
        done();
      });
    });

    it("rejects non existant events", function (done) {
      request({
        url: base_url + "/events/accept/nah",
        method: "POST",
        json: {
          auth: foo123auth
        }
      }, function (error, response, body) {
        expect(response.statusCode).toBe(200);
        expect(body.success).toBe(0);
        expect(body.error).toBe(2);
        done();
      });
    });

    it("rejects invalid auth key", function (done) {
      request({
        url: base_url + "/events/accept/" + event_id,
        method: "POST",
        json: {
          auth: "nah"
        }
      }, function (error, response, body) {
        expect(response.statusCode).toBe(200);
        expect(body.success).toBe(0);
        expect(body.error).toBe(1);
        done();
      });
    });

    it("rejects malformed requests", function (done) {
      request({
        url: base_url + "/events/accept/" + event_id,
        method: "POST",
        json: {
          auuth: foo123auth
        }
      }, function (error, response, body) {
        expect(response.statusCode).toBe(200);
        expect(body.success).toBe(0);
        expect(body.error).toBe(3);
        done();
      });
    });
  });

  describe("GET /events/accepted/", function () {
    it("can view accepted events", function (done) {
      request({
        url: base_url + "/events/accepted/",
        method: "GET",
        qs: {
          auth: foo123auth
        }
      }, function (error, response, body) {
        body = JSON.parse(body);
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(body.accepted_events)).toBe(true);
        expect(body.accepted_events.length).toBe(1);
        expect(body.error).toBe(0);
        done();
      });
    });

    it("rejects invalid auth keys", function (done) {
      request({
        url: base_url + "/events/accepted/",
        method: "GET",
        qs: {
          auth: "nah"
        }
      }, function (error, response, body) {
        body = JSON.parse(body);
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(body.accepted_events)).toBe(true);
        expect(body.accepted_events.length).toBe(0);
        expect(body.error).toBe(1);
        done();
      });
    });

    it("rejects malformed request", function (done) {
      request({
        url: base_url + "/events/accepted/",
        method: "GET",
      }, function (error, response, body) {
        body = JSON.parse(body);
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(body.accepted_events)).toBe(true);
        expect(body.accepted_events.length).toBe(0);
        expect(body.error).toBe(2);
        done();
      });
    });
  });

  describe("POST /events/decline/:eventid", function () {
    it("can decline events", function (done) {
      request({
        url: base_url + "/events/decline/" + event_id,
        method: "POST",
        json: {
          auth: foo123auth
        }
      }, function (error, response, body) {
        expect(response.statusCode).toBe(200);
        expect(body.success).toBe(1);
        expect(body.error).toBe(0);
        done();
      });
    });

    it("rejects non existant events", function (done) {
      request({
        url: base_url + "/events/decline/nah",
        method: "POST",
        json: {
          auth: foo123auth
        }
      }, function (error, response, body) {
        expect(response.statusCode).toBe(200);
        expect(body.success).toBe(0);
        expect(body.error).toBe(2);
        done();
      });
    });

    it("rejects invalid auth key", function (done) {
      request({
        url: base_url + "/events/decline/" + event_id,
        method: "POST",
        json: {
          auth: "nah"
        }
      }, function (error, response, body) {
        expect(response.statusCode).toBe(200);
        expect(body.success).toBe(0);
        expect(body.error).toBe(1);
        done();
      });
    });

    it("rejects malformed requests", function (done) {
      request({
        url: base_url + "/events/decline/" + event_id,
        method: "POST",
        json: {
          auuth: foo123auth
        }
      }, function (error, response, body) {
        expect(response.statusCode).toBe(200);
        expect(body.success).toBe(0);
        expect(body.error).toBe(3);
        done();
      });
    });
  });

  describe("GET /events/declined/", function () {
    it("can view declined events", function (done) {
      request({
        url: base_url + "/events/declined/",
        method: "GET",
        qs: {
          auth: foo123auth
        }
      }, function (error, response, body) {
        body = JSON.parse(body);
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(body.declined_events)).toBe(true);
        expect(body.declined_events.length).toBe(1);
        expect(body.error).toBe(0);
        done();
      });
    });

    it("rejects invalid auth keys", function (done) {
      request({
        url: base_url + "/events/declined/",
        method: "GET",
        qs: {
          auth: "nah"
        }
      }, function (error, response, body) {
        body = JSON.parse(body);
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(body.declined_events)).toBe(true);
        expect(body.declined_events.length).toBe(0);
        expect(body.error).toBe(1);
        done();
      });
    });

    it("rejects malformed request", function (done) {
      request({
        url: base_url + "/events/declined/",
        method: "GET",
      }, function (error, response, body) {
        body = JSON.parse(body);
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(body.declined_events)).toBe(true);
        expect(body.declined_events.length).toBe(0);
        expect(body.error).toBe(2);
        done();
      });
    });
  });

  describe("POST /events/cancel/:eventid", function () {
    it("rejects invalid auth key", function (done) {
      request(join_soc("foo123soc", foo789auth), function (error, response, body) {
        request({
          url: base_url + "/events/cancel/" + event_id,
          method: "POST",
          json: {
            auth: foo789auth
          }
        }, function (error, response, body) {
          expect(response.statusCode).toBe(200);
          expect(body.success).toBe(0);
          expect(body.error).toBe(1);
          done();
        });
      });
    });

    it("can cancel events", function (done) {
      request({
        url: base_url + "/events/cancel/" + event_id,
        method: "POST",
        json: {
          auth: foo123auth
        }
      }, function (error, response, body) {
        expect(response.statusCode).toBe(200);
        expect(body.success).toBe(1);
        expect(body.error).toBe(0);
        done();
      });
    });

    it("rejects non existant events", function (done) {
      request({
        url: base_url + "/events/cancel/nah/",
        method: "POST",
        json: {
          auth: foo123auth
        }
      }, function (error, response, body) {
        expect(response.statusCode).toBe(200);
        expect(body.success).toBe(0);
        expect(body.error).toBe(2);
        done();
      });
    });

    it("rejects malformed requests", function (done) {
      request({
        url: base_url + "/events/cancel/" + event_id,
        method: "POST",
        json: {
          auuth: foo123auth
        }
      }, function (error, response, body) {
        expect(response.statusCode).toBe(200);
        expect(body.success).toBe(0);
        expect(body.error).toBe(3);
        done();
      });
    });
  });
});
