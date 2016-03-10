/*
  "tasks" model
  ==================
*/

var db = require('../models/db.model')();

exports.list = function(callback) {
    db.query({
        sql: 'select * from tasks;',
    }, function(err, results, fields) {
        // db.end();
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

// Insert new task in the DB
exports.createTask = function(task, callback) {
    task.credits = 1; // Default for new tasks
    task.status = "Pending";

    // Write to the DB
    db.query({
        sql: 'INSERT INTO tasks ' +
        '(taskName, taskDescription, taskCredits, taskStatus, taskmasterId, assigneeId) ' +
        'VALUES (?,?,?,?,?,?);',
        values: [task.name, task.description, task.credits, task.status, task.assigner, task.assignee]
    }, function(err, results, fields) {
        // db.end();
        if (err) {
            callback(err);
            return;
        }
        callback(false, results);
    });
}

// Search an assigner, return tasks
exports.getTasksByAssigner = function(assignerId, callback) {
    db.query({
        sql: 'SELECT * FROM tasks WHERE taskmasterId = ?;',
        values: [assignerId]
    }, function(err, results, fields) {
        // db.end();
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

// Search an assignee, return a user
exports.getTasksByAssignee = function(assigneeId, callback) {
    db.query({
        sql: 'SELECT * FROM tasks WHERE assigneeId = ?;',
        values: [assigneeId]
    }, function(err, results, fields) {
        // db.end();
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