var express = require("express");
var router = express.Router();
var hello = require("../routes/misc/helloworld.js");
var register = require("../routes/user/register.js");
var login = require("../routes/user/login.js");

module.exports = router;

router.get('/hello/(:name)?', hello.perform);

router.all('/register/', register.perform);

router.all('/auth/', login.perform);
