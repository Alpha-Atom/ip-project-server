var express = require("express");
var router = express.Router();
var hello = require("./routes/helloworld.js");
var register = require("./routes/register.js");
var login = require("./routes/login.js");

module.exports = router;

router.get('/hello/(:name)?', hello.perform);

router.all('/register', register.perform);

router.all('/login', login.perform);
