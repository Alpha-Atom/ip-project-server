var express = require("express");
var router = express.Router();
var hello = require("../routes/misc/helloworld.js");
var register = require("../routes/user/register.js");
var login = require("../routes/user/login.js");
var user_view = require("../routes/user/view.js");
var soc_create = require("../routes/society/create-society.js");
var soc_view = require("../routes/society/view-society.js");
var soc_join = require("../routes/society/join-society.js");
var soc_leave = require("../routes/society/leave-society.js");
var soc_promote = require("../routes/society/promote-user.js");
var soc_events = require("../routes/events/view-all-society-events.js");
var event_create = require("../routes/events/create-society-event.js");
var event_view = require("../routes/events/view-society-events.js");
var event_pending = require("../routes/events/view-pending-events.js");
var event_accept = require("../routes/events/accept-event.js");
var event_decline = require("../routes/events/decline-event.js");

module.exports = router;

router.get('/hello/(:name)?', hello.perform);

router.all('/user/register/', register.perform);
router.all('/user/auth/', login.perform);
router.all('/user/view/(:user)?', user_view.perform);

router.all('/society/create/', soc_create.perform);
router.all('/society/view/(:societyid)?', soc_view.perform);
router.all('/society/view/:societyid/events/', soc_events.perform);
router.all('/society/join/', soc_join.perform);
router.all('/society/leave/', soc_leave.perform);
router.all('/society/promote/', soc_promote.perform);

router.all('/events/create/', event_create.perform);
router.all('/events/view/:eventid', event_view.perform);
router.all('/events/pending/', event_pending.perform);
router.all('/events/accept/:eventid', event_accept.perform);
router.all('/events/decline/:eventid', event_decline.perform);
