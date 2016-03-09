var passport = require('passport');

module.exports = function() {
    var users = require('../app/models/users.model');
    passport.serializeUser(function(user, done) {
      done(null, user.userId);
    });

    passport.deserializeUser(function(id, done) {
      users.getUserById(id, function(err, user){
        done(err, user);
      });
    });

    require('./strategies/local.js')();
};
