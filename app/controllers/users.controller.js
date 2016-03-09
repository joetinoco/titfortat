/*
  "users" controller
  ==================

  Handles user creation and authentication.

*/

exports.renderSignup = function(req, res, next){
  res.render('signup', { pageTitle: 'Sign up' } );
}

exports.renderSignin = function(){

}
