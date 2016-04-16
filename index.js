var express = require('express');
var serveIndex = require('serve-index');
var https = require('https');
var app = express();
var route_manager = require("./utils/route-manager.js");
var scheduler = require("./presenters/schedule-controller.js");
var bodyParser = require('body-parser');
var basic_auth = require('basic-auth');
var FileStreamRotator = require('file-stream-rotator');
var morgan = require('morgan');
var fs = require('fs');
var logDirectory = 'log'
var log_passwd = fs.readFileSync('logpasswd', 'utf-8');
var production = process.argv[2];

scheduler.register_existing_events();

var auth = function (req, res, next) {
  function unauthorized(res) {
    res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    return res.sendStatus(401);
  };

  var user = basic_auth(req);

  if (!user || !user.name || !user.pass) {
    return unauthorized(res);
  };

  if (user.name === 'logs' && user.pass === log_passwd) {
    return next();
  } else {
    return unauthorized(res);
  };
};

// ensure log directory exists
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory)

// create a rotating write stream
var accessLogStream = FileStreamRotator.getStream({
  date_format: 'YYYYMMDD',
  filename: logDirectory + '/access-%DATE%.log',
  frequency: 'daily',
  verbose: false
})

// setup the logger
app.use(morgan('short', {stream: accessLogStream}))
app.use(morgan('short'));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use('/', route_manager);
app.use('/source', require('magic-window')('/source', { ignore: ['config', 'redis', 'cert.pem', 'key.pem', 'dump.rdb'] }))
app.use('/log', auth, express.static('log'));
app.use('/log', auth, serveIndex('log', {'icons': true}));

app.listen(3000, function () {
  console.log('Now accepting connections on port 3000.');
});

if (production === "-p") {
  var prkey = fs.readFileSync('key.pem');
  var certi = fs.readFileSync('cert.pem');

  app.listen(80, function() {
    console.log('Now accepting connections on port 80.');
  });

  https.createServer({
    key: prkey,
    cert: certi
  }, app).listen(443, function() {
    console.log("Now accepting HTTPS connections on port 443.");
  });
}

process.on('SIGINT', function() {
  console.log( "\nRecieved Ctrl-C, shutting down." );
  process.exit(0);
})
