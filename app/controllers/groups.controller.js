/*
  Group controller
  ==================

  Manages the groups
*/

exports.create = function(req, res, next) {
     if(!req.user){
    res.send('You are not logged in.<br/><a href="/signin">Log in</a> or <a href="/signup">sign up</a>');
  } else {

            var groupModel = require('../models/groups.model');

            groupModel.createGroup(req.body, req.user, function(err,data) {
                if(err) {
                    console.log(err.toString());
                    req.flash('Feedback', 'Group creation failed. Error Code: ' + err.code);
                } else{
                    console.log('Group created');

                    req.flash('Feedback', 'Success. Group Created');
                    res.redirect('/');
                }//else
            })//creatgroup

  }//else (if logged in)
}///createGroup


exports.renderGroupCreator = function(req, res, next){
    res.render('groupCreator', {
        pageTitle: 'Create a Group',
        errorMsg: req.flash('Feedback', ''),
        user: req.user
    });
}//render

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
      if (results.length == 0) {
          callback(true, { code: 'User does not own any groups' });
          return;
      }
      callback(false, results);
  });
}
