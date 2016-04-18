// PREPARATIONS
//=============
var config = require('../config/config');
var assert = require('chai').assert;
var expect = require('chai').expect;
var req, res, next;


// Controllers
var index = require('../app/controllers/index.controller'),
users = require('../app/controllers/users.controller'),
tasks = require('../app/controllers/tasks.controller.js'),
files = require('../app/controllers/files.controller.js'),
invitations = require('../app/controllers/invitations.controller.js'),
groups = require('../app/controllers/groups.controller.js');


// Mock users
var mockUser = {
    userId: 477,
    username: 'joseph',
    userEmail: 'joseph@joseph.com'
}

var mockInvalidUser = {
    userId: -9999,
    username: 'I do not exist'
};

var mockGrouplessUser = {
    userId: 485,
    username: 'johann'
};

// Mock groups
var mockCurrentGroup = 16;
var mockInvalidGroup = -999;
var mockGroup = {
    groupName: 'Mock Group (test)'
}

// Mock invites
var mockInvitationEmail = 'mochatest@josetinoco.com';
var mockInvalidInvite = -9999;
var mockInvitationUser = {
    userId: 489,
    username: 'mochatest'
};

// DB helper functions
var db = {
    // Invites
    getTestInvite: function(callback){
        var conn = require('../app/models/db.model')();
        conn.query({
            sql: "SELECT * FROM invites WHERE inviteeEmail = '" + mockInvitationEmail + "'"
        }, function(err, result){
            callback(result[0]);
        });
    },
    cleanupMockInvites: function(callback){
        var conn = require('../app/models/db.model')();
        conn.query({
            sql: "DELETE FROM invites WHERE inviteeEmail = ?",
            values: [mockInvitationEmail]
        }, function(err, result){
            conn.query({
                sql: "DELETE FROM userGroups WHERE userId = ?",
                values: [mockInvitationUser.userId]
            }, function(err, result){
                callback();
            });
        });
    },
    cleanupMockUsers: function(callback){
        var conn = require('../app/models/db.model')();
        conn.query({
            sql: "DELETE FROM users WHERE userEmail = ?",
            values: ['mockuser@mockuserland.com']
        }, function(err, result){
            callback();
        });
    },
    cleanupMockGroups: function(callback){
        var conn = require('../app/models/db.model')();
        conn.query({
            sql: "DELETE FROM groups WHERE groupName = ?",
            values: [mockGroup.groupName]
        }, function(err, result){
            callback();
        });
    },
};

// Mock request/response objects with stub functions
var beforeAllTests = function(){
    req = {
        flash: function(type, msg){
            if (msg) {
                this.flashMsg = {};
                this.flashMsg.type = type;
                this.flash.msg = msg;
            }
        },
    };
    res = {
        render: function(template, data){
            this.template = template;
            this.data = data;
            this.asyncReturn();
        },
        redirect: function(path){
            this.redirected = path;
            this.asyncReturn();
        },
        flash: function(type, msg){
            if (msg) {
                this.flashMsg = {};
                this.flashMsg.type = type;
                this.flash.msg = msg;
            }
        },
        asyncReturn: null // This will host Mocha's async callback ("done()")
    };
    next = function(){};
}


