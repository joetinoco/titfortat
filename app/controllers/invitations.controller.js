var invitations = require('../models/invitations.model'),
groups = require('../models/groups.model'),
users = require('../models/users.model'),
email = require('./email.controller');

exports.renderNewInvite = function(req, res, next){
    // Retrieve the list of groups the user owns
    var groups = require('../models/groups.model');

    groups.groupsOwnedById(req.user.userId, function(err, results){
        if (err){
            console.log(err);
            return next(err);
        }
        if (results.length === 0){
            req.flash('error', 'You do not own any groups');
        }
        // Show the invite page
        res.render('newInvite', {
            pageTitle: 'Create New Invitation',
            user: req.user,
            groupId: req.currentGroup,
            groupName: req.currentGroupName,
            userGroupsOwned: results,
            errorMsg: req.flash('error'),
            successMsg: req.flash('success')
        });
    });
}//end render

exports.newInvite = function(req, res, next)
{
    invitations.newInvite(req.body, function(err, data){
        if (err){
            // invitation not created
            req.flash('error', 'Invitation Failed: ' + err.code);
        } else {
            // Send invitation email
            email.send(req.body.inviteeEmail,
                'Invitation to join TitForTat', // Subject
                'Hi there!<br/>' +
                'You were invited to join the Tit for Tat app. To do so, please click the link below:<br/>'+
                '<a href="' + process.env.BASE_URL + '/invitation/' + data.insertId + '">Accept invitation</a><br>' +
                'Alternatively, copy and paste this link: ' + process.env.BASE_URL + '/invitation/' + data.insertId,
                function(error, response){
                    if (error){
                        console.log(error);
                        req.flash('error', 'Error emailing invitation to user: ' + error);
                    } else {
                        req.flash('success', 'User invited successfully.');
                    }
                    res.redirect('/group/' + req.body.groupId + '/newInvite'); //goes back to invite page : create another invite
                }
            );
        }
    });
}

exports.getInvite = function (req, res, next, inviteId) {
    invitations.pendingById(inviteId, function (err, invite) {
        if(err){
            req.flash('error', 'Error retrieving the invitation.');
            next();
        } else {
            if (invite.length < 1){
                req.flash('error', 'Invitation does not exist or was already accepted.');
                return next();
            }
            req.invite = invite[0];
            return next();
        }
    });
}

exports.acceptInvite = function (req, res, next) {
    req.invitationIsValid = true;
    req.userExists = true;
    req.pageTitle = 'Invitation accepted!';
    if (!req.invite){
        // Bad invitation link
        req.invitationIsValid = false;
        req.pageTitle = 'Error!'
    } else {
        // Check if the invited user exists
        if (req.invite.userId === null){
            req.userExists = false;
            req.pageTitle = 'Error!'
        } else {
            // Add user to group
            groups.addUserToGroup(req.invite.userId, req.invite.groupId, function(err){
                if (err){
                    req.invitationIsValid = false;
                    req.pageTitle = 'Error!'
                    req.flash('error', 'Error adding user to group: ' + err.toString());
                    return next();
                }
                // Mark invitation as accepted
                invitations.markAccepted(req.invite.inviteId, function (err) {
                    if (err){
                        req.invitationIsValid = false;
                        req.pageTitle = 'Error!'
                        req.flash('error', 'Error updating invite: ' + err.toString());
                    }
                    return next();
                });
            });
        }
    }
}

exports.renderAcceptanceFeedback = function (req, res) {
    res.render('acceptInvite', {
        invitationIsValid: req.invitationIsValid,
        userExists: req.userExists,
        user: req.user,
        pageTitle: req.pageTitle,
        errorMsg: req.flash('error'),
        groupName: (req.invite ? req.invite.groupName : '')
    });
}
