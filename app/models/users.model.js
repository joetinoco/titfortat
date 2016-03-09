/*
  "users" model
  ==================

*/

// Insert new user in the DB
exports.createUser = function(user, callback){

  user.credits = 2; // Default for new users

  // Hash user password
  var bcrypt = require('bcrypt');
  var passHash = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10));

  // Write to the DB
  var db = require('../models/dbconn')();
  db.query({
    sql: 'INSERT INTO users ' +
    '(userName, userEmail, userPhone, userCountry, userPassword, userCredits) ' +
    'VALUES (?,?,?,?,?,?)',
    values: [user.name, user.email, user.phone, user.country, passHash, user.credits]
  }, function (error, results, fields) {
    console.log(results);
    console.log(fields);
    db.end();
    if (err){
      throw err;
      callback(false, err);
    }
    callback(true, results);
  });
}

// Check user name + password for authentication
exports.authenticate = function(username, password){

}
