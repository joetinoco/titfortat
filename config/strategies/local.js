/*

Passport authentication strategy (local)
========================================

*/
var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    users = require('../../app/models/users.model');

module.exports = function() {
  passport.use(new LocalStrategy(function(username, password, done) {
    users.getUser(username, function(err, user){
      if (err) {
        console.log('> User "' + username + '" failed to authenticate: ' + err.code);
        return done(null, false, {
          message: err.code
        });
      }
      if (!users.authenticate(user, password)) {
        console.log('> User "' + username + '" failed to authenticate: wrong password.');
        return done(null, false, {
          message: 'Invalid password'
        });
      }
      console.log('> User "' + username + '" logged in.');
      return done(null, user);
    });
  }));
};
