var request = require("request");
var base_url = "http://localhost:3000";

describe("User Operations", function () {

  var register_user = function (username) {
    return {
      url: base_url + "/user/register/",
      method: "POST",
      json: {
        user: username,
        password: "foofoo"
      }
    };
  };

  var login_user = function (username, pass) {
    return {
      url: base_url + "/user/auth/",
      method: "POST",
      json: {
        user: username,
        password: pass
      }
    };
  };

  var user_ops_auth_key = "";

  describe("POST /user/register/", function () {
    it("can register user", function (done) {
      request(register_user("foo123"), function (error, response, body) {
        expect(response.statusCode).toBe(200);
        expect(body.registered).toBe(1);
        if (body["auth-key"]) {
          expect(body["auth-key"].length).toBe(60);
        }
        expect(body.error).toBe(0);
        done();
      });
    });

    it("cannot register the same user twice", function (done) {
      request(register_user("foo123"), function (error, response, body) {
        expect(response.statusCode).toBe(200);
        expect(body.registered).toBe(0);
        expect(body["auth-key"]).toBe(undefined);
        expect(body.error).toBe(1);
        done();
      });
    });

    it("cannot accept malformed requests", function (done) {
      request({
        url: base_url + "/user/register/",
        method: "POST",
        json: {
          usr: "foo123",
          password: "foofoo"
        }
      }, function (error, response, body) {
        expect(response.statusCode).toBe(200);
        expect(body.registered).toBe(0);
        expect(body["auth-key"]).toBe(undefined);
        expect(body.error).toBe(2);
        done();
      });
    });
  }); //end POST /user/register/

  describe("POST /user/auth/", function () {
    it("can login as an existing user", function (done) {
      request(login_user("foo123", "foofoo"), function (error, response, body) {
        expect(response.statusCode).toBe(200);
        expect(body.logged_in).toBe(1);
        expect(body["auth-key"].length).toBe(60);
        expect(body.error).toBe(0);
        done();
      });
    });

    it("cannot login with an incorrect password", function (done) {
      request(login_user("foo123", "foofo"), function (error, response, body) {
        expect(response.statusCode).toBe(200);
        expect(body.logged_in).toBe(0);
        expect(body["auth-key"]).toBe(undefined);
        expect(body.error).toBe(1);
        done();
      });
    });

    it("cannot login with an incorrect username", function (done) {
      request(login_user("foo1233", "foofoo"), function (error, response, body) {
        expect(response.statusCode).toBe(200);
        expect(body.logged_in).toBe(0);
        expect(body["auth-key"]).toBe(undefined);
        expect(body.error).toBe(1);
        done();
      });
    });

    it("cannot accept malformed requests", function (done) {
      request({
        url: base_url + "/user/auth/",
        method: "POST",
        json: {
          usr: "foo123",
          password: "foofoo"
        }
      }, function (error, response, body) {
        expect(response.statusCode).toBe(200);
        expect(body.logged_in).toBe(0);
        expect(body["auth-key"]).toBe(undefined);
        expect(body.error).toBe(2);
        done();
      });
    });
  }); //end POST /user/auth/

});
