/*
  "tasks" controller
  ==================

  Handles task creation [and listing].

*/

var db = require('../../config/mysql.js');
var tasks = require('../models/tasks.model');

// Handler for the createTask form POST requests
exports.create = function(req, res, next) {
    tasks.createTask(req.body, function(err, data) {
        if (err) {
            res.send(err.toString());
        } else {
            var message = "<h1>Task Created!</h1><br><table><tr><td>Name:</td><td>" + req.body.taskName +
                "</td></tr><tr><td>Description:</td><td>" + req.body.description +
                "</td></tr><tr><td>Assigned By:</td><td>" + req.body.assigner +
                "</td></tr><tr><td>To:</td><td>" + req.body.assignee +
                "</td></tr></table>";
            res.send(message);
        }
    });
};

// Render createTask form
exports.render = function(req, res, next) {
    var assigner = req.user.userId; // current user
    var assigneeList = '';    
    
    console.log("Id: " + assigner + " Name: " + req.user.userName);
    
    // get list of assignees
    db.query("select * from users;", function(err, results, fields) {
        if (err) {
             console.log(err.toString());
        } else {
            if (results.length>0) {
                results.forEach(function(result) {
                    assigneeList  = assigneeList + '<option value="' + result.userId + '">' + result.userName + '</option>';
                });
            }
        }
        console.log(assigneeList);                    
    });    
    
    res.render('createTask', {
        title: 'Task Creator',
        assigner: assigner,
        assigneeList: assigneeList
    });
}

