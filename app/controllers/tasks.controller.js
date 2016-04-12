/*
"tasks" controller
==================

Handles task creation [and listing].

*/

exports.read = function(req, res) {
    var taskList;
    var tasks = require('../models/tasks.model');
    var groups = require('../models/groups.model');
    var groupId = req.currentGroup || null;
    tasks.list(groupId, function(err, data) {
        if (err) {
            console.log(err);
            res.redirect('/');
        } else if (data.length == 0){
            taskList = [];
        } else {
            taskList = new Array(data.length);
            for (var i = 0; i < taskList.length; i++) {
                taskList[i] = new Array(7);
                taskList[i][0] = data[i].taskName;
                taskList[i][1] = data[i].taskDescription;
                taskList[i][2] = data[i].taskStatus;
                taskList[i][3] = data[i].taskmasterId;
                taskList[i][4] = data[i].assigner;
                taskList[i][5] = data[i].assigneeId;
                taskList[i][6] = data[i].assignee;
            }
        }
        if (groupId){
            groups.groupName(groupId, function(err, results){
                res.render('viewTasks', {
                    pageTitle: 'View Tasks',
                    taskList: taskList,
                    user: req.user,
                    groupName: results.groupName || '(all)',
                    groupId: req.currentGroup,
                    ownsCurrentGroup: req.ownsCurrentGroup,
                });
            });
        } else {
            res.render('viewTasks', {
                pageTitle: 'View Tasks',
                taskList: taskList,
                user: req.user,
                groupName : null
            });
        }
    });
};

exports.create = function(req, res, next) {
    var tasks = require('../models/tasks.model');
    var message;
    if (req.user.userCredits >= 1) {
        tasks.createTask(req.body, req.file, function(err, data) {
            if (err) {
                message = 'Creation failed: ' + err.code;
            } else {
                tasks.useCredits(req.user, function(err, results) {
                    if (!err) {
                        message = 'Task created!';
                        req.flash('error', message);
                        res.redirect('/group/' + req.currentGroup + '/createTask');
                    }
                });
            }
        });
    } else {
        message = 'Need at least one credit!';
        req.flash('error', message);
        res.redirect('/group/' + req.currentGroup + '/createTask');
    }
};

exports.byId = function (req, res, next, id) {
    var tasks = require('../models/tasks.model');
    tasks.taskById(id, function (err, task) {
        if(err){
            req.flash('error', 'Error retrieving the task.');
            next();
        } else {
            if (task.length < 1){
                req.flash('error', 'Task does not exist');
                return next();
            }
            req.task = task[0];
            return next();
        }
    });
}

exports.allByUser = function(req, res, next, id) {
    var tasks = require('../models/tasks.model');
    var users = require('../models/users.model');

    users.getUserById(id, function(err, results) {
        var username = results.userName;
        var pageTitle = 'View ' + username + "'s Tasks";
        var assignerTasks;
        var assigneeTasks;

        tasks.getTasksByAssigner(id, function(err, results) {
            if (err) {
                next(err);
            } else if (results.length == 0){
                assignerTasks = [];
            } else {
                assignerTasks = new Array(results.length);
                for (var i = 0; i < results.length; i++) {
                    assignerTasks[i] = new Array(4);
                    assignerTasks[i][0] = results[i].taskName;
                    assignerTasks[i][1] = results[i].taskDescription;
                    assignerTasks[i][2] = results[i].userName;
                    assignerTasks[i][3] = results[i].taskStatus;
                }
            }

            tasks.getTasksByAssignee(id, function(err, results) {
                if (err) {
                    next(err);
                } else if (results.length == 0){
                    assigneeTasks = [];
                } else {
                    assigneeTasks = new Array(results.length);
                    for (var i = 0; i < results.length; i++) {
                        assigneeTasks[i] = new Array(4);
                        assigneeTasks[i][0] = results[i].taskName;
                        assigneeTasks[i][1] = results[i].taskDescription;
                        assigneeTasks[i][2] = results[i].userName;
                        assigneeTasks[i][3] = results[i].taskStatus;
                    }
                }

                req.pageTitle = pageTitle;
                req.username = username;
                req.assignerTasks = assignerTasks;
                req.assigneeTasks = assigneeTasks;
                next();
            });
        });
    });
};

