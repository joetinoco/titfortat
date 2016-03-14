/*
  "tasks" controller
  ==================

  Handles task creation [and listing].

*/

exports.read = function(req, res) {
    var message = '';
    var tasks = require('../models/tasks.model');
    tasks.list(function(err, data) {
        if (err) {
            console.log(err.toString());
        } else if (data.length > 0) {
            message = '<table><tr><td>Task Name:</td><td>Task Description:</td><td>Status:</td><td>Assigned By:</td><td>Assigned To:</td></tr>';
            data.forEach(function(entry) {
                message = message + '<tr><td>' + entry.taskName + '</td><td>' + entry.taskDescription + '</td><td>' + entry.taskStatus + '</td><td><a href="/tasks/' + entry.taskmasterId + '">' + entry.assigner + '</a></td><td><a href="/tasks/' + entry.assigneeId + '">' + entry.assignee + '</td></tr>';
            });
            message += "</table>";

            res.send(message);
        } else {
            message = 'No tasks yet. Why not <a href="/createTask">create</a> one?';
            res.send(message);
        }
    });
};

exports.create = function(req, res, next) {
    var tasks = require('../models/tasks.model');
    tasks.createTask(req.body, function(err, data) {
        if (err) {
            console.log(err.toString());
            res.redirect('/createTask');
        } else {
            var message = '<h1>Task Created!</h1><br><table><tr><td>Name:</td><td>' + req.body.name +
                '</td></tr><tr><td>Description:</td><td>' + req.body.description +
                '</td></tr><tr><td>Assigned By:</td><td>' + req.body.assigner +
                '</td></tr><tr><td>To:</td><td>' + req.body.assignee +
                '</td></tr></table>';
            res.send(message);
        }
    });
};

exports.tasksByUser = function(req, res, next, id) {
    var tasks = require('../models/tasks.model');
    var users = require('../models/users.model');

    users.getUserById(id, function(err, results) {
        var username = results.userName;
        var content = "<h1>Tasks Created by " + username + "</h1>";

        tasks.getTasksByAssigner(id, function(err, results) {
            if (err) {
                next(err);
            } else if (results.length == 0) {
                content += '<i>Nothing here yet</i>';
            } else {
                content += '<table><tr><td>Name</td><td>Description</td><td>Assigned To</td><td>Status</td></tr>';
                results.forEach(function(result) {
                    content = content + '<tr><td>' + result.taskName + '</td><td>' + result.taskDescription + '</td><td>' + result.userName + '</td><td>' + result.taskStatus + '</td></tr>';
                });
            }

            content = content + '</table><br><br><h1>Tasks Assigned to ' + username + '</h1>';;

            tasks.getTasksByAssignee(id, function(err, results) {
                if (err) {
                    next(err);
                } else if (results.length == 0) {
                    content += '<i>Nothing here yet</i>';
                } else {
                    content += '<table><tr><td>Name</td><td>Description</td><td>Assigned By</td><td>Status</td></tr>';
                    results.forEach(function(result) {
                        content = content + '<tr><td>' + result.taskName + '</td><td>' + result.taskDescription + '</td><td>' + result.userName + '</td><td>' + result.taskStatus + '</td></tr>';
                    });
                    content += '</table>';
                }
                res.send(content);
            });
        });
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
            title: 'Task Creator',
            assigner: assigner,
            assigneeList: assigneeList
        });
    });
}

