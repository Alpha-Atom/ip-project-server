var request = require("request");
var base_url = "http://localhost:3000";

describe("Society Operations", function () {

  var create_society = function (soc_name, auth_key) {
    return {
      url: base_url + "/society/create/",
      method: "POST",
      json: {
        society: soc_name,
        admins: JSON.stringify([]),
        description: "A test society.",
        auth: auth_key
      }
    };
  };

  var foo123auth;
  var foo456auth;
  var foo789auth;

  describe("POST /society/create/", function() {
    it("can create a new society", function(done) {
      request({
        url: base_url + "/user/auth/",
        method: "POST",
        json: {
          user: "foo123",
          password: "foofoo"
        }
      }, function (error, response, body) {
        foo123auth = body["auth-key"];
        request(create_society("foo123soc", foo123auth), function (error, response, body) {
          expect(response.statusCode).toBe(200);
          expect(body.success).toBe(1);
          expect(body.society).not.toBe(null);
          expect(typeof body.society).toBe("object");
          expect(body.society.name).toBe("foo123soc");
          expect(body.society.admins[0]).toBe("foo123");
          expect(body.society.description).toBe("A test society.");
          expect(body.society.users[0]).toBe("foo123");
          expect(body.error).toBe(0);
          done();
        });
      });
    });

    it("cannot create the same society as already exists", function(done) {
      request(create_society("foo123soc", foo123auth), function (error, response, body) {
        expect(response.statusCode).toBe(200);
        expect(body.success).toBe(0);
        expect(body.society).toBe(undefined);
        expect(body.error).toBe(2);
        done();
      })
    });

    it("cannot create a society without valid authentication", function (done) {
      request(create_society("foo12soc", "foo12soc"), function (error, response, body) {
        expect(response.statusCode).toBe(200);
        expect(body.success).toBe(0);
        expect(body.society).toBe(undefined);
        expect(body.error).toBe(3);
        done();
      });
    });

    it("cannot accept malformed requests", function (done) {
      request({
        url: base_url + "/society/create/",
        method: "POST",
        json: {
          yeah: "no"
        }
      }, function (error, response, body) {
        expect(response.statusCode).toBe(200);
        expect(body.success).toBe(0);
        expect(body.society).toBe(undefined);
        expect(body.error).toBe(1);
        done();
      });
    });
  }); //end POST /society/create/

  describe("GET /society/view/:societyid", function () {
    it("shows the full list of societies without an id", function (done) {
      request(base_url + "/society/view/", function (error, response, body) {
        expect(response.statusCode).toBe(200);
        body = JSON.parse(body);
        expect(Array.isArray(body.societies)).toBe(true);
        expect(body.societies.length).toBe(1);
        done();
      });
    });

    it("get an individual society", function (done) {
      request(base_url + "/society/view/foo123soc/", function (error, response, body) {
        body = JSON.parse(body);
        expect(response.statusCode).toBe(200);
        expect(body.society).not.toBe(null);
        expect(typeof body.society).toBe("object");
        expect(body.society.name).toBe("foo123soc");
        expect(body.society.admins[0]).toBe("foo123");
        expect(body.society.description).toBe("A test society.");
        expect(body.society.users[0]).toBe("foo123");
        expect(body.error).toBe(0);
        done();
      });
    });

    it("cannot get a non existant society", function (done) {
      request(base_url + "/society/view/foo12soc", function (error, response, body) {
        body = JSON.parse(body);
        expect(response.statusCode).toBe(200);
        expect(body.society).not.toBe(null);
        expect(typeof body.society).toBe("object");
        expect(JSON.stringify(body.society)).toEqual(JSON.stringify({}));
        done();
      });
    });
  }); //end GET /society/view/:societyid

  describe("GET /society/view/:societyid/events", function () {
    it("shows events for an existing society", function (done) {
      request({
        url: base_url + "/society/view/foo123soc/events/",
        method: "GET",
        qs: {
          auth: foo123auth
        }
      }, function (error, response, body) {
        body = JSON.parse(body);
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(body.events)).toBe(true);
        expect(body.error).toBe(0);
        done();
      });
    });

    it("rejects invalid authentication key", function (done) {
      request({
        url: base_url + "/society/view/foo123soc/events/",
        method: "GET",
        qs: {
          auth: "foo"
        }
      }, function (error, response, body) {
        body = JSON.parse(body);
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(body.events)).toBe(true);
        expect(body.error).toBe(1);
        done();
      });
    });

    it("rejects malformed request", function (done) {
      request({
        url: base_url + "/society/view/foo123soc/events/",
        method: "GET",
      }, function (error, response, body) {
        body = JSON.parse(body);
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(body.events)).toBe(true);
        expect(body.error).toBe(2);
        done();
      });
    });
  }); //end GET /society/view/:societyid/events

  describe("POST /society/join/", function () {

    it("successfully joins the society", function (done) {
      request({
        url: base_url + "/user/auth/",
        method: "POST",
        json: {
          user: "foo456",
          password: "foofoo"
        }
      }, function (error, response, body) {
        foo456auth = body["auth-key"];
        request({
          url: base_url + "/society/join/",
          method: "POST",
          json: {
            society: "foo123soc",
            auth: foo456auth
          }
        }, function (error, response, body) {
          expect(response.statusCode).toBe(200);
          expect(body.success).toBe(1);
          expect(body.error).toBe(0);
          done();
        });
      });
    });

    it("doesn't join the society twice", function (done) {
      request({
        url: base_url + "/society/join/",
        method: "POST",
        json: {
          society: "foo123soc",
          auth: foo456auth
        }
      }, function (error, response, body) {
        expect(response.statusCode).toBe(200);
        expect(body.success).toBe(0);
        expect(body.error).toBe(1);
        done();
      });
    });

    it("rejects invalid authentication keys", function (done) {
      request({
        url: base_url + "/society/join/",
        method: "POST",
        json: {
          society: "foo123soc",
          auth: "nah"
        }
      }, function (error, response, body) {
        expect(response.statusCode).toBe(200);
        expect(body.success).toBe(0);
        expect(body.error).toBe(3);
        done();
      });
    });

    it("rejects malformed requests", function (done) {
      request({
        url: base_url + "/society/join/",
        method: "POST",
        json: {
          society: "foo123soc",
        }
      }, function (error, response, body) {
        expect(response.statusCode).toBe(200);
        expect(body.success).toBe(0);
        expect(body.error).toBe(2);
        done();
      });
    });
  }); //end POST /society/join/

  describe("POST /society/leave/", function() {
    it("correctly leaves the society", function (done) {
      request({
        url: base_url + "/society/leave/",
        method: "POST",
        json: {
          society: "foo123soc",
          auth: foo456auth
        }
      }, function (error, response, body) {
        expect(response.statusCode).toBe(200);
        expect(body.success).toBe(1);
        expect(body.error).toBe(0);
        done();
      });
    });

    it("does not leave the society twice", function (done) {
      request({
        url: base_url + "/society/leave/",
        method: "POST",
        json: {
          society: "foo123soc",
          auth: foo456auth
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
        url: base_url + "/society/leave/",
        method: "POST",
        json: {
          society: "foo123soc",
        }
      }, function (error, response, body) {
        expect(response.statusCode).toBe(200);
        expect(body.success).toBe(0);
        expect(body.error).toBe(2);
        done();
      });
    });
  }); //end POST /society/leave/

});
