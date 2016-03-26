var express = require('express');
var https = require('https');
var app = express();
var route_manager = require("./route-manager.js");
var bodyParser = require('body-parser');
var fs = require('fs');
var prkey = fs.readFileSync('server.key');
var certi = fs.readFileSync('server.crt');

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use('/', route_manager);

// app.listen(3000, function () {
//     console.log('Example app listening on port 3000!');
// });

https.createServer({
  key: prkey,
  cert: certi
}, app).listen(3000, function() {
  console.log("App listening for HTTPS connections on port 3000!");
});

process.on('SIGINT', function() {
  console.log( "\nRecieved Ctrl-C, shutting down." );
  process.exit(0);
})
