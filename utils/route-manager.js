var express = require("express");
var router = express.Router();
var hello = require("../routes/misc/helloworld.js");
var register = require("../routes/user/register.js");
var login = require("../routes/user/login.js");
var user_view = require("../routes/user/view.js");
var soc_create = require("../routes/society/create-society.js");
var soc_view = require("../routes/society/view-society.js");
var soc_join = require("../routes/society/join-society.js");

module.exports = router;

router.get('/hello/(:name)?', hello.perform);

router.all('/user/register/', register.perform);
router.all('/user/auth/', login.perform);
router.all('/user/view/(:user)?', user_view.perform);

router.all('/society/create', soc_create.perform);
router.all('/society/view/(:societyid)?', soc_view.perform);
router.all('/society/join/', soc_join.perform);