exports.showAll = function(req, res, next) {
    res.render('viewUserTasks', {
        pageTitle: req.pageTitle,
        user: req.user,
        username: req.username,
        assignerTasks: req.assignerTasks,
        assigneeTasks: req.assigneeTasks
    });
};

exports.getNames = function(req, res, next) {
    var taskNameList = '';

    var tasks = require('../models/tasks.model');

    tasks.getTasksByAssigner(req.user.userId, function(err, results) {
        if (err) {
            console.log(err.toString());
            // next(err);
        } else if (results.length > 0) {
            console.log("Tasks returned.");
        }

        res.render('manageTask', {
            title: 'Manage Task',
            user: req.user,   //pass the user  object
            tasks: results,
            pageTitle: 'Manage task',
            successMsg: req.flash('success') || '',
            errorMsg: req.flash('error') || '',
        });

    });
}

//test-mar.19
exports.completeTask = function(req, res, next) {
    var db = require('../models/db.model')();
    var tasks = require('../models/tasks.model');
    var message = '';

    tasks.awardCredits(req.body, function(err, data) {
        if (err) {
            req.flash('error', err.toString());
            res.redirect('/manageTask');
        } else {
            req.flash('success', 'Great! User received the credits for the completed task.');
            res.redirect('/manageTask');
        }
    });
}

exports.updateAssigneeTasks = function(req, res, next) {
    var tasks = require('../models/tasks.model');
    tasks.updateAssigneeTask(req.body, req.file, function(err, results) {
        if (err) {
            req.flash('error', err.toString());
        } else {
            req.flash('error', 'Task updated');
        }
        next();
    });
}

exports.showAssigneeTasks = function(req, res, next) {
    var tasks = require('../models/tasks.model');
    var myTasks;
    var statuses;
    var message;

    tasks.getTasksByAssignee(req.user.userId, function(err, results) {
        if (err) {
            message = 'Error retrieving tasks assigned to ' + req.user.userName;
            req.flash('error', message);
        } else if (results.length > 0) {
            myTasks = new Array(results.length);
            var statuses = new Array(results.length);
            for (var i = 0; i < results.length; i++) {
                myTasks[i] = new Array(7);
                myTasks[i][0] = results[i].taskId;
                myTasks[i][1] = results[i].taskName;
                myTasks[i][2] = results[i].taskDescription;
                myTasks[i][3] = results[i].userName;
                myTasks[i][4] = results[i].groupId;
                myTasks[i][5] = results[i].groupName;
                myTasks[i][6] = results[i].helpFile;
                myTasks[i][7] = results[i].taskStatus;
                myTasks[i][8] = JSON.parse(results[i].proofFile);
                statuses[i] = ['Pending', 'Accepted', 'Completed', 'In progress'];
            }
        }
        res.render('taskExecutor', {
            pageTitle: 'Task Executor',
            user: req.user,
            errorMsg: req.flash('error'),
            tasks: myTasks,
            statuses: statuses
        });
    });
}

exports.renderAssigneeTasks = function(req, res, next) {
    res.redirect('/executeTasks');
}

exports.render = function(req, res, next) {
    //var assigner = '<option value="' + req.user.userId + '" selected>' + req.user.userName + '</option>'; // current user
    var assigner = req.user;
    var assigneeList;

    var groups = require('../models/groups.model');

    // get list of potential assignees
    // (all users in the same group, minus the current user)
    console.log('Cur group: ' + req.currentGroup);
    groups.groupUsers(req.currentGroup, function(err, results) {
        console.log(results);
        if (err) {
            console.log(err.toString());
            next(err);
        } else if (results.length > 0) {
            assigneeList = new Array(results.length);
            for (var i=0;i<results.length;i++) {
                assigneeList[i] = new Array(2);
                assigneeList[i][0] = results[i].userId;
                assigneeList[i][1] = results[i].userName;
            }
        }
        res.render('createTask', {
            pageTitle: 'Task Creator',
            user: req.user,
            errorMsg: req.flash('error'),
            assigner: assigner,
            assigneeList: assigneeList,
            groupId: req.currentGroup
        });
    });
}


//userInformation - Profile
exports.userInformation = function(req, res, next) {
    res.render('userInformation', {
        pageTitle: 'Profile',
        user: req.user,
        errorMsg: req.flash('error')
    });
};
