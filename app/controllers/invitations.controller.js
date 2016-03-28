var invitations = require('../models/invitations.model'),
email = require('./email.controller');

exports.renderNewInvite = function(req, res, next){
  // Retrieve the list of groups the user owns
  var groups = require('../controllers/groups.controller');

  groups.groupsOwnedById(req.user.userId, function(err, results){
    if (err){
      if (err.code === 'User does not own any groups'){
        results = []; // User has no groups.
      } else {
        console.log(err);
        return;
      }
    }
    // Show the invite page
    res.render('newInvite', {
        pageTitle: 'Create New Invitation',
        user: req.user,
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
          res.redirect('/newInvite'); //goes back to invite page : create another invite
        });
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

exports.acceptInvite = function (req, res) {
  var invitationIsValid = true, pageTitle = 'Invitation accepted!';
  if (!req.invite){
    invitationIsValid = false;
    pageTitle = 'Error!'
  } else {
    invitations.markAccepted(req.invite.inviteId, function (err) {
      if (err){
        invitationIsValid = false;
        pageTitle = 'Error!'
        req.flash('error', 'Error updating invite: ' + err.toString());
      }
      res.render('acceptInvite', {
        invitationIsValid: invitationIsValid,
        user: req.user,
        pageTitle: pageTitle,
        errorMsg: req.flash('error'),
        groupName: req.invite.groupName
      });
    })
  }
  res.render('acceptInvite', {
    invitationIsValid: invitationIsValid,
    user: req.user,
    pageTitle: pageTitle,
    errorMsg: req.flash('error'),
    groupName: ''
  });
}
