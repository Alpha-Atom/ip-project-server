module.exports = {
  perform: function (a,b) {
    perform(a,b);
  }
}

var perform = function (req, res) {
  res.send("Attempting to view society: " + req.params.societyid);
};
