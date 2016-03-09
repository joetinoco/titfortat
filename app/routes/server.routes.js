/*

Routes for all pages
====================

*/

module.exports = function(app){
  var index = require('../controllers/index.controller'),
      user = require('../controllers/users.controller');

  app.get('/', index.render);
  app.get('/signup', user.renderSignup)
     .post('/signup', user.createUser);
  app.get('/signin', user.renderSignin);

}