describe('Controllers', function(){
    beforeEach(beforeAllTests);

    /*
    *
    * Tests for the USERS controller
    *
    */

    describe('Users controller', function(){

        // users.createUser
        // ================

        describe('Create a new, non-existing user', function(){
            beforeEach(function(done){
                req.body = {}
                req.body.name = 'tester00'
                req.body.password = 'passpasspasspasspasspass';
                req.body.email = 'mockuser@mockuserland.com';
                req.body.phone = '555-647-7777';
                req.body.country = 'Testland';
                res.asyncReturn = done;
                users.createUser(req, res, done);
            });
            it('Should redirect the user to the signin page with a success message', function(){
                assert.equal(res.redirected, '/signin');
                assert.equal(req.flashMsg.type, 'success');
            });
        });

        describe('Attempt to create a user with an existing username', function(){
            beforeEach(function(done){
                req.body = {}
                req.body.name = 'joseph'
                req.body.password = 'passpasspasspasspasspass';
                req.body.email = 'mockuser@mockuserland.com';
                req.body.phone = '555-647-7777';
                req.body.country = 'Testland';
                res.asyncReturn = done;
                users.createUser(req, res, done);
            });
            it('Should redirect the user to the signup page with an error message', function(){
                assert.equal(res.redirected, '/signup');
                assert.equal(req.flashMsg.type, 'error');
            });
        });

        describe('Attempt to create a user with an existing email', function(){
            beforeEach(function(done){
                req.body = {}
                req.body.name = 'tester01'
                req.body.password = 'passpasspasspasspasspass';
                req.body.email = mockUser.email;
                req.body.phone = '555-647-7777';
                req.body.country = 'Testland';
                res.asyncReturn = done;
                users.createUser(req, res, done);
            });
            it('Should redirect the user to the signup page with an error message', function(){
                assert.equal(res.redirected, '/signup');
                assert.equal(req.flashMsg.type, 'error');
            });
        });

        describe('Load user counts for a user', function(){
            beforeEach(function(done){
                req.user = mockUser;
                users.loadUserCounts(req, res, done);
            });
            it('Should load the request with all user counts, even if they\'re zero', function(){
                assert.isAtLeast(req.tasksAssignedPending, 0);
                assert.isAtLeast(req.tasksAssignedWaitingApproval, 0);
                assert.isAtLeast(req.tasksAssignedClosed, 0);
                assert.isAtLeast(req.tasksPending, 0);
                assert.isAtLeast(req.tasksWaitingApproval, 0);
                assert.isAtLeast(req.tasksClosed, 0);
            });
        });

        // Clean up after user tests
        after(function(done){
            db.cleanupMockUsers(done);
        });
    }); // Users controller

    /*
    *
    * Tests for the GROUPS controller
    *
    */

    describe('Users controller', function(){

        // groups.create
        // =============

        describe('Create a new group', function(){
            beforeEach(function(done){
                req.user = mockUser;
                req.body = {};
                req.body.name = mockGroup.groupName;
                res.asyncReturn = done;
                groups.create(req, res, done);
            });
            it('Should redirect the user to the create group page with a success message', function(){
                assert.equal(res.redirected, '/createGroup');
                assert.equal(req.flashMsg.type, 'success');
            });
        });

        describe('Create a group with the same name of an existing group', function(){
            beforeEach(function(done){
                req.user = mockUser;
                req.body = {};
                req.body.name = mockGroup.groupName;
                res.asyncReturn = done;
                groups.create(req, res, done);
            });
            it('Should redirect the user to the create group page with an error message', function(){
                assert.equal(res.redirected, '/createGroup');
                assert.equal(req.flashMsg.type, 'error');
            });
        });

        // groups.loadUserOwnedGroups
        // ==========================

        describe('Load user owned groups', function(){
            beforeEach(function(done){
                req.user = mockUser;
                res.asyncReturn = done;
                groups.loadUserOwnedGroups(req, res, done);
            });
            it('Should load the user\'s groups into the request', function(){
                assert.isOk(req.groups.owned);
                assert.isAtLeast(req.groups.owned.length, 1);
            });
        });

        // groups.loadUserGroups
        // =====================

        describe('Load groups of which the user is a member', function(){
            beforeEach(function(done){
                req.user = mockUser;
                res.asyncReturn = done;
                groups.loadUserGroups(req, res, done);
            });
            it('Should load the user\'s groups into the request', function(){
                assert.isOk(req.groups.member);
                assert.isAtLeast(req.groups.member.length, 1);
            });
        });

        // groups.selectGroup
        // ==================

        describe('Select a group owned by the user', function(){
            beforeEach(function(done){
                req.user = mockUser;
                res.asyncReturn = done;
                groups.selectGroup(req, res, done, mockCurrentGroup);
            });
            it('Should load the group name and the \'user owns the group\' flag', function(){
                assert.isDefined(req.currentGroupName);
                assert.isDefined(req.ownsCurrentGroup);
                assert.isTrue(req.ownsCurrentGroup);
            });
        });

        describe('Select a group where the user is a participant', function(){
            beforeEach(function(done){
                req.user = mockUser;
                res.asyncReturn = done;
                groups.selectGroup(req, res, done, 22);
            });
            it('Should load the group name and the \'user owns the group\' flag', function(){
                assert.isDefined(req.currentGroupName);
                assert.isDefined(req.ownsCurrentGroup);
                assert.isFalse(req.ownsCurrentGroup);
            });
        });

        describe('Attempt to select an invalid group', function(){
            beforeEach(function(done){
                req.user = mockUser;
                res.asyncReturn = done;
                groups.selectGroup(req, res, done, mockInvalidGroup);
            });
            it('Should redirect the user to the home with an error message', function(){
                assert.equal(res.redirected, '/');
                assert.equal(req.flashMsg.type, 'error');
            });
        });

        // Cleanup after group tests
        after(function(done){
            db.cleanupMockGroups(done);
        });
    }); // Groups controller

    /*
    *
    * Tests for the TASKS controller
    *
    */

    describe('Tasks controller', function(){

        // tasks.read
        // ==========

        describe('read tasks from a group', function(){
            beforeEach(function(done){
                req.currentGroup = 16;
                req.ownsGroup = false;
                // Inject Mocha's callback into the response object's 'render' method
                // so that it will wait for the response before running assertions
                res.asyncReturn = done;
                tasks.read(req, res);
            });
            it('Should render the groups\' task list', function(){
                assert.equal(res.template, 'viewTasks');
                assert.isAtLeast(res.data.taskList.length, 1);
            });
        });

        describe('read all tasks', function(){
            beforeEach(function(done){
                req.currentGroup = null;
                req.ownsGroup = false;
                res.asyncReturn = done;
                tasks.read(req, res);
            });
            it('Should render all tasks from all groups', function(){
                assert.equal(res.template, 'viewTasks');
                assert.isAtLeast(res.data.taskList.length, 1);
            });
        });

        // tasks.byId
        // ==========

        describe('Load a single task by ID', function(){
            beforeEach(function(done){
                tasks.byId(req, res, done, 9);
            });
            it('Should retrieve the task', function(){
                assert.isOk(req.task);
                assert.equal(req.task.taskId, 9);
            });
        });

        describe('Attempt to load a task that does not exist', function(){
            beforeEach(function(done){
                tasks.byId(req, res, done, -999);
            });
            it('Should not load the task', function(){
                assert.isNotOk(req.task);
            });
            it('Should show a flash message', function(){
                assert.equal(req.flashMsg.type, 'error');
            });
        });

        // tasks.allByUser
        // ===============

        describe('Load all tasks for a given user', function(){
            beforeEach(function(done){
                tasks.allByUser(req, res, done, mockUser.userId);
            });
            it('Should retrieve the list of tasks', function(){
                assert.isArray(req.assignerTasks);
                assert.isArray(req.assigneeTasks);
            });
            it('Tasks must belong to given user', function(){
                assert.isOk(req.username);
                assert.equal(req.username, 'joseph');
            });
        });

        describe('Attempt to load tasks for an invalid user', function(){
            beforeEach(function(done){
                tasks.allByUser(req, res, done, -999);
            });
            it('Should not load any tasks', function(){
                assert.isNotOk(req.assignerTasks);
                assert.isNotOk(req.assigneeTasks);
            });
            it('Should show a flash message', function(){
                assert.equal(req.flashMsg.type, 'error');
            });
        });

        // tasks.getNames
        // ===============

        describe('Manage (approve) tasks of a given user', function(){
            beforeEach(function(done){
                req.user = mockUser;
                res.asyncReturn = done;
                tasks.getNames(req, res, done);
            });
            it('Should retrieve the list of tasks', function(){
                assert.isArray(res.data.tasks);
            });
            it('Tasks must belong to given user', function(){
                assert.equal(res.data.tasks[0].taskmasterId, mockUser.userId);
            });
        });

        describe('Attempt to approve tasks of an invalid user', function(){
            beforeEach(function(done){
                req.user = mockInvalidUser;
                res.asyncReturn = done;
                tasks.getNames(req, res, done);
            });
            it('Should not load any tasks', function(){
                assert.isArray(res.data.tasks);
                assert.equal(res.data.tasks.length, 0);
            });
            it('Should show a flash message', function(){
                assert.equal(req.flashMsg.type, 'error');
            });
        });
        
        
        // tasks.completeTask
        // ===============
        describe('Mark valid task as completed', function() {
            beforeEach(function(done) {
                req.body = {};
                req.body.taskId = 11;
                res.asyncReturn = done;
                tasks.completeTask(req, res, done);
            });
            it('Should redirect to Manage Task page with a success flash message', function() {
                assert.equal(res.redirected, '/manageTask');
                assert.equal(req.flashMsg.type, 'success');
            });
        });
        
        describe('Attempt to mark invalid task as completed', function() {
            beforeEach(function(done) {
                req.body = {};
                req.body.taskId = -9999;
                res.asyncReturn = done;
                tasks.completeTask(req, res, done);
            });
            it('Should redirect to Manage Task page with an error flash message', function() {
                assert.equal(res.redirected, '/manageTask');
                assert.equal(req.flashMsg.type, 'error');
            });
        });
        
        
        // tasks.updateAssigneeTasks
        // ===============
        describe('Update task status for a valid task', function(){
            beforeEach(function(done) {
                req.body = {};
                req.body.id = 15;
                req.body.status = 'Accepted';   
                tasks.updateAssigneeTasks(req, res, done);             
            });
            it('Should show a flash message', function(){
                assert.equal(req.flash.msg, 'Task updated');
            });
        });
        
        //TODO: this doesn't work:
        // describe('Update task status for an invalid task', function(){
        //     beforeEach(function(done) {
        //         req.body = {};
        //         req.body.id = -9999;
        //         req.body.status = 'Accepted';   
        //         tasks.updateAssigneeTasks(req, res, done);             
        //     });
        //     it('Should show a flash message', function(){
        //         assert.notEqual(req.flash.msg, 'Task updated');
        //     });
        // });
        
        
    }); // Tasks controller tests

    /*
    *
    * Tests for the INVITATIONS controller
    *
    */

    describe('Invitations controller', function(){

        // invitations.renderNewInvite
        // ===========================

        describe('Render the \'new invite\' page', function(){
            beforeEach(function(done){
                req.currentGroup = mockCurrentGroup;
                req.user = mockUser;
                res.asyncReturn = done;
                invitations.renderNewInvite(req, res);
            });
            it('Should render the new invite page', function(){
                assert.equal(res.template, 'newInvite');
            });
            it('Should have the form linked to the selected group', function(){
                assert.equal(res.data.groupId, mockCurrentGroup);
            });
        });

        describe('Attempt an invitation without owning any groups', function(){
            beforeEach(function(done){
                req.currentGroup = null;
                req.user = mockGrouplessUser;
                res.asyncReturn = done;
                invitations.renderNewInvite(req, res);
            });
            it('Should render the new invite page anyway', function(){
                assert.equal(res.template, 'newInvite');
            });
            it('Should show a flash error message', function(){
                assert.equal(req.flashMsg.type, 'error');
            });
        });

        // invitations.newInvite
        // =====================

        describe('Create a new invite', function(){
            beforeEach(function(done){
                req.body = {};
                req.body.groupId = mockCurrentGroup;
                req.body.inviteeEmail = mockInvitationEmail;
                req.user = mockUser;
                res.asyncReturn = done;
                invitations.newInvite(req, res, done);
            });
            it('Should redirect the user back and show a success flash message', function(){
                assert.equal(res.redirected, '/group/' + mockCurrentGroup + '/newInvite');
                assert.equal(req.flashMsg.type, 'success');
            });
        });

        describe('Accept invites', function(){

            // invitations.getInvite
            // =====================

            describe('Attempt to load an invalid invite', function(){
                beforeEach(function(done){
                    invitations.getInvite(req, res, done, mockInvalidInvite);
                });
                it('Should not load any invites', function(){
                    assert.isNotOk(req.invite);
                });
                it('Should display an error flash message', function(){
                    assert.equal(req.flashMsg.type, 'error');
                });
            });

            describe('Retrieve a valid invite', function(){
                beforeEach(function(done){
                    db.getTestInvite(function(invite){
                        invitations.getInvite(req, res, done, invite.inviteId);
                    });
                });
                it('Should load the invite in the request', function(){
                    assert.isOk(req.invite);
                });
                it('Should not have an error flash message', function(){
                    assert.notProperty(req, 'flashMsg');
                });
            });

            // invitations.acceptInvite
            // ========================

            describe('Accept a valid invite', function(){
                beforeEach(function(done){
                    db.getTestInvite(function(invite){
                        invitations.getInvite(req, res, function(){
                            invitations.acceptInvite(req, res, done);
                        }, invite.inviteId);
                    });
                });
                it('Should load the \'invitation accepted\' page with no error messages', function(){
                    assert.equal(req.pageTitle, 'Invitation accepted!');
                    assert.notProperty(req, 'flashMsg');
                });
            });

            describe('Attempt to load an already accepted invite', function(){
                beforeEach(function(done){
                    db.getTestInvite(function(invite){
                        invitations.getInvite(req, res, done, invite.inviteId);
                    });
                });
                it('Should display an error flash message', function(){
                    assert.equal(req.flashMsg.type, 'error');
                });
            });

            // Clean up mock invites from the DB
            after(function(done){
                db.cleanupMockInvites(done);
            });
        });
    }); // Invitations controller tests
});
