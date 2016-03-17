/*

Routes for all pages
====================

*/

module.exports = function(app) {
    var index = require('../controllers/index.controller'),
        user = require('../controllers/users.controller'),
        task = require('../controllers/tasks.controller.js'),
        group = require('../controllers/groups.controller.js'),
        passport = require('passport');

    app.get('/', index.render);

    app.get('/signin', user.renderSignin)
        .post('/signin', passport.authenticate('local', {
            successRedirect: '/',
            failureRedirect: '/signin',
            failureFlash: true
        }));

    app.get('/signout', function(req, res){
      req.logout();
      res.redirect('/');
    });


    app.get('/signup', user.renderSignup)
        .post('/signup', user.createUser);

    app.get('/createTask', task.render);
    app.route('/tasks')
        .get(task.read)
        .post(task.create);
    app.route('/tasks/:user')
        .get(task.read)
        
    //groups
    app.get('/createGroup', group.renderGroupCreator);
    app.route('/createGroup')
            .post(group.create);    
        
    app.param('user', task.tasksByUser);
}
