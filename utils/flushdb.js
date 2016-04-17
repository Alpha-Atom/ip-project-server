var Redis = require("ioredis");
var redis = new Redis();

module.exports = {
  flush: function () {
    redis.flushdb();
  }
}
