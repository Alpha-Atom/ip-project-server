var request = require("request");
var base_url = "http://localhost:3000";

describe("Misc Operations", function () {
  describe("GET /hello/:name", function () {
    it("says hello world when no :name present", function (done) {
      request(base_url + "/hello/", function (error, response, body) {
        expect(response.statusCode).toBe(200);
        expect(body).toBe("<title>Hello World!</title>Hello World!");
        done();
      })
    });

    it("says hello to the name provided", function (done) {
      request(base_url + "/hello/Matt/", function (error, response, body) {
        expect(response.statusCode).toBe(200);
        expect(body).toBe("<title>Hello Matt!</title>Hello Matt!");
        done();
      });
    })
  });
});
