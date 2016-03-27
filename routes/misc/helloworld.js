module.exports = {
  perform: function (a, b) {
    perform(a,b);
  }
}

var perform = function(req, res) {
  var name = req.params.name || "World";
  res.send('<title>Hello ' + name + '!</title>' + 'Hello ' + name + "!");
}
