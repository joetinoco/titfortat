/*
  "users" controller
  ==================

  Handles user creation and authentication.

*/

exports.renderSignup = function(req, res, next){
  res.render('signup', { pageTitle: 'Sign up' } );
}

// Handler for the sign up form POST requests
exports.createUser = function(req, res, next){
  var users = require('../models/users.model');
  users.createUser(req.body, function(success, data){
    if (success){
      // Insertion worked.
      // data.affectedRows should be 1,
      // and data.insertId contains the newly-created user ID.
      res.render('signup', { pageTitle: 'Sign up', errorMsg: '' } );
    } else {
      // Insertion did not work
      var errorMsg = 'Insertion failed: ' + data.code;
      res.render('signup', { pageTitle: 'Sign up', errorMsg: errorMsg } );
    }
  });
}

exports.renderSignin = function(){

}
