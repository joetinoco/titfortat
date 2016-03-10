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
                var assigner = entry.taskmasterId;
                var assignee = entry.assigneeId;
                var users = require('../models/users.model');

                users.getUserById(entry.taskmasterId, function(err, result) {
                    if (!err) {
                        assigner = result.userName;
                    }
                });
                users.getUserById(entry.assigneeId, function(err, result) {
                    if (!err) {
                        assignee = result.userName;
                    }
                });
                message = message + '<tr><td>' + entry.taskName + '</td><td>' + entry.taskDescription + '</td><td>' + entry.taskStatus + '</td><td><a href="/tasks/' + assigner + '">' + assigner + '</a></td><td><a href="/tasks/' + assignee + '">' + assignee + '</td></tr>';
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
    content = "<h1>Tasks Created by " + id + "</h1>";
    var tasks = require('../models/tasks.model');
    tasks.getTasksByAssigner(id, function(err, results) {
        if (err) {
            next(err);
        } else if (results.length == 0) {
            content += '<i>Nothing here yet</i>';
        } else {
            content += '<table><tr><td>Name</td><td>Description</td><td>Assigned To</td></tr>';
            results.forEach(function(result) {
                content = content + '<tr><td>' + result.taskName + '</td><td>' + result.taskDescription + '</td><td>' + result.assigneeId + '</td></tr>';
            });
        }

        content = content + '</table><br><br><h1>Tasks Assigned to ' + id + '</h1>';;

        tasks.getTasksByAssignee(id, function(err, results) {
            if (err) {
                next(err);
            } else if (results.length == 0) {
                content += '<i>Nothing here yet</i>';
            } else {
                content += '<table><tr><td>Name</td><td>Description</td><td>Assigned By</td></tr>';
                results.forEach(function(result) {
                    content = content + '<tr><td>' + result.taskName + '</td><td>' + result.taskDescription + '</td><td>' + result.taskmasterId + '</td></tr>';
                });
                content += '</table>';
            }
            res.send(content);
        });
        res.send(content);
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

