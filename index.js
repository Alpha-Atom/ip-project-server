var express = require('express');
var app = express();
var bcrypt = require('bcrypt-nodejs');
var Redis = require('ioredis');
var redis = new Redis();

app.get('/hello/(:name)?', function (req, res) {
    var name = req.params.name || "World";
    res.send('Hello ' + name + "!");
});

app.post('/register', function(req, res) {

});

app.post('/login', function(req, res) {

});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});
