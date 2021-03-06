//    Invitations Model
// =========================

exports.listInvites = function(callback)
{
  var db = require('../models/db.model')();
  db.query({
        sql: 'SELECT invites.inviteID, invites.invitesEmail, invites.status, invites.groupID as inviter FROM invites as i join groups as g on i.groupID = g.groupID join users as u on users.name where u.userID = g.groupAdminID;',
    }, function(err, results, fields) {
        db.end();
        if (err){
            callback (err);
            return;
        }// if error
        if (results.length == 0) {
            callback({ code: 'No Pending Invitation' });
            return;
        }//if empty groups

        callback(false, results);
    });//end query
}//end listInvites

//Insert new invitation to the db
exports.newInvite = function(invite, callback){
  var db = require('../models/db.model')();
  invite.status = "Pending"

  // write to db
  db.query({
      sql: 'INSERT INTO invites ' + ' (groupID, inviteeEmail, status) ' + 'VALUES (?,?,?)',
      values:[invite.groupId, invite.inviteeEmail, invite.status ]
  }, function (err, results, fields) {
      db.end(); //close db connection
      if (err){
        console.log(err.toString());
          callback(err);
          return;
      }//if error
      callback(false, results); //callback that send data to controller
  });//end query
}

//Retrieve a single invite
exports.pendingById = function(inviteId, callback){
  var db = require('../models/db.model')();

  db.query({
      sql: 'SELECT i.inviteId, i.groupId, i.inviteeEmail, g.groupName, u.userId, i.status '+
      'FROM invites AS i '+
      'INNER JOIN groups AS g ON (i.groupId = g.groupId) ' +
      'LEFT JOIN users as u ON (i.inviteeEmail = u.userEmail) ' +
      'WHERE i.inviteId = ? AND i.status = "Pending"',
      values:[inviteId]
  }, function (err, results, fields) {
      db.end(); //close db connection
      if (err){
          console.log(err.toString());
          callback(err);
          return;
      }
      callback(false, results);
  });
}

// Mark an invite as accepted
exports.markAccepted = function(inviteId, callback){
  var db = require('../models/db.model')();

  db.query({
      sql: 'UPDATE invites SET status = "Accepted" WHERE inviteId = ?',
      values:[inviteId]
  }, function (err, results, fields) {
      db.end(); //close db connection
      if (err){
          console.log(err.toString());
          callback(err);
          return;
      }
      callback(false, results);
  });
}
