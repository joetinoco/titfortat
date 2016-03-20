/*

Routes for all pages
====================

*/

module.exports = function(app) {
    var index = require('../controllers/index.controller'),
        user = require('../controllers/users.controller'),
        task = require('../controllers/tasks.controller.js'),
        invitation = require('../controllers/invitations.controller.js'),
        groupController = require('../controllers/groups.controller.js'),
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
    app.get('/createGroup', groupController.renderGroupCreator);
    app.route('/createGroup')
            .post(groupController.create);    
        
    //Invitations
    app.get('/newInvite', invitation.renderNewInvite);
    app.route('/newInvite')
            .post(invitation.createInvite);   //replace with invitation exports.xyz name (xyz part)

    app.param('user', task.tasksByUser);
}
