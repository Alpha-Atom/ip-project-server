var express = require('express');
var https = require('https');
var app = express();
var route_manager = require("./utils/route-manager.js");
var bodyParser = require('body-parser');
var FileStreamRotator = require('file-stream-rotator');
var morgan = require('morgan');
var fs = require('fs');
var logDirectory = 'log'
var production = process.argv[2];

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
app.use(morgan('combined', {stream: accessLogStream}))
app.use(morgan('combined'));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use('/', route_manager);
app.use('/source', require('magic-window')('/source', { ignore: ['config', 'redis', 'cert.pem', 'key.pem', 'dump.rdb'] }))

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
