/*

Routes for all pages
====================

*/

module.exports = function(app){
  var index = require('../controllers/index.controller'),
      user = require('../controllers/users.controller'),
      task = require('../controllers/tasks.controller.js'),
      passport = require('passport');

  app.get('/', index.render);

  app.get('/signin', user.renderSignin)
     .post('/signin', passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/signin',
        failureFlash: true
      }));

  app.get('/signup', user.renderSignup)
     .post('/signup', user.createUser);
     
  app.route('/tasks')
    .get(task.render)
    .post(task.create);

}
