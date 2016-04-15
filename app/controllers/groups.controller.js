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
                req.flash('error', 'Group creation failed. Error Code: ' + err.code);
                res.redirect('/createGroup');
            } else{
                req.flash('success', 'Success. Group Created.');
                res.redirect('/createGroup');
            }//else
        })//creatgroup

    }//else (if logged in)
}///createGroup


exports.renderGroupCreator = function(req, res, next){
    res.render('groupCreator', {
        pageTitle: 'Create a Group',
        errorMsg: req.flash('error'),
        successMsg: req.flash('success'),
        user: req.user
    });
}//render

exports.loadUserOwnedGroups = function(req, res, next){
    if(!req.groups){
        req.groups = {};
    }
    if(req.user){
        // Load groups that the user is an admin of
        var groups = require('../models/groups.model');
        groups.groupsOwnedById(req.user.userId, function(err, results){
            if (!err){
                req.groups.owned = results;
            }
            next();
        });
    } else next();
}

exports.loadUserGroups = function(req, res, next){
    if(!req.groups){
        req.groups = {};
    }
    if(req.user){
        // Load groups that the user belongs to
        var groups = require('../models/groups.model');
        groups.groupsById(req.user.userId, function(err, results){
            if (!err){
                req.groups.member = results;
            }
            next();
        });
    } else next();
}

exports.selectGroup = function(req, res, next, groupId){
    var ownsGroup = false;
    var groups = require('../models/groups.model');
    // Retrieve the group name
    groups.groupName(groupId, function(err, results){
        if (err){
            req.flash('error', 'Error retrieving group: ' + err.toString());
            res.redirect('/');
        } else if (!results){
            req.flash('error', 'Group not found.');
            res.redirect('/');
        } else {
            req.currentGroup = groupId;
            req.currentGroupName = results.groupName;
            // Check if the current user owns the group
            if(!req.user){
                req.ownsCurrentGroup = ownsGroup;
                next();
            } else {
                groups.groupsOwnedById(req.user.userId, function(err, results){
                    if (err){
                        req.flash('error', 'Error retrieving groups: ' + err.toString());
                        res.redirect('/');
                    } else {
                        results.forEach(function(g){
                            if (g.groupId == groupId){
                                ownsGroup = true;
                            }
                        });
                        req.ownsCurrentGroup = ownsGroup;
                        next();
                    }
                });
            }
        }
    });
}
