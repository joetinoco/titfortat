exports.renderNewInvite = function(req, res, next){
    res.render('newInvite', {
        pageTitle: 'Create New Invitation'
    });//end res.render()
}//end render

exports.newInvite = function(req, res, next)
{
    var invitations = require('../models/invitations.model');
    invitations.newInvite(req.body, function(err, data){
    if (err){
      // invitation not ceated
      req.flash('error', 'Invitation Failed: ' + err.code);
      
    } else {
      // invitation created
      res.redirect('/newInvite'); //goes back to invite page : create another invite
    }
  });    
}
