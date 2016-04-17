var Redis = require("ioredis");
var redis = new Redis();

redis.flushdb();
console.log("Database flushed!");
setTimeout(function() {process.exit(0)}, 1000);
