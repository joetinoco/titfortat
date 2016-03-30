/*
  "tasks" model
  ==================
*/

exports.list = function(callback) {
    var db = require('../models/db.model')();
    db.query({
        sql: 'select tasks.taskName, tasks.taskDescription, tasks.taskmasterId, u1.userName as assigner, tasks.assigneeId, u2.userName as assignee, tasks.taskStatus from tasks join users u1 on u1.userId = tasks.taskmasterId join users u2 on u2.userId = tasks.assigneeId;',
    }, function(err, results, fields) {
        db.end();
        if (err) {
            callback(err);
            return;
        }
        if (results.length == 0) {
            callback({ code: 'Tasks not found' });
            return;
        }
        callback(false, results);
    });
}

exports.taskById = function(id, callback) {
    var db = require('../models/db.model')();
    db.query({
        sql: 'select * from tasks where taskId = ?',
        values: [id]
    }, function(err, results, fields) {
        db.end();
        if (err) {
            callback(err);
            return;
        }
        if (results.length == 0) {
            callback({ code: 'Task not found' });
            return;
        }
        callback(false, results);
    });
}

// Insert new task in the DB
exports.createTask = function(task, file, callback) {
    var db = require('../models/db.model')();
    task.credits = 1; // Default for new tasks
    task.status = "Pending";

    var serializedFile = file ? JSON.stringify(file) : null;

    // Write to the DB
    db.query({
        sql: 'INSERT INTO tasks ' +
        '(taskName, taskDescription, taskCredits, taskStatus, taskmasterId, assigneeId, helpFile) ' +
        'VALUES (?,?,?,?,?,?,?);',
        values: [task.name, task.description, task.credits, task.status, task.assigner, task.assignee, serializedFile]
    }, function(err, results, fields) {
        db.end();
        if (err) {
            callback(err);
            return;
        }
        callback(false, results);
    });
}

exports.useCredits = function(user, callback) {
    var db = require('../models/db.model')();
    db.query({
        sql: 'update users set userCredits = ? where userId = ?',
        values: [user.userCredits - 1, user.userId]
    }, function(err, results, fields) {
        db.end();
        if (err) {
            callback(err);
            return;
        }
        callback(false, results);
    });
}

// Search an assigner, return tasks
exports.getTasksByAssigner = function(assignerId, callback) {
    var db = require('../models/db.model')();
    db.query({
        sql: 'SELECT * FROM tasks join users as u on u.userId = tasks.assigneeId WHERE taskmasterId = ?;',
        values: [assignerId]
    }, function(err, results, fields) {
        if (err) {
            callback(err);
            return;
        }
        if (results.length == 0) {
            callback({ code: 'Tasks not found' });
            return;
        }
        callback(false, results);
    });
}

// Search an assignee, return a list of tasks
exports.getTasksByAssignee = function(assigneeId, callback) {
    var db = require('../models/db.model')();
    db.query({
        sql: 'SELECT * FROM tasks join users as u on u.userId = tasks.taskmasterId WHERE assigneeId = ?;',
        values: [assigneeId]
    }, function(err, results, fields) {
        if (err) {
            callback(err);
            return;
        }
        if (results.length == 0) {
            callback({ code: 'Tasks not found' });
            return;
        }
        callback(false, results);
    });

}

exports.updateAssigneeTask = function(task, file, callback) {
    serializedFile = file ? JSON.stringify(file) : null;
    console.log('Serialized file:');
    console.log(serializedFile);
    var db = require('../models/db.model')();
    db.query({
        sql: 'update tasks set taskStatus = ?, proofFile = ? where taskId = ?',
        values: [task.status, serializedFile, task.id]
    }, function(err, results, fields) {
        if (err) {
            callback(err);
            return;
        }
        if (results.length == 0) {
            callback({ code: 'Tasks not found' });
            return;
        }
        callback(false, results);
    });
}


//jiho-Test
//
//exports.getName = function(taskName, callback){
exports.getName = function(callback) {
    var db = require('../models/db.model')();
    db.query({
        sql: 'SELECT taskName FROM tasks;'
        //sql: 'SELECT * FROM tasks join users as u on u.userid = tasks.assigneeid WHERE taskName =?;',
        //values: [taskName]
    }, function(err, results, fields) {
        if (err) {
            callback(err);
            return;
        }
        if (results.length == 0) {
            callback({ code: 'Tasks not found' });
            return;
        }
        callback(false, results);
    });
}


// give credit value from task to assignee
exports.awardCredits = function(task, callback) {
    var db = require('../models/db.model')();
    // Retrieve the completed task
    db.query({
        sql: 'SELECT * FROM tasks WHERE taskId = ?',
        values: [task.taskId]
    }, function(err, completedTask, fields) {
        if (err) {
            db.end();
            callback(err);
            return;
        }
        // Mark task as closed
        console.log('Changing task status to "Closed"');
        db.query({
            sql: 'update tasks set taskStatus = "Closed" where taskId = ?;',
            values: [completedTask[0].taskId]
        }, function(err, results, fields) {
            if (err) {
                db.end();
                callback(err);
                return;
            }
        });

        // Give those task's credits to the user
        console.log('Giving ' + completedTask[0].taskCredits + ' credits to ' + completedTask[0].assigneeId);
        db.query({
            sql: 'update users set userCredits = userCredits + ? where userId = ?',
            values: [completedTask[0].taskCredits, completedTask[0].assigneeId]
        }, function(err, results, fields) {
            db.end();
            if (err) {
                callback(err);
                return;
            }
            callback(false, results);
        });
    });
}
