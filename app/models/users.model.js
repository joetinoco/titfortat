/*
  "users" model
  ==================

*/
var bcrypt = require('bcrypt-node');

// Insert new user in the DB
exports.createUser = function(user, callback){

  user.credits = 2; // Default for new users

  // Hash user password
  var passHash = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10));

  // Write to the DB
  var db = require('../models/db.model')();
  db.query({
    sql: 'INSERT INTO users ' +
    '(userName, userEmail, userPhone, userCountry, userPassword, userCredits) ' +
    'VALUES (?,?,?,?,?,?)',
    values: [user.name, user.email, user.phone, user.country, passHash, user.credits]
  }, function (err, results, fields) {
    db.end();
    if (err){
      callback(err);
      return;
    }
    callback(false, results);
  });
}

// Search a username, return a user
exports.getUser = function(username, callback){
  var db = require('../models/db.model')();
  db.query({
    sql: 'SELECT * FROM users WHERE userName = ?',
    values: [username]
  }, function (err, results, fields) {
    db.end();
    if (err){
      callback(err);
      return;
    }
    if (results.length === 0){
      callback({ code: 'User not found' });
      return;
    }
    callback(false, results[0]);
  });
}

// Search a user ID, return a user
exports.getUserById = function(userId, callback){
  var db = require('../models/db.model')();
  db.query({
    sql: 'SELECT * FROM users WHERE userId = ?',
    values: [userId]
  }, function (err, results, fields) {
    db.end();
    if (err){
      callback(err);
      return;
    }
    callback(false, results[0]);
  });
}

// Check user name + password for authentication
exports.authenticate = function(user, password){
  return bcrypt.compareSync(password, user.userPassword.toString());
}
