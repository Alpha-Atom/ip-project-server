var request = require("request");
var base_url = "http://localhost:3000";
var server = require("../index.js");

describe("Friends Operations", function () {

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

  var friend = function (add, friendr, auth_key) {
    var the_url = base_url + "/friends/";
    if (add) {
      the_url += "add/";
    } else {
      the_url += "remove/";
    }
    return {
      url: the_url,
      method: "POST",
      json: {
        friend: friendr,
        auth: auth_key
      }
    };
  };

  var foo123auth;

  describe("POST /friends/add/", function () {
    it("can add friends", function (done) {
      request(auth_user("foo123"), function (error, response, body) {
        foo123auth = body["auth-key"];
        request(friend(true, "foo456", foo123auth), function (error, response, body) {
          expect(response.statusCode).toBe(200);
          expect(body.success).toBe(1);
          expect(body.error).toBe(0);
          done();
        });
      });
    });

    it("rejects invalid auth codes", function (done) {
      request(friend(true, "foo456", "nah"), function (error, response, body) {
        expect(response.statusCode).toBe(200);
        expect(body.success).toBe(0);
        expect(body.error).toBe(1);
        done();
      });
    });

    it("cannot add friends twice", function (done) {
      request(friend(true, "foo456", foo123auth), function (error, response, body) {
        expect(response.statusCode).toBe(200);
        expect(body.success).toBe(0);
        expect(body.error).toBe(2);
        done();
      });
    });

    it("rejects non-existant friends", function (done) {
      request(friend(true, "foo4", foo123auth), function (error, response, body) {
        expect(response.statusCode).toBe(200);
        expect(body.success).toBe(0);
        expect(body.error).toBe(3);
        done();
      });
    });

    it("rejects if you add yourself :(", function (done) {
      request(friend(true, "foo123", foo123auth), function (error, response, body) {
        expect(response.statusCode).toBe(200);
        expect(body.success).toBe(0);
        expect(body.error).toBe(4);
        done();
      });
    });

    it("reject malformed requests", function (done) {
      request({
        url: base_url + "/friends/add/",
        method: "POST",
        json: {
          yeah: "no"
        }
      }, function (error, response, body) {
        expect(response.statusCode).toBe(200);
        expect(body.success).toBe(0);
        expect(body.error).toBe(5);
        done();
      });
    });
  });

  describe("POST /friends/remove/", function () {
    it("can remove friends", function (done) {
      request(friend(false, "foo456", foo123auth), function (error, response, body) {
        expect(response.statusCode).toBe(200);
        expect(body.success).toBe(1);
        expect(body.error).toBe(0);
        done();
      });
    });

    it("rejects invalid auth keys", function (done) {
      request(friend(false, "foo456", "nah"), function (error, response, body) {
        expect(response.statusCode).toBe(200);
        expect(body.success).toBe(0);
        expect(body.error).toBe(1);
        done();
      });
    });

    it("cannot remove users who aren't friends", function (done) {
      request(friend(false, "foo", foo123auth), function (error, response, body) {
        expect(response.statusCode).toBe(200);
        expect(body.success).toBe(0);
        expect(body.error).toBe(2);
        done();
      });
    });

    it("reject malformed requests", function (done) {
      request({
        url: base_url + "/friends/remove/",
        method: "POST",
        json: {
          yeah: "no"
        }
      }, function (error, response, body) {
        expect(response.statusCode).toBe(200);
        expect(body.success).toBe(0);
        expect(body.error).toBe(3);
        server.close();
        done();
      });
    });
  });
});
