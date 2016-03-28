bcrypt = require("bcrypt-nodejs");

module.exports = {
  generate: function (user) {
    var obfuscator = (Math.random()+1).toString(36).substring(7);
    return bcrypt.hashSync(Date.now().toString() + user + obfuscator);
  }
}
