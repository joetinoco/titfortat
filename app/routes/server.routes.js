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
        passport = require('passport'),
        // Multer is used for file uploads
        // (documentation: https://github.com/expressjs/multer )
        multer  = require('multer'),
        upload = multer({ dest: 'uploads/' });

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
    app.route('/task/:user')
        .get(task.showAll);
    app.param('user', task.allByUser);
    app.route('/executeTasks')
        .get(task.showAssigneeTasks);
    // app.post('/tasks/:taskId', upload.single('proofFile'), task.renderAssigneeTasks); //todo: cannot post tasks/id
    // app.param('taskId', task.updateAssigneeTasks);
    app.post('/tasks/update', upload.single('proofFile'), task.updateAssigneeTasks, task.renderAssigneeTasks);

    //groups
    app.get('/createGroup', groupController.renderGroupCreator);
    app.route('/createGroup')
            .post(groupController.create);

    //Invitations
    app.get('/newInvite', invitation.renderNewInvite);
    app.post('/newInvite', invitation.newInvite);
    app.get('/invitation/:inviteId', invitation.acceptInvite, invitation.renderAcceptanceFeedback);
    app.param('inviteId', invitation.getInvite);

    //Jiho
   app.get('/manageTask', task.getNames);
   app.post('/manageTask', task.completeTask);



}
