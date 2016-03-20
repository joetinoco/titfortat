//    Invitations Model
// =========================

var db = require('../models/db.model')();

exports.listInvites = function(callback)
{   db.query({
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
exports.newInvite = function(invites, callback){
    invites.status = "Pending"
       
    // write to db
    db.query({
        sql: 'INSERT INTO invites ' + ' (inviteID, invitesEmail, status, groupID) ' + 'VALUES (?,?,?,?)',
        values:[invites.invitesID, invites.invitesEmail, invites.status, invites.groupID]
    }, function (err, results, fields) {
        db.end(); //close db connection
        if (err){
            callback(err);
            return;
        }//if error
        callback(false, results); //callback that send data to controller
    });//end query
}


