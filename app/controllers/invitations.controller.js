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
        userGroupsOwned: results
    });
  });

}//end render

exports.newInvite = function(req, res, next)
{
    var invitations = require('../models/invitations.model');
    invitations.newInvite(req.body, function(err, data){
    if (err){
      // invitation not created
      console.log('Model crapped');
      req.flash('error', 'Invitation Failed: ' + err.code);
    }
    res.redirect('/newInvite'); //goes back to invite page : create another invite
  });
}
