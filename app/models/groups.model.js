/*
    Groups Model
 ===================
 */

exports.listAll = function(callback) {
    var db = require('../models/db.model')();

    db.query({
        sql: 'SELECT * FROM groups'
    }, function(err, results, fields) {
        db.end();
        if (err){
            callback (err);
            return;
        }// if error
        if (results.length == 0) {
            callback({ code: 'Groups not found' });
            return;
        }//if empty groups

        callback(false, results);
    });//end query
}//listAll

exports.createGroup = function(group, user, callback){
    var db = require('../models/db.model')(); //db connection

    console.log("sending query...");
    db.query({
        sql: 'INSERT INTO groups ' + ' (groupName, groupAdminId) ' + 'VALUES (?,?)',
        values:[group.name, user.userId]
    }, function (err, results, fields) {
        db.end(); //close db connection
        if (err){
            console.log('Error returned');
            callback(err);
            return;
        }//if error
        console.log('db returned something');
        callback(false, results); //callback that send data to controller
    });//end query
}

// Returns all groups owned by the user
exports.groupsOwnedById = function(userId, callback){
  var db = require('../models/db.model')();
  db.query({
      sql: 'select * from groups where groupAdminId = ?',
      values: [userId]
  }, function(err, results, fields) {
      db.end();
      if (err) {
          callback(err);
          return;
      }
      callback(false, results);
  });
}

// Returns all groups where a user is a member
exports.groupsById = function(userId, callback){
  var db = require('../models/db.model')();
  db.query({
      sql: 'SELECT * FROM groups AS g ' +
          'INNER JOIN userGroups AS ug ON (g.groupId = ug.groupId) ' +
          'WHERE ug.userId = ?',
      values: [userId]
  }, function(err, results, fields) {
      db.end();
      if (err) {
          callback(err);
          return;
      }
      callback(false, results);
  });
}

// Get a list of users in a group
exports.groupUsers = function(groupId, callback){
  var db = require('../models/db.model')();
  db.query({
    sql: 'SELECT u.* FROM users AS u INNER JOIN userGroups AS ug ON (ug.userId = u.userId) WHERE groupId = ?',
    values: [groupId]
  }, function (err, results, fields) {
    db.end();
    if (err){
      callback(err);
      return;
    }
    callback(false, results);
  });
}

exports.addUserToGroup = function(userId, groupId, callback){
    var db = require('../models/db.model')(); //db connection

    db.query({
        sql: 'INSERT INTO userGroups ' + ' (userId, groupId) ' + 'VALUES (?,?)',
        values:[userId, groupId]
    }, function (err, results, fields) {
        db.end();
        if (err){
            callback(err);
            return;
        }
        callback(false, results);
    });
}

exports.groupName = function(groupId, callback){
    var db = require('../models/db.model')(); //db connection
    db.query({
        sql: 'select groupName from groups where groupId = ?',
        values:[groupId]
    }, function (err, results, fields) {
        db.end();
        if (err){
            callback(err);
            return;
        }
        callback(false, results[0]);
    });
}
