/*
  "users" controller
  ==================

  Handles user creation and authentication.

*/

// Render sign up form
exports.renderSignup = function(req, res, next){
  res.render('signup', { pageTitle: 'Sign up' } );
}

// Render sign in form
exports.renderSignin = function(req, res, next){
  res.render('signin', { pageTitle: 'Sign in' } );
}

// Handler for the sign up form POST requests
exports.createUser = function(req, res, next){
  var users = require('../models/users.model');
  users.createUser(req.body, function(err, data){
    if (err){
      // Insertion did not work
      var errorMsg = 'Insertion failed: ' + err.code;
      res.render('signup', { pageTitle: 'Sign up', errorMsg: errorMsg } );
    } else {
      // Insertion worked.
      // data.affectedRows should be 1,
      // and data.insertId contains the newly-created user ID.
      res.render('signup', { pageTitle: 'Sign up', errorMsg: '' } );
    }
  });
}
