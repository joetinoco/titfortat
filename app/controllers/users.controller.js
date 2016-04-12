/*
"users" controller
==================

Handles user creation and authentication.

*/

// Render sign up form
exports.renderSignup = function(req, res, next){
    res.render('signup', { pageTitle: 'Sign up', errorMsg: req.flash('error') } );
}

// Render sign in form
exports.renderSignin = function(req, res, next){
    res.render('signin', { pageTitle: 'Sign in', errorMsg: req.flash('error') } );
}

// Handler for the sign up form POST requests
exports.createUser = function(req, res, next){
    var users = require('../models/users.model');
    users.createUser(req.body, function(err, data){
        if (err){
            // Insertion did not work
            req.flash('error', 'Insertion failed: ' + err.code);
            res.redirect('/signup');
        } else {
            // Insertion worked.
            // data.affectedRows should be 1,
            // and data.insertId contains the newly-created user ID.
            res.redirect('/signin');
        }
    });
}

// Load counts for user data: tasks, credits, etc.
exports.loadUserCounts = function(req, res, next){
    if (!req.user){
        next();
    } else {
        req.userCredits = req.user.userCredits;
        // Get tasks by category

        // Counts for tasks where user is a taskmaster
        req.tasksAssignedPending = 0;
        req.tasksAssignedWaitingApproval = 0;
        req.tasksAssignedClosed = 0;

        // Counts for tasks where user is the assignee
        req.tasksPending = 0;
        req.tasksWaitingApproval = 0;
        req.tasksClosed = 0;

        var tasks = require('../models/tasks.model');
        tasks.getTaskCountsByAssignee(req.user.userId, function(err, results){
            if (err){
                console.log(err);
                next();
            }
            if (results.length > 0){
                results.forEach(function(tGroup) {
                    if (tGroup.taskStatus == 'Completed'){
                        req.tasksWaitingApproval = tGroup.numTasks;
                    } else if (tGroup.taskStatus == 'Closed'){
                        req.tasksClosed += tGroup.numTasks;
                    } else {
                        req.tasksPending += tGroup.numTasks;
                    }
                });
            }
            tasks.getTaskCountsByAssigner(req.user.userId, function(err, results){
                if (err){
                    console.log(err);
                    next();
                }
                if (results.length > 0){
                    results.forEach(function(tGroup) {
                        if (tGroup.taskStatus == 'Completed'){
                            req.tasksAssignedWaitingApproval = tGroup.numTasks;
                        } else if (tGroup.taskStatus == 'Closed'){
                            req.tasksAssignedClosed = tGroup.numTasks;
                        } else {
                            req.tasksAssignedPending += tGroup.numTasks;
                        }
                    });
                }
                next();
            });
        });
    }
}
