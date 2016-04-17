var request = require("request");
var base_url = "http://localhost:3000";

describe("User Operations", function () {

  var register_user = {
    url: base_url + "/user/register",
    method: "POST",
    json: {
      user: "foo123",
      password: "foofoo"
    }
  };

  var user_ops_auth_key = "";

  describe("POST /user/register/", function () {
    it("can register user", function (done) {
      request(register_user, function (error, response, body) {
        expect(response.statusCode).toBe(200);
        expect(body.registered).toBe(1);
        if (body["auth-key"]) {
          expect(body["auth-key"].length).toBe(60);
        }
        expect(body.error).toBe(0);
        done();
      });
    });

    it ("cannot register the same user twice", function (done) {
      request(register_user, function (error, response, body) {
        expect(response.statusCode).toBe(200);
        expect(body.registered).toBe(0);
        expect(body["auth-key"]).toBe(undefined);
        expect(body.error).toBe(1);
        done();
      });
    });

    it ("cannot accept malformed requests", function (done) {
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
    })
  });

});
