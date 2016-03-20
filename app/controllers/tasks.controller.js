/*
  "tasks" controller
  ==================

  Handles task creation [and listing].

*/

exports.read = function(req, res) {
    var taskList;
    var tasks = require('../models/tasks.model');
    tasks.list(function(err, data) {
        if (err) {
            console.log(err.toString());
            res.redirect('/');
        } else if (data.length > 0) {
            taskList = new Array(data.length);
            for (var i=0; i<taskList.length; i++) {
                taskList[i] = new Array(7);
                taskList[i][0] = data[i].taskName;
                taskList[i][1] = data[i].taskDescription;
                taskList[i][2] = data[i].taskStatus;
                taskList[i][3] = data[i].taskmasterId;
                taskList[i][4] = data[i].assigner;
                taskList[i][5] = data[i].assigneeId;
                taskList[i][6] = data[i].assignee;
            }
            res.render('viewTasks', {
                pageTitle: 'View Tasks',
                taskList: taskList,
                user: req.user
            });
        } else {
            res.render('viewTasks', {
                pageTitle: 'View Tasks',
                user: req.user
            });
        }
    });
};

exports.create = function(req, res, next) {
    var tasks = require('../models/tasks.model');
    var message;
    if (req.user.userCredits >= 1) {
        tasks.createTask(req.body, function(err, data) {
            if (err) {
                message = 'Creation failed: ' + err.code;
            } else {
                message = 'Task created!';
            }
        });
    } else {
        message = 'Need at least one credit!';
    }
    req.flash('error', message);
    res.redirect('/createTask');
};

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
              if (err.code === 'Tasks not found'){
                assignerTasks = [];
              } else next(err);
            } else if (results.length > 0) {
                assignerTasks = new Array(results.length);
                for (var i = 0; i<results.length;i++) {
                    assignerTasks[i] = new Array(4);
                    assignerTasks[i][0] = results[i].taskName;
                    assignerTasks[i][1] = results[i].taskDescription;
                    assignerTasks[i][2] = results[i].userName;
                    assignerTasks[i][3] = results[i].taskStatus;
                }
            }

            tasks.getTasksByAssignee(id, function(err, results) {
                if (err) {
                  if (err.code === 'Tasks not found'){
                    assigneeTasks = [];
                  } else next(err);
                } else if (results.length > 0) {
                    assigneeTasks = new Array(results.length);
                    for (var i = 0; i<results.length; i++) {
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

exports.render = function(req, res, next) {
    var assigner = '<option value="' + req.user.userId + '" selected>' + req.user.userName + '</option>'; // current user
    var assigneeList = '';

    var db = require('../models/db.model')();

    // get list of assignees
    db.query({
        sql: 'select * from users where userId <> ?;',
        values: req.user.userId
    }, function(err, results, fields) {
        if (err) {
            console.log(err.toString());
            next(err);
        } else if (results.length > 0) {
            results.forEach(function(result) {
                assigneeList = assigneeList + '<option value="' + result.userId + '">' + result.userName + '</option>';
            });
        }

        res.render('createTask', {
            pageTitle: 'Task Creator',
            user: req.user,
            assigner: assigner,
            assigneeList: assigneeList,
            errorMsg: req.flash('error')
        });
    });
}
