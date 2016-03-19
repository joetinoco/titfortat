/*
    Groups Model
 ===================
 */

var db = require('../models/db.model')();

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


